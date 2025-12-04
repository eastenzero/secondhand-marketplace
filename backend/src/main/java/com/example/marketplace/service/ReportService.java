package com.example.marketplace.service;

import com.example.marketplace.domain.comment.Comment;
import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.offer.Offer;
import com.example.marketplace.domain.order.Order;
import com.example.marketplace.domain.report.Report;
import com.example.marketplace.domain.report.ReportStatus;
import com.example.marketplace.domain.report.ReportTargetType;
import com.example.marketplace.domain.review.Review;
import com.example.marketplace.domain.message.Message;
import com.example.marketplace.dto.report.CreateReportRequest;
import com.example.marketplace.dto.report.ManageReportRequest;
import com.example.marketplace.dto.report.ReportListItem;
import com.example.marketplace.dto.report.ReportListResponse;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.CommentRepository;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.repository.ItemRepository;
import com.example.marketplace.repository.MessageRepository;
import com.example.marketplace.repository.OfferRepository;
import com.example.marketplace.repository.OrderRepository;
import com.example.marketplace.repository.ReportRepository;
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
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final DemandRepository demandRepository;
    private final OfferRepository offerRepository;
    private final CommentRepository commentRepository;
    private final OrderRepository orderRepository;
    private final MessageRepository messageRepository;
    private final ReviewRepository reviewRepository;
    private final AuditService auditService;

    private static final int MAX_PAGE_SIZE = 100;

    public ReportService(ReportRepository reportRepository,
                         UserRepository userRepository,
                         ItemRepository itemRepository,
                         DemandRepository demandRepository,
                         OfferRepository offerRepository,
                         CommentRepository commentRepository,
                         OrderRepository orderRepository,
                         MessageRepository messageRepository,
                         ReviewRepository reviewRepository,
                         AuditService auditService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.demandRepository = demandRepository;
        this.offerRepository = offerRepository;
        this.commentRepository = commentRepository;
        this.orderRepository = orderRepository;
        this.messageRepository = messageRepository;
        this.reviewRepository = reviewRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Report createReport(CreateReportRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        String targetTypeStr = request.getTargetType();
        ReportTargetType targetType;
        try {
            targetType = ReportTargetType.valueOf(targetTypeStr);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid targetType");
        }

        Long targetId = request.getTargetId();
        if (targetId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "targetId is required");
        }

        // Ensure target exists
        switch (targetType) {
            case user -> userRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "User not found"));
            case item -> itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
            case demand -> demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
            case offer -> offerRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Offer not found"));
            case comment -> commentRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Comment not found"));
            case order -> orderRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Order not found"));
            case message -> messageRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Message not found"));
            case review -> reviewRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Review not found"));
        }

        Report report = new Report();
        report.setReporterUserId(principal.getUserId());
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setCategory(request.getCategory());
        report.setReason(request.getReason());
        report.setStatus(ReportStatus.pending);
        Instant now = Instant.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);

        Report saved = reportRepository.save(report);
        auditService.auditInfo(principal.getUserId(), "REPORT_CREATE", "REPORT", saved.getReportId(), "Report created");
        return saved;
    }

    @Transactional(readOnly = true)
    public ReportListResponse listReports(String statusStr, int page, int size) {
        ReportStatus status;
        if (statusStr == null || statusStr.isBlank()) {
            status = ReportStatus.pending;
        } else {
            try {
                status = ReportStatus.valueOf(statusStr);
            } catch (IllegalArgumentException ex) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid status");
            }
        }

        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Report> pageResult = reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);

        List<ReportListItem> items = pageResult.getContent().stream()
                .map(r -> {
                    ReportListItem dto = new ReportListItem();
                    dto.setReportId(r.getReportId());
                    dto.setReporterUserId(r.getReporterUserId());
                    dto.setTargetType(r.getTargetType().name());
                    dto.setTargetId(r.getTargetId());
                    dto.setCategory(r.getCategory());
                    dto.setStatus(r.getStatus().name());
                    dto.setCreatedAt(r.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        ReportListResponse response = new ReportListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setReports(items);
        return response;
    }

    @Transactional
    public void manageReport(Long id, ManageReportRequest request, Long adminUserId) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Report not found"));

        String action = request.getAction();
        Instant now = Instant.now();

        if ("reviewing".equals(action)) {
            if (report.getStatus() == ReportStatus.pending) {
                report.setStatus(ReportStatus.reviewing);
                report.setHandledByUserId(adminUserId);
                report.setUpdatedAt(now);
            }
        } else if ("resolve".equals(action)) {
            report.setStatus(ReportStatus.resolved);
            report.setHandledByUserId(adminUserId);
            report.setResolution(request.getResolution());
            report.setResolvedAt(now);
            report.setUpdatedAt(now);
        } else if ("reject".equals(action)) {
            report.setStatus(ReportStatus.rejected);
            report.setHandledByUserId(adminUserId);
            report.setResolution(request.getResolution());
            report.setResolvedAt(now);
            report.setUpdatedAt(now);
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unsupported action");
        }

        reportRepository.save(report);
        auditService.auditInfo(adminUserId, "REPORT_MANAGE", "REPORT", report.getReportId(), "Report managed: " + action);
    }
}
