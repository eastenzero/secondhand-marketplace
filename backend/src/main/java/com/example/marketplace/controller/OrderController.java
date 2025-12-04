package com.example.marketplace.controller;

import com.example.marketplace.domain.order.Order;
import com.example.marketplace.dto.order.CreateOrderFromOfferRequest;
import com.example.marketplace.dto.order.CreateOrderResponse;
import com.example.marketplace.dto.order.OrderDetailResponse;
import com.example.marketplace.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrderFromOffer(@Valid @RequestBody CreateOrderFromOfferRequest request) {
        Order order = orderService.createOrderFromOffer(request);
        CreateOrderResponse response = new CreateOrderResponse(order.getOrderId(), order.getStatus().name());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrder(@PathVariable("id") Long id) {
        OrderDetailResponse response = orderService.getOrderDetail(id);
        return ResponseEntity.ok(response);
    }
}
