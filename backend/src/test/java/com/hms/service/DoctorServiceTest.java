package com.hms.service;

import com.hms.config.FileStorageConfig;
import com.hms.dto.request.UpdateDoctorProfileRequest;
import com.hms.dto.response.DoctorProfileResponse;
import com.hms.dto.response.PatientResponse;
import com.hms.entity.*;
import com.hms.enums.PatientType;
import com.hms.enums.Role;
import com.hms.enums.VisitStatus;
import com.hms.exception.BusinessRuleException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock UserRepository userRepository;
    @Mock PatientRepository patientRepository;
    @Mock VisitRepository visitRepository;
    @Mock VisitStatusLogRepository visitStatusLogRepository;
    @Mock WardCategoryRepository wardCategoryRepository;
    @Mock FileStorageConfig fileStorageConfig;

    @InjectMocks DoctorService doctorService;

    private User doctor;
    private Patient patient;
    private Visit activeVisit;
    private MedicalSection section;

    @BeforeEach
    void setUp() {
        section = new MedicalSection();
        section.setSectionId(1L);
        section.setSectionName("Cardiology");

        doctor = new User();
        doctor.setUserId(10L);
        doctor.setFullName("Dr. Jane");
        doctor.setUsername("drjane");
        doctor.setRole(Role.DOCTOR);
        doctor.setConsultationFee(600.0);
        doctor.setPhone("9876543210");
        doctor.setEmail("jane@hms.com");
        doctor.setSection(section);

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setFirstName("Alice");
        patient.setLastName("Brown");

        activeVisit = new Visit();
        activeVisit.setVisitId(3L);
        activeVisit.setDoctor(doctor);
        activeVisit.setPatient(patient);
        activeVisit.setIssue("Heart pain");
        activeVisit.setPatientType(PatientType.INPATIENT);
        activeVisit.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);

        patient.setVisits(List.of(activeVisit));
    }

    // ── getProfile ───────────────────────────────────────────────────────────

    @Test
    void getProfile_existingDoctor_returnsDoctorProfileResponse() {
        when(userRepository.findByUsername("drjane")).thenReturn(Optional.of(doctor));

        DoctorProfileResponse response = doctorService.getProfile("drjane");

        assertThat(response.userId()).isEqualTo(10L);
        assertThat(response.fullName()).isEqualTo("Dr. Jane");
        assertThat(response.consultationFee()).isEqualTo(600.0);
        assertThat(response.sectionName()).isEqualTo("Cardiology");
    }

    @Test
    void getProfile_notFound_throwsResourceNotFoundException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> doctorService.getProfile("ghost"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ghost");
    }

    // ── updateProfile ─────────────────────────────────────────────────────────

    @Test
    void updateProfile_updatesPhoneEmailAndFee() {
        when(userRepository.findByUsername("drjane")).thenReturn(Optional.of(doctor));

        UpdateDoctorProfileRequest req = new UpdateDoctorProfileRequest("1234567890", "newemail@hms.com", 750.0);
        DoctorProfileResponse response = doctorService.updateProfile("drjane", req);

        assertThat(response.consultationFee()).isEqualTo(750.0);
        assertThat(doctor.getPhone()).isEqualTo("1234567890");
        assertThat(doctor.getEmail()).isEqualTo("newemail@hms.com");
    }

    @Test
    void updateProfile_nullFields_doesNotOverwrite() {
        when(userRepository.findByUsername("drjane")).thenReturn(Optional.of(doctor));

        UpdateDoctorProfileRequest req = new UpdateDoctorProfileRequest(null, null, null);
        DoctorProfileResponse response = doctorService.updateProfile("drjane", req);

        assertThat(response.consultationFee()).isEqualTo(600.0);
        assertThat(doctor.getPhone()).isEqualTo("9876543210");
    }

    // ── searchPatient ─────────────────────────────────────────────────────────

    @Test
    void searchPatient_doctorHasActiveVisit_returnsPatientResponse() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        PatientResponse response = doctorService.searchPatient(1L, "drjane");

        assertThat(response.patientId()).isEqualTo(1L);
        assertThat(response.firstName()).isEqualTo("Alice");
        assertThat(response.visits()).hasSize(1);
        assertThat(response.visits().get(0).visitId()).isEqualTo(3L);
    }

    @Test
    void searchPatient_noActiveVisitForThisDoctor_throwsBusinessRuleException() {
        activeVisit.getDoctor().setUsername("otherdoctor");
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        assertThatThrownBy(() -> doctorService.searchPatient(1L, "drjane"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("No active treatment visit");
    }

    @Test
    void searchPatient_patientNotFound_throwsResourceNotFoundException() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> doctorService.searchPatient(99L, "drjane"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── uploadPrescription ────────────────────────────────────────────────────

    @Test
    void uploadPrescription_activeVisit_setsPathAndReturnsTimestamp() throws Exception {
        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));
        when(fileStorageConfig.store(any(MultipartFile.class), eq("prescriptions")))
                .thenReturn("/prescriptions/uuid.pdf");

        MultipartFile file = mock(MultipartFile.class);
        var uploadedAt = doctorService.uploadPrescription(3L, "drjane", file);

        assertThat(uploadedAt).isNotNull();
        assertThat(activeVisit.getPrescriptionPath()).isEqualTo("/prescriptions/uuid.pdf");
    }

    @Test
    void uploadPrescription_visitNotInProgress_throwsBusinessRuleException() throws Exception {
        activeVisit.setStatus(VisitStatus.ADMITTED);
        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));

        MultipartFile file = mock(MultipartFile.class);

        assertThatThrownBy(() -> doctorService.uploadPrescription(3L, "drjane", file))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("active visits");
    }

    // ── markDeceased ─────────────────────────────────────────────────────────

    @Test
    void markDeceased_activeVisit_setsStatusDeceasedAndReleaseBed() throws Exception {
        WardCategory ward = new WardCategory();
        ward.setCategoryId(1L);
        ward.setCategoryName("ICU");
        ward.setTotalBeds(5);
        ward.setAvailableBeds(2);
        activeVisit.setWardCategory(ward);

        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));
        when(userRepository.findByUsername("drjane")).thenReturn(Optional.of(doctor));
        when(fileStorageConfig.store(any(), eq("postmortem"))).thenReturn("/postmortem/uuid.pdf");
        when(wardCategoryRepository.findByIdWithLock(1L)).thenReturn(Optional.of(ward));
        when(visitStatusLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MultipartFile file = mock(MultipartFile.class);
        doctorService.markDeceased(3L, "drjane", "Heart failure", "10:30:00", "2026-11-24", file);

        assertThat(activeVisit.getStatus()).isEqualTo(VisitStatus.DECEASED);
        assertThat(activeVisit.getCauseOfDeath()).isEqualTo("Heart failure");
        assertThat(ward.getAvailableBeds()).isEqualTo(3);
        verify(visitStatusLogRepository).save(any(VisitStatusLog.class));
    }

    @Test
    void markDeceased_visitNotInProgress_throwsBusinessRuleException() throws Exception {
        activeVisit.setStatus(VisitStatus.ADMITTED);
        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));

        MultipartFile file = mock(MultipartFile.class);

        assertThatThrownBy(() -> doctorService.markDeceased(3L, "drjane", "cause", "10:00:00", "2026-11-24", file))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("TREATMENT_IN_PROGRESS");
    }
}
