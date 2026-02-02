package com.securehealth.backend.service;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service Layer for Identity Management.
 * <p>
 * Handles the core security operations:
 * 1. Registering new users (Hashing passwords)
 * 2. Authenticating users (Verifying passwords)
 * </p>
 *
 * @author Manas
 */
@Service
public class AuthService {

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user.
     * <p>
     * Creates a new record in the 'login' table with a secure Argon2 hash.
     * </p>
     *
     * @param email       The user's email.
     * @param rawPassword The plaintext password.
     * @param role        The selected role.
     * @return The saved Login entity.
     * @throws RuntimeException if the email is already taken.
     */
    public Login registerUser(String email, String rawPassword, Role role) {
        // 1. Duplicate Check
        if (loginRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }

        // 2. Hash Password (Argon2)
        String hash = passwordEncoder.encode(rawPassword);

        // 3. Create Entity
        Login newUser = new Login();
        newUser.setEmail(email);
        newUser.setPasswordHash(hash);
        newUser.setRole(role);

        // 4. Save to DB
        return loginRepository.save(newUser);
    }

    /**
     * Authenticates a user during Login.
     * <p>
     * 1. Finds user by email.
     * 2. Checks if the account is locked (Active Defense).
     * 3. Verifies the password hash.
     * </p>
     *
     * @param email       The input email.
     * @param rawPassword The input password.
     * @return The Login entity if successful.
     * @throws RuntimeException if credentials are invalid or account is locked.
     */
    public Login authenticateUser(String email, String rawPassword) {
        // 1. Find User
        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials")); // Generic message for security

        // 2. Check Lockout (Epic 5 - Active Defense)
        if (user.isLocked()) {
            // In a real app, check if lockout time has expired here
            throw new RuntimeException("Account is locked due to too many failed attempts.");
        }

        // 3. Verify Password
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            // Update failed attempts count here (omitted for brevity, but vital for Epic 5)
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }
}