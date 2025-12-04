package com.example.marketplace.dto.notification;

import java.util.List;

public class NotificationListResponse {

    private long total;
    private List<NotificationListItem> notifications;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<NotificationListItem> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationListItem> notifications) {
        this.notifications = notifications;
    }
}
