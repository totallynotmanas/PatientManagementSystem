## for registration
fetch("http://localhost:8081/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

## for login
fetch("http://localhost:8081/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

## for logout
fetch("http://localhost:8081/api/auth/logout", {
    method: "POST",
    // This sends the cookie back to the server so it can be deleted
    credentials: "include", 
  });