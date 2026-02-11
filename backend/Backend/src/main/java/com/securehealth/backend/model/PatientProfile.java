package com.securehealth.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patient_profile")
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Login user;

    @Column(nullable = false)
    private String fullName;

    private LocalDate dateOfBirth;

    private String addressEncrypted;

    private String medicalHistoryEncrypted;
}
