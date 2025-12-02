package com.example.marketplace.repository;

import com.example.marketplace.domain.demand.Demand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface DemandRepository extends JpaRepository<Demand, Long> {

    @Query("""
            select d from Demand d
            where d.status = 'active'
              and (:category is null or d.category = :category)
              and (:minPrice is null or d.expectedPrice >= :minPrice)
              and (:maxPrice is null or d.expectedPrice <= :maxPrice)
              and (:keywords is null or (
                lower(d.title) like lower(concat('%', :keywords, '%'))
                or lower(d.description) like lower(concat('%', :keywords, '%'))
              ))
            """)
    Page<Demand> searchActiveDemands(String keywords,
                                     String category,
                                     BigDecimal minPrice,
                                     BigDecimal maxPrice,
                                     Pageable pageable);
}
