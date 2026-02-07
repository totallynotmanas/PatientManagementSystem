package com.securehealth.backend.service;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;


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
    private EmailService emailService;


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
    public String authenticateUser(String email, String rawPassword) {

        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (user.isLocked()) {
            throw new RuntimeException("Account is locked due to too many failed attempts.");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // 2FA CHECK
        if ((user.getRole() == Role.DOCTOR || user.getRole() == Role.ADMIN)
                && user.isTwoFactorEnabled()) {

            String otp = generateOtp();
            user.setOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
            loginRepository.save(user);

            emailService.sendOtp(user.getEmail(), otp);

            return "OTP_REQUIRED";  // stops login until OTP verified
        }

        return "LOGIN_SUCCESS";
    }


    /**
     * Verifies the One-Time Password (OTP) for a user during 2FA login.
     * <p>
     * Checks that the OTP matches the stored value and that it has not expired.
     * On success, the OTP is cleared from the database to prevent reuse.
     * </p>
     *
     * @param email The email of the user performing OTP verification.
     * @param otp   The OTP value entered by the user.
     * @return "LOGIN_SUCCESS" if OTP is valid.
     * @throws RuntimeException if the OTP is invalid or expired.
     * @author Diya
     */
    public String verifyOtp(String email, String otp) {
        public String verifyOtp
    }(String email, String otp) {

        Login user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null &&
                user.getOtp().equals(otp) &&
                user.getOtpExpiry().isAfter(LocalDateTime.now())) {

            user.setOtp(null);
            loginRepository.save(user);

            return "LOGIN_SUCCESS";
        }

        throw new RuntimeException("Invalid or expired OTP");
    }


    /**
     * Generates a 6-digit numeric One-Time Password (OTP).
     * <p>
     * The OTP is used for step-up authentication during 2FA login.
     * </p>
     *
     * @return A randomly generated 6-digit OTP as a String.
     */
    private String generateOtp() {


        private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }


}