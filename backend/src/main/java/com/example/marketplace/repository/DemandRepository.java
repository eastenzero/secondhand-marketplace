package com.example.marketplace.repository;

import com.example.marketplace.domain.demand.Demand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface DemandRepository extends JpaRepository<Demand, Long> {

    @Query("""
            select d from Demand d
            where d.status = 'active'
              and (:category is null or d.category = :category)
              and (:minPrice is null or d.expectedPrice >= :minPrice)
              and (:maxPrice is null or d.expectedPrice <= :maxPrice)
              and (:keywords is null or d.title like :keywords)
            """)
    Page<Demand> searchActiveDemands(@Param("keywords") String keywords,
                                     @Param("category") String category,
                                     @Param("minPrice") BigDecimal minPrice,
                                     @Param("maxPrice") BigDecimal maxPrice,
                                     Pageable pageable);
}
