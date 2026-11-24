package com.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.entity.User;
import com.hms.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class AdminControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;

    private String adminToken;
    private String clerkToken;

    @BeforeEach
    void setUp() {
        User admin = createUser("admin_it", "pass", Role.ADMIN);
        adminToken = bearerToken("admin_it", Role.ADMIN, admin.getUserId());

        User clerk = createUser("clerk_it", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_it", Role.CLERK, clerk.getUserId());
    }

    // ── Personnel ─────────────────────────────────────────────────────────────

    @Test
    void createUser_asAdmin_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "fullName", "New Clerk",
                "username", "newclerk1",
                "password", "pass123",
                "role", "CLERK"
        );

        mockMvc.perform(post("/api/v1/admin/personnel")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newclerk1"));
    }

    @Test
    void createUser_asClerk_returns403() throws Exception {
        Map<String, Object> body = Map.of(
                "fullName", "X", "username", "xuser", "password", "pass123", "role", "CLERK");

        mockMvc.perform(post("/api/v1/admin/personnel")
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listPersonnel_asAdmin_returns200WithArray() throws Exception {
        createUser("doc_list", "pass", Role.DOCTOR);

        mockMvc.perform(get("/api/v1/admin/personnel")
                        .param("role", "DOCTOR")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getPersonnel_existingId_returns200() throws Exception {
        User doc = createUser("doc_get", "pass", Role.DOCTOR);

        mockMvc.perform(get("/api/v1/admin/personnel/{id}", doc.getUserId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("doc_get"));
    }

    @Test
    void updatePersonnel_asAdmin_returns200() throws Exception {
        User target = createUser("doc_upd", "pass", Role.DOCTOR);
        Map<String, Object> body = Map.of("fullName", "Updated Name");

        mockMvc.perform(put("/api/v1/admin/personnel/{id}", target.getUserId())
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"));
    }

    @Test
    void setPersonnelStatus_asAdmin_returns200() throws Exception {
        User target = createUser("doc_status", "pass", Role.DOCTOR);
        Map<String, Object> body = Map.of("isActive", false);

        mockMvc.perform(patch("/api/v1/admin/personnel/{id}/status", target.getUserId())
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    // ── Catalogue: Tests ──────────────────────────────────────────────────────

    @Test
    void addTest_asAdmin_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "testName", "Blood Panel", "cost", BigDecimal.valueOf(200), "isAvailable", true);

        mockMvc.perform(post("/api/v1/admin/catalogue/tests")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.testName").value("Blood Panel"));
    }

    @Test
    void listTests_asAdmin_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/catalogue/tests")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ── Catalogue: Equipment ──────────────────────────────────────────────────

    @Test
    void addEquipment_asAdmin_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "equipmentName", "X-Ray Machine", "cost", BigDecimal.valueOf(1000), "isActive", true);

        mockMvc.perform(post("/api/v1/admin/catalogue/equipment")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipmentName").value("X-Ray Machine"));
    }

    @Test
    void listEquipment_asAdmin_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/catalogue/equipment")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ── Catalogue: Resources ──────────────────────────────────────────────────

    @Test
    void addResource_asAdmin_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "resourceName", "Bandages", "costPerUnit", BigDecimal.valueOf(5), "isActive", true);

        mockMvc.perform(post("/api/v1/admin/catalogue/resources")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resourceName").value("Bandages"));
    }

    @Test
    void listResources_asAdmin_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/catalogue/resources")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ── Wards ─────────────────────────────────────────────────────────────────

    @Test
    void listWards_asAdmin_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/wards")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ── Seminars ──────────────────────────────────────────────────────────────

    @Test
    void addSeminar_asAdmin_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "seminarName", "Cardiology Update",
                "seminarDate", "2027-01-15",
                "durationHours", 2.0,
                "hallNumber", "H1"
        );

        mockMvc.perform(post("/api/v1/admin/seminars")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.seminarName").value("Cardiology Update"));
    }

    @Test
    void listSeminars_asAdmin_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/seminars")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
