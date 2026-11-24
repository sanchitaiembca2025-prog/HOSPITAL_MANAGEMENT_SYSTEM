package com.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.entity.*;
import com.hms.enums.*;
import com.hms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
class InvoiceControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired ObjectMapper objectMapper;
    @Autowired PatientRepository patientRepository;
    @Autowired VisitRepository visitRepository;
    @Autowired InvoiceRepository invoiceRepository;

    private User clerkUser;
    private String clerkToken;
    private Visit tipVisit;

    @BeforeEach
    void setUp() {
        clerkUser = createUser("clerk_inv", "pass", Role.CLERK);
        clerkToken = bearerToken("clerk_inv", Role.CLERK, clerkUser.getUserId());

        User docUser = createUser("doctor_inv", "pass", Role.DOCTOR);
        docUser.setConsultationFee(600.0);
        userRepository.save(docUser);

        Patient patient = new Patient();
        patient.setFirstName("Inv");
        patient.setLastName("Patient");
        patient.setPhone("1234567890");
        patient.setGender(Gender.FEMALE);
        patient.setAge(30);
        patientRepository.save(patient);

        tipVisit = new Visit();
        tipVisit.setPatient(patient);
        tipVisit.setDoctor(docUser);
        tipVisit.setIssue("Broken arm");
        tipVisit.setPatientType(PatientType.OUTPATIENT);
        tipVisit.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);
        visitRepository.save(tipVisit);
    }

    @Test
    void generateInvoice_validVisit_returns201WithInvoice() throws Exception {
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.doctorFee").value(600.0))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"));
    }

    @Test
    void generateInvoice_duplicateInvoice_returns409() throws Exception {
        // Generate once
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isCreated());

        // Try again — should conflict
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isConflict());
    }

    @Test
    void getInvoice_afterGeneration_returns200() throws Exception {
        // Generate first
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isCreated());

        // Then get
        mockMvc.perform(get("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").isNumber());
    }

    @Test
    void getInvoice_noInvoice_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirmPayment_validPendingInvoice_returns200WithPaid() throws Exception {
        // Generate invoice first
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isCreated());

        // Confirm payment
        mockMvc.perform(patch("/api/v1/visits/{visitId}/invoice/pay", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"))
                .andExpect(jsonPath("$.status").value("DISCHARGED"));
    }

    @Test
    void confirmPayment_doublePayment_returns409() throws Exception {
        // Generate and pay
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken));
        mockMvc.perform(patch("/api/v1/visits/{visitId}/invoice/pay", tipVisit.getVisitId())
                        .header("Authorization", clerkToken));

        // Pay again — conflict
        mockMvc.perform(patch("/api/v1/visits/{visitId}/invoice/pay", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isConflict());
    }

    @Test
    void invoiceEndpoints_withoutAuth_return403() throws Exception {
        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void generateInvoice_forAdmittedVisit_returns400() throws Exception {
        tipVisit.setStatus(VisitStatus.ADMITTED);
        visitRepository.save(tipVisit);

        mockMvc.perform(post("/api/v1/visits/{visitId}/invoice", tipVisit.getVisitId())
                        .header("Authorization", clerkToken))
                .andExpect(status().isBadRequest());
    }
}
