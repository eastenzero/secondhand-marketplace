package com.example.marketplace.repository;

import com.example.marketplace.domain.thread.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatThreadRepository extends JpaRepository<ChatThread, Long> {
}
