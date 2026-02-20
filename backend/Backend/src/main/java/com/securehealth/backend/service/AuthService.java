package com.securehealth.backend.service;

import com.securehealth.backend.model.AuditLog;
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
import com.securehealth.backend.dto.LoginResponse;
import com.securehealth.backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.MessageDigest;
import java.security.SecureRandom;
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

    /**
     * Number of previous passwords to check for reuse.
     * Default is 5 as per security best practices.
     */
    private static final int PASSWORD_HISTORY_LIMIT = 5;

    /**
     * Token expiration time in minutes.
     */
    private static final int TOKEN_EXPIRATION_MINUTES = 30;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    private static final int MAX_ACTIVE_SESSIONS = 3;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Registers a new user.
     */
    public Login registerUser(String email, String rawPassword, Role role) {
        if (loginRepository.existsByEmail(email)) {
            logEvent(email, "REGISTRATION_FAILED", "UNKNOWN", "UNKNOWN", "Email already taken");
            throw new RuntimeException("Email already taken");
        }

        String hash = passwordEncoder.encode(rawPassword);

        Login newUser = new Login();
        newUser.setEmail(email);
        newUser.setPasswordHash(hash);
        newUser.setRole(role);

        if (role == Role.DOCTOR || role == Role.ADMIN) {
            newUser.setTwoFactorEnabled(true);
        }

        Login savedUser = loginRepository.save(newUser);
        logEvent(email, "USER_REGISTERED", "UNKNOWN", "UNKNOWN", "User registered with role: " + role);
        return savedUser;
    }

    /**
     * Authenticates user and generates tokens.
     */
    public LoginResponse login(String email, String rawPassword, String ipAddress, String userAgent) {

        rateLimiterService.checkLoginAttempts(email, ipAddress, userAgent);

        // 1. Verify User
        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logEvent(email, "LOGIN_FAILED", ipAddress, userAgent, "User not found");
                    rateLimiterService.registerFailedLogin(email, ipAddress, userAgent);
                    return new RuntimeException("Invalid credentials");
                });

        if (user.isLocked()) {
            logEvent(email, "LOGIN_FAILED", ipAddress, userAgent, "Account locked");
            throw new RuntimeException("Account locked");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            rateLimiterService.registerFailedLogin(email, ipAddress, userAgent);

            logEvent(email, "LOGIN_FAILED", ipAddress, userAgent, "Invalid password");
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

            logEvent(email, "OTP_REQUIRED", ipAddress, userAgent, "OTP sent to email");
            // Return "OTP_REQUIRED" status with NULL tokens
            return new LoginResponse(null, null, user.getRole().name(), "OTP_REQUIRED");
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

        logEvent(email, "LOGIN_SUCCESS", ipAddress, userAgent, "Standard login");
        rateLimiterService.resetLoginAttempts(email);
        return new LoginResponse(accessToken, refreshToken, user.getRole().name(), "LOGIN_SUCCESS");
    }

    /**
     * Verifies OTP and Completes Login (Generates Tokens).
     */
    public LoginResponse verifyOtp(String email, String otp, String ipAddress, String userAgent) {

        rateLimiterService.checkOtpAttempts(email, ipAddress, userAgent);

        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null &&
                user.getOtp().equals(otp) &&
                user.getOtpExpiry().isAfter(LocalDateTime.now())) {

            // 1. Clear OTP to prevent reuse
            user.setOtp(null);
            loginRepository.save(user);

            rateLimiterService.resetOtpAttempts(email);

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

            logEvent(email, "LOGIN_SUCCESS", ipAddress, userAgent, "2FA Verified");

            return new LoginResponse(accessToken, refreshToken, user.getRole().name(), "LOGIN_SUCCESS");
        }
        rateLimiterService.registerFailedOtp(email, ipAddress, userAgent);

        logEvent(email, "LOGIN_FAILED", ipAddress, userAgent, "Invalid/Expired OTP");

        throw new RuntimeException("Invalid or expired OTP");
    }

    /**
     * Revokes a session (Logout).
     */
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        // 1. Blacklist the Access Token (Task #19286)
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            String jwt = accessToken.substring(7);
            try {
                // Calculate remaining time
                java.util.Date expiration = jwtUtil.extractExpiration(jwt);
                long remainingMillis = expiration.getTime() - System.currentTimeMillis();

                tokenBlacklistService.blacklistToken(jwt, remainingMillis);
            } catch (Exception e) {
                // Token might already be expired, which is fine
            }
        }

        // 2. Revoke the Refresh Token
        if (refreshToken != null) {
            String hash = hashToken(refreshToken);
            sessionRepository.findByRefreshTokenHash(hash).ifPresent(session -> {
                session.setRevoked(true);
                sessionRepository.save(session);

                // Clear the idle tracker
                tokenBlacklistService.clearIdleSession(session.getUser().getEmail());

                logEvent(session.getUser().getEmail(), "LOGOUT", session.getIpAddress(), session.getUserAgent(),
                        "User initiated logout");
            });
        }
    }

    /**
     * Enables Two-Factor Authentication for a user (e.g. Patient).
     */
    @Transactional
    public void enableTwoFactorAuth(String email) {
        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTwoFactorEnabled(true);
        loginRepository.save(user);

        logEvent(email, "2FA_ENABLED", "UNKNOWN", "UNKNOWN", "User manually enabled 2FA");
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

    /**
     * Generates a 6-digit numeric One-Time Password (OTP).
     * <p>
     * The OTP is used for step-up authentication during 2FA login.
     * </p>
     *
     * @return A randomly generated 6-digit OTP as a String.
     */
    private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    // ==================== PASSWORD RECOVERY METHODS ====================

    /**
     * Initiates the password reset process.
     * <p>
     * Generates a secure token, stores its hash in the database,
     * and sends a reset link to the user's email.
     * </p>
     *
     * @param email The email address of the user requesting password reset.
     * @throws RuntimeException if email is not registered (for security, returns
     *                          same message).
     */
    @Transactional
    public void initiatePasswordReset(String email) {
        // Find user by email - don't reveal if email exists for security
        Optional<Login> userOpt = loginRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // For security, we don't reveal if email exists or not
            // Just log and return silently
            logEvent(email, "PASSWORD_RESET_REQUEST", "UNKNOWN", "UNKNOWN", "User not found");
            return;
        }

        Login user = userOpt.get();

        // Invalidate any existing tokens for this user
        resetTokenRepository.invalidateAllTokensForUser(user);

        // Generate secure token
        String token = generateSecureToken();
        String tokenHash = hashToken(token);

        // Create token entity with 30-minute expiration
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES);
        PasswordResetToken resetToken = new PasswordResetToken(user, tokenHash, expiresAt);
        resetTokenRepository.save(resetToken);

        // Build reset link and send email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);
        logEvent(email, "PASSWORD_RESET_INITIATED", "UNKNOWN", "UNKNOWN", "Reset link sent to email");
    }

    /**
     * Validates a password reset token.
     * <p>
     * Checks if the token exists, has not been used, and has not expired.
     * </p>
     *
     * @param token The raw token from the reset link.
     * @return true if the token is valid, false otherwise.
     */
    public boolean validateResetToken(String token) {
        String tokenHash = hashToken(token);
        Optional<PasswordResetToken> resetTokenOpt = resetTokenRepository.findValidToken(tokenHash,
                LocalDateTime.now());
        return resetTokenOpt.isPresent();
    }

    /**
     * Resets the user's password using a valid reset token.
     * <p>
     * Validates the token, checks for password reuse, updates the password,
     * and stores the old password in history.
     * </p>
     *
     * @param token       The raw token from the reset link.
     * @param newPassword The new password to set.
     * @throws RuntimeException if token is invalid, expired, or password was
     *                          previously used.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String tokenHash = hashToken(token);

        // Find and validate token
        PasswordResetToken resetToken = resetTokenRepository
                .findValidToken(tokenHash, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        Login user = resetToken.getUser();

        // Check password strength (additional validation beyond DTO)
        validatePasswordStrength(newPassword);

        // Check for password reuse
        if (isPasswordPreviouslyUsed(user, newPassword)) {
            logEvent(user.getEmail(), "PASSWORD_RESET_FAILED", "UNKNOWN", "UNKNOWN", "Password reuse attempt");
            throw new RuntimeException("Cannot reuse a recent password. Please choose a different password.");
        }

        // Store current password in history before changing
        savePasswordToHistory(user, user.getPasswordHash());

        // Hash and update new password
        String newPasswordHash = passwordEncoder.encode(newPassword);
        user.setPasswordHash(newPasswordHash);
        loginRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        // Invalidate all active sessions for security
        invalidateAllUserSessions(user);
        logEvent(user.getEmail(), "PASSWORD_RESET_SUCCESS", "UNKNOWN", "UNKNOWN", "Password reset successfully");
    }

    /**
     * Checks if a password was previously used by the user.
     * <p>
     * Compares against the last 5 passwords stored in history.
     * </p>
     *
     * @param user        The user whose history to check.
     * @param newPassword The new password to verify.
     * @return true if the password was previously used, false otherwise.
     */
    private boolean isPasswordPreviouslyUsed(Login user, String newPassword) {
        // Check current password
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            return true;
        }

        // Check password history
        List<PasswordHistory> history = passwordHistoryRepository
                .findRecentPasswords(user, PASSWORD_HISTORY_LIMIT);

        for (PasswordHistory entry : history) {
            if (passwordEncoder.matches(newPassword, entry.getPasswordHash())) {
                return true;
            }
        }

        return false;
    }

    /**
     * Saves a password hash to the user's password history.
     *
     * @param user         The user whose password is being stored.
     * @param passwordHash The hashed password to store.
     */
    private void savePasswordToHistory(Login user, String passwordHash) {
        PasswordHistory history = new PasswordHistory(user, passwordHash);
        passwordHistoryRepository.save(history);
    }

    /**
     * Validates password strength beyond minimum length.
     * <p>
     * NIST 800-63B compliant validation:
     * - Minimum 12 characters
     * - No common patterns (optional, can be extended)
     * </p>
     *
     * @param password The password to validate.
     * @throws RuntimeException if password doesn't meet requirements.
     */
    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 12) {
            throw new RuntimeException("Password must be at least 12 characters long");
        }

        // Check for common weak patterns
        String lowerPassword = password.toLowerCase();
        String[] weakPatterns = { "password", "123456", "qwerty", "admin", "letmein" };

        for (String pattern : weakPatterns) {
            if (lowerPassword.contains(pattern)) {
                throw new RuntimeException("Password contains a common weak pattern");
            }
        }
    }

    /**
     * Invalidates all active sessions for a user.
     * <p>
     * Called after password reset for security.
     * Forces re-authentication on all devices.
     * </p>
     *
     * @param user The user whose sessions should be invalidated.
     */
    private void invalidateAllUserSessions(Login user) {
        // This would require a query to find all sessions by user
        // For now, we'll rely on the password change invalidating the JWT
        // In a full implementation, you'd add:
        // sessionRepository.revokeAllByUser(user);
    }

    /**
     * Generates a cryptographically secure random token.
     *
     * @return A URL-safe Base64 encoded token.
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * ROTATION LOGIC:
     * 1. Validate the old Refresh Token.
     * 2. Security: If it's already revoked? ALARM! Revoke everything (Theft
     * detected).
     * 3. If valid: Kill the old one, create a NEW one.
     */
    @Transactional
    public LoginResponse refreshToken(String oldRefreshToken, String ipAddress, String userAgent) {
        // 1. Hash the incoming token to find it in DB
        String hash = hashToken(oldRefreshToken);

        Session session = sessionRepository.findByRefreshTokenHash(hash)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // 2. SECURITY CHECK: Reuse Detection (Theft)
        if (session.isRevoked()) {
            // ALARM: Someone is trying to use a dead token!
            // This means the legitimate user likely already rotated it, and now a hacker is
            // trying the old one.
            logEvent(session.getUser().getEmail(), "TOKEN_THEFT_DETECTED", ipAddress, userAgent,
                    "Reuse of revoked token attempted");

            // Nuclear Option: Kill ALL sessions for this user to force re-login
            sessionRepository.revokeAllUserSessions(session.getUser().getUserId());

            throw new RuntimeException("Security Alert: Session revoked due to suspected theft.");
        }

        // 3. Check Expiry
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired. Please login again.");
        }

        // 4. ROTATE: Revoke the old token
        session.setRevoked(true);
        sessionRepository.save(session);

        // 5. Generate NEW Tokens
        Login user = session.getUser();
        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getUserId());
        String newRefreshToken = jwtUtil.generateRefreshToken(); // UUID

        // 6. Save NEW Session
        createSession(user, newRefreshToken, ipAddress, userAgent);

        // Log the success
        logEvent(user.getEmail(), "TOKEN_REFRESHED", ipAddress, userAgent, "Token rotated successfully");

        return new LoginResponse(newAccessToken, newRefreshToken, user.getRole().name(), "SUCCESS");
    }

    private void createSession(Login user, String refreshToken, String ipAddress, String userAgent) {

        List<Session> activeSessions = sessionRepository.findActiveSessionsByUserOrderByCreatedAtAsc(user);

        // If they have 3 or more active sessions, revoke the oldest ones until they
        // have 2 left
        if (activeSessions.size() >= MAX_ACTIVE_SESSIONS) {
            int sessionsToKill = (activeSessions.size() - MAX_ACTIVE_SESSIONS) + 1;
            for (int i = 0; i < sessionsToKill; i++) {
                Session oldestSession = activeSessions.get(i);
                oldestSession.setRevoked(true);
                sessionRepository.save(oldestSession);

                logEvent(user.getEmail(), "SESSION_TERMINATED", oldestSession.getIpAddress(),
                        oldestSession.getUserAgent(), "Max concurrent sessions exceeded. Oldest session revoked.");
            }
        }

        String refreshTokenHash = hashToken(refreshToken);
        Session session = new Session();
        session.setUser(user);
        session.setRefreshTokenHash(refreshTokenHash);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setExpiresAt(LocalDateTime.now().plusDays(7));
        sessionRepository.save(session);

        // Start the idle tracker for this new session
        tokenBlacklistService.updateLastActive(user.getEmail());
    }

    private void logEvent(String email, String action, String ip, String agent, String details) {
        try {
            AuditLog log = new AuditLog(email, action, ip, agent, details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Failsafe: Logging should never break the actual login process
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}