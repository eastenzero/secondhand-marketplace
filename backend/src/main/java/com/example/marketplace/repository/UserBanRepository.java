package com.example.marketplace.repository;

import com.example.marketplace.domain.ban.BanStatus;
import com.example.marketplace.domain.ban.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBanRepository extends JpaRepository<UserBan, Long> {

    boolean existsByUserIdAndStatus(Long userId, BanStatus status);
}
