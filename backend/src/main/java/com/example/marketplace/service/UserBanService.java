package com.example.marketplace.service;

import com.example.marketplace.domain.ban.BanStatus;
import com.example.marketplace.domain.ban.UserBan;
import com.example.marketplace.dto.ban.CreateUserBanRequest;
import com.example.marketplace.dto.ban.UserBanListItem;
import com.example.marketplace.dto.ban.UserBanListResponse;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.UserBanRepository;
import com.example.marketplace.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserBanService {

    private final UserBanRepository userBanRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    private static final int MAX_PAGE_SIZE = 100;

    public UserBanService(UserBanRepository userBanRepository,
                          UserRepository userRepository,
                          AuditService auditService,
                          NotificationService notificationService) {
        this.userBanRepository = userBanRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public UserBan createUserBan(CreateUserBanRequest request, Long adminUserId) {
        Long userId = request.getUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "userId is required");
        }

        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "User not found"));

        if (userBanRepository.existsByUserIdAndStatus(userId, BanStatus.active)) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE, "User already has active ban");
        }

        Instant now = Instant.now();

        UserBan ban = new UserBan();
        ban.setUserId(userId);
        ban.setReason(request.getReason());
        ban.setStatus(BanStatus.active);
        ban.setStartAt(now);
        ban.setEndAt(request.getEndAt());
        ban.setCreatedByUserId(adminUserId);
        ban.setCreatedAt(now);
        ban.setUpdatedAt(now);

        UserBan saved = userBanRepository.save(ban);
        auditService.auditInfo(adminUserId, "USER_BAN_CREATE", "USER_BAN", saved.getBanId(), "User banned");

        notificationService.sendNotification(
                userId,
                "USER_BANNED",
                "Account banned",
                request.getReason(),
                "user_ban",
                saved.getBanId()
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public UserBanListResponse listUserBans(int page, int size) {
        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<UserBan> pageResult = userBanRepository.findAll(pageable);

        List<UserBanListItem> items = pageResult.getContent().stream()
                .map(b -> {
                    UserBanListItem dto = new UserBanListItem();
                    dto.setBanId(b.getBanId());
                    dto.setUserId(b.getUserId());
                    dto.setReason(b.getReason());
                    dto.setStatus(b.getStatus().name());
                    dto.setStartAt(b.getStartAt());
                    dto.setEndAt(b.getEndAt());
                    dto.setCreatedAt(b.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        UserBanListResponse response = new UserBanListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setBans(items);
        return response;
    }

    @Transactional
    public void revokeBan(Long banId, Long adminUserId) {
        UserBan ban = userBanRepository.findById(banId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Ban not found"));

        if (ban.getStatus() != BanStatus.active) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE, "Ban is not active");
        }

        Instant now = Instant.now();
        ban.setStatus(BanStatus.revoked);
        if (ban.getEndAt() == null) {
            ban.setEndAt(now);
        }
        ban.setUpdatedAt(now);

        userBanRepository.save(ban);
        auditService.auditInfo(adminUserId, "USER_BAN_REVOKE", "USER_BAN", ban.getBanId(), "User ban revoked");

        notificationService.sendNotification(
                ban.getUserId(),
                "USER_BAN_REVOKED",
                "Ban revoked",
                null,
                "user_ban",
                ban.getBanId()
        );
    }

    @Transactional(readOnly = true)
    public boolean hasActiveBan(Long userId) {
        if (userId == null) {
            return false;
        }
        return userBanRepository.existsByUserIdAndStatus(userId, BanStatus.active);
    }
}
