package com.hms.exception;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.controller.BaseIntegrationTest;
import com.hms.entity.User;
import com.hms.enums.Role;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class GlobalExceptionHandlerTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;
    @Autowired EntityManager em;

    private String clerkToken;

    @BeforeEach
    void setUp() {
        User clerk = createUser("geh_clerk", "pass", Role.CLERK);
        clerkToken = bearerToken("geh_clerk", Role.CLERK, clerk.getUserId());
    }

    // 404 — resource not found
    @Test
    void getPatient_nonExistent_returns404WithErrorBody() throws Exception {
        mockMvc.perform(get("/api/v1/patients/99999")
                        .header("Authorization", clerkToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    // 400 — validation failure (missing required field: firstName)
    @Test
    void registerPatient_missingRequiredField_returns400WithMessage() throws Exception {
        String json = """
                { "lastName": "Smith", "age": 30, "gender": "MALE",
                  "phone": "9876543210", "address": "123 Main St" }
                """;

        mockMvc.perform(post("/api/v1/patients")
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    // 403 — wrong role (CLERK trying ADMIN endpoint)
    @Test
    void adminEndpoint_withClerkToken_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/personnel")
                        .param("role", "DOCTOR")
                        .header("Authorization", clerkToken))
                .andExpect(status().isForbidden());
    }

    // 403 — no token on a protected endpoint
    @Test
    void protectedEndpoint_withNoAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/personnel")
                        .param("role", "DOCTOR"))
                .andExpect(status().isForbidden());
    }

    // 409 — duplicate active visit triggers ConflictException
    @Test
    void createVisit_duplicateActive_returns409() throws Exception {
        User doctor = createUser("geh_doctor", "pass", Role.DOCTOR);

        String patientJson = """
                { "firstName": "Conf", "lastName": "Test", "age": 25,
                  "gender": "MALE", "phone": "9000000009", "address": "1 Test St" }
                """;

        // Extract patientId from JSON body (no Location header on this endpoint)
        String responseBody = mockMvc.perform(post("/api/v1/patients")
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patientJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(responseBody);
        long patientId = json.get("patientId").asLong();

        String visitJson = String.format("""
                { "patientType": "OUTPATIENT", "issue": "Headache", "doctorId": %d }
                """, doctor.getUserId());

        // First visit — created
        mockMvc.perform(post("/api/v1/patients/{id}/visits", patientId)
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(visitJson))
                .andExpect(status().isCreated());

        // Flush so the second request sees the visit in DB
        em.flush();
        em.clear();

        // Second visit — BusinessRuleException (400) since patient already has active visit
        mockMvc.perform(post("/api/v1/patients/{id}/visits", patientId)
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(visitJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
