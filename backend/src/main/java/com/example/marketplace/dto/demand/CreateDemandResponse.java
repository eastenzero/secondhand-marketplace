package com.example.marketplace.dto.demand;

public class CreateDemandResponse {

    private Long demandId;
    private String status;

    public CreateDemandResponse() {
    }

    public CreateDemandResponse(Long demandId, String status) {
        this.demandId = demandId;
        this.status = status;
    }

    public Long getDemandId() {
        return demandId;
    }

    public void setDemandId(Long demandId) {
        this.demandId = demandId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
