package com.securehealth.backend.repository;

import com.securehealth.backend.model.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
   Optional<PatientProfile> findByUser_UserId(Long userId);
}
