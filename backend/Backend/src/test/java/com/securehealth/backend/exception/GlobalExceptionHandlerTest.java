package com.securehealth.backend.exception;

import com.securehealth.backend.dto.RegistrationRequest;
import jakarta.validation.Valid;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {

    private WebRequest webRequest() {
        return new ServletWebRequest(new MockHttpServletRequest("GET", "/api/auth/login"));
    }

    @Test
    void handleRuntimeExceptionReturnsBadRequest() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(
                new RuntimeException("boom"), webRequest());
        assertEquals(400, response.getStatusCode().value());
        assertEquals("boom", response.getBody().get("message"));
    }

    @Test
    void handleAuthenticationExceptionReturnsUnauthorized() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<Map<String, Object>> response = handler.handleAuthenticationException(
                new org.springframework.security.authentication.BadCredentialsException("bad"), webRequest());
        assertEquals(401, response.getStatusCode().value());
        assertEquals("Invalid credentials", response.getBody().get("message"));
    }

    @Test
    void handleValidationExceptionReturnsBadRequest() throws Exception {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        Method method = TestController.class.getDeclaredMethod("register", RegistrationRequest.class);
        BindingResult bindingResult = new BeanPropertyBindingResult(new RegistrationRequest(), "registrationRequest");
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                new org.springframework.core.MethodParameter(method, 0), bindingResult);
        ResponseEntity<Map<String, Object>> response = handler.handleValidationException(ex, webRequest());
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Validation Error", response.getBody().get("error"));
    }

    @Test
    void handleGenericExceptionReturnsInternalServerError() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<Map<String, Object>> response = handler.handleGenericException(
                new Exception("boom"), webRequest());
        assertEquals(500, response.getStatusCode().value());
        assertTrue(((String) response.getBody().get("message")).contains("unexpected"));
    }

    static class TestController {
        @SuppressWarnings("unused")
        void register(@Valid RegistrationRequest request) {
        }
    }
}
