package com.example.marketplace.controller;

import com.example.marketplace.domain.item.Item;
import com.example.marketplace.dto.common.ManageResultResponse;
import com.example.marketplace.dto.item.CreateItemRequest;
import com.example.marketplace.dto.item.CreateItemResponse;
import com.example.marketplace.dto.item.ItemDetailResponse;
import com.example.marketplace.dto.item.ItemManageRequest;
import com.example.marketplace.dto.item.ItemSearchResponse;
import com.example.marketplace.service.ItemService;
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
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<ItemSearchResponse> searchItems(@RequestParam(required = false) String keywords,
                                                          @RequestParam(required = false) String category,
                                                          @RequestParam(required = false) BigDecimal minPrice,
                                                          @RequestParam(required = false) BigDecimal maxPrice,
                                                          @RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        ItemSearchResponse response = itemService.searchItems(keywords, category, minPrice, maxPrice, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CreateItemResponse> createItem(@Valid @RequestBody CreateItemRequest request) {
        Item item = itemService.createItem(request);
        CreateItemResponse response = new CreateItemResponse(item.getItemId(), item.getStatus());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ManageResultResponse> manageItem(@PathVariable("id") Long id,
                                                           @Valid @RequestBody ItemManageRequest request) {
        itemService.manageItem(id, request);
        return ResponseEntity.ok(new ManageResultResponse("ok"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDetailResponse> getItem(@PathVariable("id") Long id) {
        ItemDetailResponse response = itemService.getItemDetail(id);
        return ResponseEntity.ok(response);
    }
}
