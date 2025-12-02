package com.example.marketplace.auth;

import com.example.marketplace.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends BaseIntegrationTest {

    @Test
    void register_success() throws Exception {
        String body = """
                {
                  \"username\": \"user_reg_1\",
                  \"password\": \"password123\",
                  \"contact\": { \"phone\": \"123\", \"email\": \"u1@example.com\" }
                }
                """;

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @Test
    void register_duplicateUsername_shouldReturnUsernameTaken() throws Exception {
        String body = """
                {
                  \"username\": \"user_reg_dup\",
                  \"password\": \"password123\"
                }
                """;

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("USERNAME_TAKEN"));
    }

    @Test
    void login_success_shouldSetAuthCookie() throws Exception {
        String registerBody = """
                {
                  \"username\": \"user_login_1\",
                  \"password\": \"password123\"
                }
                """;

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = """
                { \"username\": \"user_login_1\", \"password\": \"password123\" }
                """;

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(jwtProperties.getCookieName()));
    }

    @Test
    void login_fail_invalid_credentials() throws Exception {
        String body = """
                { \"username\": \"not_exists\", \"password\": \"wrong\" }
                """;

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_FAILED"));
    }

    @Test
    void login_rateLimited_afterTooManyAttempts() throws Exception {
        String body = """
                { \"username\": \"not_exists_rate\", \"password\": \"wrong\" }
                """;

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("AUTH_FAILED"));
        }

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
    }
}
