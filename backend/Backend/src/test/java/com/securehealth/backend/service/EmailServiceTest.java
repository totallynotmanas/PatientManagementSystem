package com.securehealth.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendOtpBuildsEmail() {
        emailService.sendOtp("user@example.com", "123456");
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertEquals("user@example.com", message.getTo()[0]);
        assertEquals("SecureHealth Login OTP", message.getSubject());
        assertTrue(message.getText().contains("123456"));
    }

    @Test
    void sendPasswordResetEmailBuildsEmail() {
        String link = "http://localhost/reset?token=abc";
        emailService.sendPasswordResetEmail("user@example.com", link);
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertEquals("user@example.com", message.getTo()[0]);
        assertEquals("SecureHealth - Password Reset Request", message.getSubject());
        assertTrue(message.getText().contains(link));
    }
}
