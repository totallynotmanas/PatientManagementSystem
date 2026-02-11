# SecureHealth Backend API

A Spring Boot REST API for the Patient Management System with secure authentication, 2FA, and password recovery features.

## Tech Stack

- **Framework:** Spring Boot 3.2.2
- **Language:** Java 21
- **Database:** PostgreSQL
- **Security:** Spring Security with Argon2 password hashing
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Spring Mail for OTP and password reset
- **Testing:** JUnit 5, Mockito, MockMvc

## Folder Structure

```
Backend/
├── src/
│   ├── main/
│   │   ├── java/com/securehealth/backend/
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   └── AuthController.java
│   │   │   ├── dto/
│   │   │   │   ├── ForgotPasswordRequest.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── LoginResponse.java
│   │   │   │   ├── OtpRequest.java
│   │   │   │   ├── RegistrationRequest.java
│   │   │   │   ├── RegistrationResponse.java
│   │   │   │   └── ResetPasswordRequest.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── model/
│   │   │   │   ├── DoctorProfile.java
│   │   │   │   ├── Login.java
│   │   │   │   ├── PasswordHistory.java
│   │   │   │   ├── PasswordResetToken.java
│   │   │   │   ├── PatientProfile.java
│   │   │   │   ├── Role.java
│   │   │   │   ├── SecurityLog.java
│   │   │   │   └── Session.java
│   │   │   ├── repository/
│   │   │   │   ├── DoctorProfileRepository.java
│   │   │   │   ├── LoginRepository.java
│   │   │   │   ├── PasswordHistoryRepository.java
│   │   │   │   ├── PasswordResetTokenRepository.java
│   │   │   │   ├── PatientProfileRepository.java
│   │   │   │   ├── SecurityLogRepository.java
│   │   │   │   └── SessionRepository.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── EmailService.java
│   │   │   │   └── SecurityLogService.java
│   │   │   ├── util/
│   │   │   │   ├── EncryptionUtil.java
│   │   │   │   └── JwtUtil.java
│   │   │   └── SecureHealthApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/securehealth/backend/
│           ├── controller/
│           │   └── AuthControllerTest.java
│           ├── repository/
│           │   └── LoginRepositoryTest.java
│           ├── service/
│           │   └── AuthServiceTest.java
│           ├── util/
│           │   └── JwtUtilTest.java
│           └── BackendApplicationTests.java
├── pom.xml
└── Dockerfile
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/verify-otp` | Verify 2FA OTP code |
| POST | `/api/auth/resend-otp` | Resend OTP email |
| POST | `/api/auth/logout` | Logout and invalidate session |

### Password Recovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/forgot-password` | Request password reset email |
| GET | `/api/auth/validate-reset-token` | Validate reset token |
| POST | `/api/auth/reset-password` | Reset password with token |

## User Roles

```java
public enum Role {
    PATIENT,
    DOCTOR,
    NURSE,
    ADMIN,
    LAB_TECHNICIAN
}
```

## Security Features

- **Password Hashing:** Argon2 (NIST/OWASP recommended)
- **JWT Tokens:** 15-minute access tokens, 7-day refresh tokens
- **2FA:** OTP via email for DOCTOR and ADMIN roles
- **Password Policy:**
  - Minimum 12 characters
  - No common weak patterns (password, 123456, qwerty, etc.)
  - Cannot reuse last 5 passwords
- **Reset Tokens:** 30-minute expiration, single use
- **Session Management:** Secure HttpOnly cookies

## Test Cases

### AuthServiceTest (Unit Tests)

| Test Case | Description |
|-----------|-------------|
| `testRegisterUser_Success` | Successfully registers a new user |
| `testRegisterUser_DuplicateEmail` | Rejects duplicate email registration |
| `testLogin_Success` | Authenticates user and returns tokens |
| `testLogin_UserNotFound` | Returns error for non-existent user |
| `testLogin_InvalidPassword` | Returns error for wrong password |
| `testLogin_AccountLocked` | Blocks locked account login |
| `testLogin_DoctorRequiresOtp` | Triggers 2FA for doctor role |
| `testLogout_Success` | Revokes session on logout |
| `testInitiatePasswordReset_Success` | Sends reset email for valid user |
| `testInitiatePasswordReset_UserNotFound` | Silently handles non-existent email |
| `testValidateResetToken_Valid` | Returns true for valid token |
| `testValidateResetToken_Invalid` | Returns false for invalid/expired token |
| `testResetPassword_Success` | Resets password with valid token |
| `testResetPassword_InvalidToken` | Rejects invalid reset token |
| `testResetPassword_PasswordReused` | Blocks reuse of current password |
| `testResetPassword_PasswordInHistory` | Blocks reuse of recent passwords |
| `testResetPassword_WeakPassword` | Rejects passwords with weak patterns |
| `testResetPassword_ShortPassword` | Rejects passwords under 12 chars |

### AuthControllerTest (Integration Tests)

| Test Case | Description |
|-----------|-------------|
| `testRegisterUser_Success` | POST /register returns 201 |
| `testLoginUser_Success` | POST /login returns tokens and cookie |
| `testLoginUser_InvalidCredentials` | POST /login returns 401 |
| `testLoginUser_AccountLocked` | POST /login returns 401 for locked |
| `testLoginUser_InvalidEmail` | POST /login returns 400 for bad email |
| `testLoginUser_MissingPassword` | POST /login returns 400 |
| `testLogout_Success` | POST /logout clears cookie |
| `testForgotPassword_Success` | POST /forgot-password returns 200 |
| `testForgotPassword_InvalidEmail` | POST /forgot-password returns 400 |
| `testValidateResetToken_Valid` | GET /validate-reset-token returns valid=true |
| `testValidateResetToken_Invalid` | GET /validate-reset-token returns 400 |
| `testResetPassword_Success` | POST /reset-password returns 200 |
| `testResetPassword_PasswordMismatch` | POST /reset-password returns 400 |
| `testResetPassword_InvalidToken` | POST /reset-password returns 400 |
| `testResetPassword_PasswordReused` | POST /reset-password returns 400 |
| `testResetPassword_ShortPassword` | POST /reset-password returns 400 |

## Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Run with verbose output
mvn test -X
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/healthcare_auth_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `temp_user` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `temp_pass` |
| `MAIL_HOST` | SMTP host | - |
| `MAIL_PORT` | SMTP port | - |
| `MAIL_USERNAME` | SMTP username | - |
| `MAIL_PASSWORD` | SMTP password | - |
| `FRONTEND_URL` | Frontend URL for reset links | `http://localhost:3000` |

## Quick Start

```bash
# 1. Start PostgreSQL (via Docker)
docker-compose up -d postgres_db

# 2. Run the application
mvn spring-boot:run

# 3. API available at http://localhost:8080 (local run)
```

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "SecurePass123!",
  "role": "DOCTOR"
}

# Response: 201 Created
{ "message": "User registered successfully" }
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "SecurePass123!"
}

# Response: 200 OK (2FA required for DOCTOR)
{ "status": "OTP_REQUIRED" }

# Response: 200 OK (No 2FA)
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "role": "PATIENT",
  "status": "LOGIN_SUCCESS"
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{ "email": "user@hospital.com" }

# Response: 200 OK
{ "message": "If an account exists with this email, a password reset link has been sent." }
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecure123!",
  "confirmPassword": "NewSecure123!"
}

# Response: 200 OK
{ "message": "Password has been reset successfully. Please login with your new password." }
```


