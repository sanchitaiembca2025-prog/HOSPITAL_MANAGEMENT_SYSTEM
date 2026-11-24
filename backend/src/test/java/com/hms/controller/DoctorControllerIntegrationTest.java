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
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class DoctorControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;
    @Autowired PatientRepository patientRepository;
    @Autowired VisitRepository visitRepository;
    @Autowired EntityManager em;

    private User doctor;
    private String doctorToken;
    private String clerkToken;

    @BeforeEach
    void setUp() {
        doctor = createUser("doc_ctrl", "pass", Role.DOCTOR);
        doctorToken = bearerToken("doc_ctrl", Role.DOCTOR, doctor.getUserId());

        User clerk = createUser("clerk_ctrl", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_ctrl", Role.CLERK, clerk.getUserId());
    }

    @Test
    void getProfile_asDoctor_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/doctor/profile")
                        .header("Authorization", doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("doc_ctrl"));
    }

    @Test
    void getProfile_asClerk_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/doctor/profile")
                        .header("Authorization", clerkToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateProfile_asDoctor_returns200() throws Exception {
        Map<String, Object> body = Map.of(
                "phone", "9876543210",
                "email", "doc@hospital.com",
                "consultationFee", 500.0
        );

        mockMvc.perform(put("/api/v1/doctor/profile")
                        .header("Authorization", doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("9876543210"));
    }

    @Test
    void searchPatient_withActiveVisit_returns200() throws Exception {
        Patient patient = registerPatient("Search", "Patient", "9100000001");
        createActiveVisit(patient, doctor);
        // Flush so patient.visits lazy collection is visible when re-fetched
        em.flush();
        em.clear();

        mockMvc.perform(get("/api/v1/doctor/patients/{id}", patient.getPatientId())
                        .header("Authorization", doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Search"));
    }

    @Test
    void searchPatient_noActiveVisit_returns400() throws Exception {
        Patient patient = registerPatient("No", "Visit", "9100000002");
        em.flush();
        em.clear();

        // No TIP visit assigned to this doctor → BusinessRuleException → 400
        mockMvc.perform(get("/api/v1/doctor/patients/{id}", patient.getPatientId())
                        .header("Authorization", doctorToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadPrescription_asDoctor_returns200() throws Exception {
        Patient patient = registerPatient("Rx", "Patient", "9100000003");
        Visit visit = createActiveVisit(patient, doctor);
        em.flush();
        em.clear();

        MockMultipartFile pdf = new MockMultipartFile(
                "file", "rx.pdf", "application/pdf", new byte[512]);

        mockMvc.perform(multipart("/api/v1/visits/{id}/prescription", visit.getVisitId())
                        .file(pdf)
                        .header("Authorization", doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Prescription uploaded"));
    }

    @Test
    void uploadPrescription_asClerk_returns403() throws Exception {
        MockMultipartFile pdf = new MockMultipartFile(
                "file", "rx.pdf", "application/pdf", new byte[512]);

        mockMvc.perform(multipart("/api/v1/visits/1/prescription")
                        .file(pdf)
                        .header("Authorization", clerkToken))
                .andExpect(status().isForbidden());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Patient registerPatient(String first, String last, String phone) {
        Patient p = new Patient();
        p.setFirstName(first);
        p.setLastName(last);
        p.setAge(30);
        p.setGender(Gender.MALE);
        p.setPhone(phone);
        p.setAddress("1 Test St");
        p.setRegisteredAt(LocalDateTime.now());
        return patientRepository.save(p);
    }

    private Visit createActiveVisit(Patient patient, User doctor) {
        Visit v = new Visit();
        v.setPatient(patient);
        v.setDoctor(doctor);
        v.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);
        v.setPatientType(PatientType.OUTPATIENT);
        v.setIssue("Test issue");
        v.setEntryTime(LocalDateTime.now());
        return visitRepository.save(v);
    }
}
