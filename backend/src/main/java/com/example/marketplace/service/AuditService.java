package com.example.marketplace.service;

import com.example.marketplace.domain.audit.AuditLog;
import com.example.marketplace.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void auditInfo(Long actorUserId, String action, String entityType, Long entityId, String message) {
        save("INFO", actorUserId, action, entityType, entityId, message);
    }

    public void auditWarn(Long actorUserId, String action, String entityType, Long entityId, String message) {
        save("WARN", actorUserId, action, entityType, entityId, message);
    }

    private void save(String level, Long actorUserId, String action, String entityType, Long entityId, String message) {
        AuditLog logEntity = new AuditLog();
        logEntity.setLevel(level);
        logEntity.setActorUserId(actorUserId);
        logEntity.setAction(action);
        logEntity.setEntityType(entityType);
        logEntity.setEntityId(entityId);
        logEntity.setMessage(message);
        logEntity.setIp(resolveClientIp());
        logEntity.setCreatedAt(Instant.now());
        auditLogRepository.save(logEntity);

        try {
            if (actorUserId != null) {
                MDC.put("userId", actorUserId.toString());
            }
            MDC.put("action", action);
            logger.info("audit action={} entityType={} entityId={}", action, entityType, entityId);
        } finally {
            MDC.remove("userId");
            MDC.remove("action");
        }
    }

    private String resolveClientIp() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        HttpServletRequest request = attrs.getRequest();
        return request.getRemoteAddr();
    }
}
