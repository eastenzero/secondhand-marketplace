package com.example.marketplace.comment;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.repository.ItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CommentControllerTest extends BaseIntegrationTest {

    @Autowired
    private ItemRepository itemRepository;

    @Test
    void createComment_success() throws Exception {
        var cookie = authCookie("comment_user");
        var user = userRepository.findByUsername("comment_user").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("comment item");
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
                  \"content\": \"hello\"
                }
                """.formatted(saved.getItemId());

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.commentId").isNumber());

        mockMvc.perform(get("/api/comments")
                        .param("targetType", "item")
                        .param("targetId", saved.getItemId().toString())
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void createComment_emptyContent_shouldReturnContentInvalid() throws Exception {
        var cookie = authCookie("comment_user_empty");
        var user = userRepository.findByUsername("comment_user_empty").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("comment item empty");
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
                  \"content\": "   "
                }
                """.formatted(saved.getItemId());

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("CONTENT_INVALID"));
    }

    @Test
    void createComment_tooLongContent_shouldReturnContentInvalid() throws Exception {
        var cookie = authCookie("comment_user_long");
        var user = userRepository.findByUsername("comment_user_long").orElseThrow();

        Item item = new Item();
        item.setSellerId(user.getUserId());
        item.setTitle("comment item long");
        item.setDescription("desc");
        item.setCategory("cat");
        item.setPrice(new BigDecimal("100.00"));
        item.setCondition(null);
        item.setStatus(ItemStatus.active.name());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        Item saved = itemRepository.save(item);

        String longContent = "a".repeat(1001);

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": %d,
                  \"content\": \"%s\"
                }
                """.formatted(saved.getItemId(), longContent);

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("CONTENT_INVALID"));
    }

    @Test
    void createComment_targetNotFound_shouldReturnTargetNotFound() throws Exception {
        var cookie = authCookie("comment_user_target_missing");

        String body = """
                {
                  \"targetType\": \"item\",
                  \"targetId\": 999999,
                  \"content\": \"hello\"
                }
                """;

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TARGET_NOT_FOUND"));
    }
}
