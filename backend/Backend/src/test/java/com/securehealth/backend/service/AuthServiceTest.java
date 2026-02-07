package com.securehealth.backend.service;

import com.securehealth.backend.dto.LoginResponse;
import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.model.Session;
import com.securehealth.backend.repository.LoginRepository;
import com.securehealth.backend.repository.SessionRepository;
import com.securehealth.backend.util.JwtUtil;
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

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private EmailService emailService;

    @Mock
    private LoginRepository loginRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private Login testUser;

    @BeforeEach
    void setUp() {
        testUser = new Login();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword123");
        testUser.setRole(Role.PATIENT);
        testUser.setLocked(false);
    }

    // ==================== registerUser() Tests ====================

    @Test
    void testRegisterUser_Success() {
        String email = "newuser@example.com";
        String password = "SecurePassword123!";
        Role role = Role.DOCTOR;

        when(loginRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");
        when(loginRepository.save(any(Login.class))).thenReturn(testUser);

        Login result = authService.registerUser(email, password, role);

        assertNotNull(result);
        verify(loginRepository).save(any(Login.class));
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        String email = "existing@example.com";
        when(loginRepository.existsByEmail(email)).thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> authService.registerUser(email, "Password123!", Role.PATIENT));

        verify(loginRepository, never()).save(any(Login.class));
    }

    // ==================== login() Tests (MERGED) ====================

    @Test
    void testLogin_Success() {
        // Arrange
        String email = "test@example.com";
        String password = "SecurePassword123!";
        String ip = "127.0.0.1";
        String agent = "Chrome";

        // Mocks for User Validation
        when(loginRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPasswordHash())).thenReturn(true);

        // Mocks for Token Generation
        when(jwtUtil.generateAccessToken(anyString(), anyString(), anyLong())).thenReturn("access-token-123");
        when(jwtUtil.generateRefreshToken()).thenReturn("refresh-token-456");

        // Act
        // [FIXED] Uses new login method from Backend
        LoginResponse result = authService.login(email, password, ip, agent);

        // Assert
        assertNotNull(result);
        assertEquals("access-token-123", result.getAccessToken());
        assertEquals("refresh-token-456", result.getRefreshToken());
        assertEquals("PATIENT", result.getRole());
        assertEquals("LOGIN_SUCCESS", result.getStatus());

        // Verify Session was saved to DB
        verify(sessionRepository, times(1)).save(any(Session.class));
    }

    @Test
    void testLogin_UserNotFound() {
        // Arrange
        String email = "nonexistent@example.com";
        when(loginRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.login(email, "SomePassword123!", "ip", "agent"));
        
        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPassword() {
        String email = "test@example.com";
        String password = "WrongPassword!";

        when(loginRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPasswordHash())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.login(email, password, "ip", "agent"));

        assertEquals("Invalid credentials", exception.getMessage());
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testLogin_AccountLocked() {
        testUser.setLocked(true);
        when(loginRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.login("test@example.com", "Password!", "ip", "agent"));

        assertTrue(exception.getMessage().contains("locked"));
    }

    // [MERGED] Adapted from Devops branch to use new 'login' method signature
    @Test
    void testLogin_DoctorRequiresOtp() {
        // Arrange
        testUser.setRole(Role.DOCTOR);
        testUser.setTwoFactorEnabled(true);
        String password = "Password123!";
        
        when(loginRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPasswordHash())).thenReturn(true);

        // Act
        // Call the new login method
        LoginResponse result = authService.login("test@example.com", password, "127.0.0.1", "Chrome");

        // Assert
        assertEquals("OTP_REQUIRED", result.getStatus()); // Check status instead of return string
        assertNull(result.getAccessToken()); // Ensure no tokens were generated
        
        verify(loginRepository, times(1)).save(any(Login.class)); // Verifies OTP was saved to DB
        verify(emailService, times(1)).sendOtp(anyString(), anyString()); // Verifies email was sent
    }

    // ==================== logout() Tests ====================

    @Test
    void testLogout_Success() {
        String refreshToken = "some-refresh-token";
        Session mockSession = new Session();
        
        // Mock finding the session by hash
        when(sessionRepository.findByRefreshTokenHash(anyString())).thenReturn(Optional.of(mockSession));

        authService.logout(refreshToken);

        // Verify the session was updated (revoked)
        verify(sessionRepository).save(mockSession);
        assertTrue(mockSession.isRevoked());
    }
}