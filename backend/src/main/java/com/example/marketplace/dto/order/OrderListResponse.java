package com.example.marketplace.dto.order;

import java.util.List;

public class OrderListResponse {

    private long total;
    private List<OrderListItem> orders;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<OrderListItem> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderListItem> orders) {
        this.orders = orders;
    }
}
