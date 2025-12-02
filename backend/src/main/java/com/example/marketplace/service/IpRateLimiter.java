package com.example.marketplace.service;

import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IpRateLimiter {

    private static class CounterWindow {
        private long windowStartMillis;
        private int count;
    }

    private final Map<String, CounterWindow> counters = new ConcurrentHashMap<>();

    private static final long WINDOW_MILLIS = 60_000L;
    private static final int MAX_ATTEMPTS = 10;

    public void checkRateLimit(String key) {
        long now = Instant.now().toEpochMilli();
        CounterWindow window = counters.computeIfAbsent(key, k -> {
            CounterWindow cw = new CounterWindow();
            cw.windowStartMillis = now;
            cw.count = 0;
            return cw;
        });

        synchronized (window) {
            if (now - window.windowStartMillis > WINDOW_MILLIS) {
                window.windowStartMillis = now;
                window.count = 0;
            }
            window.count++;
            if (window.count > MAX_ATTEMPTS) {
                throw new BusinessException(ErrorCode.RATE_LIMITED, "Too many requests");
            }
        }
    }

    public void reset() {
        counters.clear();
    }
}
