## for registration
const registerUser = async (email, password, role) => {
  const response = await fetch("http://localhost:8081/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return await response.json(); // Returns User object
};

## for login
const loginUser = async (email, password) => {
  const response = await fetch("http://localhost:8081/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CRITICAL: Allows browser to save the secure cookie
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.status === "OTP_REQUIRED") {
    console.log("OTP Required! Redirect to OTP screen.");
    return { status: "OTP_REQUIRED", email: email };
  } 
  
  if (data.accessToken) {
    console.log("Login Success! Token:", data.accessToken);
    // TODO: Save accessToken to React Context or State
    return { status: "SUCCESS", token: data.accessToken, role: data.role };
  }

  throw new Error("Login failed");
};

## for otp
const verifyOtp = async (email, otpCode) => {
  const response = await fetch("http://localhost:8081/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CRITICAL: Sets the session cookie after OTP check
    body: JSON.stringify({ email, otp: otpCode }),
  });

  if (!response.ok) {
    throw new Error("Invalid OTP");
  }

  const data = await response.json();
  console.log("OTP Verified! Access Token:", data.accessToken);
  // TODO: Save accessToken to React Context or State
  return data;
};

## for logout
const logoutUser = async () => {
  await fetch("http://localhost:8081/api/auth/logout", {
    method: "POST",
    credentials: "include", // CRITICAL: Sends the cookie so server can delete it
  });

  console.log("Logged out successfully");
  // TODO: Clear accessToken from React State
};

## for enabling 2fa
const enableTwoFactorAuth = async (email) => {
  const response = await fetch("http://localhost:8081/api/auth/enable-2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Failed to enable 2FA");
  }
  return await response.json();
};