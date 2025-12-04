package com.example.marketplace.dto.review;

import java.util.List;

public class ReviewListResponse {

    private long total;
    private List<ReviewListItem> reviews;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<ReviewListItem> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewListItem> reviews) {
        this.reviews = reviews;
    }
}
