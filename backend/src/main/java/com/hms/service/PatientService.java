package com.hms.service;

import com.hms.dto.request.RegisterPatientRequest;
import com.hms.dto.response.PatientResponse;
import com.hms.entity.Patient;
import com.hms.entity.Visit;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    @Transactional
    public Long registerPatient(RegisterPatientRequest req) {
        Patient patient = new Patient();
        patient.setFirstName(req.firstName());
        patient.setLastName(req.lastName());
        patient.setPhone(req.phone());
        patient.setAddress(req.address());
        patient.setGender(req.gender());
        patient.setAge(req.age());
        return patientRepository.save(patient).getPatientId();
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        List<PatientResponse.VisitSummary> summaries = patient.getVisits().stream()
                .map(v -> new PatientResponse.VisitSummary(
                        v.getVisitId(),
                        v.getIssue(),
                        v.getDoctor().getFullName(),
                        v.getEntryTime(),
                        v.getDischargeTime(),
                        v.getStatus().name(),
                        v.getInvoice() != null ? v.getInvoice().getInvoiceId() : null,
                        v.getInvoice() != null ? v.getInvoice().getTotalAmount() : null))
                .toList();

        return new PatientResponse(
                patient.getPatientId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getGender(),
                patient.getAge(),
                patient.getRegisteredAt(),
                summaries);
    }
}
