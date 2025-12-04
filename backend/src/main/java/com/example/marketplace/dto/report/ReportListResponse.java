package com.example.marketplace.dto.report;

import java.util.List;

public class ReportListResponse {

    private long total;
    private List<ReportListItem> reports;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<ReportListItem> getReports() {
        return reports;
    }

    public void setReports(List<ReportListItem> reports) {
        this.reports = reports;
    }
}
