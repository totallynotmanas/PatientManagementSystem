package com.securehealth.backend.controller;

import com.securehealth.backend.dto.LoginRequest;
import com.securehealth.backend.dto.LoginResponse;
import com.securehealth.backend.dto.RegistrationRequest;
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
}