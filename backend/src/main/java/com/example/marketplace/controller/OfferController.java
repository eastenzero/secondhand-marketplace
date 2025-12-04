package com.example.marketplace.controller;

import com.example.marketplace.domain.offer.Offer;
import com.example.marketplace.dto.offer.CreateOfferRequest;
import com.example.marketplace.dto.offer.CreateOfferResponse;
import com.example.marketplace.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    public ResponseEntity<CreateOfferResponse> createOffer(@Valid @RequestBody CreateOfferRequest request) {
        Offer offer = offerService.createOffer(request);
        CreateOfferResponse response = new CreateOfferResponse(offer.getOfferId(), offer.getStatus().name());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CreateOfferResponse> updateOfferStatus(@PathVariable("id") Long id,
                                                                 @RequestParam("action") String action) {
        Offer offer = offerService.updateOfferStatus(id, action);
        CreateOfferResponse response = new CreateOfferResponse(offer.getOfferId(), offer.getStatus().name());
        return ResponseEntity.ok(response);
    }
}
