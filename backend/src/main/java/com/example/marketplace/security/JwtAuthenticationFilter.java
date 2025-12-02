package com.example.marketplace.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final JwtProperties properties;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, JwtProperties properties) {
        this.tokenProvider = tokenProvider;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Cookie[] cookies = request.getCookies();
        if (cookies != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String jwt = Arrays.stream(cookies)
                    .filter(c -> properties.getCookieName().equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);

            if (StringUtils.hasText(jwt)) {
                try {
                    Claims claims = tokenProvider.parseToken(jwt);
                    Object userIdClaim = claims.get("userId");
                    Long userId = userIdClaim instanceof Number ? ((Number) userIdClaim).longValue() : null;
                    String username = claims.getSubject();
                    String role = claims.get("role", String.class);

                    if (userId != null && username != null && role != null) {
                        AuthenticatedUser principal = new AuthenticatedUser(
                                userId,
                                username,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (JwtException ex) {
                    // ignore invalid token, will be treated as anonymous
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
