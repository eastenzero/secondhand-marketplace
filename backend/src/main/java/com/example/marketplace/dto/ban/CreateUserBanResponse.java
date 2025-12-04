package com.example.marketplace.dto.ban;

public class CreateUserBanResponse {

    private Long banId;

    public CreateUserBanResponse() {
    }

    public CreateUserBanResponse(Long banId) {
        this.banId = banId;
    }

    public Long getBanId() {
        return banId;
    }

    public void setBanId(Long banId) {
        this.banId = banId;
    }
}
