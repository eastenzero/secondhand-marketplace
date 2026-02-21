package com.example.marketplace.controller;

import com.example.marketplace.service.ImageStyleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final ImageStyleService imageStyleService;

    public SystemController(ImageStyleService imageStyleService) {
        this.imageStyleService = imageStyleService;
    }

    @GetMapping("/image-style")
    public ResponseEntity<Map<String, String>> getImageStyle() {
        return ResponseEntity.ok(Map.of("style", imageStyleService.getStyle()));
    }

    @PutMapping("/image-style")
    public ResponseEntity<Map<String, String>> setImageStyle(@RequestBody Map<String, String> body) {
        String style = body.get("style");
        if (style == null || style.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "style is required"));
        }
        try {
            imageStyleService.setStyle(style);
            return ResponseEntity.ok(Map.of("style", imageStyleService.getStyle()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
