package com.securehealth.backend.repository;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for LoginRepository.
 * Tests database queries using H2 in-memory database.
 */
@DataJpaTest
class LoginRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LoginRepository loginRepository;

    private Login testUser;

    @BeforeEach
    void setUp() {
        testUser = new Login();
        testUser.setEmail("testuser@example.com");
        testUser.setPasswordHash("hashedPassword123");
        testUser.setRole(Role.PATIENT);
        testUser.setLocked(false);

        entityManager.persistAndFlush(testUser);
    }

    // ==================== findByEmail() Tests ====================

    @Test
    void testFindByEmail_Found() {
        // Act
        Optional<Login> result = loginRepository.findByEmail("testuser@example.com");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("testuser@example.com", result.get().getEmail());
        assertEquals(Role.PATIENT, result.get().getRole());
    }

    @Test
    void testFindByEmail_NotFound() {
        // Act
        Optional<Login> result = loginRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void testFindByEmail_CaseSensitive() {
        // Act
        Optional<Login> result = loginRepository.findByEmail("TESTUSER@EXAMPLE.COM");

        // Assert
        // Database queries are typically case-sensitive for email unless explicitly
        // configured otherwise
        // This test documents the expected behavior
        assertFalse(result.isPresent());
    }

    // ==================== existsByEmail() Tests ====================

    @Test
    void testExistsByEmail_True() {
        // Act
        boolean exists = loginRepository.existsByEmail("testuser@example.com");

        // Assert
        assertTrue(exists);
    }

    @Test
    void testExistsByEmail_False() {
        // Act
        boolean exists = loginRepository.existsByEmail("notregistered@example.com");

        // Assert
        assertFalse(exists);
    }

    // ==================== Save & Persistence Tests ====================

    @Test
    void testSaveLogin_NewUser() {
        // Arrange
        Login newUser = new Login();
        newUser.setEmail("newuser@example.com");
        newUser.setPasswordHash("anotherHashedPassword");
        newUser.setRole(Role.DOCTOR);
        newUser.setLocked(false);

        // Act
        Login savedUser = loginRepository.save(newUser);
        entityManager.flush();

        // Assert
        assertNotNull(savedUser.getUserId());
        assertEquals("newuser@example.com", savedUser.getEmail());
        assertTrue(loginRepository.existsByEmail("newuser@example.com"));
    }

    @Test
    void testUpdateLogin_ModifyRole() {
        // Arrange
        Login user = loginRepository.findByEmail("testuser@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.NURSE);

        // Act
        loginRepository.save(user);
        entityManager.flush();

        // Assert
        Login updated = loginRepository.findByEmail("testuser@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));
        assertEquals(Role.NURSE, updated.getRole());
    }

    @Test
    void testDeleteLogin() {
        // Act
        loginRepository.deleteById(testUser.getUserId());
        entityManager.flush();

        // Assert
        Optional<Login> deleted = loginRepository.findByEmail("testuser@example.com");
        assertFalse(deleted.isPresent());
    }

    // ==================== Data Integrity Tests ====================

    @Test
    void testLogin_PasswordHashNotNull() {
        // Act
        Login user = loginRepository.findByEmail("testuser@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Assert
        assertNotNull(user.getPasswordHash());
        assertFalse(user.getPasswordHash().isEmpty());
    }

    @Test
    void testLogin_RoleNotNull() {
        // Act
        Login user = loginRepository.findByEmail("testuser@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Assert
        assertNotNull(user.getRole());
    }

    @Test
    void testLogin_MultipleUsers() {
        // Arrange
        Login user2 = new Login();
        user2.setEmail("doctor@hospital.com");
        user2.setPasswordHash("doctorHashedPassword");
        user2.setRole(Role.DOCTOR);
        user2.setLocked(false);
        loginRepository.save(user2);
        entityManager.flush();

        // Act
        Optional<Login> found1 = loginRepository.findByEmail("testuser@example.com");
        Optional<Login> found2 = loginRepository.findByEmail("doctor@hospital.com");

        // Assert
        assertTrue(found1.isPresent());
        assertTrue(found2.isPresent());
        assertNotEquals(found1.get().getUserId(), found2.get().getUserId());
    }
}
