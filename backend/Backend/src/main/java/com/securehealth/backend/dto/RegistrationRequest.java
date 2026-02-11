package com.securehealth.backend.dto;

import com.securehealth.backend.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
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

    // Optional profile fields
    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    private String address;

    @JsonProperty("license_number")
    private String licenseNumber;

    private String specialization;
}
