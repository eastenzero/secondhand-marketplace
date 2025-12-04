package com.example.marketplace.service;

import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.order.Order;
import com.example.marketplace.domain.review.Review;
import com.example.marketplace.domain.review.ReviewTargetType;
import com.example.marketplace.dto.review.CreateReviewRequest;
import com.example.marketplace.dto.review.ReviewListItem;
import com.example.marketplace.dto.review.ReviewListResponse;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.repository.ItemRepository;
import com.example.marketplace.repository.OrderRepository;
import com.example.marketplace.repository.ReviewRepository;
import com.example.marketplace.repository.UserRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final DemandRepository demandRepository;
    private final OrderRepository orderRepository;
    private final AuditService auditService;

    private static final int MAX_PAGE_SIZE = 100;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         ItemRepository itemRepository,
                         DemandRepository demandRepository,
                         OrderRepository orderRepository,
                         AuditService auditService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.demandRepository = demandRepository;
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Review createReview(CreateReviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        String targetTypeStr = request.getTargetType();
        ReviewTargetType targetType;
        try {
            targetType = ReviewTargetType.valueOf(targetTypeStr);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid targetType");
        }

        Long targetId = request.getTargetId();
        if (targetId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "targetId is required");
        }

        // Ensure target exists and, for order, current user is participant
        if (targetType == ReviewTargetType.user) {
            userRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "User not found"));
        } else if (targetType == ReviewTargetType.item) {
            itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
        } else if (targetType == ReviewTargetType.demand) {
            demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
        } else if (targetType == ReviewTargetType.order) {
            Order order = orderRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Order not found"));
            Long currentUserId = principal.getUserId();
            if (!currentUserId.equals(order.getBuyerId()) && !currentUserId.equals(order.getSellerId())) {
                throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not participant of this order");
            }
        }

        Integer rating = request.getRating();
        if (rating == null || rating < 1 || rating > 5) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "rating must be between 1 and 5");
        }

        Review review = new Review();
        review.setReviewerUserId(((AuthenticatedUser) authentication.getPrincipal()).getUserId());
        review.setTargetType(targetType);
        review.setTargetId(targetId);
        review.setRating(rating);
        review.setComment(request.getComment());
        review.setInternalNote(request.getInternalNote());
        if (request.getIsPublic() != null) {
            review.setPublic(request.getIsPublic());
        }
        review.setStatus("active");
        Instant now = Instant.now();
        review.setCreatedAt(now);
        review.setUpdatedAt(now);

        Review saved = reviewRepository.save(review);
        auditService.auditInfo(review.getReviewerUserId(), "REVIEW_CREATE", "REVIEW", saved.getReviewId(), "Review created");
        return saved;
    }

    @Transactional(readOnly = true)
    public ReviewListResponse listReviews(String targetTypeStr,
                                          Long targetId,
                                          int page,
                                          int size) {
        ReviewTargetType targetType;
        try {
            targetType = ReviewTargetType.valueOf(targetTypeStr);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid targetType");
        }

        if (targetId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "targetId is required");
        }

        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Review> pageResult = reviewRepository.findByTargetTypeAndTargetIdAndIsPublicTrueAndStatus(
                targetType,
                targetId,
                "active",
                pageable
        );

        List<ReviewListItem> items = pageResult.getContent().stream()
                .map(r -> {
                    ReviewListItem dto = new ReviewListItem();
                    dto.setReviewId(r.getReviewId());
                    dto.setReviewerUserId(r.getReviewerUserId());
                    dto.setRating(r.getRating());
                    dto.setComment(r.getComment());
                    dto.setCreatedAt(r.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        ReviewListResponse response = new ReviewListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setReviews(items);
        return response;
    }
}
