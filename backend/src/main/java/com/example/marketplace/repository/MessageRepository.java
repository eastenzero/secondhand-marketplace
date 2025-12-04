package com.example.marketplace.repository;

import com.example.marketplace.domain.message.Message;
import com.example.marketplace.domain.message.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByThreadId(Long threadId, Pageable pageable);

    Page<Message> findByThreadIdAndStatusNot(Long threadId, MessageStatus status, Pageable pageable);

    @Query("select distinct m.threadId from Message m where m.senderUserId = ?1 or m.recipientUserId = ?1")
    List<Long> findDistinctThreadIdsByUserId(Long userId);

    boolean existsByThreadIdAndSenderUserIdOrThreadIdAndRecipientUserId(Long threadId1,
                                                                        Long senderUserId,
                                                                        Long threadId2,
                                                                        Long recipientUserId);

    Message findTopByThreadIdAndStatusNotOrderByCreatedAtDesc(Long threadId, MessageStatus status);

    long countByThreadIdAndRecipientUserIdAndStatusAndReadIsFalse(Long threadId,
                                                                  Long recipientUserId,
                                                                  MessageStatus status);

    List<Message> findByThreadIdAndRecipientUserIdAndStatusAndReadIsFalse(Long threadId,
                                                                          Long recipientUserId,
                                                                          MessageStatus status);
}
