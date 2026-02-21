package com.example.marketplace.service;

import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.dto.item.CreateItemRequest;
import com.example.marketplace.dto.item.ItemDetailResponse;
import com.example.marketplace.dto.item.ItemManageRequest;
import com.example.marketplace.dto.item.ItemSearchResponse;
import com.example.marketplace.dto.item.ItemSearchResultItem;
import com.example.marketplace.dto.item.ItemUpdatePayload;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.ItemRepository;
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
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.util.StringUtils;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final boolean reviewEnabled;
    private final ListingPermissionService listingPermissionService;
    private final AuditService auditService;
    private final ImageStyleService imageStyleService;

    private static final int MAX_PAGE_SIZE = 100;

    public ItemService(ItemRepository itemRepository,
            @Value("${app.review.enabled:false}") boolean reviewEnabled,
            ListingPermissionService listingPermissionService,
            AuditService auditService,
            ImageStyleService imageStyleService) {
        this.itemRepository = itemRepository;
        this.reviewEnabled = reviewEnabled;
        this.listingPermissionService = listingPermissionService;
        this.auditService = auditService;
        this.imageStyleService = imageStyleService;
    }

    public Item createItem(CreateItemRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        Item item = new Item();
        item.setSellerId(principal.getUserId());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDesc());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setCondition(null);

        ItemStatus initialStatus = reviewEnabled ? ItemStatus.pending : ItemStatus.active;
        item.setStatus(initialStatus.name());

        if (request.getImages() != null) {
            item.setImages(request.getImages().toArray(new String[0]));
        }

        Instant now = Instant.now();
        item.setCreatedAt(now);
        item.setUpdatedAt(now);

        Item saved = itemRepository.save(item);
        auditService.auditInfo(principal.getUserId(), "ITEM_CREATE", "ITEM", saved.getItemId(), "Item created");
        return saved;
    }

    public ItemDetailResponse getItemDetail(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Item not found"));

        if (ItemStatus.deleted.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Item not found");
        }

        ItemDetailResponse resp = new ItemDetailResponse();
        resp.setItemId(item.getItemId());
        resp.setSellerId(item.getSellerId());
        resp.setTitle(item.getTitle());
        resp.setDesc(item.getDescription());
        resp.setCategory(item.getCategory());
        resp.setPrice(item.getPrice());
        resp.setCondition(item.getCondition());
        resp.setStatus(item.getStatus());
        if (item.getImages() != null) {
            String[] rewritten = imageStyleService.rewriteImageUrls(item.getImages());
            resp.setImages(Arrays.asList(rewritten));
        }
        resp.setCreatedAt(item.getCreatedAt());
        resp.setUpdatedAt(item.getUpdatedAt());

        resp.setOffers(java.util.Collections.emptyList());
        resp.setComments(java.util.Collections.emptyList());
        return resp;
    }

    @Transactional
    public void manageItem(Long id, ItemManageRequest request) {
        Long currentUserId = listingPermissionService.requireCurrentUserId();

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Item not found"));

        if (ItemStatus.deleted.name().equals(item.getStatus())) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE, "Item is deleted");
        }

        listingPermissionService.assertItemOwner(item, currentUserId);

        String action = request.getAction();
        if ("update".equals(action)) {
            ItemUpdatePayload payload = request.getPayload();
            if (payload != null) {
                if (payload.getTitle() != null) {
                    item.setTitle(payload.getTitle());
                }
                if (payload.getDesc() != null) {
                    item.setDescription(payload.getDesc());
                }
                if (payload.getCategory() != null) {
                    item.setCategory(payload.getCategory());
                }
                if (payload.getPrice() != null) {
                    item.setPrice(payload.getPrice());
                }
                if (payload.getCondition() != null) {
                    item.setCondition(payload.getCondition());
                }
                if (payload.getImages() != null) {
                    item.setImages(payload.getImages().toArray(new String[0]));
                }
            }
            item.setUpdatedAt(Instant.now());
            itemRepository.save(item);
            auditService.auditInfo(currentUserId, "ITEM_UPDATE", "ITEM", item.getItemId(), "Item updated");
        } else if ("off".equals(action)) {
            if (!ItemStatus.off.name().equals(item.getStatus())) {
                item.setStatus(ItemStatus.off.name());
                item.setUpdatedAt(Instant.now());
                itemRepository.save(item);
                auditService.auditInfo(currentUserId, "ITEM_OFF", "ITEM", item.getItemId(), "Item offlined");
            }
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unsupported action");
        }
    }

    public ItemSearchResponse searchItems(String keywords,
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

        Page<Item> pageResult = itemRepository.searchActiveItems(
                keywordPattern,
                category,
                minPrice,
                maxPrice,
                pageable);

        List<ItemSearchResultItem> items = pageResult.getContent().stream()
                .map(item -> {
                    ItemSearchResultItem dto = new ItemSearchResultItem();
                    dto.setItemId(item.getItemId());
                    dto.setTitle(item.getTitle());
                    dto.setPrice(item.getPrice());
                    dto.setStatus(item.getStatus());
                    if (item.getImages() != null && item.getImages().length > 0) {
                        dto.setThumbnailUrl(imageStyleService.rewriteImageUrl(item.getImages()[0]));
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        ItemSearchResponse response = new ItemSearchResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setItems(items);
        return response;
    }
}
