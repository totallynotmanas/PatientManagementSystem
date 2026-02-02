package com.securehealth.backend.service;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.repository.LoginRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 * Tests business logic for user registration and authentication.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private LoginRepository loginRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private Login testUser;

    @BeforeEach
    void setUp() {
        testUser = new Login();
        testUser.setUser_id(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword123");
        testUser.setRole(Role.PATIENT);
        testUser.setLocked(false);
    }

    // ==================== registerUser() Tests ====================

    @Test
    void testRegisterUser_Success() {
        // Arrange
        String email = "newuser@example.com";
        String password = "SecurePassword123!";
        Role role = Role.DOCTOR;

        when(loginRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");
        when(loginRepository.save(any(Login.class))).thenReturn(testUser);

        // Act
        Login result = authService.registerUser(email, password, role);

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(loginRepository, times(1)).existsByEmail(email);
        verify(passwordEncoder, times(1)).encode(password);
        verify(loginRepository, times(1)).save(any(Login.class));
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        // Arrange
        String email = "existing@example.com";
        when(loginRepository.existsByEmail(email)).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.registerUser(email, "Password123!", Role.PATIENT));

        assertEquals("Email already taken", exception.getMessage());
        verify(loginRepository, times(1)).existsByEmail(email);
        verify(loginRepository, never()).save(any(Login.class));
    }

    @Test
    void testRegisterUser_PasswordHashed() {
        // Arrange
        String rawPassword = "PlainTextPassword123!";
        String hashedPassword = "$argon2id$v=19$m=4096,t=3,p=1$salt$hash";

        when(loginRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);
        when(loginRepository.save(any(Login.class))).thenAnswer(invocation -> {
            Login user = invocation.getArgument(0);
            assertEquals(hashedPassword, user.getPasswordHash());
            return user;
        });

        // Act
        authService.registerUser("test@example.com", rawPassword, Role.NURSE);

        // Assert
        verify(passwordEncoder, times(1)).encode(rawPassword);
    }

    // ==================== authenticateUser() Tests ====================

    @Test
    void testAuthenticateUser_Success() {
        // Arrange
        String email = "test@example.com";
        String password = "SecurePassword123!";

        when(loginRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPasswordHash())).thenReturn(true);

        // Act
        Login result = authService.authenticateUser(email, password);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(loginRepository, times(1)).findByEmail(email);
        verify(passwordEncoder, times(1)).matches(password, testUser.getPasswordHash());
    }

    @Test
    void testAuthenticateUser_InvalidEmail() {
        // Arrange
        String email = "nonexistent@example.com";
        when(loginRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.authenticateUser(email, "SomePassword123!"));

        assertEquals("Invalid credentials", exception.getMessage());
        verify(loginRepository, times(1)).findByEmail(email);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testAuthenticateUser_InvalidPassword() {
        // Arrange
        String email = "test@example.com";
        String password = "WrongPassword123!";

        when(loginRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.authenticateUser(email, password));

        assertEquals("Invalid credentials", exception.getMessage());
        verify(passwordEncoder, times(1)).matches(password, testUser.getPasswordHash());
    }

    @Test
    void testAuthenticateUser_AccountLocked() {
        // Arrange
        testUser.setLocked(true);
        when(loginRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.authenticateUser("test@example.com", "Password123!"));

        assertTrue(exception.getMessage().contains("locked"));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
}
