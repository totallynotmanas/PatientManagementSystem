package com.securehealth.backend.service;

import com.securehealth.backend.model.AuditLog;
import com.securehealth.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimiterService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void checkLoginAttempts(String email, String ipAddress, String userAgent) {
        String lockKey = "auth:lock:" + email;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            logEvent(email, "LOGIN_BLOCKED", ipAddress, userAgent, "Account is temporarily locked");
            throw new RuntimeException("Account is temporarily locked. Try again in 30 minutes.");
        }
    }


    public void registerFailedLogin(String email, String ipAddress, String userAgent) {
        String failKey = "auth:fail:" + email;
        String lockKey = "auth:lock:" + email;

        Long attempts = redisTemplate.opsForValue().increment(failKey);
        
        // If it's the first failure, set expiry to 15 mins
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(failKey, Duration.ofMinutes(15));
        }


        if (attempts != null && attempts >= 5) {
            redisTemplate.opsForValue().set(lockKey, "LOCKED", Duration.ofMinutes(30));
            redisTemplate.delete(failKey); // Reset counter so it starts fresh after unlock
            
            logEvent(email, "ACCOUNT_LOCKED", ipAddress, userAgent, "Locked due to 5 failed attempts");
            throw new RuntimeException("Too many failed attempts. Account locked for 30 minutes.");
        }
    }
        
    public void resetLoginAttempts(String email) {
        redisTemplate.delete("auth:fail:" + email);
    }


    public void checkOtpAttempts(String email, String ipAddress, String userAgent) {
        String key = "otp:attempt:" + email;
        String attemptsStr = redisTemplate.opsForValue().get(key);
        
        if (attemptsStr != null && Integer.parseInt(attemptsStr) >= 3) {
            logEvent(email, "OTP_BLOCKED", ipAddress, userAgent, "Blocked due to too many invalid OTP attempts");
            throw new RuntimeException("Too many invalid OTP attempts. Please request a new OTP.");
        }
    }
    
    public void registerFailedOtp(String email, String ipAddress, String userAgent) {
        String key = "otp:attempt:" + email;

        Long attempts = redisTemplate.opsForValue().increment(key);
        
        // Expire the block after 5 minutes
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(5));
        }

        if (attempts != null && attempts >= 3) {
            logEvent(email, "OTP_LIMIT_REACHED", ipAddress, userAgent, "Limit reached for OTP attempts");
            throw new RuntimeException("Too many invalid OTP attempts. Please request a new OTP.");
        }
    }

    public void resetOtpAttempts(String email) {
        redisTemplate.delete("otp:attempt:" + email);
    }

    private void logEvent(String email, String action, String ip, String agent, String details) {
        try {
            AuditLog log = new AuditLog(email, action, ip, agent, details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}