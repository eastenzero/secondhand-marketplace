package com.example.marketplace.service;

import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ListingPermissionService {

    public Long requireCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }
        return principal.getUserId();
    }

    public void assertItemOwner(Item item, Long currentUserId) {
        if (!item.getSellerId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not owner of this item");
        }
    }

    public void assertDemandOwner(Demand demand, Long currentUserId) {
        if (!demand.getBuyerId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not owner of this demand");
        }
    }
}
