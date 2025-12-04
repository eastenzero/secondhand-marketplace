package com.example.marketplace.dto.message;

import java.util.List;

public class MessageListResponse {

    private long total;
    private List<MessageListItem> messages;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<MessageListItem> getMessages() {
        return messages;
    }

    public void setMessages(List<MessageListItem> messages) {
        this.messages = messages;
    }
}
