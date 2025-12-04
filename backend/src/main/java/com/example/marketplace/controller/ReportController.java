package com.example.marketplace.controller;

import com.example.marketplace.domain.report.Report;
import com.example.marketplace.dto.common.ManageResultResponse;
import com.example.marketplace.dto.report.CreateReportRequest;
import com.example.marketplace.dto.report.CreateReportResponse;
import com.example.marketplace.dto.report.ManageReportRequest;
import com.example.marketplace.dto.report.ReportListResponse;
import com.example.marketplace.security.AuthenticatedUser;
import com.example.marketplace.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<CreateReportResponse> createReport(@Valid @RequestBody CreateReportRequest request) {
        Report report = reportService.createReport(request);
        CreateReportResponse response = new CreateReportResponse(report.getReportId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportListResponse> listReports(@RequestParam(required = false) String status,
                                                          @RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        ReportListResponse response = reportService.listReports(status, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/{id}/manage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ManageResultResponse> manageReport(@PathVariable("id") Long id,
                                                             @Valid @RequestBody ManageReportRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long adminUserId = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser principal
                ? principal.getUserId()
                : null;
        reportService.manageReport(id, request, adminUserId);
        return ResponseEntity.ok(new ManageResultResponse("ok"));
    }
}
