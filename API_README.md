# Current Backend API Documentation

This document lists all the **actual, currently implemented** REST API endpoints available in the Spring Boot backend (`http://localhost:8081/api`).

## Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user (Returns JWT or requests OTP) |
| POST | `/auth/verify-otp` | Verify 2FA OTP for a session |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/enable-2fa` | Enable 2FA for the authenticated user |
| POST | `/auth/forgot-password` | Request a password reset email |
| GET | `/auth/validate-reset-token` | Validate a password reset token |
| POST | `/auth/reset-password` | Reset the user's password |
| POST | `/auth/refresh-token` | Generate a new JWT using a refresh token |

## Patients (`/api/patients`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients` | Get a list of all patients |
| GET | `/patients/{id}` | Get specific patient details by ID |
| POST | `/patients` | Create a new patient profile |
| PUT | `/patients/{id}` | Update an existing patient profile |

## Patient Data Endpoints
The following controllers currently only expose a single endpoint to fetch records belonging to a specific patient ID. 

| Controller / Base Path | Method | Endpoint | Description |
|---|---|---|---|
| **Appointments** | GET | `/api/appointments/patient/{patientId}` | Get all appointments for a patient |
| **Lab Results**| GET | `/api/lab-results/patient/{patientId}` | Get all lab results for a patient |
| **Medical Records** | GET | `/api/medical-records/patient/{patientId}` | Get all medical records for a patient |
| **Prescriptions** | GET | `/api/prescriptions/patient/{patientId}` | Get all prescriptions for a patient |
| **Vital Signs** | GET | `/api/vital-signs/patient/{patientId}` | Get all recorded vital signs for a patient |

## Audit Logs (`/api/audit-logs`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit-logs` | Retrieve all system audit logs |
| GET | `/audit-logs/{email}` | Retrieve audit logs for a specific user email |