package com.securehealth.backend.integration;

import com.securehealth.backend.service.RateLimiterService;
import com.securehealth.backend.service.TokenBlacklistService;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

/**
 * Test configuration to disable Redis for integration tests.
 * This prevents Redis connection errors in CI environments.
 */
@Configuration
@EnableAutoConfiguration(exclude = {
    RedisAutoConfiguration.class,
    RedisRepositoriesAutoConfiguration.class
})
public class TestConfig {
    
    @MockBean
    private TokenBlacklistService tokenBlacklistService;
    
    @MockBean
    private RateLimiterService rateLimiterService;
    
    // This configuration class disables Redis autoconfiguration for tests
    // and provides mocks for Redis-dependent services
}
