package com.securehealth.backend.controller;

import com.securehealth.backend.dto.ForgotPasswordRequest;
import com.securehealth.backend.dto.LoginRequest;
import com.securehealth.backend.dto.LoginResponse;
import com.securehealth.backend.dto.RegistrationRequest;
import com.securehealth.backend.dto.ResetPasswordRequest;
import com.securehealth.backend.model.Login;
import com.securehealth.backend.service.AuthService;
import jakarta.servlet.http.Cookie;            
import jakarta.servlet.http.HttpServletRequest;  
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Authentication endpoints.
 * <p>
 * Exposes APIs for user registration and login.
 * This layer handles HTTP concerns (Status codes, JSON formatting)
 * and delegates business logic to the {@link AuthService}.
 * </p>
 *
 * @author Manas
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register a new user.
     * <p>
     * Endpoint: POST /api/auth/register
     * </p>
     *
     * @param request The validated DTO containing email, password, and role.
     * @return 201 Created if successful, or 400 Bad Request if validation fails.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegistrationRequest request) {
        try {
            authService.registerUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole());
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "User registered successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);

        } catch (RuntimeException e) {
            // In a real app, use a Global Exception Handler instead of try-catch here
            Map<String, String> resp = new HashMap<>();
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }

    }

    /**
     * Authenticates an existing user during login.
     *
     * <p><b>Endpoint:</b> POST /api/auth/login</p>
     *
     * <p>This endpoint performs the first step of authentication:
     * <ul>
     *   <li>Validates user credentials (email and password)</li>
     *   <li>Checks account lock status</li>
     *   <li>Triggers role-based Two-Factor Authentication (2FA) if required</li>
     * </ul>
     * </p>
     *
     * <p><b>Responses:</b></p>
     * <ul>
     *   <li><b>LOGIN_SUCCESS</b> — User authenticated successfully</li>
     *   <li><b>OTP_REQUIRED</b> — OTP has been sent to the user's email for 2FA verification</li>
     * </ul>
     *
     * @param request Contains email and password from the client
     * @return HTTP 200 with authentication status, or HTTP 401 if credentials are invalid
     * Authenticates user and sets Secure HttpOnly Cookie.
     * Endpoint: POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletResponse response,
                                   HttpServletRequest httpRequest) {
        try {

            // 1. Call Service
            LoginResponse loginData = authService.login(
                request.getEmail(), 
                request.getPassword(),
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
            );

            // [NEW] Check for OTP Requirement
            if ("OTP_REQUIRED".equals(loginData.getStatus())) {
                // Return immediately. DO NOT set cookies.
                return ResponseEntity.ok(loginData); 
            }

            // 2. If we get here, Login is fully successful. Set the Cookie.
            Cookie refreshCookie = new Cookie("refreshToken", loginData.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // True in Prod
            refreshCookie.setPath("/api/auth");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60);

            response.addCookie(refreshCookie);

            // 3. Hide Refresh Token from JSON
            loginData.setRefreshToken(null); 

            return ResponseEntity.ok(loginData);

        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }
    }


    /**
     * Verifies the One-Time Password (OTP) as part of Two-Factor Authentication (2FA).
     *
     * <p><b>Endpoint:</b> POST /api/auth/verify-otp</p>
     *
     * <p>This endpoint completes the second step of authentication for
     * high-privilege users (e.g., DOCTOR, ADMIN) after the initial password
     * verification has succeeded. It validates the OTP sent to the user's
     * registered email address.</p>
     *
     * <p><b>Behavior:</b></p>
     * <ul>
     *   <li>Checks if the OTP matches the stored value</li>
     *   <li>Ensures the OTP has not expired (time-bound validity)</li>
     *   <li>Clears the OTP after successful verification to prevent reuse</li>
     * </ul>
     *
     * <p><b>Responses:</b></p>
     * <ul>
     *   <li><b>LOGIN_SUCCESS</b> — OTP is valid and login is completed</li>
     *   <li><b>UNAUTHORIZED</b> — OTP is invalid or expired</li>
     * </ul>
     *
     * @param request JSON body containing the user's email and OTP
     * @return HTTP 200 with login success status, or HTTP 401 if verification fails
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody Map<String, String> request,
                                                     HttpServletResponse response,
                                                     HttpServletRequest httpRequest) {
        try {
            LoginResponse loginData = authService.verifyOtp(
                request.get("email"), 
                request.get("otp"),
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
            );

            // Login is successful. Set the Cookie.
            Cookie refreshCookie = new Cookie("refreshToken", loginData.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // True in Prod
            refreshCookie.setPath("/api/auth");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60);

            response.addCookie(refreshCookie);

            // Hide Refresh Token from JSON
            loginData.setRefreshToken(null); 

            return ResponseEntity.ok(loginData);

        } catch (RuntimeException e) {
            // In a real app, use a Global Exception Handler
            // For now, returning a generic response
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }



    
    // --- LOGOUT (NEW - TASK #12515) ---
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken,
                                    HttpServletResponse response) {
        
        // 1. Invalidate in DB
        if(refreshToken != null) authService.logout(refreshToken);

        // 2. Kill the Cookie
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0); // Expires immediately
        
        response.addCookie(cookie);
        
        return ResponseEntity.ok("Logged out successfully");
    }

    /**
     * Enables Two-Factor Authentication for a user (e.g. Patient).
     * <p>
     * Endpoint: POST /api/auth/enable-2fa
     * </p>
     */
    @PostMapping("/enable-2fa")
    public ResponseEntity<Map<String, String>> enableTwoFactorAuth(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                throw new RuntimeException("Email is required");
            }

            authService.enableTwoFactorAuth(email);
            
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Two-Factor Authentication enabled successfully");
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            Map<String, String> resp = new HashMap<>();
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
    }

    // ==================== PASSWORD RECOVERY ENDPOINTS ====================

    /**
     * Initiates the password reset process.
     *
     * <p><b>Endpoint:</b> POST /api/auth/forgot-password</p>
     *
     * <p>This endpoint accepts a user's email address and, if the account exists,
     * sends a password reset link to that email. For security reasons, the same
     * response is returned whether or not the email exists in the system.</p>
     *
     * <p><b>Security Note:</b> This endpoint does not reveal whether an email
     * is registered to prevent email enumeration attacks.</p>
     *
     * @param request The validated DTO containing the user's email.
     * @return HTTP 200 with a generic success message.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.initiatePasswordReset(request.getEmail());
            
            // Always return success to prevent email enumeration
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "If an account exists with this email, a password reset link has been sent.");
            return ResponseEntity.ok(resp);
            
        } catch (Exception e) {
            // Log the error but don't expose details
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "If an account exists with this email, a password reset link has been sent.");
            return ResponseEntity.ok(resp);
        }
    }

    /**
     * Validates a password reset token.
     *
     * <p><b>Endpoint:</b> GET /api/auth/validate-reset-token</p>
     *
     * <p>This endpoint checks if a reset token is valid before showing
     * the password reset form. This prevents users from filling out
     * the form only to find out the token is expired.</p>
     *
     * @param token The reset token from the URL query parameter.
     * @return HTTP 200 if valid, HTTP 400 if invalid or expired.
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Object>> validateResetToken(
            @RequestParam("token") String token) {
        
        boolean isValid = authService.validateResetToken(token);
        
        Map<String, Object> resp = new HashMap<>();
        if (isValid) {
            resp.put("valid", true);
            resp.put("message", "Token is valid");
            return ResponseEntity.ok(resp);
        } else {
            resp.put("valid", false);
            resp.put("message", "Token is invalid or expired");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
    }

    /**
     * Resets the user's password using a valid reset token.
     *
     * <p><b>Endpoint:</b> POST /api/auth/reset-password</p>
     *
     * <p>This endpoint validates the reset token, checks for password reuse,
     * and updates the user's password. It also invalidates all active sessions
     * for security purposes.</p>
     *
     * <p><b>Password Requirements:</b></p>
     * <ul>
     *   <li>Minimum 12 characters (NIST 800-63B compliant)</li>
     *   <li>Cannot be one of the last 5 passwords used</li>
     *   <li>Cannot contain common weak patterns</li>
     * </ul>
     *
     * @param request The validated DTO containing token, new password, and confirmation.
     * @return HTTP 200 if successful, HTTP 400 if validation fails.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            // Validate passwords match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                Map<String, String> resp = new HashMap<>();
                resp.put("message", "Passwords do not match");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
            }

            authService.resetPassword(request.getToken(), request.getNewPassword());
            
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Password has been reset successfully. Please login with your new password.");
            return ResponseEntity.ok(resp);
            
        } catch (RuntimeException e) {
            Map<String, String> resp = new HashMap<>();
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
    }
}