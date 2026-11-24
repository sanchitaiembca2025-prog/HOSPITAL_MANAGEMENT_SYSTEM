package com.hms.service;

import com.hms.config.FileStorageConfig;
import com.hms.dto.request.SaveLabCostsRequest;
import com.hms.dto.response.LabPatientResponse;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LabServiceTest {

    @Mock PatientRepository patientRepository;
    @Mock VisitRepository visitRepository;
    @Mock InvoiceRepository invoiceRepository;
    @Mock TestCatalogueRepository testCatalogueRepository;
    @Mock EquipmentCatalogueRepository equipmentCatalogueRepository;
    @Mock ResourceCatalogueRepository resourceCatalogueRepository;
    @Mock FileStorageConfig fileStorageConfig;

    @InjectMocks LabService labService;

    private Patient patient;
    private User doctor;
    private Visit activeVisit;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setUserId(10L);
        doctor.setFullName("Dr. Jones");
        doctor.setRole(Role.DOCTOR);
        doctor.setConsultationFee(400.0);

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setFirstName("Bob");
        patient.setLastName("Smith");
        patient.setAge(45);

        activeVisit = new Visit();
        activeVisit.setVisitId(3L);
        activeVisit.setDoctor(doctor);
        activeVisit.setPatient(patient);
        activeVisit.setPatientType(PatientType.INPATIENT);
        activeVisit.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);

        patient.setVisits(List.of(activeVisit));
    }

    // ── searchPatient ────────────────────────────────────────────────────────

    @Test
    void searchPatient_withActiveVisit_returnsLabPatientResponse() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        LabPatientResponse response = labService.searchPatient(1L);

        assertThat(response.patientId()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("Bob Smith");
        assertThat(response.visitId()).isEqualTo(3L);
        assertThat(response.canProceed()).isTrue();
        assertThat(response.prescriptionReady()).isFalse();
        assertThat(response.gateMessage()).isNull();
    }

    @Test
    void searchPatient_prescriptionUploaded_flagsReady() {
        activeVisit.setPrescriptionPath("/prescriptions/file.pdf");
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        LabPatientResponse response = labService.searchPatient(1L);

        assertThat(response.prescriptionReady()).isTrue();
    }

    @Test
    void searchPatient_noActiveVisit_returnsResponseWithMessage() {
        Visit dischargedVisit = new Visit();
        dischargedVisit.setStatus(VisitStatus.DISCHARGED);
        patient.setVisits(List.of(dischargedVisit));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        LabPatientResponse response = labService.searchPatient(1L);

        assertThat(response.canProceed()).isFalse();
        assertThat(response.visitId()).isNull();
        assertThat(response.gateMessage()).contains("no active treatment");
    }

    @Test
    void searchPatient_notFound_throwsResourceNotFoundException() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> labService.searchPatient(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── saveLabCosts ─────────────────────────────────────────────────────────

    @Test
    void saveLabCosts_calculatesCorrectTotal() {
        TestCatalogue test = new TestCatalogue();
        test.setTestId(1L);
        test.setCost(BigDecimal.valueOf(200));

        EquipmentCatalogue equip = new EquipmentCatalogue();
        equip.setEquipmentId(1L);
        equip.setCost(BigDecimal.valueOf(100));

        ResourceCatalogue resource = new ResourceCatalogue();
        resource.setResourceId(1L);
        resource.setCostPerUnit(BigDecimal.valueOf(50));

        Invoice existingInvoice = new Invoice();
        existingInvoice.setInvoiceId(1L);
        existingInvoice.setDoctorFee(BigDecimal.valueOf(400));
        existingInvoice.setVisit(activeVisit);

        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));
        when(invoiceRepository.findByVisitVisitId(3L)).thenReturn(Optional.of(existingInvoice));
        when(testCatalogueRepository.findById(1L)).thenReturn(Optional.of(test));
        when(equipmentCatalogueRepository.findById(1L)).thenReturn(Optional.of(equip));
        when(resourceCatalogueRepository.findById(1L)).thenReturn(Optional.of(resource));

        SaveLabCostsRequest req = new SaveLabCostsRequest(
                List.of(new SaveLabCostsRequest.TestLineItem(1L, 2)),       // 2 * 200 = 400
                List.of(new SaveLabCostsRequest.EquipmentLineItem(1L, 3)),  // 3 * 100 = 300
                List.of(new SaveLabCostsRequest.ResourceLineItem(1L, 4.0)) // 4 * 50 = 200
        );

        BigDecimal total = labService.saveLabCosts(3L, req);

        // doctorFee(400) + testCost(400) + equipCost(300) + resourceCost(200) = 1300
        assertThat(total).isEqualByComparingTo(BigDecimal.valueOf(1300));
        assertThat(existingInvoice.getTestCost()).isEqualByComparingTo(BigDecimal.valueOf(400));
        assertThat(existingInvoice.getEquipmentCost()).isEqualByComparingTo(BigDecimal.valueOf(300));
        assertThat(existingInvoice.getResourceCost()).isEqualByComparingTo(BigDecimal.valueOf(200));
    }

    @Test
    void saveLabCosts_createsNewInvoiceIfNoneExists() {
        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));
        when(invoiceRepository.findByVisitVisitId(3L)).thenReturn(Optional.empty());
        Invoice newInvoice = new Invoice();
        newInvoice.setInvoiceId(1L);
        newInvoice.setDoctorFee(BigDecimal.valueOf(400));
        newInvoice.setVisit(activeVisit);
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(newInvoice);

        SaveLabCostsRequest req = new SaveLabCostsRequest(
                new ArrayList<>(), new ArrayList<>(), new ArrayList<>());

        BigDecimal total = labService.saveLabCosts(3L, req);

        assertThat(total).isEqualByComparingTo(BigDecimal.valueOf(400));
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    void saveLabCosts_visitNotInProgress_throwsBusinessRuleException() {
        activeVisit.setStatus(VisitStatus.ADMITTED);
        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));

        SaveLabCostsRequest req = new SaveLabCostsRequest(
                new ArrayList<>(), new ArrayList<>(), new ArrayList<>());

        assertThatThrownBy(() -> labService.saveLabCosts(3L, req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("active visits");
    }

    @Test
    void saveLabCosts_testNotFound_throwsResourceNotFoundException() {
        when(visitRepository.findById(3L)).thenReturn(Optional.of(activeVisit));
        when(invoiceRepository.findByVisitVisitId(3L)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any())).thenReturn(new Invoice());
        when(testCatalogueRepository.findById(99L)).thenReturn(Optional.empty());

        Invoice storedInvoice = new Invoice();
        storedInvoice.setDoctorFee(BigDecimal.valueOf(400));
        storedInvoice.setVisit(activeVisit);
        when(invoiceRepository.save(any())).thenReturn(storedInvoice);

        SaveLabCostsRequest req = new SaveLabCostsRequest(
                List.of(new SaveLabCostsRequest.TestLineItem(99L, 1)),
                new ArrayList<>(), new ArrayList<>());

        assertThatThrownBy(() -> labService.saveLabCosts(3L, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Test not found");
    }
}
