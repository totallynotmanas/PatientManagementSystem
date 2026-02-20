package com.securehealth.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class TokenBlacklistService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * Blacklists an Access Token until its natural expiration time.
     */
    public void blacklistToken(String token, long remainingMillis) {
        if (remainingMillis > 0) {
            String key = "jwt:blacklist:" + token;
            // The token naturally expires after this duration, so we can let Redis drop it then to save memory
            redisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(remainingMillis));
        }
    }

    /**
     * Checks if a token is in the blacklist.
     */
    public boolean isBlacklisted(String token) {
        String key = "jwt:blacklist:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }


    public void updateLastActive(String email) {
        String key = "session:active:" + email;
        // Extend the idle timeout by 30 minutes on every request
        redisTemplate.opsForValue().set(key, "active", Duration.ofMinutes(30));
    }

    public boolean isSessionIdle(String email) {
        String key = "session:active:" + email;
        // If the key doesn't exist, they have been idle for > 30 minutes
        return Boolean.FALSE.equals(redisTemplate.hasKey(key));
    }
    
    public void clearIdleSession(String email) {
        redisTemplate.delete("session:active:" + email);
    }
}