package com.securehealth.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctor_profile")
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Login user;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String licenseNumber;

    private String specialization;
}
