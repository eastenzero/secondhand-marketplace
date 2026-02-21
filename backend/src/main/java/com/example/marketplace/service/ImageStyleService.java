package com.example.marketplace.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Manages the current image style toggle (cartoon / photo).
 * Thread-safe, in-memory only (resets to default on restart).
 */
@Service
public class ImageStyleService {

    public static final String STYLE_CARTOON = "cartoon";
    public static final String STYLE_PHOTO = "photo";
    private static final Set<String> VALID_STYLES = Set.of(STYLE_CARTOON, STYLE_PHOTO);

    private final AtomicReference<String> currentStyle = new AtomicReference<>(STYLE_PHOTO);

    public String getStyle() {
        return currentStyle.get();
    }

    public void setStyle(String style) {
        if (!VALID_STYLES.contains(style)) {
            throw new IllegalArgumentException("Invalid style: " + style + ". Must be one of: " + VALID_STYLES);
        }
        currentStyle.set(style);
    }

    /**
     * Rewrite a single image URL based on current style.
     * photo paths: /demo-assets/photo/{cat}_{nn}.webp
     * cartoon paths: /demo-assets/cartoon/{cat}_{nn}.svg
     */
    public String rewriteImageUrl(String url) {
        if (url == null)
            return null;
        String style = currentStyle.get();
        if (STYLE_CARTOON.equals(style)) {
            // Rewrite photo → cartoon
            if (url.startsWith("/demo-assets/photo/")) {
                return url.replace("/demo-assets/photo/", "/demo-assets/cartoon/")
                        .replaceAll("\\.webp$", ".svg");
            }
        }
        // style=photo or URL not matching pattern → return as-is
        return url;
    }

    /**
     * Rewrite an array of image URLs.
     */
    public String[] rewriteImageUrls(String[] urls) {
        if (urls == null)
            return null;
        return Arrays.stream(urls)
                .map(this::rewriteImageUrl)
                .toArray(String[]::new);
    }
}
