package com.securehealth.backend.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EmailValidatorUtilTest {

    @Test
    public void testValidDomain() {
        // gmail.com definitely has MX records
        assertTrue(EmailValidatorUtil.hasMxRecord("test@gmail.com"), "gmail.com should be valid");
    }

    @Test
    public void testInvalidDomain() {
        // This domain should not have MX or A records
        assertFalse(EmailValidatorUtil.hasMxRecord("test@non-existent-domain-xyz-123.com"), "Invalid domain should be rejected");
    }

    @Test
    public void testNullOrInvalidFormat() {
        assertFalse(EmailValidatorUtil.hasMxRecord(null));
        assertFalse(EmailValidatorUtil.hasMxRecord("invalid-email"));
    }
}
