package com.example.marketplace.item;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.repository.ItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ItemControllerTest extends BaseIntegrationTest {

    @Autowired
    private ItemRepository itemRepository;

    @Test
    void createItem_invalidPrice_shouldFailValidation() throws Exception {
        String body = """
                {
                  \"title\": \"item_invalid_price\",
                  \"desc\": \"desc\",
                  \"category\": \"cat\",
                  \"price\": 0
                }
                """;

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(authCookie("item_creator")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void searchItems_noResult_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/items")
                        .param("keywords", "__no_such_item_keyword__")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void createItem_success_shouldReturnItemIdAndStatus() throws Exception {
        String body = """
                {
                  \"title\": \"item_ok_1\",
                  \"desc\": \"valid item\",
                  \"category\": \"cat\",
                  \"price\": 100.00
                }
                """;

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(authCookie("item_creator_ok")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.itemId").isNumber())
                .andExpect(jsonPath("$.status").isString());
    }

    @Test
    void manageItem_update_success() throws Exception {
        var cookie = authCookie("item_owner");
        var user = userRepository.findByUsername("item_owner").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("old title");
        item.setDescription("old desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        String body = """
                {
                  \"action\": \"update\",
                  \"payload\": { "title": \"new title\" }
                }
                """;

        mockMvc.perform(patch("/api/items/" + saved.getItemId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ok"));

        Item updated = itemRepository.findById(saved.getItemId()).orElseThrow();
        assertEquals("new title", updated.getTitle());
    }

    @Test
    void manageItem_update_forbiddenForNonOwner() throws Exception {
        var ownerCookie = authCookie("item_owner2");
        var owner = userRepository.findByUsername("item_owner2").orElseThrow();

        Item item = new Item();
        item.setSellerId(owner.getUserId());
        item.setTitle("title");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        var otherCookie = authCookie("item_other");

        String body = """
                {
                  \"action\": \"update\",
                  \"payload\": { "title": \"new title\" }
                }
                """;

        mockMvc.perform(patch("/api/items/" + saved.getItemId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(otherCookie))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN_OWNER"));
    }

    @Test
    void manageItem_off_success() throws Exception {
        var cookie = authCookie("item_off_owner");
        var user = userRepository.findByUsername("item_off_owner").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("title");
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
                  \"action\": \"off\"
                }
                """;

        mockMvc.perform(patch("/api/items/" + saved.getItemId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ok"));

        Item updated = itemRepository.findById(saved.getItemId()).orElseThrow();
        assertEquals(ItemStatus.off.name(), updated.getStatus());
    }

    @Test
    void manageItem_deleted_shouldReturnConflictState() throws Exception {
        var cookie = authCookie("item_deleted_owner");
        var user = userRepository.findByUsername("item_deleted_owner").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("title");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.deleted.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        String body = """
                {
                  \"action\": \"update\",
                  \"payload\": { "title": \"new title\" }
                }
                """;

        mockMvc.perform(patch("/api/items/" + saved.getItemId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT_STATE"));
    }

    @Test
    void getItem_deleted_shouldReturnNotFound() throws Exception {
        authCookie("item_deleted_existing_user");
        var user = userRepository.findByUsername("item_deleted_existing_user").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("deleted item");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.deleted.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        mockMvc.perform(get("/api/items/" + saved.getItemId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void searchItems_invalidPage_shouldReturnInvalidRange() throws Exception {
        mockMvc.perform(get("/api/items")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RANGE"));
    }

    @Test
    void searchItems_invalidPriceRange_shouldReturnInvalidRange() throws Exception {
        mockMvc.perform(get("/api/items")
                        .param("minPrice", "100")
                        .param("maxPrice", "10")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RANGE"));
    }
}
