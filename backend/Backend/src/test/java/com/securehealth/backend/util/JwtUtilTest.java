package com.securehealth.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import javax.crypto.SecretKey;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    "jwt.expiration=900000"
})
class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Test
    void testGenerateAccessToken() {
        String token = jwtUtil.generateAccessToken("test@example.com", "DOCTOR", 100L);
        assertNotNull(token);
        
        // Manually parse to verify contents
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertEquals("test@example.com", claims.getSubject());
        assertEquals("DOCTOR", claims.get("role"));
        assertEquals(100, claims.get("userId", Integer.class)); // JWT stores numbers as Integer
    }

    @Test
    void testGenerateRefreshToken() {
        String token = jwtUtil.generateRefreshToken();
        assertNotNull(token);
        assertTrue(token.length() > 20); // Should be a long random string
    }
}