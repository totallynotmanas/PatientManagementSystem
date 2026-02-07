package com.securehealth.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor; // [NEW] Generates constructor with args
import lombok.Data;
import lombok.NoArgsConstructor;  // [NEW] Generates empty constructor

/**
 * DTO for login requests.
 */
@Data
@NoArgsConstructor  // Fixes "The constructor LoginRequest() is undefined"
@AllArgsConstructor // Fixes "new LoginRequest(email, pass)" usage
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 12, message = "Password must be at least 12 characters long")
    private String password;
}