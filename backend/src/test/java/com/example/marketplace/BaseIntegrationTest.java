package com.example.marketplace;

import com.example.marketplace.domain.user.User;
import com.example.marketplace.domain.user.UserRole;
import com.example.marketplace.repository.UserRepository;
import com.example.marketplace.security.JwtProperties;
import com.example.marketplace.security.JwtTokenProvider;
import com.example.marketplace.service.IpRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtTokenProvider jwtTokenProvider;

    @Autowired
    protected JwtProperties jwtProperties;

    @Autowired
    protected IpRateLimiter ipRateLimiter;

    @BeforeEach
    void resetRateLimiter() {
        ipRateLimiter.reset();
    }

    protected Cookie authCookie(String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername(username);
                    u.setPasswordHash(passwordEncoder.encode("password123"));
                    u.setRole(UserRole.MEMBER);
                    u.setStatus("active");
                    return userRepository.save(u);
                });

        String token = jwtTokenProvider.generateToken(user);
        return new Cookie(jwtProperties.getCookieName(), token);
    }
}
