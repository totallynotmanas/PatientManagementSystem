package com.securehealth.backend.dto;

/**
 * Data Transfer Object (DTO) for OTP verification requests.
 *
 * <p>This class represents the JSON payload sent by the client when
 * completing the second step of Two-Factor Authentication (2FA).
 * It carries the user's email and the One-Time Password (OTP) entered
 * for login verification.</p>
 *
 * <p>This DTO is used by authentication controllers to map incoming
 * HTTP request bodies into Java objects.</p>
 */
public class OtpRequest {
    private String email;
    private String otp;

    public String getEmail() { return email; }
    public String getOtp() { return otp; }
}
