package com.securehealth.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The main entry point for the Secure Health Backend API.
 * <p>
 * This class bootstraps the Spring Boot application, initializing the embedded
 * Tomcat server,
 * database connections (PostgreSQL), and security configurations.
 * </p>
 *
 * @author Manas
 * @version 1.0
 * @since 2024-01-01
 */
@SpringBootApplication
public class SecureHealthApplication {

    /**
     * Main method to launch the application.
     *
     * @param args Command line arguments passed during startup.
     */
    public static void main(String[] args) {
        SpringApplication.run(SecureHealthApplication.class, args);
    }

}