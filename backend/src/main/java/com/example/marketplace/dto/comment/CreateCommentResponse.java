package com.example.marketplace.dto.comment;

public class CreateCommentResponse {

    private Long commentId;

    public CreateCommentResponse() {
    }

    public CreateCommentResponse(Long commentId) {
        this.commentId = commentId;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }
}
