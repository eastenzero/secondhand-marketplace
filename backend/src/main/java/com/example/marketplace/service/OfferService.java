package com.example.marketplace.service;

import com.example.marketplace.domain.common.TargetType;
import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.domain.offer.Offer;
import com.example.marketplace.domain.offer.OfferStatus;
import com.example.marketplace.dto.offer.CreateOfferRequest;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.repository.ItemRepository;
import com.example.marketplace.repository.OfferRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final ItemRepository itemRepository;
    private final DemandRepository demandRepository;
    private final AuditService auditService;

    public OfferService(OfferRepository offerRepository,
                        ItemRepository itemRepository,
                        DemandRepository demandRepository,
                        AuditService auditService) {
        this.offerRepository = offerRepository;
        this.itemRepository = itemRepository;
        this.demandRepository = demandRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Offer createOffer(CreateOfferRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.INVALID_AMOUNT, "Amount must be greater than 0");
        }

        TargetType targetType;
        try {
            targetType = TargetType.valueOf(request.getTargetType());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid targetType");
        }

        Long targetId = request.getTargetId();
        if (targetId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "targetId is required");
        }

        Long currentUserId = principal.getUserId();

        if (targetType == TargetType.item) {
            Item item = itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
            if (!ItemStatus.active.name().equals(item.getStatus())) {
                throw new BusinessException(ErrorCode.TARGET_NOT_ACTIVE, "Item is not active");
            }
            if (item.getSellerId().equals(currentUserId)) {
                throw new BusinessException(ErrorCode.SELF_OFFER_NOT_ALLOWED, "Cannot offer on own item");
            }
        } else if (targetType == TargetType.demand) {
            Demand demand = demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
            if (!ItemStatus.active.name().equals(demand.getStatus())) {
                throw new BusinessException(ErrorCode.TARGET_NOT_ACTIVE, "Demand is not active");
            }
            if (demand.getBuyerId().equals(currentUserId)) {
                throw new BusinessException(ErrorCode.SELF_OFFER_NOT_ALLOWED, "Cannot offer on own demand");
            }
        }

        Offer offer = new Offer();
        offer.setTargetType(targetType);
        offer.setTargetId(targetId);
        offer.setOffererId(currentUserId);
        offer.setAmount(request.getAmount());
        offer.setMessage(request.getMessage());
        offer.setStatus(OfferStatus.created);
        offer.setCreatedAt(Instant.now());

        Offer saved = offerRepository.save(offer);
        auditService.auditInfo(currentUserId, "OFFER_CREATE", "OFFER", saved.getOfferId(), "Offer created");
        return saved;
    }
}
