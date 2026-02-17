package com.securehealth.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.securehealth.backend.dto.ForgotPasswordRequest;
import com.securehealth.backend.dto.LoginRequest;
import com.securehealth.backend.dto.LoginResponse;
import com.securehealth.backend.dto.RegistrationRequest;
import com.securehealth.backend.dto.ResetPasswordRequest;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=password",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
        "jwt.expiration=900000"
})
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    // --- REGISTRATION TESTS ---

    @Test
    public void testRegisterUser_Success() throws Exception {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("test@example.com");
        request.setPassword("password1234");
        request.setRole(Role.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    // --- LOGIN TESTS (NEW) ---

    @Test
    public void testLoginUser_Success() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest("test@example.com", "password1234");

        LoginResponse mockResponse = new LoginResponse("access-token-123", "refresh-token-456", "PATIENT",
                "LOGIN_SUCCESS");

        // [FIX] Use any() for the last two arguments to handle nulls
        when(authService.login(anyString(), anyString(), any(), any()))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token-123"))
                .andExpect(cookie().value("refreshToken", "refresh-token-456"))
                .andExpect(cookie().httpOnly("refreshToken", true));
    }

    @Test
    public void testLoginUser_InvalidCredentials() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        // Mock Service to throw exception
        // Note: We use any() for IP/Agent because they don't matter for this specific
        // error
        doThrow(new RuntimeException("Invalid credentials"))
                .when(authService).login(anyString(), anyString(), any(), any());

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()) // Expect 401
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    public void testLoginUser_AccountLocked() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest("locked@example.com", "password1234");

        doThrow(new RuntimeException("Account locked"))
                .when(authService).login(anyString(), anyString(), any(), any());

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()) // Expect 401
                .andExpect(jsonPath("$.message").value("Account locked"));
    }

    @Test
    public void testLoginUser_InvalidEmail() throws Exception {
        // Arrange: Email format is wrong (no @ symbol)
        LoginRequest request = new LoginRequest("invalid-email-format", "password1234");

        // Act & Assert
        // We don't need to mock authService here because @Valid stops it before it
        // reaches the service
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Expect 400
    }

    @Test
    public void testLoginUser_MissingPassword() throws Exception {
        // Arrange: Password is null (or empty)
        LoginRequest request = new LoginRequest("test@example.com", "");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Expect 400
    }

    @Test
    public void testLogout_Success() throws Exception {
        // Arrange
        String refreshToken = "valid-refresh-token";
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("refreshToken", refreshToken);

        // Act & Assert
        mockMvc.perform(post("/api/auth/logout")
                .cookie(cookie)) // Simulate browser sending cookie
                .andExpect(status().isOk())
                .andExpect(content().string("Logged out successfully"))
                .andExpect(cookie().maxAge("refreshToken", 0)); // Verify cookie is killed
    }

    // ==================== PASSWORD RECOVERY TESTS ====================

    @Test
    public void testForgotPassword_Success() throws Exception {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest("test@example.com");

        doNothing().when(authService).initiatePasswordReset(anyString());

        // Act & Assert
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("If an account exists with this email, a password reset link has been sent."));
    }

    @Test
    public void testForgotPassword_InvalidEmail() throws Exception {
        // Arrange - Invalid email format
        ForgotPasswordRequest request = new ForgotPasswordRequest("invalid-email");

        // Act & Assert - Validation should fail
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testValidateResetToken_Valid() throws Exception {
        // Arrange
        String token = "validToken123";
        when(authService.validateResetToken(token)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/auth/validate-reset-token")
                .param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.message").value("Token is valid"));
    }

    @Test
    public void testValidateResetToken_Invalid() throws Exception {
        // Arrange
        String token = "invalidToken";
        when(authService.validateResetToken(token)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/api/auth/validate-reset-token")
                .param("token", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Token is invalid or expired"));
    }

    @Test
    public void testResetPassword_Success() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest(
                "validToken123",
                "NewSecurePass123!",
                "NewSecurePass123!");

        doNothing().when(authService).resetPassword(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Password has been reset successfully. Please login with your new password."));
    }

    @Test
    public void testResetPassword_PasswordMismatch() throws Exception {
        // Arrange - Passwords don't match
        ResetPasswordRequest request = new ResetPasswordRequest(
                "validToken123",
                "NewSecurePass123!",
                "DifferentPass123!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Passwords do not match"));
    }

    @Test
    public void testResetPassword_InvalidToken() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest(
                "invalidToken",
                "NewSecurePass123!",
                "NewSecurePass123!");

        doThrow(new RuntimeException("Invalid or expired reset token"))
                .when(authService).resetPassword(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired reset token"));
    }

    @Test
    public void testResetPassword_PasswordReused() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest(
                "validToken123",
                "OldPassword123!",
                "OldPassword123!");

        doThrow(new RuntimeException("Cannot reuse a recent password. Please choose a different password."))
                .when(authService).resetPassword(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Cannot reuse a recent password. Please choose a different password."));
    }

    @Test
    public void testResetPassword_ShortPassword() throws Exception {
        // Arrange - Password too short (validation should fail before service layer)
        ResetPasswordRequest request = new ResetPasswordRequest(
                "validToken123",
                "Short1!",
                "Short1!");

        // Act & Assert - DTO validation should catch this
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}