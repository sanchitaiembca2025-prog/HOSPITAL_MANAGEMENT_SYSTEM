package com.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.entity.User;
import com.hms.enums.Gender;
import com.hms.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class PatientControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;

    private User clerkUser;
    private String clerkToken;
    private String doctorToken;

    @BeforeEach
    void setUp() {
        clerkUser = createUser("clerk_pt", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_pt", Role.CLERK, clerkUser.getUserId());

        User docUser = createUser("doctor_pt", "pass", Role.DOCTOR);
        doctorToken = bearerToken("doctor_pt", Role.DOCTOR, docUser.getUserId());
    }

    @Test
    void registerPatient_asClerk_returns201WithPatientId() throws Exception {
        Map<String, Object> body = Map.of(
                "firstName", "Alice",
                "lastName", "Wonder",
                "phone", "9876543210",
                "address", "12 Elm St",
                "gender", "FEMALE",
                "age", 28
        );

        mockMvc.perform(post("/api/v1/patients")
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.patientId").isNumber())
                .andExpect(jsonPath("$.message").value("Patient registered successfully"));
    }

    @Test
    void registerPatient_asDoctor_returns403() throws Exception {
        Map<String, Object> body = Map.of(
                "firstName", "Bob", "lastName", "Test",
                "phone", "1234567890", "gender", "MALE", "age", 40);

        mockMvc.perform(post("/api/v1/patients")
                        .header("Authorization", doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void registerPatient_missingRequiredField_returns400() throws Exception {
        // Missing lastName, phone, gender, age
        Map<String, Object> body = Map.of("firstName", "OnlyFirst");

        mockMvc.perform(post("/api/v1/patients")
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerPatient_noAuth_returns403() throws Exception {
        Map<String, Object> body = Map.of(
                "firstName", "Alice", "lastName", "X",
                "phone", "1234567890", "gender", "FEMALE", "age", 25);

        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listPatients_asClerk_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/patients")
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void listPatients_asDoctor_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/patients")
                        .header("Authorization", doctorToken))
                .andExpect(status().isOk());
    }

    @Test
    void getPatient_nonExistingId_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/patients/99999")
                        .header("Authorization", clerkToken))
                .andExpect(status().isNotFound());
    }
}
