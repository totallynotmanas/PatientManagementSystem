package com.securehealth.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service

/**
 * Service responsible for email-based communication.
 *
 * <p>This service handles sending One-Time Password (OTP) emails used
 * during Two-Factor Authentication (2FA) in the Secure Health system.</p>
 *
 * <p>It uses Spring Boot's {@link JavaMailSender} to construct and send
 * plain text email messages to users during login verification.</p>
 *
 */
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a One-Time Password (OTP) email to a user.
     *
     * <p>This method constructs a simple text email containing the OTP
     * required for completing 2FA login and sends it to the provided
     * email address.</p>
     *
     * @param to  The recipient's email address.
     * @param otp The generated One-Time Password to be delivered.
     */
    public void sendOtp(String to, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("SecureHealth Login OTP");
        msg.setText("Your OTP is: " + otp);
        mailSender.send(msg);
    }
}
