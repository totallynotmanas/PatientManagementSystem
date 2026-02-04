package com.securehealth.backend.dto;

import com.securehealth.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for User Registration.
 * <p>
 * This class captures the raw JSON input from the frontend.
 * It uses Jakarta Validation annotations to enforce security rules
 * <i>before</i> the data ever reaches the database.
 * </p>
 *
 * @author Manas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    /**
     * The user's email address.
     * <p>Validation: Must be a well-formed email format.</p>
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * The raw password.
     * <p>Validation: Must be at least 12 characters (NIST Guidelines).</p>
     */
    @NotBlank(message = "Password is required")
    @Size(min = 12, message = "Password must be at least 12 characters long")
    private String password;

    /**
     * The desired role.
     */
    @NotNull(message = "Role is required")
    private Role role;
}
