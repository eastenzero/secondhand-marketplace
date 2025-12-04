package com.example.marketplace.dto.thread;

import java.util.List;

public class ThreadListResponse {

    private long total;
    private List<ThreadListItem> threads;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<ThreadListItem> getThreads() {
        return threads;
    }

    public void setThreads(List<ThreadListItem> threads) {
        this.threads = threads;
    }
}
