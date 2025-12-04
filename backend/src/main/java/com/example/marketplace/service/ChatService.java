package com.example.marketplace.service;

import com.example.marketplace.domain.message.Message;
import com.example.marketplace.domain.message.MessageStatus;
import com.example.marketplace.domain.thread.ChatThread;
import com.example.marketplace.domain.thread.ThreadTargetType;
import com.example.marketplace.domain.user.User;
import com.example.marketplace.dto.message.MessageListItem;
import com.example.marketplace.dto.message.MessageListResponse;
import com.example.marketplace.dto.thread.CreateThreadRequest;
import com.example.marketplace.dto.thread.ThreadListItem;
import com.example.marketplace.dto.thread.ThreadListResponse;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatThreadRepository chatThreadRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final int MAX_PAGE_SIZE = 100;
    private static final long REVOKE_WINDOW_SECONDS = 300;

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

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

        Long currentUserId = principal.getUserId();
        boolean participant = messageRepository.existsByThreadIdAndSenderUserIdOrThreadIdAndRecipientUserId(
                threadId, currentUserId, threadId, currentUserId);
        if (!participant) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not participant of this thread");
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "createdAt"));

        Page<Message> pageResult = messageRepository.findByThreadIdAndStatusNot(threadId, MessageStatus.deleted, pageable);

        List<MessageListItem> items = pageResult.getContent().stream()
                .map(m -> {
                    MessageListItem dto = new MessageListItem();
                    dto.setMessageId(m.getMessageId());
                    dto.setSenderUserId(m.getSenderUserId());
                    dto.setRecipientUserId(m.getRecipientUserId());
                    dto.setContent(m.getContent());
                    dto.setRead(m.isRead());
                    dto.setCreatedAt(m.getCreatedAt());
                    dto.setStatus(m.getStatus().name());
                    return dto;
                })
                .collect(Collectors.toList());

        MessageListResponse response = new MessageListResponse();
        response.setTotal(pageResult.getTotalElements());
        response.setMessages(items);
        return response;
    }

    @Transactional(readOnly = true)
    public ThreadListResponse listMyThreads(int page, int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.INVALID_RANGE, "Invalid page or size");
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        Long currentUserId = principal.getUserId();

        List<Long> threadIds = messageRepository.findDistinctThreadIdsByUserId(currentUserId);

        List<ThreadListItem> allItems = new ArrayList<>();

        for (Long threadId : threadIds) {
            ChatThread thread = chatThreadRepository.findById(threadId)
                    .orElse(null);
            if (thread == null) {
                continue;
            }

            Message lastMessage = messageRepository.findTopByThreadIdAndStatusNotOrderByCreatedAtDesc(threadId, MessageStatus.deleted);
            if (lastMessage == null) {
                continue;
            }

            Long otherUserId;
            if (currentUserId.equals(lastMessage.getSenderUserId())) {
                otherUserId = lastMessage.getRecipientUserId();
            } else {
                otherUserId = lastMessage.getSenderUserId();
            }

            String otherUsername = null;
            if (otherUserId != null) {
                User other = userRepository.findById(otherUserId).orElse(null);
                if (other != null) {
                    otherUsername = other.getUsername();
                }
            }

            long unreadCount = messageRepository.countByThreadIdAndRecipientUserIdAndStatusAndReadIsFalse(
                    threadId, currentUserId, MessageStatus.active);

            ThreadListItem item = new ThreadListItem();
            item.setThreadId(threadId);
            item.setTargetType(thread.getTargetType().name());
            item.setTargetId(thread.getTargetId());
            item.setOtherUserId(otherUserId);
            item.setOtherUsername(otherUsername);
            item.setLastMessageId(lastMessage.getMessageId());
            item.setLastMessageContent(lastMessage.getContent());
            item.setLastMessageSenderUserId(lastMessage.getSenderUserId());
            item.setLastMessageStatus(lastMessage.getStatus().name());
            item.setLastMessageCreatedAt(lastMessage.getCreatedAt());
            item.setUnreadCount(unreadCount);
            item.setHasUnread(unreadCount > 0);

            allItems.add(item);
        }

        allItems.sort(Comparator.comparing(ThreadListItem::getLastMessageCreatedAt,
                        Comparator.nullsFirst(Comparator.naturalOrder()))
                .reversed());

        long total = allItems.size();
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, allItems.size());
        List<ThreadListItem> pageItems;
        if (fromIndex >= allItems.size()) {
            pageItems = new ArrayList<>();
        } else {
            pageItems = new ArrayList<>(allItems.subList(fromIndex, toIndex));
        }

        ThreadListResponse response = new ThreadListResponse();
        response.setTotal(total);
        response.setThreads(pageItems);
        return response;
    }

    @Transactional
    public void markMessageRead(Long messageId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (messageId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "messageId is required");
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Message not found"));

        Long currentUserId = principal.getUserId();
        if (!currentUserId.equals(message.getRecipientUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not recipient of this message");
        }

        if (message.getStatus() != MessageStatus.active) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE, "Message is not active");
        }

        if (!message.isRead()) {
            Instant now = Instant.now();
            message.setRead(true);
            message.setReadAt(now);
            message.setUpdatedAt(now);
            messageRepository.save(message);
        }
    }

    @Transactional
    public void markThreadAsRead(Long threadId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (threadId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "threadId is required");
        }

        chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Thread not found"));

        Long currentUserId = principal.getUserId();
        boolean participant = messageRepository.existsByThreadIdAndSenderUserIdOrThreadIdAndRecipientUserId(
                threadId, currentUserId, threadId, currentUserId);
        if (!participant) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not participant of this thread");
        }

        List<Message> messages = messageRepository.findByThreadIdAndRecipientUserIdAndStatusAndReadIsFalse(
                threadId, currentUserId, MessageStatus.active);
        if (!messages.isEmpty()) {
            Instant now = Instant.now();
            for (Message message : messages) {
                message.setRead(true);
                message.setReadAt(now);
                message.setUpdatedAt(now);
            }
            messageRepository.saveAll(messages);
        }
    }

    @Transactional
    public void manageMessage(Long messageId, String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        if (messageId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "messageId is required");
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Message not found"));

        Long currentUserId = principal.getUserId();
        Long senderUserId = message.getSenderUserId();
        Long recipientUserId = message.getRecipientUserId();

        if (!currentUserId.equals(senderUserId) && !currentUserId.equals(recipientUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not participant of this message");
        }

        Instant now = Instant.now();

        if ("revoke".equals(action)) {
            if (!currentUserId.equals(senderUserId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Only sender can revoke message");
            }
            if (message.getStatus() != MessageStatus.active) {
                throw new BusinessException(ErrorCode.CONFLICT_STATE, "Message cannot be revoked");
            }
            Instant createdAt = message.getCreatedAt();
            if (createdAt == null || createdAt.isBefore(now.minusSeconds(REVOKE_WINDOW_SECONDS))) {
                throw new BusinessException(ErrorCode.CONFLICT_STATE, "Message revoke window has passed");
            }
            message.setStatus(MessageStatus.recalled);
            message.setUpdatedAt(now);
        } else if ("delete".equals(action)) {
            if (message.getStatus() == MessageStatus.deleted) {
                throw new BusinessException(ErrorCode.CONFLICT_STATE, "Message already deleted");
            }
            message.setStatus(MessageStatus.deleted);
            message.setDeletedAt(now);
            message.setUpdatedAt(now);
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unsupported action");
        }

        messageRepository.save(message);
    }
}
