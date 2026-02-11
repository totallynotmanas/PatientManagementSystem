package com.securehealth.backend.dto;

import com.securehealth.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private String message;
    private Long userId;
    private Role role;
}
