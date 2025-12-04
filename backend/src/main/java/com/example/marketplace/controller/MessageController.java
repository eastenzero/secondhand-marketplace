package com.example.marketplace.controller;

import com.example.marketplace.dto.common.ManageResultResponse;
import com.example.marketplace.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final ChatService chatService;

    public MessageController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ManageResultResponse> markMessageRead(@PathVariable("id") Long id) {
        chatService.markMessageRead(id);
        return ResponseEntity.ok(new ManageResultResponse("ok"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ManageResultResponse> manageMessage(@PathVariable("id") Long id,
                                                              @RequestParam("action") String action) {
        chatService.manageMessage(id, action);
        return ResponseEntity.ok(new ManageResultResponse("ok"));
    }
}
