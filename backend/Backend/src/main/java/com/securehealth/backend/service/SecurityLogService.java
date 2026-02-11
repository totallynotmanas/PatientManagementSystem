package com.securehealth.backend.service;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.SecurityLog;
import com.securehealth.backend.repository.SecurityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for security logging and audit functionality.
 * <p>
 * Handles logging of all security-related events including authentication
 * attempts, 2FA verification, account lockouts, and other security incidents.
 * </p>
 * 
 * @author Manas
 */
@Service
public class SecurityLogService {

    @Autowired
    private SecurityLogRepository securityLogRepository;

    /**
     * Logs a successful login event
     */
    public void logLoginSuccess(Long userId, String ipAddress, String userAgent) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEventType("LOGIN_SUCCESS");
        log.setIpAddress(ipAddress);
        log.setSeverity("INFO");
        log.setDetails("User logged in successfully");
        log.setTimestamp(LocalDateTime.now());
        
        securityLogRepository.save(log);
    }

    /**
     * Logs a failed login attempt
     */
    public void logLoginFailure(Long userId, String ipAddress, String reason) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEventType("LOGIN_FAILED");
        log.setIpAddress(ipAddress);
        log.setSeverity("WARN");
        log.setDetails("Login failed: " + reason);
        log.setTimestamp(LocalDateTime.now());
        
        securityLogRepository.save(log);
    }

    /**
     * Logs successful 2FA verification
     */
    public void log2FASuccess(Long userId, String ipAddress) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEventType("2FA_SUCCESS");
        log.setIpAddress(ipAddress);
        log.setSeverity("INFO");
        log.setDetails("2FA verification successful");
        log.setTimestamp(LocalDateTime.now());
        
        securityLogRepository.save(log);
    }

    /**
     * Logs a failed 2FA attempt
     */
    public void log2FAFailure(Long userId, String ipAddress, String reason) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEventType("2FA_FAILED");
        log.setIpAddress(ipAddress);
        log.setSeverity("WARN");
        log.setDetails("2FA verification failed: " + reason);
        log.setTimestamp(LocalDateTime.now());
        
        securityLogRepository.save(log);
    }

    /**
     * Logs account lockout event
     */
    public void logAccountLocked(Long userId, String ipAddress, String reason) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEventType("ACCOUNT_LOCKED");
        log.setIpAddress(ipAddress);
        log.setSeverity("CRITICAL");
        log.setDetails("Account locked: " + reason);
        log.setTimestamp(LocalDateTime.now());
        
        securityLogRepository.save(log);
    }

    /**
     * Logs password reset event
     */
    public void logPasswordReset(Long userId, String ipAddress) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEventType("PASSWORD_RESET");
        log.setIpAddress(ipAddress);
        log.setSeverity("INFO");
        log.setDetails("Password reset initiated");
        log.setTimestamp(LocalDateTime.now());
        
        securityLogRepository.save(log);
    }

    /**
     * Checks if user has exceeded rate limit for failed login attempts
     */
    public boolean hasExceededLoginRateLimit(Long userId) {
        int recentFailures = securityLogRepository.countFailedLoginsSince(
            userId, LocalDateTime.now().minusMinutes(30));
        return recentFailures >= 5;
    }

    /**
     * Checks if user has exceeded rate limit for OTP attempts
     */
    public boolean hasExceededOtpRateLimit(Long userId) {
        int recentOtpFailures = securityLogRepository.countFailedOtpAttemptsSince(
            userId, LocalDateTime.now().minusMinutes(15));
        return recentOtpFailures >= 3;
    }
}
