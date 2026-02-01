package com.securehealth.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Represents the core Identity entity for authentication.
 * <p>
 * This entity maps to the 'login' table in the database and stores
 * credentials, role information, and active defense states (lockouts).
 * </p>
 *
 * @see com.securehealth.backend.repository.LoginRepository
 * @author Manas
 */
@Data // Generates Getters, Setters, toString, Equals, HashCode
@NoArgsConstructor // Generates empty constructor (Required by JPA)
@AllArgsConstructor // Generates full constructor
@Entity
@Table(name = "login")
public class Login {

    /**
     * Unique identifier for the user.
     * Auto-incremented by the database.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    /**
     * User's unique email address.
     * Used as the username for login.
     */
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Securely hashed password (Argon2).
     * <p><b>SECURITY WARNING:</b> Never store plaintext passwords here.</p>
     */
    @Column(nullable = false)
    private String passwordHash;

    /**
     * The user's role in the system.
     * Examples: PATIENT, DOCTOR, ADMIN.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- Active Defense Fields (Epic 5) ---

    /**
     * Tracks consecutive failed login attempts.
     * Used to trigger temporary account locking.
     */
    private int failedAttempts = 0;

    /**
     * Indicates if the account is currently locked due to brute-force attempts.
     */
    private boolean isLocked = false;

    /**
     * Timestamp indicating when the account will automatically unlock.
     * Null if the account is not locked.
     */
    private LocalDateTime lockoutUntil;

    /**
     * Audit timestamp for when the account was created.
     * Cannot be updated after creation.
     */
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Compatibility methods for tests expecting snake_case naming
    public Long getUser_id() {
        return userId;
    }

    public void setUser_id(Long userId) {
        this.userId = userId;
    }
}