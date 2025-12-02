package com.example.marketplace.dto.comment;

import java.util.List;

public class CommentListResponse {

    private long total;
    private List<CommentListItem> comments;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<CommentListItem> getComments() {
        return comments;
    }

    public void setComments(List<CommentListItem> comments) {
        this.comments = comments;
    }
}
