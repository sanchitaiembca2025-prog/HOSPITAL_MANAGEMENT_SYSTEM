package com.hms.controller;

import com.hms.entity.User;
import com.hms.enums.Role;
import com.hms.repository.UserRepository;
import com.hms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Shared base for integration tests that need JWT-authenticated requests.
 * Subclasses annotate with @Transactional so H2 rolls back after each test.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected UserRepository userRepository;
    @Autowired protected PasswordEncoder passwordEncoder;
    @Autowired protected JwtUtil jwtUtil;

    protected String bearerToken(String username, Role role, Long userId) {
        return "Bearer " + jwtUtil.generateToken(username, role.name(), userId);
    }

    protected User createUser(String username, String password, Role role) {
        User user = new User();
        user.setFullName("Test " + role.name());
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setIsActive(true);
        return userRepository.save(user);
    }
}
