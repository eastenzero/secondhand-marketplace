package com.example.marketplace.dto.demand;

import java.util.List;

public class DemandSearchResponse {

    private long total;
    private List<DemandSearchResultItem> demands;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<DemandSearchResultItem> getDemands() {
        return demands;
    }

    public void setDemands(List<DemandSearchResultItem> demands) {
        this.demands = demands;
    }
}
