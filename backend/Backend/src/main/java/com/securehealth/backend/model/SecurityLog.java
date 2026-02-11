package com.securehealth.backend.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Represents security audit logs for authentication events.
 * <p>
 * This entity tracks all security-related events including login attempts,
 * 2FA verification, account lockouts, and other security incidents.
 * </p>
 * 
 * @author Manas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "security_logs")
public class SecurityLog {

    /**
     * Unique identifier for the log entry
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    /**
     * Reference to the user who triggered the event
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * Type of security event
     * Examples: LOGIN_SUCCESS, LOGIN_FAILED, 2FA_SUCCESS, 2FA_FAILED, ACCOUNT_LOCKED
     */
    @Column(name = "event_type", nullable = false)
    private String eventType;

    /**
     * IP address from which the event originated
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * Severity level of the event
     * Examples: INFO, WARN, CRITICAL
     */
    @Column(name = "severity", nullable = false)
    private String severity;

    /**
     * Additional details about the event
     */
    @Column(columnDefinition = "TEXT")
    private String details;

    /**
     * Timestamp when the event occurred
     */
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
