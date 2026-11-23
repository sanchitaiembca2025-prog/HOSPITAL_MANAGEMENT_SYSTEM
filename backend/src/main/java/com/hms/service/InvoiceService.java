package com.hms.service;

import com.hms.dto.response.InvoiceResponse;
import com.hms.entity.*;
import com.hms.enums.PaymentStatus;
import com.hms.enums.VisitStatus;
import com.hms.exception.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final VisitRepository visitRepository;
    private final InvoiceRepository invoiceRepository;
    private final VisitStatusLogRepository visitStatusLogRepository;
    private final UserRepository userRepository;
    private final WardCategoryRepository wardCategoryRepository;

    @Transactional
    public InvoiceResponse generateInvoice(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        if (visit.getStatus() != VisitStatus.TREATMENT_IN_PROGRESS
                && visit.getStatus() != VisitStatus.DECEASED) {
            throw new BusinessRuleException("Invoice can only be generated for visits in TREATMENT_IN_PROGRESS or DECEASED state");
        }

        if (invoiceRepository.findByVisitVisitId(visitId).isPresent()) {
            throw new ConflictException("Invoice already exists for visit: " + visitId);
        }

        Invoice invoice = new Invoice();
        invoice.setVisit(visit);
        invoice.setDoctorFee(visit.getDoctor().getConsultationFee() != null
                ? java.math.BigDecimal.valueOf(visit.getDoctor().getConsultationFee())
                : java.math.BigDecimal.ZERO);
        invoice.recalculateTotal();

        invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Transactional
    public Object confirmPayment(Long visitId, Long actingUserId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        Invoice invoice = invoiceRepository.findByVisitVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for visit: " + visitId));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ConflictException("Invoice already paid for visit: " + visitId);
        }

        User actingUser = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actingUserId));

        invoice.setPaymentStatus(PaymentStatus.PAID);

        VisitStatus prev = visit.getStatus();
        // Deceased visits remain DECEASED after payment; only active visits move to DISCHARGED
        if (prev != VisitStatus.DECEASED) {
            visit.setStatus(VisitStatus.DISCHARGED);
            visit.setDischargeTime(LocalDateTime.now());

            if (visit.getWardCategory() != null) {
                WardCategory ward = wardCategoryRepository.findByIdWithLock(visit.getWardCategory().getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
                ward.setAvailableBeds(ward.getAvailableBeds() + 1);
            }

            visitStatusLogRepository.save(new VisitStatusLog(
                    visit, prev, VisitStatus.DISCHARGED, actingUser, LocalDateTime.now()));
        }

        return new java.util.LinkedHashMap<>() {{
            put("visitId", visit.getVisitId());
            put("status", visit.getStatus().name());
            put("dischargeTime", visit.getDischargeTime());
            put("paymentStatus", invoice.getPaymentStatus().name());
        }};
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long visitId) {
        Invoice invoice = invoiceRepository.findByVisitVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for visit: " + visitId));
        return toResponse(invoice);
    }

    private InvoiceResponse toResponse(Invoice i) {
        return new InvoiceResponse(
                i.getInvoiceId(),
                i.getDoctorFee(),
                i.getTestCost(),
                i.getEquipmentCost(),
                i.getResourceCost(),
                i.getTotalAmount(),
                i.getPaymentStatus());
    }
}
