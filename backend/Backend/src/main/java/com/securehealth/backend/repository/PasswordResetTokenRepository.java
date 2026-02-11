package com.securehealth.backend.repository;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Data Access Object (DAO) for the PasswordResetToken entity.
 * <p>
 * This interface extends JpaRepository to provide standard CRUD operations
 * (Create, Read, Update, Delete) without writing SQL.
 * </p>
 *
 * @author Manas
 * @version 1.0
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Finds a valid reset token by its hash.
     * <p>
     * Used during password reset to validate the token.
     * </p>
     *
     * @param tokenHash The SHA-256 hash of the token to search for.
     * @return An Optional containing the PasswordResetToken if found, or empty if not.
     */
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /**
     * Finds a valid (unused and not expired) token by its hash.
     *
     * @param tokenHash The SHA-256 hash of the token to search for.
     * @param now       Current timestamp for expiration check.
     * @return An Optional containing the valid PasswordResetToken if found.
     */
    @Query("SELECT t FROM PasswordResetToken t WHERE t.tokenHash = :tokenHash " +
           "AND t.used = false AND t.expiresAt >= :currentTime")
    Optional<PasswordResetToken> findValidToken(@Param("tokenHash") String tokenHash,
                                                @Param("currentTime") LocalDateTime currentTime);

    /**
     * Invalidates all existing tokens for a user.
     * <p>
     * Called when a new reset token is requested to prevent
     * multiple active tokens for the same user.
     * </p>
     *
     * @param user The user whose tokens should be invalidated.
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    void invalidateAllTokensForUser(@Param("user") Login user);

    /**
     * Deletes all expired tokens.
     * <p>
     * Cleanup method to remove old tokens from the database.
     * </p>
     *
     * @param expirationDate Tokens that expired before this date will be deleted.
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :expirationDate")
    void deleteExpiredTokens(@Param("expirationDate") LocalDateTime expirationDate);
}
