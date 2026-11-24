package com.hms.service;

import com.hms.dto.request.RegisterPatientRequest;
import com.hms.dto.response.PatientResponse;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.entity.Visit;
import com.hms.enums.Gender;
import com.hms.enums.Role;
import com.hms.enums.VisitStatus;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock PatientRepository patientRepository;

    @InjectMocks PatientService patientService;

    private Patient patient;
    private User doctor;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setUserId(10L);
        doctor.setFullName("Dr. Smith");
        doctor.setRole(Role.DOCTOR);

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setPhone("9999999999");
        patient.setAddress("123 Main St");
        patient.setGender(Gender.MALE);
        patient.setAge(30);
        patient.setVisits(Collections.emptyList());
    }

    @Test
    void registerPatient_savesAndReturnsId() {
        Patient saved = new Patient();
        saved.setPatientId(42L);
        when(patientRepository.save(any(Patient.class))).thenReturn(saved);

        RegisterPatientRequest req = new RegisterPatientRequest(
                "Jane", "Doe", "8888888888", "456 Elm St", Gender.FEMALE, 25);

        Long id = patientService.registerPatient(req);

        assertThat(id).isEqualTo(42L);
        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void listAllPatients_returnsPatientResponseList() {
        when(patientRepository.findAll()).thenReturn(List.of(patient));

        List<PatientResponse> result = patientService.listAllPatients();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).firstName()).isEqualTo("John");
        assertThat(result.get(0).lastName()).isEqualTo("Doe");
        assertThat(result.get(0).visits()).isEmpty();
    }

    @Test
    void listAllPatients_withVisits_includesVisitSummaries() {
        Visit visit = new Visit();
        visit.setVisitId(5L);
        visit.setIssue("Fever");
        visit.setDoctor(doctor);
        visit.setStatus(VisitStatus.ADMITTED);

        patient.setVisits(List.of(visit));
        when(patientRepository.findAll()).thenReturn(List.of(patient));

        List<PatientResponse> result = patientService.listAllPatients();

        assertThat(result.get(0).visits()).hasSize(1);
        assertThat(result.get(0).visits().get(0).visitId()).isEqualTo(5L);
        assertThat(result.get(0).visits().get(0).issue()).isEqualTo("Fever");
    }

    @Test
    void getPatient_existingId_returnsPatientResponse() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        PatientResponse response = patientService.getPatient(1L);

        assertThat(response.patientId()).isEqualTo(1L);
        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.gender()).isEqualTo(Gender.MALE);
    }

    @Test
    void getPatient_nonExistingId_throwsResourceNotFoundException() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientService.getPatient(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
