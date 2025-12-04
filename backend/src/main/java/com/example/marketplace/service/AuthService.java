package com.example.marketplace.service;

import com.example.marketplace.domain.user.User;
import com.example.marketplace.domain.user.UserRole;
import com.example.marketplace.dto.auth.ContactDto;
import com.example.marketplace.dto.auth.LoginRequest;
import com.example.marketplace.dto.auth.RegisterRequest;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.UserRepository;
import com.example.marketplace.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;
    private final UserBanService userBanService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuditService auditService,
                       UserBanService userBanService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
        this.userBanService = userBanService;
    }

    public Long register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            auditService.auditWarn(null, "REGISTER_FAILED", "USER", null, "Username already taken: " + request.getUsername());
            throw new BusinessException(ErrorCode.USERNAME_TAKEN, "Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        ContactDto contact = request.getContact();
        if (contact != null) {
            user.setContactPhone(contact.getPhone());
            user.setContactEmail(contact.getEmail());
        }

        user.setRole(UserRole.MEMBER);
        user.setStatus("active");

        User saved = userRepository.save(user);

        auditService.auditInfo(saved.getUserId(), "REGISTER", "USER", saved.getUserId(), "User registered");
        return saved.getUserId();
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            Long actorId = user != null ? user.getUserId() : null;
            auditService.auditWarn(actorId, "LOGIN_FAILED", "USER", actorId, "Invalid username or password for " + request.getUsername());
            throw new BusinessException(ErrorCode.AUTH_FAILED, "Invalid username or password");
        }

        if (!"active".equals(user.getStatus())) {
            auditService.auditWarn(user.getUserId(), "LOGIN_DISABLED", "USER", user.getUserId(),
                    "Login attempt for disabled user " + user.getUsername());
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED, "User account is disabled");
        }

        if (userBanService.hasActiveBan(user.getUserId())) {
            auditService.auditWarn(user.getUserId(), "LOGIN_BANNED", "USER", user.getUserId(),
                    "Login attempt for banned user " + user.getUsername());
            throw new BusinessException(ErrorCode.USER_BANNED, "User is banned");
        }

        auditService.auditInfo(user.getUserId(), "LOGIN", "USER", user.getUserId(), "User login success");
        return jwtTokenProvider.generateToken(user);
    }
}
