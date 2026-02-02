package com.securehealth.backend.model;

/**
 * Defines the authorized roles within the Healthcare System.
 * Used for Role-Based Access Control (RBAC).
 */
public enum Role {
    PATIENT,
    DOCTOR,
    NURSE,
    ADMIN,
    LAB_TECHNICIAN
}