package com.securehealth.backend.repository;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.SecurityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for security audit logs.
 * <p>
 * Provides methods to log and retrieve security events for auditing
 * and compliance purposes.
 * </p>
 * 
 * @author Manas
 */
@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {

    /**
     * Find all security logs for a specific user
     */
    List<SecurityLog> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * Find all security logs within a time range
     */
    @Query("SELECT sl FROM SecurityLog sl WHERE sl.timestamp BETWEEN :start AND :end ORDER BY sl.timestamp DESC")
    List<SecurityLog> findByTimestampBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Find all security events of a specific type
     */
    List<SecurityLog> findByEventTypeOrderByTimestampDesc(String eventType);

    /**
     * Find all critical security events
     */
    List<SecurityLog> findBySeverityOrderByTimestampDesc(String severity);

    /**
     * Count failed login attempts for a user within a time window
     */
    @Query("SELECT COUNT(sl) FROM SecurityLog sl WHERE sl.userId = :userId AND sl.eventType = 'LOGIN_FAILED' AND sl.timestamp > :since")
    int countFailedLoginsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    /**
     * Count OTP verification attempts for a user within a time window
     */
    @Query("SELECT COUNT(sl) FROM SecurityLog sl WHERE sl.userId = :userId AND sl.eventType = '2FA_FAILED' AND sl.timestamp > :since")
    int countFailedOtpAttemptsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
