package com.securehealth.backend.security;

import com.securehealth.backend.util.JwtUtil;
import com.securehealth.backend.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        // 1. Check for "Bearer " token
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);

            if (tokenBlacklistService.isBlacklisted(jwt)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been revoked");
                return; // Stop processing
            }

            try {
                email = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                System.out.println("JWT Extraction Error: " + e.getMessage());
            }
        }

        // 2. Validate Token & Set Security Context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            if (tokenBlacklistService.isSessionIdle(email)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired due to inactivity");
                return; // Stop processing
            }

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

            if (jwtUtil.validateToken(jwt, userDetails)) {

                tokenBlacklistService.updateLastActive(email);
                
                // Create the Authentication Object
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // CRITICAL: This logs the user in for this request
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        chain.doFilter(request, response);
    }
}