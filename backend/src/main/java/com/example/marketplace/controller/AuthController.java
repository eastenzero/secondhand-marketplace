package com.example.marketplace.controller;

import com.example.marketplace.dto.auth.LoginRequest;
import com.example.marketplace.dto.auth.RegisterRequest;
import com.example.marketplace.dto.auth.RegisterResponse;
import com.example.marketplace.security.JwtProperties;
import com.example.marketplace.service.AuthService;
import com.example.marketplace.service.IpRateLimiter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final JwtProperties jwtProperties;
    private final IpRateLimiter ipRateLimiter;

    public AuthController(AuthService authService, JwtProperties jwtProperties, IpRateLimiter ipRateLimiter) {
        this.authService = authService;
        this.jwtProperties = jwtProperties;
        this.ipRateLimiter = ipRateLimiter;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request,
                                                     HttpServletRequest httpRequest) {
        String key = httpRequest.getRemoteAddr() + ":REGISTER";
        ipRateLimiter.checkRateLimit(key);
        Long userId = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterResponse(userId));
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request,
                                      HttpServletRequest httpRequest,
                                      HttpServletResponse response) {
        String key = httpRequest.getRemoteAddr() + ":LOGIN";
        ipRateLimiter.checkRateLimit(key);
        String token = authService.login(request);

        Cookie cookie = new Cookie(jwtProperties.getCookieName(), token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(false);
        int maxAgeSeconds = (int) Duration.ofDays(jwtProperties.getExpirationDays()).getSeconds();
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(jwtProperties.getCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(false);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.noContent().build();
    }
}
