package com.securehealth.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Login user;

    @Column(nullable = false)
    private String refreshTokenHash; // Stores the SHA-256 Hash

    private String ipAddress;
    private String userAgent;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean isRevoked = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}