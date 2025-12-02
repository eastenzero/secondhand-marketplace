package com.example.marketplace.dto.item;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class ItemManageRequest {

    @NotBlank
    private String action; // update | off

    @Valid
    private ItemUpdatePayload payload;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public ItemUpdatePayload getPayload() {
        return payload;
    }

    public void setPayload(ItemUpdatePayload payload) {
        this.payload = payload;
    }
}
