package com.example.marketplace.controller;

import com.example.marketplace.domain.comment.Comment;
import com.example.marketplace.dto.comment.CommentListResponse;
import com.example.marketplace.dto.comment.CreateCommentRequest;
import com.example.marketplace.dto.comment.CreateCommentResponse;
import com.example.marketplace.service.CommentService;
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
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CreateCommentResponse> createComment(@Valid @RequestBody CreateCommentRequest request) {
        Comment comment = commentService.createComment(request);
        CreateCommentResponse response = new CreateCommentResponse(comment.getCommentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<CommentListResponse> listComments(@RequestParam String targetType,
                                                            @RequestParam Long targetId,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        CommentListResponse response = commentService.listComments(targetType, targetId, page, size);
        return ResponseEntity.ok(response);
    }
}
