package com.securehealth.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

/**
 * Security configuration for the application.
 *
 * Defines the password encoder (Argon2) and the HTTP security filter chain
 * to control access to endpoints.
 */
@Configuration
public class SecurityConfig {

    /**
     * Configures the Argon2 password encoder.
     *
     * Parameters are tuned for current security standards (NIST/OWASP):
     * Salt length: 16 bytes, hash length: 32 bytes, parallelism: 1,
     * memory: 4096 KB, iterations: 3.
     *
     * @return a configured Argon2PasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 1, 4096, 3);
    }

    /**
     * Configures the HTTP security filter chain.
     *
     * Disables CSRF (stateless JWTs) and allows public access to
     * registration and login endpoints.
     *
     * @param http the HttpSecurity object to configure
     * @return the built SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for REST APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }
}