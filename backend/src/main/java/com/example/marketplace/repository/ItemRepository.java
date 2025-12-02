package com.example.marketplace.repository;

import com.example.marketplace.domain.item.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("""
            select i from Item i
            where i.status = 'active'
              and (:category is null or i.category = :category)
              and (:minPrice is null or i.price >= :minPrice)
              and (:maxPrice is null or i.price <= :maxPrice)
              and (:keywords is null or i.title like :keywords)
            """)
    Page<Item> searchActiveItems(String keywords,
                                 String category,
                                 BigDecimal minPrice,
                                 BigDecimal maxPrice,
                                 Pageable pageable);
}
