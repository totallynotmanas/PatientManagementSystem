package com.securehealth.backend.repository;

import com.securehealth.backend.model.Login;
import com.securehealth.backend.model.PasswordHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data Access Object (DAO) for the PasswordHistory entity.
 * <p>
 * This interface extends JpaRepository to provide standard CRUD operations
 * (Create, Read, Update, Delete) without writing SQL.
 * </p>
 * <p>
 * Used for checking password reuse during password changes/resets.
 * </p>
 *
 * @author Manas
 * @version 1.0
 */
@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {

    /**
     * Gets the last N password hashes for a user.
     * <p>
     * Used to check if a new password was previously used.
     * Default policy checks last 5 passwords.
     * </p>
     *
     * @param user  The user whose password history to retrieve.
     * @param limit Maximum number of passwords to return.
     * @return List of PasswordHistory entries, most recent first.
     */
    java.util.List<PasswordHistory> findByUserOrderByCreatedAtDesc(Login user, org.springframework.data.domain.Pageable pageable);

    /**
     * Gets all password history entries for a user.
     * <p>
     * Used for administrative purposes or cleanup.
     * </p>
     *
     * @param user The user whose password history to retrieve.
     * @return List of all PasswordHistory entries for the user.
     */
    List<PasswordHistory> findByUserOrderByCreatedAtDesc(Login user);

    /**
     * Counts the number of password history entries for a user.
     *
     * @param user The user to count for.
     * @return Number of stored password hashes.
     */
    long countByUser(Login user);
}
