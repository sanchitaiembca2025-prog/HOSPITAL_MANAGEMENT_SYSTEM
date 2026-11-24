package com.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.entity.Visit;
import com.hms.enums.Gender;
import com.hms.enums.PatientType;
import com.hms.enums.Role;
import com.hms.enums.VisitStatus;
import com.hms.repository.PatientRepository;
import com.hms.repository.VisitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class LabControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;
    @Autowired PatientRepository patientRepository;
    @Autowired VisitRepository visitRepository;

    private User labUser;
    private User doctor;
    private String labToken;
    private String clerkToken;

    @BeforeEach
    void setUp() {
        labUser = createUser("lab_ctrl", "pass", Role.LAB);
        labToken = bearerToken("lab_ctrl", Role.LAB, labUser.getUserId());

        doctor = createUser("doc_lab_ctrl", "pass", Role.DOCTOR);

        User clerk = createUser("clerk_lab_ctrl", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_lab_ctrl", Role.CLERK, clerk.getUserId());
    }

    @Test
    void searchPatient_asLab_withActiveVisit_returns200() throws Exception {
        Patient patient = registerPatient();
        createVisitInProgress(patient, doctor);

        mockMvc.perform(get("/api/v1/lab/patients/{id}", patient.getPatientId())
                        .header("Authorization", labToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").isString())
                .andExpect(jsonPath("$.canProceed").isBoolean());
    }

    @Test
    void searchPatient_asClerk_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/lab/patients/1")
                        .header("Authorization", clerkToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void saveLabCosts_asLab_returns200() throws Exception {
        Patient patient = registerPatient();
        Visit visit = createVisitInProgress(patient, doctor);

        Map<String, Object> body = Map.of(
                "tests", List.of(),
                "equipment", List.of(),
                "resources", List.of()
        );

        mockMvc.perform(post("/api/v1/visits/{id}/costs", visit.getVisitId())
                        .header("Authorization", labToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Lab costs saved"));
    }

    @Test
    void saveLabCosts_asClerk_returns403() throws Exception {
        Map<String, Object> body = Map.of("tests", List.of(), "equipment", List.of(), "resources", List.of());

        mockMvc.perform(post("/api/v1/visits/1/costs")
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void uploadTestResult_asLab_returns200() throws Exception {
        Patient patient = registerPatient();
        Visit visit = createVisitInProgress(patient, doctor);

        MockMultipartFile pdf = new MockMultipartFile(
                "file", "result.pdf", "application/pdf", new byte[512]);

        mockMvc.perform(multipart("/api/v1/visits/{id}/test-result", visit.getVisitId())
                        .file(pdf)
                        .header("Authorization", labToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Test result uploaded"));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Patient registerPatient() {
        Patient p = new Patient();
        p.setFirstName("Lab");
        p.setLastName("Patient");
        p.setAge(40);
        p.setGender(Gender.FEMALE);
        p.setPhone("9100000001");
        p.setAddress("2 Test Ave");
        p.setRegisteredAt(LocalDateTime.now());
        return patientRepository.save(p);
    }

    private Visit createVisitInProgress(Patient patient, User doctor) {
        Visit v = new Visit();
        v.setPatient(patient);
        v.setDoctor(doctor);
        v.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);
        v.setPatientType(PatientType.OUTPATIENT);
        v.setIssue("Lab test needed");
        v.setEntryTime(LocalDateTime.now());
        return visitRepository.save(v);
    }
}
