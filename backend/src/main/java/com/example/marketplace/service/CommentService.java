package com.example.marketplace.service;

import com.example.marketplace.domain.comment.Comment;
import com.example.marketplace.domain.common.TargetType;
import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.dto.comment.CommentListItem;
import com.example.marketplace.dto.comment.CommentListResponse;
import com.example.marketplace.dto.comment.CreateCommentRequest;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.CommentRepository;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.repository.ItemRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.util.StringUtils;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ItemRepository itemRepository;
    private final DemandRepository demandRepository;
    private final AuditService auditService;

    private static final int MAX_PAGE_SIZE = 100;

    public CommentService(CommentRepository commentRepository,
                          ItemRepository itemRepository,
                          DemandRepository demandRepository,
                          AuditService auditService) {
        this.commentRepository = commentRepository;
        this.itemRepository = itemRepository;
        this.demandRepository = demandRepository;
        this.auditService = auditService;
    }

    public Comment createComment(CreateCommentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
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

        String content = request.getContent();
        if (!StringUtils.hasText(content) || content.length() > 1000) {
            throw new BusinessException(ErrorCode.CONTENT_INVALID, "Comment content is invalid");
        }

        if (targetType == TargetType.item) {
            itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
        } else if (targetType == TargetType.demand) {
            demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
        }

        Comment comment = new Comment();
        comment.setTargetType(targetType);
        comment.setTargetId(targetId);
        comment.setUserId(principal.getUserId());
        comment.setContent(content.trim());
        comment.setCreatedAt(Instant.now());

        Comment saved = commentRepository.save(comment);
        auditService.auditInfo(principal.getUserId(), "COMMENT_CREATE", "COMMENT", saved.getCommentId(), "Comment created");
        return saved;
    }

    public CommentListResponse listComments(String targetTypeStr,
                                            Long targetId,
                                            int page,
                                            int size) {
        TargetType targetType;
        try {
            targetType = TargetType.valueOf(targetTypeStr);
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

        Page<Comment> pageResult = commentRepository.findByTargetTypeAndTargetId(targetType, targetId, pageable);

        List<CommentListItem> items = pageResult.getContent().stream()
                .map(c -> {
                    CommentListItem dto = new CommentListItem();
                    dto.setCommentId(c.getCommentId());
                    dto.setUserId(c.getUserId());
                    dto.setContent(c.getContent());
                    dto.setCreatedAt(c.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        CommentListResponse response = new CommentListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setComments(items);
        return response;
    }
}
