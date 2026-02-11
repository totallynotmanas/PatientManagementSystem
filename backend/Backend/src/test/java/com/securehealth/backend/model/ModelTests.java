package com.securehealth.backend.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ModelTests {

    @Test
    void passwordResetTokenValidation() {
        Login user = new Login();
        user.setUserId(1L);
        PasswordResetToken token = new PasswordResetToken(user, "hash", LocalDateTime.now().plusMinutes(5));
        token.setUsed(false);
        assertTrue(token.isValid());
        token.setUsed(true);
        assertFalse(token.isValid());
    }

    @Test
    void passwordHistoryConstructorSetsFields() {
        Login user = new Login();
        user.setUserId(2L);
        PasswordHistory history = new PasswordHistory(user, "hash");
        assertEquals(user, history.getUser());
        assertEquals("hash", history.getPasswordHash());
    }

    @Test
    void sessionDefaults() {
        Session session = new Session();
        assertFalse(session.isRevoked());
        assertNotNull(session.getCreatedAt());
    }

    @Test
    void patientProfileFields() {
        Login user = new Login();
        user.setUserId(3L);
        PatientProfile profile = new PatientProfile(1L, user, "Patient Name", LocalDate.of(1990, 1, 1), "addr", "history");
        assertEquals("Patient Name", profile.getFullName());
        assertEquals(user, profile.getUser());
    }

    @Test
    void securityLogDefaults() {
        SecurityLog log = new SecurityLog();
        log.setEventType("LOGIN_SUCCESS");
        log.setSeverity("INFO");
        assertNotNull(log.getTimestamp());
    }

    @Test
    void roleEnumContainsAdmin() {
        assertEquals(Role.ADMIN, Role.valueOf("ADMIN"));
    }
}
