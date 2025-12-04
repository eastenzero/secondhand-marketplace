package com.example.marketplace.repository;

import com.example.marketplace.domain.review.Review;
import com.example.marketplace.domain.review.ReviewTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByTargetTypeAndTargetIdAndIsPublicTrueAndStatus(ReviewTargetType targetType, Long targetId, String status, Pageable pageable);
}
