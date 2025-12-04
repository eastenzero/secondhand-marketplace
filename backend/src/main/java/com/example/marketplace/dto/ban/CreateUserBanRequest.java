package com.example.marketplace.dto.ban;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class CreateUserBanRequest {

    @NotNull
    private Long userId;

    private String reason;

    private Instant endAt;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public void setEndAt(Instant endAt) {
        this.endAt = endAt;
    }
}
