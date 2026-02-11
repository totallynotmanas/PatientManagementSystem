package com.securehealth.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityConfigTest {

    @Test
    void passwordEncoderIsArgon2() {
        SecurityConfig config = new SecurityConfig();
        PasswordEncoder encoder = config.passwordEncoder();
        assertTrue(encoder instanceof Argon2PasswordEncoder);
    }

    @Test
    void corsConfigurationAllowsCommonMethods() {
        SecurityConfig config = new SecurityConfig();
        CorsConfigurationSource source = config.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/login");
        CorsConfiguration cors = source.getCorsConfiguration(request);
        assertNotNull(cors);
        assertTrue(cors.getAllowedMethods().contains("GET"));
        assertTrue(cors.getAllowedMethods().contains("POST"));
        assertTrue(cors.getAllowedHeaders().contains("Content-Type"));
    }
}
