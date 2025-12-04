package com.example.marketplace.dto.report;

public class CreateReportResponse {

    private Long reportId;

    public CreateReportResponse() {
    }

    public CreateReportResponse(Long reportId) {
        this.reportId = reportId;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }
}
