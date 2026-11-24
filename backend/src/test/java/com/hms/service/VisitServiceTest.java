package com.hms.service;

import com.hms.dto.request.CreateVisitRequest;
import com.hms.dto.response.VisitResponse;
import com.hms.entity.*;
import com.hms.enums.PatientType;
import com.hms.enums.Role;
import com.hms.enums.VisitStatus;
import com.hms.exception.BusinessRuleException;
import com.hms.exception.ConflictException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitServiceTest {

    @Mock VisitRepository visitRepository;
    @Mock PatientRepository patientRepository;
    @Mock UserRepository userRepository;
    @Mock WardCategoryRepository wardCategoryRepository;
    @Mock VisitStatusLogRepository visitStatusLogRepository;
    @Mock InvoiceRepository invoiceRepository;

    @InjectMocks VisitService visitService;

    private Patient patient;
    private User doctor;
    private User clerk;
    private WardCategory ward;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setUserId(10L);
        doctor.setFullName("Dr. Smith");
        doctor.setRole(Role.DOCTOR);
        doctor.setConsultationFee(500.0);

        clerk = new User();
        clerk.setUserId(20L);
        clerk.setFullName("Clerk Bob");
        clerk.setRole(Role.CLERK);

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setVisits(new ArrayList<>());

        ward = new WardCategory();
        ward.setCategoryId(1L);
        ward.setCategoryName("GENERAL");
        ward.setTotalBeds(20);
        ward.setAvailableBeds(10);
    }

    // ── createVisit ──────────────────────────────────────────────────────────

    @Test
    void createVisit_outpatient_savesVisitWithAdmittedStatus() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(userRepository.findById(10L)).thenReturn(Optional.of(doctor));
        Visit saved = new Visit();
        saved.setVisitId(99L);
        saved.setPatient(patient);
        saved.setDoctor(doctor);
        saved.setPatientType(PatientType.OUTPATIENT);
        saved.setStatus(VisitStatus.ADMITTED);
        when(visitRepository.save(any())).thenReturn(saved);

        CreateVisitRequest req = new CreateVisitRequest("Headache", 10L, PatientType.OUTPATIENT, null);
        Long visitId = visitService.createVisit(1L, req);

        assertThat(visitId).isEqualTo(99L);
        verify(visitRepository).save(any(Visit.class));
    }

    @Test
    void createVisit_inpatientWithWard_setsWardCategory() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(userRepository.findById(10L)).thenReturn(Optional.of(doctor));
        when(wardCategoryRepository.findById(1L)).thenReturn(Optional.of(ward));
        Visit saved = new Visit();
        saved.setVisitId(5L);
        saved.setPatient(patient);
        saved.setDoctor(doctor);
        saved.setPatientType(PatientType.INPATIENT);
        saved.setStatus(VisitStatus.ADMITTED);
        saved.setWardCategory(ward);
        when(visitRepository.save(any())).thenReturn(saved);

        CreateVisitRequest req = new CreateVisitRequest("Surgery", 10L, PatientType.INPATIENT, 1L);
        Long visitId = visitService.createVisit(1L, req);

        assertThat(visitId).isEqualTo(5L);
    }

    @Test
    void createVisit_inpatientWithoutWardId_throwsBusinessRuleException() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(userRepository.findById(10L)).thenReturn(Optional.of(doctor));

        CreateVisitRequest req = new CreateVisitRequest("Surgery", 10L, PatientType.INPATIENT, null);

        assertThatThrownBy(() -> visitService.createVisit(1L, req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Ward category is required");
    }

    @Test
    void createVisit_patientHasDeceasedVisit_throwsBusinessRuleException() {
        Visit deceasedVisit = new Visit();
        deceasedVisit.setStatus(VisitStatus.DECEASED);
        patient.setVisits(List.of(deceasedVisit));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        CreateVisitRequest req = new CreateVisitRequest("Cold", 10L, PatientType.OUTPATIENT, null);

        assertThatThrownBy(() -> visitService.createVisit(1L, req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("deceased");
    }

    @Test
    void createVisit_patientHasActiveVisit_throwsBusinessRuleException() {
        Visit activeVisit = new Visit();
        activeVisit.setStatus(VisitStatus.ADMITTED);
        patient.setVisits(List.of(activeVisit));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        CreateVisitRequest req = new CreateVisitRequest("Cold", 10L, PatientType.OUTPATIENT, null);

        assertThatThrownBy(() -> visitService.createVisit(1L, req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("active visit");
    }

    @Test
    void createVisit_patientNotFound_throwsResourceNotFoundException() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        CreateVisitRequest req = new CreateVisitRequest("Cold", 10L, PatientType.OUTPATIENT, null);

        assertThatThrownBy(() -> visitService.createVisit(99L, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── admitVisit ───────────────────────────────────────────────────────────

    @Test
    void admitVisit_validAdmittedVisit_transitionToTreatmentInProgress() {
        Visit visit = buildVisitWithStatus(VisitStatus.ADMITTED);
        visit.setPatientType(PatientType.OUTPATIENT);
        when(visitRepository.findById(1L)).thenReturn(Optional.of(visit));
        when(userRepository.findById(20L)).thenReturn(Optional.of(clerk));
        when(visitStatusLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VisitResponse response = visitService.admitVisit(1L, 20L);

        assertThat(response.status()).isEqualTo(VisitStatus.TREATMENT_IN_PROGRESS);
        verify(visitStatusLogRepository).save(any(VisitStatusLog.class));
    }

    @Test
    void admitVisit_inpatientWithBeds_decrementsBedCount() {
        Visit visit = buildVisitWithStatus(VisitStatus.ADMITTED);
        visit.setPatientType(PatientType.INPATIENT);
        visit.setWardCategory(ward);
        when(visitRepository.findById(1L)).thenReturn(Optional.of(visit));
        when(userRepository.findById(20L)).thenReturn(Optional.of(clerk));
        when(wardCategoryRepository.findByIdWithLock(1L)).thenReturn(Optional.of(ward));
        when(visitStatusLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        visitService.admitVisit(1L, 20L);

        assertThat(ward.getAvailableBeds()).isEqualTo(9);
    }

    @Test
    void admitVisit_inpatientNoBeds_throwsBusinessRuleException() {
        ward.setAvailableBeds(0);
        Visit visit = buildVisitWithStatus(VisitStatus.ADMITTED);
        visit.setPatientType(PatientType.INPATIENT);
        visit.setWardCategory(ward);
        when(visitRepository.findById(1L)).thenReturn(Optional.of(visit));
        when(userRepository.findById(20L)).thenReturn(Optional.of(clerk));
        when(wardCategoryRepository.findByIdWithLock(1L)).thenReturn(Optional.of(ward));

        assertThatThrownBy(() -> visitService.admitVisit(1L, 20L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("No beds available");
    }

    @Test
    void admitVisit_visitNotInAdmittedState_throwsConflictException() {
        Visit visit = buildVisitWithStatus(VisitStatus.TREATMENT_IN_PROGRESS);
        when(visitRepository.findById(1L)).thenReturn(Optional.of(visit));

        assertThatThrownBy(() -> visitService.admitVisit(1L, 20L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("ADMITTED");
    }

    // ── getVisit ─────────────────────────────────────────────────────────────

    @Test
    void getVisit_existingVisit_returnsVisitResponse() {
        Visit visit = buildVisitWithStatus(VisitStatus.ADMITTED);
        when(visitRepository.findById(1L)).thenReturn(Optional.of(visit));

        VisitResponse response = visitService.getVisit(1L);

        assertThat(response.visitId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo(VisitStatus.ADMITTED);
    }

    @Test
    void getVisit_nonExistingVisit_throwsResourceNotFoundException() {
        when(visitRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> visitService.getVisit(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Visit buildVisitWithStatus(VisitStatus status) {
        Visit visit = new Visit();
        visit.setVisitId(1L);
        visit.setPatient(patient);
        visit.setDoctor(doctor);
        visit.setIssue("Fever");
        visit.setPatientType(PatientType.OUTPATIENT);
        visit.setStatus(status);
        return visit;
    }
}
