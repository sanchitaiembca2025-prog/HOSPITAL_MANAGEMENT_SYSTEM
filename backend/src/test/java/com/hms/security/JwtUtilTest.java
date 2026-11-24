package com.hms.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    // 32+ UTF-8 bytes for HMAC-SHA256
    private static final String SECRET =
            "dGVzdFNlY3JldEtleUZvckpXVFRlc3RpbmdQdXJwb3Nlc09ubHkxMjM0NTY=";
    private static final long EXPIRATION_MS = 3_600_000L; // 1 hour

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION_MS);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken("admin", "ADMIN", 1L);
        assertThat(token).isNotBlank();
    }

    @Test
    void extractUsername_returnsCorrectSubject() {
        String token = jwtUtil.generateToken("doctor1", "DOCTOR", 10L);
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("doctor1");
    }

    @Test
    void extractAllClaims_roleClaimIsCorrect() {
        String token = jwtUtil.generateToken("clerk1", "CLERK", 20L);
        String role = jwtUtil.extractAllClaims(token).get("role", String.class);
        assertThat(role).isEqualTo("CLERK");
    }

    @Test
    void extractAllClaims_userIdClaimIsCorrect() {
        String token = jwtUtil.generateToken("lab1", "LAB", 30L);
        Long userId = jwtUtil.extractAllClaims(token).get("userId", Long.class);
        assertThat(userId).isEqualTo(30L);
    }

    @Test
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtUtil.generateToken("admin", "ADMIN", 1L);
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_tamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken("admin", "ADMIN", 1L);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtUtil.isTokenValid(tampered)).isFalse();
    }

    @Test
    void isTokenValid_emptyString_returnsFalse() {
        assertThat(jwtUtil.isTokenValid("")).isFalse();
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() {
        JwtUtil shortLivedUtil = new JwtUtil(SECRET, 1L); // 1 ms expiry
        String token = shortLivedUtil.generateToken("user", "DOCTOR", 1L);
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}
        assertThat(shortLivedUtil.isTokenValid(token)).isFalse();
    }

    @Test
    void generateToken_differentUsers_producesDifferentTokens() {
        String t1 = jwtUtil.generateToken("user1", "DOCTOR", 1L);
        String t2 = jwtUtil.generateToken("user2", "DOCTOR", 2L);
        assertThat(t1).isNotEqualTo(t2);
    }
}
