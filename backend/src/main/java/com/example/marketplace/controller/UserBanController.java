package com.example.marketplace.controller;

import com.example.marketplace.domain.ban.UserBan;
import com.example.marketplace.dto.ban.CreateUserBanRequest;
import com.example.marketplace.dto.ban.CreateUserBanResponse;
import com.example.marketplace.dto.ban.UserBanListResponse;
import com.example.marketplace.dto.common.ManageResultResponse;
import com.example.marketplace.security.AuthenticatedUser;
import com.example.marketplace.service.UserBanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/user-bans")
public class UserBanController {

    private final UserBanService userBanService;

    public UserBanController(UserBanService userBanService) {
        this.userBanService = userBanService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreateUserBanResponse> createUserBan(@Valid @RequestBody CreateUserBanRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long adminUserId = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser principal
                ? principal.getUserId()
                : null;
        UserBan ban = userBanService.createUserBan(request, adminUserId);
        CreateUserBanResponse response = new CreateUserBanResponse(ban.getBanId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserBanListResponse> listUserBans(@RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        UserBanListResponse response = userBanService.listUserBans(page, size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ManageResultResponse> revokeBan(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long adminUserId = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser principal
                ? principal.getUserId()
                : null;
        userBanService.revokeBan(id, adminUserId);
        return ResponseEntity.ok(new ManageResultResponse("ok"));
    }
}
