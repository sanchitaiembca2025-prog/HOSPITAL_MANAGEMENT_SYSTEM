package com.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.entity.*;
import com.hms.enums.*;
import com.hms.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class VisitControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;
    @Autowired PatientRepository patientRepository;
    @Autowired WardCategoryRepository wardCategoryRepository;
    @Autowired VisitRepository visitRepository;
    @Autowired EntityManager em;

    private User clerkUser;
    private User doctorUser;
    private Patient patient;
    private WardCategory ward;
    private String clerkToken;
    private String doctorToken;

    @BeforeEach
    void setUp() {
        clerkUser = createUser("clerk_v", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_v", Role.CLERK, clerkUser.getUserId());

        doctorUser = createUser("doctor_v", "pass", Role.DOCTOR);
        doctorUser.setConsultationFee(500.0);
        userRepository.save(doctorUser);
        doctorToken = bearerToken("doctor_v", Role.DOCTOR, doctorUser.getUserId());

        patient = new Patient();
        patient.setFirstName("Visit");
        patient.setLastName("Patient");
        patient.setPhone("9876543210");
        patient.setGender(Gender.MALE);
        patient.setAge(35);
        patientRepository.save(patient);

        ward = new WardCategory();
        ward.setCategoryName("TEST_WARD");
        ward.setTotalBeds(10);
        ward.setAvailableBeds(10);
        wardCategoryRepository.save(ward);
    }

    @Test
    void createVisit_outpatient_asClerk_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "issue", "Fever",
                "doctorId", doctorUser.getUserId(),
                "patientType", "OUTPATIENT"
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/visits", patient.getPatientId())
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.visitId").isNumber())
                .andExpect(jsonPath("$.status").value("ADMITTED"));
    }

    @Test
    void createVisit_inpatientWithWard_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "issue", "Surgery",
                "doctorId", doctorUser.getUserId(),
                "patientType", "INPATIENT",
                "wardCategoryId", ward.getCategoryId()
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/visits", patient.getPatientId())
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.visitId").isNumber());
    }

    @Test
    void createVisit_inpatientWithoutWard_returns400() throws Exception {
        Map<String, Object> body = Map.of(
                "issue", "Surgery",
                "doctorId", doctorUser.getUserId(),
                "patientType", "INPATIENT"
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/visits", patient.getPatientId())
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createVisit_asDoctor_returns403() throws Exception {
        Map<String, Object> body = Map.of(
                "issue", "Headache",
                "doctorId", doctorUser.getUserId(),
                "patientType", "OUTPATIENT"
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/visits", patient.getPatientId())
                        .header("Authorization", doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void admitVisit_validAdmittedVisit_returns200WithTIPStatus() throws Exception {
        // Create a visit first
        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setDoctor(doctorUser);
        visit.setIssue("Fracture");
        visit.setPatientType(PatientType.OUTPATIENT);
        visit.setStatus(VisitStatus.ADMITTED);
        visitRepository.save(visit);

        mockMvc.perform(patch("/api/v1/visits/{visitId}/admit", visit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TREATMENT_IN_PROGRESS"));
    }

    @Test
    void admitVisit_alreadyInTreatment_returns409() throws Exception {
        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setDoctor(doctorUser);
        visit.setIssue("Cold");
        visit.setPatientType(PatientType.OUTPATIENT);
        visit.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);
        visitRepository.save(visit);

        mockMvc.perform(patch("/api/v1/visits/{visitId}/admit", visit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isConflict());
    }

    @Test
    void getVisit_existingVisit_asClerk_returns200() throws Exception {
        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setDoctor(doctorUser);
        visit.setIssue("Cough");
        visit.setPatientType(PatientType.OUTPATIENT);
        visit.setStatus(VisitStatus.ADMITTED);
        visitRepository.save(visit);

        mockMvc.perform(get("/api/v1/visits/{visitId}", visit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visitId").value(visit.getVisitId()))
                .andExpect(jsonPath("$.status").value("ADMITTED"));
    }

    @Test
    void getVisit_nonExistingId_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/visits/99999")
                        .header("Authorization", clerkToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void createVisit_duplicateActiveVisit_returns400() throws Exception {
        // First visit (active)
        Visit existing = new Visit();
        existing.setPatient(patient);
        existing.setDoctor(doctorUser);
        existing.setIssue("Cold");
        existing.setPatientType(PatientType.OUTPATIENT);
        existing.setStatus(VisitStatus.ADMITTED);
        visitRepository.save(existing);

        // Flush so the visit FK is visible to the next findById call
        em.flush();
        em.clear();

        // Second visit attempt
        Map<String, Object> body = Map.of(
                "issue", "Fever",
                "doctorId", doctorUser.getUserId(),
                "patientType", "OUTPATIENT"
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/visits", patient.getPatientId())
                        .header("Authorization", clerkToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("active visit")));
    }
}
