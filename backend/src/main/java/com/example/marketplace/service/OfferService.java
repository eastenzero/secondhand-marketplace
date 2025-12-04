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
    private final NotificationService notificationService;

    public OfferService(OfferRepository offerRepository,
                        ItemRepository itemRepository,
                        DemandRepository demandRepository,
                        AuditService auditService,
                        NotificationService notificationService) {
        this.offerRepository = offerRepository;
        this.itemRepository = itemRepository;
        this.demandRepository = demandRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
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
        Long ownerId = null;

        if (targetType == TargetType.item) {
            Item item = itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
            if (!ItemStatus.active.name().equals(item.getStatus())) {
                throw new BusinessException(ErrorCode.TARGET_NOT_ACTIVE, "Item is not active");
            }
            if (item.getSellerId().equals(currentUserId)) {
                throw new BusinessException(ErrorCode.SELF_OFFER_NOT_ALLOWED, "Cannot offer on own item");
            }
            ownerId = item.getSellerId();
        } else if (targetType == TargetType.demand) {
            Demand demand = demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
            if (!ItemStatus.active.name().equals(demand.getStatus())) {
                throw new BusinessException(ErrorCode.TARGET_NOT_ACTIVE, "Demand is not active");
            }
            if (demand.getBuyerId().equals(currentUserId)) {
                throw new BusinessException(ErrorCode.SELF_OFFER_NOT_ALLOWED, "Cannot offer on own demand");
            }
            ownerId = demand.getBuyerId();
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

        if (ownerId != null) {
            notificationService.sendNotification(
                    ownerId,
                    "OFFER_RECEIVED",
                    "New offer received",
                    "You have received a new offer",
                    targetType.name(),
                    targetId
            );
        }

        return saved;
    }

    @Transactional
    public Offer updateOfferStatus(Long offerId, String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (offerId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "offerId is required");
        }

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Offer not found"));

        Long currentUserId = principal.getUserId();
        Long offererId = offer.getOffererId();

        TargetType targetType = offer.getTargetType();
        Long targetId = offer.getTargetId();

        Long buyerId;
        Long sellerId;

        if (targetType == TargetType.item) {
            Item item = itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
            sellerId = item.getSellerId();
            buyerId = offererId;
        } else if (targetType == TargetType.demand) {
            Demand demand = demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
            buyerId = demand.getBuyerId();
            sellerId = offererId;
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unsupported targetType");
        }

        Long ownerId = (targetType == TargetType.item) ? sellerId : buyerId;

        OfferStatus status = offer.getStatus();

        switch (action) {
            case "accept" -> {
                if (status != OfferStatus.created) {
                    throw new BusinessException(ErrorCode.CONFLICT_STATE, "Offer already processed");
                }
                if (!currentUserId.equals(ownerId)) {
                    throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not owner of target");
                }
                offer.setStatus(OfferStatus.accepted);
                auditService.auditInfo(currentUserId, "OFFER_ACCEPT", "OFFER", offerId, "Offer accepted");
                notificationService.sendNotification(
                        offererId,
                        "OFFER_ACCEPTED",
                        "Your offer was accepted",
                        null,
                        "offer",
                        offerId
                );
            }
            case "reject" -> {
                if (status != OfferStatus.created) {
                    throw new BusinessException(ErrorCode.CONFLICT_STATE, "Offer already processed");
                }
                if (!currentUserId.equals(ownerId)) {
                    throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not owner of target");
                }
                offer.setStatus(OfferStatus.rejected);
                auditService.auditInfo(currentUserId, "OFFER_REJECT", "OFFER", offerId, "Offer rejected");
                notificationService.sendNotification(
                        offererId,
                        "OFFER_REJECTED",
                        "Your offer was rejected",
                        null,
                        "offer",
                        offerId
                );
            }
            case "cancel" -> {
                if (status != OfferStatus.created) {
                    throw new BusinessException(ErrorCode.CONFLICT_STATE, "Cannot cancel processed offer");
                }
                if (!currentUserId.equals(offererId)) {
                    throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Only offerer can cancel");
                }
                offer.setStatus(OfferStatus.canceled);
                auditService.auditInfo(currentUserId, "OFFER_CANCEL", "OFFER", offerId, "Offer canceled");
                notificationService.sendNotification(
                        ownerId,
                        "OFFER_CANCELED",
                        "An offer was canceled",
                        null,
                        "offer",
                        offerId
                );
            }
            default -> throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unknown action");
        }

        return offerRepository.save(offer);
    }
}
