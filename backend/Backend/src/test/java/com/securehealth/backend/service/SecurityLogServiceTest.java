package com.securehealth.backend.service;

import com.securehealth.backend.model.SecurityLog;
import com.securehealth.backend.repository.SecurityLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityLogServiceTest {

    @Mock
    private SecurityLogRepository securityLogRepository;

    @InjectMocks
    private SecurityLogService securityLogService;

    @Test
    void logLoginSuccessSavesEntry() {
        securityLogService.logLoginSuccess(10L, "127.0.0.1", "Chrome");
        ArgumentCaptor<SecurityLog> captor = ArgumentCaptor.forClass(SecurityLog.class);
        verify(securityLogRepository).save(captor.capture());
        SecurityLog log = captor.getValue();
        assertEquals("LOGIN_SUCCESS", log.getEventType());
        assertEquals("INFO", log.getSeverity());
        assertEquals(10L, log.getUserId());
        assertEquals("127.0.0.1", log.getIpAddress());
    }

    @Test
    void logLoginFailureSavesEntry() {
        securityLogService.logLoginFailure(12L, "10.0.0.2", "Bad password");
        ArgumentCaptor<SecurityLog> captor = ArgumentCaptor.forClass(SecurityLog.class);
        verify(securityLogRepository).save(captor.capture());
        SecurityLog log = captor.getValue();
        assertEquals("LOGIN_FAILED", log.getEventType());
        assertEquals("WARN", log.getSeverity());
        assertEquals(12L, log.getUserId());
    }

    @Test
    void hasExceededLoginRateLimitUsesRepository() {
        when(securityLogRepository.countFailedLoginsSince(eq(5L), any(LocalDateTime.class))).thenReturn(6);
        assertTrue(securityLogService.hasExceededLoginRateLimit(5L));
    }

    @Test
    void hasExceededOtpRateLimitUsesRepository() {
        when(securityLogRepository.countFailedOtpAttemptsSince(eq(7L), any(LocalDateTime.class))).thenReturn(3);
        assertTrue(securityLogService.hasExceededOtpRateLimit(7L));
    }
}
