package com.example.marketplace.dto.demand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class DemandManageRequest {

    @NotBlank
    private String action; // update | off

    @Valid
    private DemandUpdatePayload payload;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public DemandUpdatePayload getPayload() {
        return payload;
    }

    public void setPayload(DemandUpdatePayload payload) {
        this.payload = payload;
    }
}
