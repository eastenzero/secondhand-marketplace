package com.example.marketplace.order;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.domain.order.Order;
import com.example.marketplace.repository.ItemRepository;
import com.example.marketplace.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderLifecycleIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void offerToOrderHappyPath_shouldSucceed() throws Exception {
        var sellerCookie = authCookie("lifecycle_seller");
        var seller = userRepository.findByUsername("lifecycle_seller").orElseThrow();

        Item item = new Item();
        item.setSellerId(seller.getUserId());
        item.setTitle("lifecycle item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item savedItem = itemRepository.save(item);

        var buyerCookie = authCookie("lifecycle_buyer");

        String offerBody = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"amount\": 80.00
                }
                """.formatted(savedItem.getItemId());

        String offerResponse = mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(offerBody)
                        .cookie(buyerCookie))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.offerId").isNumber())
                .andExpect(jsonPath("$.status").value("created"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number offerIdNumber = com.jayway.jsonpath.JsonPath.read(offerResponse, "$.offerId");
        long offerId = offerIdNumber.longValue();

        mockMvc.perform(patch("/api/offers/" + offerId)
                        .param("action", "accept")
                        .cookie(sellerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("accepted"));

        String orderBody = """
                {
                  \"offerId\": %d,
                  \"shippingName\": \"buyer\",
                  \"shippingPhone\": \"123456\",
                  \"shippingAddress\": \"addr\",
                  \"paymentMethod\": \"COD\"
                }
                """.formatted(offerId);

        String orderResponse = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody)
                        .cookie(buyerCookie))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").isNumber())
                .andExpect(jsonPath("$.status").value("created"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number orderIdNumber = com.jayway.jsonpath.JsonPath.read(orderResponse, "$.orderId");
        long orderId = orderIdNumber.longValue();

        mockMvc.perform(patch("/api/orders/" + orderId)
                        .param("action", "pay")
                        .cookie(buyerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("paid"));

        mockMvc.perform(patch("/api/orders/" + orderId)
                        .param("action", "complete")
                        .cookie(buyerCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("completed"));

        Order order = orderRepository.findById(orderId).orElseThrow();
        assertThat(order.getStatus().name()).isEqualTo("completed");
    }

    @Test
    void illegalOrderTransition_shouldBeRejected() throws Exception {
        var sellerCookie = authCookie("illegal_seller");
        var seller = userRepository.findByUsername("illegal_seller").orElseThrow();

        Item item = new Item();
        item.setSellerId(seller.getUserId());
        item.setTitle("illegal item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item savedItem = itemRepository.save(item);

        var buyerCookie = authCookie("illegal_buyer");

        String offerBody = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"amount\": 80.00
                }
                """.formatted(savedItem.getItemId());

        String offerResponse = mockMvc.perform(post("/api/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(offerBody)
                        .cookie(buyerCookie))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number offerIdNumber2 = com.jayway.jsonpath.JsonPath.read(offerResponse, "$.offerId");
        long offerId = offerIdNumber2.longValue();

        String orderBody = """
                {
                  \"offerId\": %d,
                  \"shippingName\": \"buyer\",
                  \"shippingPhone\": \"123456\",
                  \"shippingAddress\": \"addr\",
                  \"paymentMethod\": \"COD\"
                }
                """.formatted(offerId);

        String orderResponse = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody)
                        .cookie(buyerCookie))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number orderIdNumber2 = com.jayway.jsonpath.JsonPath.read(orderResponse, "$.orderId");
        long orderId = orderIdNumber2.longValue();

        mockMvc.perform(patch("/api/orders/" + orderId)
                        .param("action", "complete")
                        .cookie(buyerCookie))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT_STATE"));
    }
}
