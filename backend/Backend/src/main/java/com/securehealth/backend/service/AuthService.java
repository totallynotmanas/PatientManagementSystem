package com.securehealth.backend.service;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.model.Session; // [FIXED] Added Import
import com.securehealth.backend.repository.LoginRepository;
import com.securehealth.backend.repository.SessionRepository; // [FIXED] Added Import
import com.securehealth.backend.dto.LoginResponse; // [FIXED] Added Import
import com.securehealth.backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.transaction.annotation.Transactional; // [FIXED] Added Import

import java.time.LocalDateTime;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

/**
 * Service Layer for Identity Management.
 * <p>
 * Handles the core security operations:
 * 1. Registering new users (Hashing passwords)
 * 2. Authenticating users (Verifying passwords)
 * </p>
 *
 * @author Manas
 */

@Service
public class AuthService {

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private EmailService emailService;

    private SessionRepository sessionRepository; // Now this will work!

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user.
     */
    @Transactional // Now this will work!
    public Login registerUser(String email, String rawPassword, Role role) {
        if (loginRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }

        String hash = passwordEncoder.encode(rawPassword);

        Login newUser = new Login();
        newUser.setEmail(email);
        newUser.setPasswordHash(hash);
        newUser.setRole(role);
        
        return loginRepository.save(newUser);
    }

    /**
     * Authenticates user and generates tokens.
     */
    @Transactional
    public LoginResponse login(String email, String rawPassword, String ipAddress, String userAgent) {
        // 1. Verify User
        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (user.isLocked()) throw new RuntimeException("Account locked");

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }


        // --- 1. 2FA CHECK (Priority) ---
        // If user is DOCTOR/ADMIN and has 2FA enabled, stop and send OTP.
        if ((user.getRole() == Role.DOCTOR || user.getRole() == Role.ADMIN)
                && user.isTwoFactorEnabled()) {

            String otp = generateOtp();
            user.setOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
            loginRepository.save(user);

            emailService.sendOtp(user.getEmail(), otp);

            // Return "OTP_REQUIRED" status with NULL tokens
            return new LoginResponse(null, null, null, "OTP_REQUIRED");
        }

        // --- 2. GENERATE TOKENS (Standard Login) ---
        // If 2FA is not required (or disabled), proceed to generate JWTs.
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken();

        // 3. Hash Refresh Token
        String refreshTokenHash = hashToken(refreshToken);

        // 4. Create Session in DB
        Session session = new Session();
        session.setUser(user);
        session.setRefreshTokenHash(refreshTokenHash);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setExpiresAt(LocalDateTime.now().plusDays(7)); 
        sessionRepository.save(session);

        return new LoginResponse(accessToken, refreshToken, user.getRole().name(), "LOGIN_SUCCESS");
    }

    /**
     * Verifies OTP and Completes Login (Generates Tokens).
     */
    public LoginResponse verifyOtp(String email, String otp, String ipAddress, String userAgent) {
        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null &&
                user.getOtp().equals(otp) &&
                user.getOtpExpiry().isAfter(LocalDateTime.now())) {

            // 1. Clear OTP to prevent reuse
            user.setOtp(null);
            loginRepository.save(user);

            // 2. Generate Tokens (Login is now successful!)
            String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getUserId());
            String refreshToken = jwtUtil.generateRefreshToken();
            String refreshTokenHash = hashToken(refreshToken);

            // 3. Create Session
            Session session = new Session();
            session.setUser(user);
            session.setRefreshTokenHash(refreshTokenHash);
            session.setIpAddress(ipAddress);
            session.setUserAgent(userAgent);
            session.setExpiresAt(LocalDateTime.now().plusDays(7)); 
            sessionRepository.save(session);

            return new LoginResponse(accessToken, refreshToken, user.getRole().name(), "LOGIN_SUCCESS");
        }

        throw new RuntimeException("Invalid or expired OTP");
    }

    /**
     * Revokes a session (Logout).
     */
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null) return;
        
        String hash = hashToken(refreshToken);
        
        sessionRepository.findByRefreshTokenHash(hash)
            .ifPresent(session -> {
                session.setRevoked(true);
                sessionRepository.save(session);
            });
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token");
        }
    }
    }


    /**
     * Generates a 6-digit numeric One-Time Password (OTP).
     * <p>
     * The OTP is used for step-up authentication during 2FA login.
     * </p>
     *
     * @return A randomly generated 6-digit OTP as a String.
     */
    private String generateOtp() {


        private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }


}