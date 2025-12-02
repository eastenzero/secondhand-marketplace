package com.example.marketplace.dto.item;

import java.util.List;

public class ItemSearchResponse {

    private long total;
    private List<ItemSearchResultItem> items;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<ItemSearchResultItem> getItems() {
        return items;
    }

    public void setItems(List<ItemSearchResultItem> items) {
        this.items = items;
    }
}
