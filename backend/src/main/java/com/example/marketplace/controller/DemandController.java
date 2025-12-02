package com.example.marketplace.controller;

import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.dto.common.ManageResultResponse;
import com.example.marketplace.dto.demand.CreateDemandRequest;
import com.example.marketplace.dto.demand.CreateDemandResponse;
import com.example.marketplace.dto.demand.DemandDetailResponse;
import com.example.marketplace.dto.demand.DemandManageRequest;
import com.example.marketplace.dto.demand.DemandSearchResponse;
import com.example.marketplace.service.DemandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/demands")
public class DemandController {

    private final DemandService demandService;

    public DemandController(DemandService demandService) {
        this.demandService = demandService;
    }

    @GetMapping
    public ResponseEntity<DemandSearchResponse> searchDemands(@RequestParam(required = false) String keywords,
                                                              @RequestParam(required = false) String category,
                                                              @RequestParam(required = false) BigDecimal minPrice,
                                                              @RequestParam(required = false) BigDecimal maxPrice,
                                                              @RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(defaultValue = "20") int size) {
        DemandSearchResponse response = demandService.searchDemands(keywords, category, minPrice, maxPrice, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CreateDemandResponse> createDemand(@Valid @RequestBody CreateDemandRequest request) {
        Demand demand = demandService.createDemand(request);
        CreateDemandResponse response = new CreateDemandResponse(demand.getDemandId(), demand.getStatus());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ManageResultResponse> manageDemand(@PathVariable("id") Long id,
                                                             @Valid @RequestBody DemandManageRequest request) {
        demandService.manageDemand(id, request);
        return ResponseEntity.ok(new ManageResultResponse("ok"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandDetailResponse> getDemand(@PathVariable("id") Long id) {
        DemandDetailResponse response = demandService.getDemandDetail(id);
        return ResponseEntity.ok(response);
    }
}
