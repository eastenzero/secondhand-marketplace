package com.example.marketplace.repository;

import com.example.marketplace.domain.offer.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferRepository extends JpaRepository<Offer, Long> {
}
