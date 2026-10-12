package com.hms.service;

import com.hms.config.FileStorageConfig;
import com.hms.dto.request.SaveLabCostsRequest;
import com.hms.dto.response.LabPatientResponse;
import com.hms.entity.*;
import com.hms.enums.VisitStatus;
import com.hms.exception.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class LabService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final InvoiceRepository invoiceRepository;
    private final TestCatalogueRepository testCatalogueRepository;
    private final EquipmentCatalogueRepository equipmentCatalogueRepository;
    private final ResourceCatalogueRepository resourceCatalogueRepository;
    private final FileStorageConfig fileStorageConfig;

    @Transactional(readOnly = true)
    public LabPatientResponse searchPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        Visit tipVisit = patient.getVisits().stream()
                .filter(v -> v.getStatus() == VisitStatus.TREATMENT_IN_PROGRESS)
                .findFirst()
                .orElse(null);

        if (tipVisit == null) {
            return new LabPatientResponse(patient.getPatientId(),
                    patient.getFirstName() + " " + patient.getLastName(),
                    patient.getAge(), null, null, false, false,
                    "Patient has no active treatment visit");
        }

        boolean prescriptionReady = tipVisit.getPrescriptionPath() != null;
        boolean canProceed = prescriptionReady;
        String gateMessage = canProceed ? null : "Prescription not yet uploaded by doctor";

        return new LabPatientResponse(
                patient.getPatientId(),
                patient.getFirstName() + " " + patient.getLastName(),
                patient.getAge(),
                tipVisit.getDoctor().getFullName(),
                tipVisit.getVisitId(),
                prescriptionReady,
                canProceed,
                gateMessage);
    }

    @Transactional
    public BigDecimal saveLabCosts(Long visitId, SaveLabCostsRequest req) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        if (visit.getStatus() != VisitStatus.TREATMENT_IN_PROGRESS) {
            throw new BusinessRuleException("Lab costs can only be saved for active visits");
        }

        if (visit.getPrescriptionPath() == null) {
            throw new BusinessRuleException("Prescription must be uploaded before saving lab costs");
        }

        Invoice invoice = invoiceRepository.findByVisitVisitId(visitId)
                .orElseGet(() -> {
                    Invoice inv = new Invoice();
                    inv.setVisit(visit);
                    inv.setDoctorFee(visit.getDoctor().getConsultationFee() != null
                            ? BigDecimal.valueOf(visit.getDoctor().getConsultationFee())
                            : BigDecimal.ZERO);
                    return invoiceRepository.save(inv);
                });

        BigDecimal testTotal = BigDecimal.ZERO;
        for (SaveLabCostsRequest.TestLineItem item : req.tests()) {
            TestCatalogue test = testCatalogueRepository.findById(item.testId())
                    .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + item.testId()));
            testTotal = testTotal.add(test.getCost().multiply(BigDecimal.valueOf(item.quantity())));
        }

        BigDecimal equipTotal = BigDecimal.ZERO;
        for (SaveLabCostsRequest.EquipmentLineItem item : req.equipment()) {
            EquipmentCatalogue equip = equipmentCatalogueRepository.findById(item.equipmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + item.equipmentId()));
            equipTotal = equipTotal.add(equip.getCost().multiply(BigDecimal.valueOf(item.quantity())));
        }

        BigDecimal resourceTotal = BigDecimal.ZERO;
        for (SaveLabCostsRequest.ResourceLineItem item : req.resources()) {
            ResourceCatalogue resource = resourceCatalogueRepository.findById(item.resourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + item.resourceId()));
            resourceTotal = resourceTotal.add(resource.getCostPerUnit().multiply(BigDecimal.valueOf(item.quantityUsed())));
        }

        invoice.setTestCost(testTotal);
        invoice.setEquipmentCost(equipTotal);
        invoice.setResourceCost(resourceTotal);
        invoice.recalculateTotal();

        return invoice.getTotalAmount();
    }

    @Transactional
    public void uploadTestResult(Long visitId, MultipartFile file) throws IOException {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        if (visit.getStatus() != VisitStatus.TREATMENT_IN_PROGRESS) {
            throw new BusinessRuleException("Test results can only be uploaded for active visits");
        }

        fileStorageConfig.store(file, "test-results/" + visitId);
    }
}
