package com.securehealth.backend.util;

import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

/**
 * Utility class for validating email addresses beyond simple regex.
 */
public class EmailValidatorUtil {

    /**
     * Checks if the domain of an email address has a valid Mail Exchange (MX) record.
     * This helps verify that the email address is not from a non-existent or fake domain.
     *
     * @param email The email address to validate.
     * @return true if the domain has at least one MX record, false otherwise.
     */
    public static boolean hasMxRecord(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.lastIndexOf("@") + 1);

        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ictx = new InitialDirContext(env);
            
            // Perform DNS lookup for MX records
            Attributes attrs = ictx.getAttributes(domain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");

            // If no MX records found, check for A records (fallback for some simple mail servers)
            if (attr == null || attr.size() == 0) {
                attrs = ictx.getAttributes(domain, new String[]{"A"});
                attr = attrs.get("A");
            }

            return attr != null && attr.size() > 0;
        } catch (Exception e) {
            // DNS lookup failed or domain doesn't exist
            return false;
        }
    }
}
