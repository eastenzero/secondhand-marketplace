package com.example.marketplace.service;

import com.example.marketplace.domain.message.Message;
import com.example.marketplace.domain.message.MessageStatus;
import com.example.marketplace.domain.thread.ChatThread;
import com.example.marketplace.domain.thread.ThreadTargetType;
import com.example.marketplace.dto.message.MessageListItem;
import com.example.marketplace.dto.message.MessageListResponse;
import com.example.marketplace.dto.thread.CreateThreadRequest;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.ChatThreadRepository;
import com.example.marketplace.repository.MessageRepository;
import com.example.marketplace.repository.UserRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatThreadRepository chatThreadRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final int MAX_PAGE_SIZE = 100;

    public ChatService(ChatThreadRepository chatThreadRepository,
                       MessageRepository messageRepository,
                       UserRepository userRepository,
                       AuditService auditService) {
        this.chatThreadRepository = chatThreadRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ChatThread createThreadWithFirstMessage(CreateThreadRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        String targetTypeStr = request.getTargetType();
        ThreadTargetType targetType;
        try {
            targetType = ThreadTargetType.valueOf(targetTypeStr);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid targetType");
        }

        Long recipientUserId = request.getRecipientUserId();
        if (recipientUserId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "recipientUserId is required");
        }

        userRepository.findById(recipientUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Recipient user not found"));

        Long currentUserId = principal.getUserId();
        if (currentUserId.equals(recipientUserId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Cannot start thread with yourself");
        }

        ChatThread thread = new ChatThread();
        thread.setTargetType(targetType);
        thread.setTargetId(request.getTargetId());
        thread.setCreatedByUserId(currentUserId);
        Instant now = Instant.now();
        thread.setCreatedAt(now);
        thread.setUpdatedAt(now);
        ChatThread savedThread = chatThreadRepository.save(thread);

        Message message = new Message();
        message.setThreadId(savedThread.getThreadId());
        message.setSenderUserId(currentUserId);
        message.setRecipientUserId(recipientUserId);
        message.setContent(request.getContent());
        message.setRead(false);
        message.setStatus(MessageStatus.active);
        message.setCreatedAt(now);
        message.setUpdatedAt(now);
        messageRepository.save(message);

        auditService.auditInfo(currentUserId, "THREAD_CREATE", "THREAD", savedThread.getThreadId(), "Thread created with first message");
        return savedThread;
    }

    @Transactional(readOnly = true)
    public MessageListResponse listMessages(Long threadId, int page, int size) {
        if (threadId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "threadId is required");
        }

        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Thread not found"));

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "createdAt"));

        Page<Message> pageResult = messageRepository.findByThreadId(threadId, pageable);

        List<MessageListItem> items = pageResult.getContent().stream()
                .map(m -> {
                    MessageListItem dto = new MessageListItem();
                    dto.setMessageId(m.getMessageId());
                    dto.setSenderUserId(m.getSenderUserId());
                    dto.setRecipientUserId(m.getRecipientUserId());
                    dto.setContent(m.getContent());
                    dto.setRead(m.isRead());
                    dto.setCreatedAt(m.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        MessageListResponse response = new MessageListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setMessages(items);
        return response;
    }
}
