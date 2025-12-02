package com.example.marketplace.demand;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.ItemStatus;
import com.example.marketplace.repository.DemandRepository;
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

class DemandControllerTest extends BaseIntegrationTest {

    @Autowired
    private DemandRepository demandRepository;

    @Test
    void createDemand_invalidExpectedPrice_shouldFailValidation() throws Exception {
        String body = """
                {
                  \"title\": \"demand_invalid_price\",
                  \"desc\": \"desc\",
                  \"category\": \"cat\",
                  \"expectedPrice\": 0
                }
                """;

        mockMvc.perform(post("/api/demands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(authCookie("demand_creator")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void createDemand_success_shouldReturnDemandIdAndStatus() throws Exception {
        String body = """
                {
                  \"title\": \"demand_ok_1\",
                  \"desc\": \"need something\",
                  \"category\": \"cat\",
                  \"expectedPrice\": 50.00
                }
                """;

        mockMvc.perform(post("/api/demands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(authCookie("demand_creator_ok")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.demandId").isNumber())
                .andExpect(jsonPath("$.status").isString());
    }

    @Test
    void searchDemands_noResult_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/demands")
                        .param("keywords", "__no_such_demand_keyword__")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void manageDemand_update_success() throws Exception {
        var cookie = authCookie("demand_owner");
        var user = userRepository.findByUsername("demand_owner").orElseThrow();

        Demand demand = new Demand();
        demand.setBuyerId(user.getUserId());
        demand.setTitle("old title");
        demand.setDescription("old desc");
        demand.setCategory("cat");
        demand.setExpectedPrice(new BigDecimal("50.00"));
        demand.setStatus(ItemStatus.active.name());
        demand.setCreatedAt(Instant.now());
        demand.setUpdatedAt(Instant.now());
        Demand saved = demandRepository.save(demand);

        String body = """
                {
                  \"action\": \"update\",
                  \"payload\": { "title": \"new title\" }
                }
                """;

        mockMvc.perform(patch("/api/demands/" + saved.getDemandId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ok"));

        Demand updated = demandRepository.findById(saved.getDemandId()).orElseThrow();
        assertEquals("new title", updated.getTitle());
    }

    @Test
    void manageDemand_update_forbiddenForNonOwner() throws Exception {
        var ownerCookie = authCookie("demand_owner2");
        var owner = userRepository.findByUsername("demand_owner2").orElseThrow();

        Demand demand = new Demand();
        demand.setBuyerId(owner.getUserId());
        demand.setTitle("title");
        demand.setDescription("desc");
        demand.setCategory("cat");
        demand.setExpectedPrice(new BigDecimal("50.00"));
        demand.setStatus(ItemStatus.active.name());
        demand.setCreatedAt(Instant.now());
        demand.setUpdatedAt(Instant.now());
        Demand saved = demandRepository.save(demand);

        var otherCookie = authCookie("demand_other");

        String body = """
                {
                  \"action\": \"update\",
                  \"payload\": { "title": \"new title\" }
                }
                """;

        mockMvc.perform(patch("/api/demands/" + saved.getDemandId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(otherCookie))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN_OWNER"));
    }

    @Test
    void manageDemand_off_success() throws Exception {
        var cookie = authCookie("demand_off_owner");
        var user = userRepository.findByUsername("demand_off_owner").orElseThrow();

        Demand demand = new Demand();
        demand.setBuyerId(user.getUserId());
        demand.setTitle("title");
        demand.setDescription("desc");
        demand.setCategory("cat");
        demand.setExpectedPrice(new BigDecimal("50.00"));
        demand.setStatus(ItemStatus.active.name());
        demand.setCreatedAt(Instant.now());
        demand.setUpdatedAt(Instant.now());
        Demand saved = demandRepository.save(demand);

        String body = """
                {
                  \"action\": \"off\"
                }
                """;

        mockMvc.perform(patch("/api/demands/" + saved.getDemandId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ok"));

        Demand updated = demandRepository.findById(saved.getDemandId()).orElseThrow();
        assertEquals(ItemStatus.off.name(), updated.getStatus());
    }

    @Test
    void manageDemand_deleted_shouldReturnConflictState() throws Exception {
        var cookie = authCookie("demand_deleted_owner");
        var user = userRepository.findByUsername("demand_deleted_owner").orElseThrow();

        Demand demand = new Demand();
        demand.setBuyerId(user.getUserId());
        demand.setTitle("title");
        demand.setDescription("desc");
        demand.setCategory("cat");
        demand.setExpectedPrice(new BigDecimal("50.00"));
        demand.setStatus(ItemStatus.deleted.name());
        demand.setCreatedAt(Instant.now());
        demand.setUpdatedAt(Instant.now());
        Demand saved = demandRepository.save(demand);

String body = """
        {
          \"action\": \"update\",
          \"payload\": { "title": \"new title\" }
        }
        """;

        mockMvc.perform(patch("/api/demands/" + saved.getDemandId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookie))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT_STATE"));
    }

    @Test
    void getDemand_deleted_shouldReturnNotFound() throws Exception {
        authCookie("demand_deleted_existing_user");
        var user = userRepository.findByUsername("demand_deleted_existing_user").orElseThrow();

        Demand demand = new Demand();
        demand.setBuyerId(user.getUserId());
        demand.setTitle("deleted demand");
        demand.setDescription("desc");
        demand.setCategory("cat");
        demand.setExpectedPrice(new BigDecimal("50.00"));
        demand.setStatus(ItemStatus.deleted.name());
        demand.setCreatedAt(Instant.now());
        demand.setUpdatedAt(Instant.now());
        Demand saved = demandRepository.save(demand);

        mockMvc.perform(get("/api/demands/" + saved.getDemandId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void searchDemands_invalidPage_shouldReturnInvalidRange() throws Exception {
        mockMvc.perform(get("/api/demands")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RANGE"));
    }

    @Test
    void searchDemands_invalidPriceRange_shouldReturnInvalidRange() throws Exception {
        mockMvc.perform(get("/api/demands")
                        .param("minPrice", "100")
                        .param("maxPrice", "10")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RANGE"));
    }
}
