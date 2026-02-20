package com.securehealth.backend.service;

import com.securehealth.backend.dto.LoginResponse;
import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.PasswordHistory;
import com.securehealth.backend.model.PasswordResetToken;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.model.Session;
import com.securehealth.backend.repository.AuditLogRepository;
import com.securehealth.backend.repository.LoginRepository;
import com.securehealth.backend.repository.PasswordHistoryRepository;
import com.securehealth.backend.repository.PasswordResetTokenRepository;
import com.securehealth.backend.repository.SessionRepository;
import com.securehealth.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
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
    private PasswordResetTokenRepository resetTokenRepository;

    @Mock
    private PasswordHistoryRepository passwordHistoryRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private RateLimiterService rateLimiterService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

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

    @Test
    void testRegisterUser_Doctor_AutoEnables2FA() {
        String email = "doctor@example.com";
        String password = "Password123!";
        Role role = Role.DOCTOR;

        when(loginRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("encodedPass");
        when(loginRepository.save(any(Login.class))).thenAnswer(i -> i.getArguments()[0]);

        Login result = authService.registerUser(email, password, role);

        assertTrue(result.isTwoFactorEnabled(), "Doctor should have 2FA enabled by default");
    }

    @Test
    void testRegisterUser_Admin_AutoEnables2FA() {
        String email = "admin@example.com";
        String password = "Password123!";
        Role role = Role.ADMIN;

        when(loginRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("encodedPass");
        when(loginRepository.save(any(Login.class))).thenAnswer(i -> i.getArguments()[0]);

        Login result = authService.registerUser(email, password, role);

        assertTrue(result.isTwoFactorEnabled(), "Admin should have 2FA enabled by default");
    }

    @Test
    void testRegisterUser_Patient_DefaultNo2FA() {
        String email = "patient@example.com";
        String password = "Password123!";
        Role role = Role.PATIENT;

        when(loginRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("encodedPass");
        when(loginRepository.save(any(Login.class))).thenAnswer(i -> i.getArguments()[0]);

        Login result = authService.registerUser(email, password, role);

        assertFalse(result.isTwoFactorEnabled(), "Patient should NOT have 2FA enabled by default");
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

    @Test
    void testEnableTwoFactorAuth_Success() {
        String email = "user@example.com";
        Login user = new Login();
        user.setEmail(email);
        user.setTwoFactorEnabled(false);

        when(loginRepository.findByEmail(email)).thenReturn(Optional.of(user));

        authService.enableTwoFactorAuth(email);

        assertTrue(user.isTwoFactorEnabled());
        verify(loginRepository).save(user);
    }

    // ==================== logout() Tests ====================

    @Test
    void testLogout_Success() {
        String refreshToken = "some-refresh-token";
        Session mockSession = new Session();
        mockSession.setUser(testUser);

        // Mock finding the session by hash
        when(sessionRepository.findByRefreshTokenHash(anyString())).thenReturn(Optional.of(mockSession));

        authService.logout(null, refreshToken);

        // Verify the session was updated (revoked)
        verify(sessionRepository).save(mockSession);
        assertTrue(mockSession.isRevoked());
    }

    // ==================== Password Recovery Tests ====================

    @Test
    void testInitiatePasswordReset_Success() {
        // Arrange
        String email = "test@example.com";
        when(loginRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        // Act
        authService.initiatePasswordReset(email);

        // Assert
        verify(resetTokenRepository).invalidateAllTokensForUser(testUser);
        verify(resetTokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq(email), anyString());
    }

    @Test
    void testInitiatePasswordReset_UserNotFound() {
        // Arrange
        String email = "nonexistent@example.com";
        when(loginRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act - Should not throw, just silently return
        assertDoesNotThrow(() -> authService.initiatePasswordReset(email));

        // Assert - No token should be created, no email sent
        verify(resetTokenRepository, never()).save(any(PasswordResetToken.class));
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void testValidateResetToken_Valid() {
        // Arrange
        String token = "validToken123";
        PasswordResetToken mockToken = new PasswordResetToken();
        mockToken.setUsed(false);
        mockToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.of(mockToken));

        // Act
        boolean result = authService.validateResetToken(token);

        // Assert
        assertTrue(result);
    }

    @Test
    void testValidateResetToken_Invalid() {
        // Arrange
        String token = "invalidToken";
        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        // Act
        boolean result = authService.validateResetToken(token);

        // Assert
        assertFalse(result);
    }

    @Test
    void testResetPassword_Success() {
        // Arrange
        String token = "validToken123";
        String newPassword = "NewSecurePass123!";

        PasswordResetToken mockResetToken = new PasswordResetToken();
        mockResetToken.setUser(testUser);
        mockResetToken.setUsed(false);
        mockResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.of(mockResetToken));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false); // Password not reused
        when(passwordHistoryRepository.findRecentPasswords(any(Login.class), anyInt()))
                .thenReturn(Collections.emptyList());
        when(passwordEncoder.encode(newPassword)).thenReturn("newHashedPassword");

        // Act
        assertDoesNotThrow(() -> authService.resetPassword(token, newPassword));

        // Assert
        verify(passwordHistoryRepository).save(any(PasswordHistory.class)); // Old password saved to history
        verify(loginRepository).save(testUser); // New password saved
        verify(resetTokenRepository).save(mockResetToken); // Token marked as used
        assertTrue(mockResetToken.isUsed());
    }

    @Test
    void testResetPassword_InvalidToken() {
        // Arrange
        String token = "invalidToken";
        String newPassword = "NewSecurePass123!";

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(token, newPassword));

        assertEquals("Invalid or expired reset token", exception.getMessage());
        verify(loginRepository, never()).save(any(Login.class));
    }

    @Test
    void testResetPassword_PasswordReused() {
        // Arrange
        String token = "validToken123";
        String newPassword = "MyOldSecure123!"; // No weak patterns, 14 chars

        PasswordResetToken mockResetToken = new PasswordResetToken();
        mockResetToken.setUser(testUser);
        mockResetToken.setUsed(false);
        mockResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.of(mockResetToken));
        // Current password matches (reuse detected)
        when(passwordEncoder.matches(newPassword, testUser.getPasswordHash())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(token, newPassword));

        assertTrue(exception.getMessage().contains("reuse"));
        verify(loginRepository, never()).save(any(Login.class));
    }

    @Test
    void testResetPassword_PasswordInHistory() {
        // Arrange
        String token = "validToken123";
        String newPassword = "HistoricSecure1!"; // No weak patterns, 16 chars

        PasswordResetToken mockResetToken = new PasswordResetToken();
        mockResetToken.setUser(testUser);
        mockResetToken.setUsed(false);
        mockResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        PasswordHistory historyEntry = new PasswordHistory(testUser, "oldHashedPassword");

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.of(mockResetToken));
        // Current password doesn't match
        when(passwordEncoder.matches(newPassword, testUser.getPasswordHash())).thenReturn(false);
        // But password in history matches (reuse detected)
        when(passwordHistoryRepository.findRecentPasswords(any(Login.class), anyInt()))
                .thenReturn(List.of(historyEntry));
        when(passwordEncoder.matches(newPassword, historyEntry.getPasswordHash())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(token, newPassword));

        assertTrue(exception.getMessage().contains("reuse"));
        verify(loginRepository, never()).save(any(Login.class));
    }

    @Test
    void testResetPassword_WeakPassword() {
        // Arrange
        String token = "validToken123";
        String weakPassword = "password1234"; // Contains "password" - weak pattern

        PasswordResetToken mockResetToken = new PasswordResetToken();
        mockResetToken.setUser(testUser);
        mockResetToken.setUsed(false);
        mockResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.of(mockResetToken));
        // Note: No stubs for passwordEncoder/passwordHistoryRepository
        // because validation fails before reuse check

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(token, weakPassword));

        assertTrue(exception.getMessage().contains("weak pattern"));
        verify(loginRepository, never()).save(any(Login.class));
    }

    @Test
    void testResetPassword_ShortPassword() {
        // Arrange
        String token = "validToken123";
        String shortPassword = "Short1!"; // Less than 12 characters

        PasswordResetToken mockResetToken = new PasswordResetToken();
        mockResetToken.setUser(testUser);
        mockResetToken.setUsed(false);
        mockResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        when(resetTokenRepository.findValidToken(anyString(), any(LocalDateTime.class)))
                .thenReturn(Optional.of(mockResetToken));
        // Note: No stubs for passwordEncoder/passwordHistoryRepository
        // because validation fails before reuse check

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.resetPassword(token, shortPassword));

        assertTrue(exception.getMessage().contains("12 characters"));
        verify(loginRepository, never()).save(any(Login.class));
    }
}