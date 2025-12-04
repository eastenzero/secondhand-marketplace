package com.example.marketplace.dto.thread;

public class CreateThreadResponse {

    private Long threadId;

    public CreateThreadResponse() {
    }

    public CreateThreadResponse(Long threadId) {
        this.threadId = threadId;
    }

    public Long getThreadId() {
        return threadId;
    }

    public void setThreadId(Long threadId) {
        this.threadId = threadId;
    }
}
