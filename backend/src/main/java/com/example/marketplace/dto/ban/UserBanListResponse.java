package com.example.marketplace.dto.ban;

import java.util.List;

public class UserBanListResponse {

    private long total;
    private List<UserBanListItem> bans;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<UserBanListItem> getBans() {
        return bans;
    }

    public void setBans(List<UserBanListItem> bans) {
        this.bans = bans;
    }
}
