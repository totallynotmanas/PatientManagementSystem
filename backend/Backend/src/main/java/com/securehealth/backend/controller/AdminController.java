package com.securehealth.backend.controller;

import com.securehealth.backend.dto.AdminMetricsDTO;
import com.securehealth.backend.dto.RegistrationRequest;
import com.securehealth.backend.model.Role;
import com.securehealth.backend.service.AdminService;
import com.securehealth.backend.service.AppointmentService;
import com.securehealth.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AuthService authService;

    @Autowired
    private com.securehealth.backend.service.EmailService emailService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getDashboardMetrics() {
        AdminMetricsDTO metrics = adminService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/appointments/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getPendingAppointments() {
        return ResponseEntity.ok(appointmentService.getPendingAppointments());
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAllStaff() {
        return ResponseEntity.ok(adminService.getAllStaff());
    }

    @DeleteMapping("/staff/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> removeStaffMember(@PathVariable Long userId) {
        try {
            adminService.removeStaffMember(userId);
            return ResponseEntity.ok("Staff member removed successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAllPatients() {
        return ResponseEntity.ok(adminService.getAllPatients());
    }

    @PutMapping("/staff/{userId}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateStaffRole(
            @PathVariable Long userId,
            @RequestBody com.securehealth.backend.dto.RoleUpdateDTO request) {

        try {
            return ResponseEntity.ok(adminService.updateStaffRole(userId, request.getNewRole()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // 3. Get user activity summary
    @GetMapping("/user-activity")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getUserActivity(@RequestParam(defaultValue = "24h") String timeframe) {
        // Mock implemented for now. Can be connected to a service later.
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "User activity for " + timeframe));
    }

    // 4. Get security events
    @GetMapping("/security-events")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getSecurityEvents() {
        // Mock implemented for now.
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    // 5. Generate audit report
    @PostMapping("/audit-report")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> generateAuditReport(@RequestBody java.util.Map<String, Object> params) {
        // Mock implemented for now.
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Audit report generated"));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createStaffAccount(@Valid @RequestBody RegistrationRequest request) {
        if (request.getRole() == null || request.getRole() == Role.PATIENT) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", "Role must be DOCTOR, NURSE, LAB_TECHNICIAN, or ADMIN"));
        }
        try {
            authService.registerUser(request);
            try {
                emailService.sendStaffWelcome(
                    request.getEmail(),
                    request.getFullName() != null ? request.getFullName() : request.getEmail(),
                    request.getRole().name(),
                    request.getPassword()
                );
            } catch (Exception emailEx) {
                // Account created successfully even if email fails — log and continue
                System.err.println("[AdminController] Failed to send welcome email to " + request.getEmail() + ": " + emailEx.getMessage());
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(java.util.Map.of("message", "Staff account created successfully. A welcome email has been sent to " + request.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }
}