package com.example.marketplace.offer;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.repository.ItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OfferControllerTest extends BaseIntegrationTest {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private DemandRepository demandRepository;

    @Test
    void selfOffer_shouldBeRejected() throws Exception {
        var cookie = authCookie("offer_self_user");

        var user = userRepository.findByUsername("offer_self_user").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("self offer item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"amount\": 50.00
                }
                """.formatted(saved.getItemId());

        mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("SELF_OFFER_NOT_ALLOWED"));
    }

    @Test
    void createOffer_onActiveItem_success() throws Exception {
        var sellerCookie = authCookie("offer_seller");
        var seller = userRepository.findByUsername("offer_seller").orElseThrow();

        Item item = new Item();
        item.setSellerId(seller.getUserId());
        item.setTitle("offer item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        var buyerCookie = authCookie("offer_buyer");

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"amount\": 80.00,
                  \"message\": \"can we make a deal?\"
                }
                """.formatted(saved.getItemId());

        mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(buyerCookie))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.offerId").isNumber())
                .andExpect(jsonPath("$.status").value("created"));
    }

    @Test
    void createOffer_onOffItem_shouldReturnTargetNotActive() throws Exception {
        var sellerCookie = authCookie("offer_off_seller");
        var seller = userRepository.findByUsername("offer_off_seller").orElseThrow();

        Item item = new Item();
        item.setSellerId(seller.getUserId());
        item.setTitle("offer off item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.off.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        var buyerCookie = authCookie("offer_off_buyer");

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"amount\": 80.00
                }
                """.formatted(saved.getItemId());

        mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(buyerCookie))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TARGET_NOT_ACTIVE"));
    }

    @Test
    void createOffer_onNonexistentItem_shouldReturnTargetNotFound() throws Exception {
        var buyerCookie = authCookie("offer_nonexistent_buyer");

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": 999999,
                  \"amount\": 80.00
                }
                """;

        mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(buyerCookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TARGET_NOT_FOUND"));
    }

    @Test
    void createOffer_invalidAmount_shouldReturnInvalidAmount() throws Exception {
        var sellerCookie = authCookie("offer_invalid_amount_seller");
        var seller = userRepository.findByUsername("offer_invalid_amount_seller").orElseThrow();

        Item item = new Item();
        item.setSellerId(seller.getUserId());
        item.setTitle("offer invalid amount item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        var buyerCookie = authCookie("offer_invalid_amount_buyer");

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"amount\": 0
                }
                """.formatted(saved.getItemId());

        mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(buyerCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_AMOUNT"));
    }
}
