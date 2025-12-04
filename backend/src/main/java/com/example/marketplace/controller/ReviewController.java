package com.example.marketplace.controller;

import com.example.marketplace.domain.review.Review;
import com.example.marketplace.dto.review.CreateReviewRequest;
import com.example.marketplace.dto.review.CreateReviewResponse;
import com.example.marketplace.dto.review.ReviewListResponse;
import com.example.marketplace.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<CreateReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        Review review = reviewService.createReview(request);
        CreateReviewResponse response = new CreateReviewResponse(review.getReviewId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<ReviewListResponse> listReviews(@RequestParam String targetType,
                                                          @RequestParam Long targetId,
                                                          @RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        ReviewListResponse response = reviewService.listReviews(targetType, targetId, page, size);
        return ResponseEntity.ok(response);
    }
}
