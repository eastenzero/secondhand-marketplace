package com.example.marketplace.dto.review;

public class CreateReviewResponse {

    private Long reviewId;

    public CreateReviewResponse() {
    }

    public CreateReviewResponse(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }
}
