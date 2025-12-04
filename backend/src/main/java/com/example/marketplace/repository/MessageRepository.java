package com.example.marketplace.repository;

import com.example.marketplace.domain.message.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByThreadId(Long threadId, Pageable pageable);
}
