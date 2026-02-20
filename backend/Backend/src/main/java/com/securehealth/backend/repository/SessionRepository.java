package com.securehealth.backend.repository;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByRefreshTokenHash(String refreshTokenHash);

    // 1. Find all active sessions for a user (so we can revoke them)
    List<Session> findAllByUserAndRevokedFalse(Login user);

    // 2. (Optional but good) A clean way to revoke everything for a user
    @Modifying
    @Query("UPDATE Session s SET s.revoked = true WHERE s.user.userId = :userId")
    void revokeAllUserSessions(@Param("userId") Long userId);

    // Add to SessionRepository.java
    @Query("SELECT s FROM Session s WHERE s.user = :user AND s.revoked = false ORDER BY s.createdAt ASC")
    List<Session> findActiveSessionsByUserOrderByCreatedAtAsc(@Param("user") Login user);
}