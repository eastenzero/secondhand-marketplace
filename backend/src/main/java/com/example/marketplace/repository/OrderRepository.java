package com.example.marketplace.repository;

import com.example.marketplace.domain.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

	boolean existsByOfferId(Long offerId);

	Page<Order> findByBuyerId(Long buyerId, Pageable pageable);

	Page<Order> findBySellerId(Long sellerId, Pageable pageable);
}
