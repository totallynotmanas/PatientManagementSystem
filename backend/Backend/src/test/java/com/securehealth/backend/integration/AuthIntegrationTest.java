package com.securehealth.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securehealth.backend.dto.ForgotPasswordRequest;
import com.securehealth.backend.dto.LoginRequest;
import com.securehealth.backend.dto.RegistrationRequest;
import com.securehealth.backend.dto.ResetPasswordRequest;
import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.PasswordResetToken;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.model.Session;
import com.securehealth.backend.repository.LoginRepository;
import com.securehealth.backend.repository.PasswordResetTokenRepository;
import com.securehealth.backend.repository.SessionRepository;
import com.securehealth.backend.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for authentication flows.
 * Tests the full stack: Controller -> Service -> Repository -> Database
 * Uses H2 in-memory database for isolation.
 */
@SpringBootTest(classes = {
        com.securehealth.backend.SecureHealthApplication.class,
        TestConfig.class
})
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:integrationtestdb",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
        "jwt.expiration=900000"
})
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @MockBean
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        sessionRepository.deleteAll();
        resetTokenRepository.deleteAll();
        loginRepository.deleteAll();
    }

    // ==================== REGISTRATION FLOW ====================

    @Test
    void testCompleteRegistrationFlow_Patient() throws Exception {
        // Arrange
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("patient@hospital.com");
        request.setPassword("SecurePass123!");
        request.setRole(Role.PATIENT);

        // Act - Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        // Assert - Verify user in database
        Optional<Login> savedUser = loginRepository.findByEmail("patient@hospital.com");
        assertTrue(savedUser.isPresent());
        assertEquals(Role.PATIENT, savedUser.get().getRole());
        assertFalse(savedUser.get().isTwoFactorEnabled());
        assertFalse(savedUser.get().isLocked());
    }

    @Test
    void testCompleteRegistrationFlow_Doctor_With2FA() throws Exception {
        // Arrange
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("doctor@hospital.com");
        request.setPassword("SecurePass123!");
        request.setRole(Role.DOCTOR);

        // Act - Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Assert - Verify 2FA is enabled for doctor
        Optional<Login> savedUser = loginRepository.findByEmail("doctor@hospital.com");
        assertTrue(savedUser.isPresent());
        assertTrue(savedUser.get().isTwoFactorEnabled(), "Doctor should have 2FA enabled");
    }

    @Test
    void testRegistration_DuplicateEmail() throws Exception {
        // Arrange - Create first user
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("duplicate@hospital.com");
        request.setPassword("SecurePass123!");
        request.setRole(Role.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Act - Try to register with same email
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already taken"));

        // Assert - Only one user in database
        assertEquals(1, loginRepository.count());
    }

    // ==================== LOGIN FLOW ====================

    @Test
    void testCompleteLoginFlow_Success() throws Exception {
        // Arrange - Register user first
        registerTestUser("user@hospital.com", "SecurePass123!", Role.PATIENT);

        LoginRequest loginRequest = new LoginRequest("user@hospital.com", "SecurePass123!");

        // Act - Login
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.role").value("PATIENT"))
                .andExpect(jsonPath("$.status").value("LOGIN_SUCCESS"))
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true))
                .andReturn();

        // Assert - Verify session created in database
        assertEquals(1, sessionRepository.count());
        Session session = sessionRepository.findAll().get(0);
        assertNotNull(session.getRefreshTokenHash());
        assertFalse(session.isRevoked());
    }

    @Test
    void testLoginFlow_InvalidCredentials() throws Exception {
        // Arrange
        registerTestUser("user@hospital.com", "CorrectPass123!", Role.PATIENT);

        LoginRequest loginRequest = new LoginRequest("user@hospital.com", "WrongPassword!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));

        // Verify no session created
        assertEquals(0, sessionRepository.count());
    }

    @Test
    void testLoginFlow_DoctorRequires2FA() throws Exception {
        // Arrange - Register doctor
        registerTestUser("doctor@hospital.com", "SecurePass123!", Role.DOCTOR);

        LoginRequest loginRequest = new LoginRequest("doctor@hospital.com", "SecurePass123!");

        // Act - Login should trigger OTP
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OTP_REQUIRED"))
                .andExpect(jsonPath("$.accessToken").doesNotExist());

        // Assert - Verify OTP was sent
        verify(emailService, times(1)).sendOtp(eq("doctor@hospital.com"), anyString());

        // Verify OTP stored in database
        Optional<Login> doctor = loginRepository.findByEmail("doctor@hospital.com");
        assertTrue(doctor.isPresent());
        assertNotNull(doctor.get().getOtp());
        assertNotNull(doctor.get().getOtpExpiry());
    }

    // ==================== LOGOUT FLOW ====================

    @Test
    void testCompleteLogoutFlow() throws Exception {
        // Arrange - Register and login
        registerTestUser("user@hospital.com", "SecurePass123!", Role.PATIENT);
        LoginRequest loginRequest = new LoginRequest("user@hospital.com", "SecurePass123!");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String refreshToken = loginResult.getResponse().getCookie("refreshToken").getValue();

        // Act - Logout
        mockMvc.perform(post("/api/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(content().string("Logged out successfully"))
                .andExpect(cookie().maxAge("refreshToken", 0));

        // Assert - Verify session is revoked in database
        Session session = sessionRepository.findAll().get(0);
        assertTrue(session.isRevoked());
    }

    // ==================== PASSWORD RESET FLOW ====================

    @Test
    void testCompletePasswordResetFlow() throws Exception {
        // Arrange - Register user
        registerTestUser("user@hospital.com", "OldPassword123!", Role.PATIENT);

        // Step 1: Request password reset and capture the token from email
        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest("user@hospital.com");

        // Capture the reset link sent via email
        final String[] capturedToken = new String[1];
        doAnswer(invocation -> {
            String resetLink = invocation.getArgument(1);
            // Extract token from URL: http://localhost:3000/reset-password?token=TOKEN
            capturedToken[0] = resetLink.substring(resetLink.indexOf("token=") + 6);
            return null;
        }).when(emailService).sendPasswordResetEmail(eq("user@hospital.com"), anyString());

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk());

        // Verify email was sent and token was captured
        verify(emailService, times(1)).sendPasswordResetEmail(eq("user@hospital.com"), anyString());
        assertNotNull(capturedToken[0], "Token should be captured from email");

        String resetToken = capturedToken[0];

        // Step 2: Validate token
        mockMvc.perform(get("/api/auth/validate-reset-token")
                .param("token", resetToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));

        // Step 3: Reset password
        ResetPasswordRequest resetRequest = new ResetPasswordRequest(
                resetToken,
                "NewSecurePass123!",
                "NewSecurePass123!");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Password has been reset successfully. Please login with your new password."));

        // Step 4: Verify can login with new password
        LoginRequest loginRequest = new LoginRequest("user@hospital.com", "NewSecurePass123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LOGIN_SUCCESS"));

        // Step 5: Verify old password doesn't work
        LoginRequest oldLoginRequest = new LoginRequest("user@hospital.com", "OldPassword123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(oldLoginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testPasswordReset_TokenExpiration() throws Exception {
        // Arrange - Create user
        registerTestUser("user@hospital.com", "Password123!", Role.PATIENT);
        
        // Request password reset and capture token
        final String[] capturedToken = new String[1];
        doAnswer(invocation -> {
            String resetLink = invocation.getArgument(1);
            capturedToken[0] = resetLink.substring(resetLink.indexOf("token=") + 6);
            return null;
        }).when(emailService).sendPasswordResetEmail(eq("user@hospital.com"), anyString());

        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest("user@hospital.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk());

        // Manually expire the token in database
        PasswordResetToken token = resetTokenRepository.findAll().get(0);
        token.setExpiresAt(LocalDateTime.now().minusHours(1));
        resetTokenRepository.save(token);

        // Act - Try to validate expired token
        mockMvc.perform(get("/api/auth/validate-reset-token")
                .param("token", capturedToken[0]))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valid").value(false));

        // Try to reset with expired token
        ResetPasswordRequest resetRequest = new ResetPasswordRequest(
                capturedToken[0],
                "NewPassword123!",
                "NewPassword123!");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired reset token"));
    }

    @Test
    void testPasswordReset_TokenSingleUse() throws Exception {
        // Arrange - Register and request reset
        registerTestUser("user@hospital.com", "OldPassword123!", Role.PATIENT);
        
        // Capture token from email
        final String[] capturedToken = new String[1];
        doAnswer(invocation -> {
            String resetLink = invocation.getArgument(1);
            capturedToken[0] = resetLink.substring(resetLink.indexOf("token=") + 6);
            return null;
        }).when(emailService).sendPasswordResetEmail(eq("user@hospital.com"), anyString());

        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest("user@hospital.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk());

        String resetToken = capturedToken[0];

        // Act - Use token once
        ResetPasswordRequest resetRequest = new ResetPasswordRequest(
                resetToken,
                "CompletelyNewPass456!",
                "CompletelyNewPass456!");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isOk());

        // Try to use same token again
        ResetPasswordRequest secondResetRequest = new ResetPasswordRequest(
                resetToken,
                "AnotherStrongPass789!",
                "AnotherStrongPass789!");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondResetRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired reset token"));
    }

    @Test
    void testPasswordReset_PasswordReuse() throws Exception {
        // Arrange - Register user
        String originalPassword = "OriginalPass123!";
        registerTestUser("user@hospital.com", originalPassword, Role.PATIENT);

        // Capture token from email
        final String[] capturedToken = new String[1];
        doAnswer(invocation -> {
            String resetLink = invocation.getArgument(1);
            capturedToken[0] = resetLink.substring(resetLink.indexOf("token=") + 6);
            return null;
        }).when(emailService).sendPasswordResetEmail(eq("user@hospital.com"), anyString());

        // Request reset
        ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest("user@hospital.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk());

        String resetToken = capturedToken[0];

        // Act - Try to reset with same password
        ResetPasswordRequest resetRequest = new ResetPasswordRequest(
                resetToken,
                originalPassword,
                originalPassword);

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Cannot reuse a recent password. Please choose a different password."));
    }

    // ==================== HELPER METHODS ====================

    private void registerTestUser(String email, String password, Role role) throws Exception {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setRole(role);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
