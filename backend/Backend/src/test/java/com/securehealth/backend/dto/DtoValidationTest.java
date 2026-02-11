package com.securehealth.backend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DtoValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void loginRequestValidation() {
        LoginRequest invalid = new LoginRequest("bad-email", "short");
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(invalid);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Invalid email")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("12")));
    }

    @Test
    void forgotPasswordRequestValidation() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("invalid");
        Set<ConstraintViolation<ForgotPasswordRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Invalid email")));
    }

    @Test
    void registrationRequestValidation() {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("user@example.com");
        request.setPassword("short");
        Set<ConstraintViolation<RegistrationRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Role is required")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("12")));
    }

    @Test
    void resetPasswordRequestValidation() {
        ResetPasswordRequest request = new ResetPasswordRequest("token", "short", "");
        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("12")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("confirmation")));
    }

    @Test
    void otpRequestGetters() {
        OtpRequest request = new OtpRequest();
        ReflectionTestUtils.setField(request, "email", "user@example.com");
        ReflectionTestUtils.setField(request, "otp", "123456");
        assertEquals("user@example.com", request.getEmail());
        assertEquals("123456", request.getOtp());
    }

    @Test
    void registrationResponseFields() {
        RegistrationResponse response = new RegistrationResponse("ok", 5L, com.securehealth.backend.model.Role.PATIENT);
        assertEquals("ok", response.getMessage());
        assertEquals(5L, response.getUserId());
        assertEquals(com.securehealth.backend.model.Role.PATIENT, response.getRole());
    }

    @Test
    void loginResponseFields() {
        LoginResponse response = new LoginResponse("access", "refresh", "PATIENT", "LOGIN_SUCCESS");
        assertEquals("access", response.getAccessToken());
        assertEquals("refresh", response.getRefreshToken());
        assertEquals("PATIENT", response.getRole());
        assertEquals("LOGIN_SUCCESS", response.getStatus());
    }

    @Test
    void registrationRequestOptionalFields() {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("user@example.com");
        request.setPassword("SecurePassword123!");
        request.setRole(com.securehealth.backend.model.Role.PATIENT);
        request.setFullName("Test User");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setAddress("New York");
        Set<ConstraintViolation<RegistrationRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
        assertNotNull(request.getDateOfBirth());
    }
}
