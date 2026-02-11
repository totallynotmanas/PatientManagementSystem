package com.securehealth.backend.repository;

import com.securehealth.backend.model.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
   Optional<DoctorProfile> findByUser_UserId(Long userId);
}
