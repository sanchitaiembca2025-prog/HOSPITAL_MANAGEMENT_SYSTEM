package com.hms.controller;

import com.hms.entity.User;
import com.hms.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class LookupControllerIntegrationTest extends BaseIntegrationTest {

    private String clerkToken;
    private String labToken;
    private String doctorToken;

    @BeforeEach
    void setUp() {
        User clerk = createUser("clerk_lkp", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_lkp", Role.CLERK, clerk.getUserId());

        User lab = createUser("lab_lkp", "pass", Role.LAB);
        labToken = bearerToken("lab_lkp", Role.LAB, lab.getUserId());

        User doc = createUser("doc_lkp", "pass", Role.DOCTOR);
        doctorToken = bearerToken("doc_lkp", Role.DOCTOR, doc.getUserId());
    }

    @Test
    void getMedicalSections_noAuth_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/medical-sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getDoctors_asClerk_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/doctors")
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getDoctors_withSectionId_asClerk_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/doctors")
                        .param("sectionId", "1")
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getDoctors_asDoctor_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/doctors")
                        .header("Authorization", doctorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getWards_asClerk_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/wards")
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getWards_asDoctor_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/wards")
                        .header("Authorization", doctorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCatalogueTests_asLab_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/catalogue/tests")
                        .header("Authorization", labToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getCatalogueTests_asClerk_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/catalogue/tests")
                        .header("Authorization", clerkToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCatalogueEquipment_asLab_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/catalogue/equipment")
                        .header("Authorization", labToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getCatalogueResources_asLab_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/catalogue/resources")
                        .header("Authorization", labToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
