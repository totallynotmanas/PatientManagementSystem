## Base URL
http://localhost:8081/api

## Register
fetch("http://localhost:8081/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, role }),
});

## Login
fetch("http://localhost:8081/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});

## Verify OTP
fetch("http://localhost:8081/api/auth/verify-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, otp }),
});

## Resend OTP
fetch("http://localhost:8081/api/auth/resend-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});

## Logout
fetch("http://localhost:8081/api/auth/logout", {
  method: "POST",
  credentials: "include",
});
