package com.example.marketplace.dto.report;

import jakarta.validation.constraints.NotBlank;

public class ManageReportRequest {

    @NotBlank
    private String action; // reviewing | resolve | reject

    private String resolution;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }
}
