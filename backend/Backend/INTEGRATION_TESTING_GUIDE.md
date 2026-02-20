# Backend Integration Testing Guide

## Overview

This guide covers the integration tests for the SecureHealth Backend API. Integration tests verify the complete flow from HTTP request through controller, service, repository, and database layers.

## Test Structure

### Test Types

1. **Unit Tests** (`AuthServiceTest`, `JwtUtilTest`)
   - Test individual components in isolation
   - Use mocks for dependencies
   - Fast execution

2. **Controller Tests** (`AuthControllerTest`)
   - Test HTTP layer with MockMvc
   - Mock service layer
   - Verify request/response handling

3. **Integration Tests** (`AuthIntegrationTest`) ⭐ NEW
   - Test complete flow end-to-end
   - Real database (H2 in-memory)
   - No service mocking
   - Verify data persistence

## Integration Test Coverage

### Authentication Flows

| Test Case | Description | Verifies |
|-----------|-------------|----------|
| `testCompleteRegistrationFlow_Patient` | Register patient account | User saved to DB, no 2FA |
| `testCompleteRegistrationFlow_Doctor_With2FA` | Register doctor account | User saved with 2FA enabled |
| `testRegistration_DuplicateEmail` | Prevent duplicate emails | Constraint enforcement |
| `testCompleteLoginFlow_Success` | Full login flow | Session created, tokens issued |
| `testLoginFlow_InvalidCredentials` | Login with wrong password | No session created |
| `testLoginFlow_DoctorRequires2FA` | Doctor login triggers OTP | OTP sent and stored |
| `testCompleteLogoutFlow` | Logout and revoke session | Session marked as revoked |

### Password Reset Flows

| Test Case | Description | Verifies |
|-----------|-------------|----------|
| `testCompletePasswordResetFlow` | Full reset flow (request → validate → reset → login) | Token lifecycle, password update |
| `testPasswordReset_TokenExpiration` | Expired token rejection | Time-based validation |
| `testPasswordReset_TokenSingleUse` | Token can only be used once | Token marked as used |
| `testPasswordReset_PasswordReuse` | Cannot reuse current password | Password history check |

## Running Integration Tests

### Run All Tests
```bash
cd backend/Backend
mvn test
```

### Run Only Integration Tests
```bash
mvn test -Dtest=AuthIntegrationTest
```

### Run Specific Test
```bash
mvn test -Dtest=AuthIntegrationTest#testCompleteLoginFlow_Success
```

### Run with Verbose Output
```bash
mvn test -X
```

## Test Configuration

### Database Setup
Integration tests use H2 in-memory database configured in `@TestPropertySource`:

```java
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:integrationtestdb",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    "jwt.expiration=900000"
})
```

### Transaction Management
- Each test runs in a transaction (`@Transactional`)
- Database is rolled back after each test
- Ensures test isolation

### Email Service
- `EmailService` is mocked with `@MockBean`
- Prevents actual email sending during tests
- Allows verification of email calls

## Key Integration Test Patterns

### 1. Complete Flow Testing
```java
@Test
void testCompletePasswordResetFlow() throws Exception {
    // Step 1: Register user
    registerTestUser("user@hospital.com", "OldPassword123!", Role.PATIENT);
    
    // Step 2: Request reset
    mockMvc.perform(post("/api/auth/forgot-password")...);
    
    // Step 3: Validate token
    mockMvc.perform(get("/api/auth/validate-reset-token")...);
    
    // Step 4: Reset password
    mockMvc.perform(post("/api/auth/reset-password")...);
    
    // Step 5: Login with new password
    mockMvc.perform(post("/api/auth/login")...);
    
    // Step 6: Verify old password fails
    mockMvc.perform(post("/api/auth/login")...).andExpect(status().isUnauthorized());
}
```

### 2. Database Verification
```java
// Verify data persisted correctly
Optional<Login> savedUser = loginRepository.findByEmail("patient@hospital.com");
assertTrue(savedUser.isPresent());
assertEquals(Role.PATIENT, savedUser.get().getRole());
```

### 3. State Verification
```java
// Verify session state
Session session = sessionRepository.findAll().get(0);
assertTrue(session.isRevoked());
```

## Test Data Management

### Setup
```java
@BeforeEach
void setUp() {
    // Clean database before each test
    sessionRepository.deleteAll();
    resetTokenRepository.deleteAll();
    loginRepository.deleteAll();
}
```

### Helper Methods
```java
private void registerTestUser(String email, String password, Role role) throws Exception {
    RegistrationRequest request = new RegistrationRequest();
    request.setEmail(email);
    request.setPassword(password);
    request.setRole(role);
    
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());
}
```

## Comparison: Unit vs Integration Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **Scope** | Single component | Full stack |
| **Dependencies** | Mocked | Real (except email) |
| **Database** | Mocked | H2 in-memory |
| **Speed** | Very fast | Slower |
| **Purpose** | Logic verification | Flow verification |
| **Isolation** | High | Medium |

## Best Practices

1. **Test Isolation**
   - Clean database before each test
   - Use `@Transactional` for automatic rollback
   - Don't depend on test execution order

2. **Meaningful Assertions**
   - Verify HTTP status codes
   - Check response body content
   - Validate database state
   - Confirm side effects (emails sent, sessions created)

3. **Complete Flows**
   - Test realistic user journeys
   - Include multiple steps
   - Verify state transitions

4. **Error Scenarios**
   - Test validation failures
   - Test business rule violations
   - Test edge cases (expired tokens, locked accounts)

## Common Issues & Solutions

### Issue: Tests fail with "Table not found"
**Solution:** Ensure `spring.jpa.hibernate.ddl-auto=create-drop` in test properties

### Issue: Tests interfere with each other
**Solution:** Add `@Transactional` to test class and clean data in `@BeforeEach`

### Issue: JWT validation fails
**Solution:** Verify `jwt.secret` is set in `@TestPropertySource`

### Issue: Email service errors
**Solution:** Ensure `EmailService` is mocked with `@MockBean`

## Adding New Integration Tests

1. **Identify the flow** to test (e.g., 2FA verification)
2. **Create test method** with descriptive name
3. **Set up test data** using helper methods
4. **Execute the flow** with multiple API calls
5. **Verify results** at each step
6. **Check database state** after completion

### Example Template
```java
@Test
void testNewFeatureFlow() throws Exception {
    // Arrange - Set up test data
    registerTestUser("test@example.com", "Password123!", Role.PATIENT);
    
    // Act - Execute the flow
    MvcResult result = mockMvc.perform(post("/api/auth/new-endpoint")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andReturn();
    
    // Assert - Verify results
    Optional<Entity> entity = repository.findByField("value");
    assertTrue(entity.isPresent());
    assertEquals(expectedValue, entity.get().getField());
}
```

## Test Execution Results

Expected output when running integration tests:

```
[INFO] Running com.securehealth.backend.integration.AuthIntegrationTest
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
```

## Next Steps

1. Add integration tests for 2FA OTP verification flow
2. Add integration tests for session refresh token flow
3. Add integration tests for concurrent login attempts
4. Add integration tests for account locking mechanism
5. Add performance tests for high-load scenarios

## Resources

- [Spring Boot Testing Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [MockMvc Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#spring-mvc-test-framework)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
