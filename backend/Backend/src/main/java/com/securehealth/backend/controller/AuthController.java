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
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest request) {
        try {
            authService.registerUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole());
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");

        } catch (RuntimeException e) {
            // In a real app, use a Global Exception Handler instead of try-catch here
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Login existing user.
     * Endpoint: POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            Login user = authService.authenticateUser(request.getEmail(), request.getPassword());
            Map<String, Object> resp = Map.of(
                    "message", "Login successful",
                    "email", user.getEmail(),
                    "role", user.getRole());
            return ResponseEntity.ok(resp);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}