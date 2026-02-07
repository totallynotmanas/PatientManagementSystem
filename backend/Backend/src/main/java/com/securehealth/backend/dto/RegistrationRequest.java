package com.securehealth.backend.dto;

import com.securehealth.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor; // [NEW]
import lombok.Data;
import lombok.NoArgsConstructor;  // [NEW]

/**
 * Data Transfer Object (DTO) for User Registration.
 */
@Data
@NoArgsConstructor  // Fixes Test Error
@AllArgsConstructor // Fixes Test Error
public class RegistrationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 12, message = "Password must be at least 12 characters long")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;
}