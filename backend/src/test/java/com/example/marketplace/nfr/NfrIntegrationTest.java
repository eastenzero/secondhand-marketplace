package com.example.marketplace.nfr;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.audit.AuditLog;
import com.example.marketplace.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NfrIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void traceId_generatedWhenMissing_shouldReturnHeader() throws Exception {
        mockMvc.perform(get("/api/items")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Trace-Id"))
                .andExpect(result -> {
                    String traceId = result.getResponse().getHeader("X-Trace-Id");
                    assertNotNull(traceId);
                    assertFalse(traceId.isBlank());
                });
    }

    @Test
    void traceId_passthrough_shouldEchoSameHeader() throws Exception {
        String customTraceId = "trace-test-123";

        mockMvc.perform(get("/api/items")
                        .param("page", "1")
                        .param("size", "20")
                        .header("X-Trace-Id", customTraceId))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Trace-Id", customTraceId));
    }

    @Test
    void healthEndpoint_shouldReturnUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void register_shouldWriteAuditLog() throws Exception {
        auditLogRepository.deleteAll();
        long before = auditLogRepository.count();

        String body = """
                {
                  \"username\": \"audit_user_1\",
                  \"password\": \"password123\"
                }
                """;

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").isNumber());

        long after = auditLogRepository.count();
        assertEquals(before + 1, after);

        List<AuditLog> logs = auditLogRepository.findAll();
        AuditLog log = logs.get(logs.size() - 1);
        assertEquals("INFO", log.getLevel());
        assertEquals("REGISTER", log.getAction());
        assertEquals("USER", log.getEntityType());
        assertNotNull(log.getActorUserId());
        assertEquals(log.getActorUserId(), log.getEntityId());
    }
}
