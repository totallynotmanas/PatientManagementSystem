## Base URL
http://localhost:8081/api

## Register
POST /api/auth/register

```json
{
  "email": "doctor@hospital.com",
  "password": "StrongPassword123!",
  "role": "DOCTOR",
  "full_name": "Dr Jane Smith",
  "license_number": "LIC-12345",
  "specialization": "Cardiology"
}
```

```json
{
  "message": "User registered successfully",
  "userId": 18,
  "role": "DOCTOR"
}
```

## Login
POST /api/auth/login

```json
{
  "email": "doctor@hospital.com",
  "password": "StrongPassword123!"
}
```

OTP-required response:

```json
{
  "accessToken": null,
  "refreshToken": null,
  "role": "DOCTOR",
  "status": "OTP_REQUIRED"
}
```

Login-success response:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh>",
  "role": "PATIENT",
  "status": "LOGIN_SUCCESS"
}
```

## Verify OTP
POST /api/auth/verify-otp

```json
{
  "email": "doctor@hospital.com",
  "otp": "123456"
}
```

## Resend OTP
POST /api/auth/resend-otp

```json
{
  "email": "doctor@hospital.com"
}
```

## Forgot Password
POST /api/auth/forgot-password

```json
{
  "email": "user@hospital.com"
}
```

## Validate Reset Token
GET /api/auth/validate-reset-token?token=<token>

## Reset Password
POST /api/auth/reset-password

```json
{
  "token": "<token>",
  "newPassword": "NewStrongPassword123!",
  "confirmPassword": "NewStrongPassword123!"
}
```

## Logout
POST /api/auth/logout
