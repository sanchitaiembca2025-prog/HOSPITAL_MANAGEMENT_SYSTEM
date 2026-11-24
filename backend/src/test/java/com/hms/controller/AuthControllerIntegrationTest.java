package com.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.dto.request.LoginRequest;
import com.hms.entity.User;
import com.hms.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class AuthControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        createUser("testadmin", "admin123", Role.ADMIN);
    }

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        LoginRequest req = new LoginRequest("testadmin", "admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.name").value("Test ADMIN"));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        LoginRequest req = new LoginRequest("testadmin", "wrongpass");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_unknownUser_returns401() throws Exception {
        LoginRequest req = new LoginRequest("nobody", "pass");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_missingUsername_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"pass\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_authenticatedUser_returns200WithMessage() throws Exception {
        User user = createUser("logoutuser", "pass", Role.CLERK);
        String token = bearerToken("logoutuser", Role.CLERK, user.getUserId());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    void login_deactivatedUser_returns401() throws Exception {
        User inactive = new User();
        inactive.setFullName("Inactive User");
        inactive.setUsername("inactive");
        inactive.setPasswordHash(passwordEncoder.encode("pass123"));
        inactive.setRole(Role.CLERK);
        inactive.setIsActive(false);
        userRepository.save(inactive);

        LoginRequest req = new LoginRequest("inactive", "pass123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }
}
