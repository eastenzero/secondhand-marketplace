package com.example.marketplace.dto.offer;

public class CreateOfferResponse {

    private Long offerId;
    private String status;

    public CreateOfferResponse() {
    }

    public CreateOfferResponse(Long offerId, String status) {
        this.offerId = offerId;
        this.status = status;
    }

    public Long getOfferId() {
        return offerId;
    }

    public void setOfferId(Long offerId) {
        this.offerId = offerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
