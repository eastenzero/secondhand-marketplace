package com.example.marketplace.service;

import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.dto.demand.CreateDemandRequest;
import com.example.marketplace.dto.demand.DemandDetailResponse;
import com.example.marketplace.dto.demand.DemandManageRequest;
import com.example.marketplace.dto.demand.DemandSearchResponse;
import com.example.marketplace.dto.demand.DemandSearchResultItem;
import com.example.marketplace.dto.demand.DemandUpdatePayload;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.util.StringUtils;

@Service
public class DemandService {

    private final DemandRepository demandRepository;
    private final boolean reviewEnabled;
    private final ListingPermissionService listingPermissionService;
    private final AuditService auditService;

    private static final int MAX_PAGE_SIZE = 100;

    public DemandService(DemandRepository demandRepository,
                         @Value("${app.review.enabled:false}") boolean reviewEnabled,
                         ListingPermissionService listingPermissionService,
                         AuditService auditService) {
        this.demandRepository = demandRepository;
        this.reviewEnabled = reviewEnabled;
        this.listingPermissionService = listingPermissionService;
        this.auditService = auditService;
    }

    public Demand createDemand(CreateDemandRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        Demand demand = new Demand();
        demand.setBuyerId(principal.getUserId());
        demand.setTitle(request.getTitle());
        demand.setDescription(request.getDesc());
        demand.setCategory(request.getCategory());
        demand.setExpectedPrice(request.getExpectedPrice());

        ItemStatus initialStatus = reviewEnabled ? ItemStatus.pending : ItemStatus.active;
        demand.setStatus(initialStatus.name());

        Instant now = Instant.now();
        demand.setCreatedAt(now);
        demand.setUpdatedAt(now);

        Demand saved = demandRepository.save(demand);
        auditService.auditInfo(principal.getUserId(), "DEMAND_CREATE", "DEMAND", saved.getDemandId(), "Demand created");
        return saved;
    }

    public DemandDetailResponse getDemandDetail(Long id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Demand not found"));

        if (ItemStatus.deleted.name().equals(demand.getStatus())) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Demand not found");
        }

        DemandDetailResponse resp = new DemandDetailResponse();
        resp.setDemandId(demand.getDemandId());
        resp.setBuyerId(demand.getBuyerId());
        resp.setTitle(demand.getTitle());
        resp.setDesc(demand.getDescription());
        resp.setCategory(demand.getCategory());
        resp.setExpectedPrice(demand.getExpectedPrice());
        resp.setStatus(demand.getStatus());
        resp.setCreatedAt(demand.getCreatedAt());
        resp.setUpdatedAt(demand.getUpdatedAt());
        resp.setOffers(java.util.Collections.emptyList());
        resp.setComments(java.util.Collections.emptyList());
        return resp;
    }

    public DemandSearchResponse searchDemands(String keywords,
                                              String category,
                                              BigDecimal minPrice,
                                              BigDecimal maxPrice,
                                              int page,
                                              int size) {
        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "minPrice cannot be greater than maxPrice");
        }

        String keywordPattern = StringUtils.hasText(keywords) ? ("%" + keywords.trim() + "%") : null;

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Demand> pageResult = demandRepository.searchActiveDemands(
                keywordPattern,
                category,
                minPrice,
                maxPrice,
                pageable
        );

        List<DemandSearchResultItem> demands = pageResult.getContent().stream()
                .map(d -> {
                    DemandSearchResultItem dto = new DemandSearchResultItem();
                    dto.setDemandId(d.getDemandId());
                    dto.setTitle(d.getTitle());
                    dto.setExpectedPrice(d.getExpectedPrice());
                    dto.setStatus(d.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());

        DemandSearchResponse response = new DemandSearchResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setDemands(demands);
        return response;
    }

    @Transactional
    public void manageDemand(Long id, DemandManageRequest request) {
        Long currentUserId = listingPermissionService.requireCurrentUserId();

        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Demand not found"));

        if (ItemStatus.deleted.name().equals(demand.getStatus())) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE, "Demand is deleted");
        }

        listingPermissionService.assertDemandOwner(demand, currentUserId);

        String action = request.getAction();
        if ("update".equals(action)) {
            DemandUpdatePayload payload = request.getPayload();
            if (payload != null) {
                if (payload.getTitle() != null) {
                    demand.setTitle(payload.getTitle());
                }
                if (payload.getDesc() != null) {
                    demand.setDescription(payload.getDesc());
                }
                if (payload.getCategory() != null) {
                    demand.setCategory(payload.getCategory());
                }
                if (payload.getExpectedPrice() != null) {
                    demand.setExpectedPrice(payload.getExpectedPrice());
                }
            }
            demand.setUpdatedAt(Instant.now());
            demandRepository.save(demand);
            auditService.auditInfo(currentUserId, "DEMAND_UPDATE", "DEMAND", demand.getDemandId(), "Demand updated");
        } else if ("off".equals(action)) {
            if (!ItemStatus.off.name().equals(demand.getStatus())) {
                demand.setStatus(ItemStatus.off.name());
                demand.setUpdatedAt(Instant.now());
                demandRepository.save(demand);
                auditService.auditInfo(currentUserId, "DEMAND_OFF", "DEMAND", demand.getDemandId(), "Demand offlined");
            }
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unsupported action");
        }
    }
}
