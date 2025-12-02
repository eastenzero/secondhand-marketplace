package com.example.marketplace.repository;

import com.example.marketplace.domain.comment.Comment;
import com.example.marketplace.domain.common.TargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByTargetTypeAndTargetId(TargetType targetType, Long targetId, Pageable pageable);
}
