package com.securehealth.backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EncryptionUtilTest {

    @Test
    void encryptAndDecryptRoundTrip() {
        EncryptionUtil util = new EncryptionUtil();
        ReflectionTestUtils.setField(util, "encryptionKeyString", "0123456789abcdef0123456789abcdef");
        String plaintext = "Sensitive data";
        String encrypted = util.encrypt(plaintext);
        assertNotNull(encrypted);
        assertNotEquals(plaintext, encrypted);
        String decrypted = util.decrypt(encrypted);
        assertEquals(plaintext, decrypted);
    }

    @Test
    void emptyValuesReturnAsIs() {
        EncryptionUtil util = new EncryptionUtil();
        ReflectionTestUtils.setField(util, "encryptionKeyString", "0123456789abcdef0123456789abcdef");
        assertEquals("", util.encrypt(""));
        assertEquals("", util.decrypt(""));
    }
}
