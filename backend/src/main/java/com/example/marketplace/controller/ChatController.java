package com.example.marketplace.controller;

import com.example.marketplace.domain.thread.ChatThread;
import com.example.marketplace.dto.common.ManageResultResponse;
import com.example.marketplace.dto.message.MessageListResponse;
import com.example.marketplace.dto.thread.CreateThreadRequest;
import com.example.marketplace.dto.thread.CreateThreadResponse;
import com.example.marketplace.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/threads")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<CreateThreadResponse> createThread(@Valid @RequestBody CreateThreadRequest request) {
        ChatThread thread = chatService.createThreadWithFirstMessage(request);
        CreateThreadResponse response = new CreateThreadResponse(thread.getThreadId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<MessageListResponse> listMessages(@PathVariable("id") Long id,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        MessageListResponse response = chatService.listMessages(id, page, size);
        return ResponseEntity.ok(response);
    }
}
