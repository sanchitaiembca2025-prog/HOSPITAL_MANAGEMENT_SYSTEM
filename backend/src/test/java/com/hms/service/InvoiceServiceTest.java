package com.hms.service;

import com.hms.dto.response.InvoiceResponse;
import com.hms.entity.*;
import com.hms.enums.PatientType;
import com.hms.enums.PaymentStatus;
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

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock VisitRepository visitRepository;
    @Mock InvoiceRepository invoiceRepository;
    @Mock VisitStatusLogRepository visitStatusLogRepository;
    @Mock UserRepository userRepository;
    @Mock WardCategoryRepository wardCategoryRepository;

    @InjectMocks InvoiceService invoiceService;

    private Patient patient;
    private User doctor;
    private User clerk;
    private Visit visit;
    private WardCategory ward;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setUserId(10L);
        doctor.setFullName("Dr. Alice");
        doctor.setRole(Role.DOCTOR);
        doctor.setConsultationFee(500.0);

        clerk = new User();
        clerk.setUserId(20L);
        clerk.setRole(Role.CLERK);

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setFirstName("Jane");
        patient.setLastName("Doe");

        ward = new WardCategory();
        ward.setCategoryId(1L);
        ward.setCategoryName("GENERAL");
        ward.setTotalBeds(20);
        ward.setAvailableBeds(9);

        visit = new Visit();
        visit.setVisitId(5L);
        visit.setPatient(patient);
        visit.setDoctor(doctor);
        visit.setIssue("Fracture");
        visit.setPatientType(PatientType.INPATIENT);
        visit.setWardCategory(ward);
        visit.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);
    }

    // ── generateInvoice ──────────────────────────────────────────────────────

    @Test
    void generateInvoice_validVisit_createsInvoiceWithDoctorFee() {
        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            i.setInvoiceId(1L);
            return i;
        });

        InvoiceResponse response = invoiceService.generateInvoice(5L);

        assertThat(response.doctorFee()).isEqualByComparingTo(BigDecimal.valueOf(500.0));
        assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.PENDING);
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    void generateInvoice_doctorHasNoFee_usesZero() {
        doctor.setConsultationFee(null);
        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InvoiceResponse response = invoiceService.generateInvoice(5L);

        assertThat(response.doctorFee()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void generateInvoice_invoiceAlreadyExists_throwsConflictException() {
        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.of(new Invoice()));

        assertThatThrownBy(() -> invoiceService.generateInvoice(5L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Invoice already exists");
    }

    @Test
    void generateInvoice_visitInAdmittedState_throwsBusinessRuleException() {
        visit.setStatus(VisitStatus.ADMITTED);
        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));

        assertThatThrownBy(() -> invoiceService.generateInvoice(5L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("TREATMENT_IN_PROGRESS");
    }

    @Test
    void generateInvoice_deceasedVisit_succeeds() {
        visit.setStatus(VisitStatus.DECEASED);
        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InvoiceResponse response = invoiceService.generateInvoice(5L);

        assertThat(response).isNotNull();
    }

    // ── confirmPayment ───────────────────────────────────────────────────────

    @Test
    void confirmPayment_pendingInvoice_setsStatusPaidAndDischargesVisit() {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1L);
        invoice.setDoctorFee(BigDecimal.valueOf(500));
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setVisit(visit);

        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.of(invoice));
        when(userRepository.findById(20L)).thenReturn(Optional.of(clerk));
        when(wardCategoryRepository.findByIdWithLock(1L)).thenReturn(Optional.of(ward));
        when(visitStatusLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) invoiceService.confirmPayment(5L, 20L);

        assertThat(result.get("paymentStatus")).isEqualTo("PAID");
        assertThat(result.get("status")).isEqualTo("DISCHARGED");
        assertThat(invoice.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(visit.getStatus()).isEqualTo(VisitStatus.DISCHARGED);
        assertThat(ward.getAvailableBeds()).isEqualTo(10);
    }

    @Test
    void confirmPayment_deceasedVisit_remainsDeceasedAfterPayment() {
        visit.setStatus(VisitStatus.DECEASED);
        visit.setWardCategory(null);
        Invoice invoice = new Invoice();
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setVisit(visit);

        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.of(invoice));
        when(userRepository.findById(20L)).thenReturn(Optional.of(clerk));

        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) invoiceService.confirmPayment(5L, 20L);

        assertThat(result.get("status")).isEqualTo("DECEASED");
        assertThat(visit.getDischargeTime()).isNull();
    }

    @Test
    void confirmPayment_alreadyPaid_throwsConflictException() {
        Invoice invoice = new Invoice();
        invoice.setPaymentStatus(PaymentStatus.PAID);

        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.confirmPayment(5L, 20L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already paid");
    }

    @Test
    void confirmPayment_noInvoice_throwsResourceNotFoundException() {
        when(visitRepository.findById(5L)).thenReturn(Optional.of(visit));
        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.confirmPayment(5L, 20L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Invoice not found");
    }

    // ── getInvoice ───────────────────────────────────────────────────────────

    @Test
    void getInvoice_existing_returnsInvoiceResponse() {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1L);
        invoice.setDoctorFee(BigDecimal.valueOf(500));
        invoice.setTestCost(BigDecimal.valueOf(200));
        invoice.setEquipmentCost(BigDecimal.valueOf(100));
        invoice.setResourceCost(BigDecimal.valueOf(50));
        invoice.recalculateTotal();
        invoice.setPaymentStatus(PaymentStatus.PENDING);

        when(invoiceRepository.findByVisitVisitId(5L)).thenReturn(Optional.of(invoice));

        InvoiceResponse response = invoiceService.getInvoice(5L);

        assertThat(response.totalAmount()).isEqualByComparingTo(BigDecimal.valueOf(850));
    }

    @Test
    void getInvoice_notFound_throwsResourceNotFoundException() {
        when(invoiceRepository.findByVisitVisitId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.getInvoice(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
