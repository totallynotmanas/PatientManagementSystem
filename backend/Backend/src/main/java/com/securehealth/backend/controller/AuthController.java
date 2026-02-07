package com.securehealth.backend.controller;

import com.securehealth.backend.dto.LoginRequest;
import com.securehealth.backend.dto.RegistrationRequest;
import com.securehealth.backend.model.Login;
import com.securehealth.backend.service.AuthService;
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
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            String result = authService.authenticateUser(request.getEmail(), request.getPassword());

            Map<String, Object> resp = new HashMap<>();

            if ("OTP_REQUIRED".equals(result)) {
                resp.put("message", "OTP sent to registered email");
                resp.put("status", "OTP_REQUIRED");
                return ResponseEntity.ok(resp);
            }

            resp.put("message", "Login successful");
            resp.put("status", "LOGIN_SUCCESS");
            return ResponseEntity.ok(resp);

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
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String result = authService.verifyOtp(request.get("email"), request.get("otp"));

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Login successful after OTP");
            resp.put("status", result);
            return ResponseEntity.ok(resp);

        } catch (RuntimeException e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }
    }



}