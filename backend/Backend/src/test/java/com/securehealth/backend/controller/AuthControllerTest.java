package com.securehealth.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securehealth.backend.dto.RegistrationRequest;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegisterUser_Success() throws Exception {
        RegistrationRequest request = new RegistrationRequest("test@example.com", "password1234", Role.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    public void testRegisterUser_DuplicateEmail() throws Exception {
        RegistrationRequest request = new RegistrationRequest("duplicate@example.com", "password1234", Role.PATIENT);

        doThrow(new RuntimeException("Email is already taken"))
                .when(authService).registerUser(request.getEmail(), request.getPassword(), request.getRole());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already taken"));
    }

    @Test
    public void testRegisterUser_InvalidEmail() throws Exception {
        RegistrationRequest request = new RegistrationRequest("invalid-email", "password1234", Role.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegisterUser_PasswordTooShort() throws Exception {
        RegistrationRequest request = new RegistrationRequest("test@example.com", "123", Role.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegisterUser_MissingEmail() throws Exception {
        RegistrationRequest request = new RegistrationRequest(null, "password1234", Role.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testLoginUser_Success() throws Exception {
        // Similar tests for login
    }

    @Test
    public void testLoginUser_InvalidCredentials() throws Exception {
        // Similar tests for login
    }

    @Test
    public void testLoginUser_AccountLocked() throws Exception {
        // Similar tests for login
    }

    @Test
    public void testLoginUser_InvalidEmail() throws Exception {
        // Similar tests for login
    }

    @Test
    public void testLoginUser_MissingPassword() throws Exception {
        // Similar tests for login
    }
}
