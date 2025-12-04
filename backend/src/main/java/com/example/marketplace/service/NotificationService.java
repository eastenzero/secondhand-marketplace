package com.example.marketplace.service;

import com.example.marketplace.domain.notification.Notification;
import com.example.marketplace.domain.notification.NotificationStatus;
import com.example.marketplace.dto.notification.NotificationListItem;
import com.example.marketplace.dto.notification.NotificationListResponse;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.NotificationRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private static final int MAX_PAGE_SIZE = 100;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse listMyNotifications(int page, int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Notification> pageResult = notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                principal.getUserId(),
                NotificationStatus.active,
                pageable
        );

        List<NotificationListItem> items = pageResult.getContent().stream()
                .map(n -> {
                    NotificationListItem dto = new NotificationListItem();
                    dto.setNotificationId(n.getNotificationId());
                    dto.setType(n.getType());
                    dto.setTitle(n.getTitle());
                    dto.setContent(n.getContent());
                    dto.setRelatedType(n.getRelatedType());
                    dto.setRelatedId(n.getRelatedId());
                    dto.setRead(n.isRead());
                    dto.setCreatedAt(n.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        NotificationListResponse response = new NotificationListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setNotifications(items);
        return response;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Notification not found"));

        if (!notification.getUserId().equals(principal.getUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not owner of this notification");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        }
    }
}
