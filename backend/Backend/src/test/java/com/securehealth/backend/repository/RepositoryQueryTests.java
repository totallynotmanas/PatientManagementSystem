package com.securehealth.backend.repository;

import com.securehealth.backend.model.DoctorProfile;
import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.PasswordHistory;
import com.securehealth.backend.model.PasswordResetToken;
import com.securehealth.backend.model.PatientProfile;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.model.SecurityLog;
import com.securehealth.backend.model.Session;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class RepositoryQueryTests {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private SecurityLogRepository securityLogRepository;

    private Login persistUser(String email) {
        Login user = new Login();
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setRole(Role.PATIENT);
        user.setTwoFactorEnabled(false);
        return entityManager.persist(user);
    }

    @Test
    void doctorProfileAndPatientProfilePersist() {
        Login user = persistUser("profile@example.com");
        DoctorProfile doctorProfile = new DoctorProfile();
        doctorProfile.setUser(user);
        doctorProfile.setFullName("Dr. Who");
        doctorProfile.setSpecialization("General");
        doctorProfile.setLicenseNumber("LIC123");
        doctorProfileRepository.save(doctorProfile);

        PatientProfile patientProfile = new PatientProfile();
        patientProfile.setUser(user);
        patientProfile.setFullName("Patient");
        patientProfile.setDateOfBirth(LocalDate.of(1991, 2, 2));
        patientProfileRepository.save(patientProfile);

        assertNotNull(doctorProfileRepository.findById(doctorProfile.getProfileId()).orElse(null));
        assertNotNull(patientProfileRepository.findById(patientProfile.getProfileId()).orElse(null));
    }

    @Test
    void sessionRepositoryFindByRefreshTokenHash() {
        Login user = persistUser("session@example.com");
        Session session = new Session();
        session.setUser(user);
        session.setRefreshTokenHash("refresh-hash");
        session.setExpiresAt(LocalDateTime.now().plusDays(1));
        entityManager.persist(session);
        Optional<Session> found = sessionRepository.findByRefreshTokenHash("refresh-hash");
        assertTrue(found.isPresent());
        assertEquals("refresh-hash", found.get().getRefreshTokenHash());
    }

    @Test
    void passwordHistoryRepositoryQueries() {
        Login user = persistUser("history@example.com");
        PasswordHistory history = new PasswordHistory(user, "hash1");
        entityManager.persist(history);
        assertEquals(1, passwordHistoryRepository.countByUser(user));
        assertFalse(passwordHistoryRepository.findByUserOrderByCreatedAtDesc(user).isEmpty());
    }

    @Test
    void passwordResetTokenRepositoryQueries() {
        Login user = persistUser("reset@example.com");
        PasswordResetToken token = new PasswordResetToken(user, "tokenHash", LocalDateTime.now().plusMinutes(10));
        token.setUsed(false);
        entityManager.persist(token);
        entityManager.flush();
        entityManager.clear();

        LocalDateTime nowTs = LocalDateTime.now().minusHours(1);
        assertTrue(passwordResetTokenRepository.findValidToken("tokenHash", nowTs).isPresent());
        passwordResetTokenRepository.invalidateAllTokensForUser(user);
        entityManager.flush();
        entityManager.clear();
        PasswordResetToken updated = passwordResetTokenRepository.findByTokenHash("tokenHash").orElseThrow();
        assertTrue(updated.isUsed());

        PasswordResetToken expired = new PasswordResetToken(user, "expiredHash", LocalDateTime.now().minusMinutes(5));
        entityManager.persist(expired);
        entityManager.flush();
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        entityManager.flush();
        entityManager.clear();
        assertFalse(passwordResetTokenRepository.findByTokenHash("expiredHash").isPresent());
    }

    @Test
    void securityLogRepositoryCountsFailures() {
        SecurityLog loginFailed = new SecurityLog();
        loginFailed.setUserId(10L);
        loginFailed.setEventType("LOGIN_FAILED");
        loginFailed.setSeverity("WARN");
        loginFailed.setTimestamp(LocalDateTime.now().minusMinutes(5));
        entityManager.persist(loginFailed);

        SecurityLog otpFailed = new SecurityLog();
        otpFailed.setUserId(10L);
        otpFailed.setEventType("2FA_FAILED");
        otpFailed.setSeverity("WARN");
        otpFailed.setTimestamp(LocalDateTime.now().minusMinutes(5));
        entityManager.persist(otpFailed);
        entityManager.flush();

        assertEquals(1, securityLogRepository.countFailedLoginsSince(10L, LocalDateTime.now().minusMinutes(30)));
        assertEquals(1, securityLogRepository.countFailedOtpAttemptsSince(10L, LocalDateTime.now().minusMinutes(30)));
    }
}
