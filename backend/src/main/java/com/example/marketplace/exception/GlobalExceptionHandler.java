package com.example.marketplace.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorCode code = ex.getErrorCode();
        HttpStatus status = mapStatus(code);
        ApiErrorResponse body = new ApiErrorResponse(code.name(), ex.getMessage());
        return new ResponseEntity<>(body, status);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Validation failed");
        ApiErrorResponse body = new ApiErrorResponse(ErrorCode.VALIDATION_ERROR.name(), message);
        return new ResponseEntity<>(body, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        ApiErrorResponse body = new ApiErrorResponse(ErrorCode.VALIDATION_ERROR.name(), ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleOtherExceptions(Exception ex) {
        ApiErrorResponse body = new ApiErrorResponse("INTERNAL_ERROR", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private HttpStatus mapStatus(ErrorCode code) {
        return switch (code) {
            case AUTH_REQUIRED, AUTH_FAILED -> HttpStatus.UNAUTHORIZED;
            case USERNAME_TAKEN -> HttpStatus.CONFLICT;
            case NOT_FOUND, TARGET_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case TARGET_NOT_ACTIVE, CONFLICT_STATE -> HttpStatus.CONFLICT;
            case INVALID_RANGE, INVALID_AMOUNT -> HttpStatus.BAD_REQUEST;
            case CONTENT_INVALID, VALIDATION_ERROR -> HttpStatus.UNPROCESSABLE_ENTITY;
            case FORBIDDEN_OWNER, SELF_OFFER_NOT_ALLOWED, ACCOUNT_DISABLED, USER_BANNED -> HttpStatus.FORBIDDEN;
            case RATE_LIMITED -> HttpStatus.TOO_MANY_REQUESTS;
        };
    }
}
