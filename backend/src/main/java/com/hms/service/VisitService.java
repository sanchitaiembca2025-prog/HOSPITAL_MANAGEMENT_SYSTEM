package com.hms.service;

import com.hms.dto.request.CreateVisitRequest;
import com.hms.dto.response.VisitResponse;
import com.hms.entity.*;
import com.hms.enums.PatientType;
import com.hms.enums.VisitStatus;
import com.hms.exception.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final WardCategoryRepository wardCategoryRepository;
    private final VisitStatusLogRepository visitStatusLogRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public Long createVisit(Long patientId, CreateVisitRequest req) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        List<Visit> existingVisits = patient.getVisits();

        boolean hasDeceasedVisit = existingVisits.stream()
                .anyMatch(v -> v.getStatus() == VisitStatus.DECEASED);
        if (hasDeceasedVisit) {
            throw new BusinessRuleException("Cannot create a new visit: patient has a deceased visit record");
        }

        boolean hasActiveVisit = existingVisits.stream()
                .anyMatch(v -> v.getStatus() == VisitStatus.ADMITTED
                        || v.getStatus() == VisitStatus.TREATMENT_IN_PROGRESS);
        if (hasActiveVisit) {
            throw new BusinessRuleException("Cannot create a new visit: patient already has an active visit");
        }

        User doctor = userRepository.findById(req.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + req.doctorId()));

        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setIssue(req.issue());
        visit.setDoctor(doctor);
        visit.setPatientType(req.patientType());
        visit.setStatus(VisitStatus.ADMITTED);

        if (req.patientType() == PatientType.INPATIENT) {
            if (req.wardCategoryId() == null) {
                throw new BusinessRuleException("Ward category is required for INPATIENT");
            }
            WardCategory ward = wardCategoryRepository.findById(req.wardCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found: " + req.wardCategoryId()));
            visit.setWardCategory(ward);
        }

        return visitRepository.save(visit).getVisitId();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public VisitResponse admitVisit(Long visitId, Long actingUserId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        if (visit.getStatus() != VisitStatus.ADMITTED) {
            throw new ConflictException("Visit is not in ADMITTED state");
        }

        User actingUser = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actingUserId));

        if (visit.getPatientType() == PatientType.INPATIENT && visit.getWardCategory() != null) {
            WardCategory ward = wardCategoryRepository.findByIdWithLock(visit.getWardCategory().getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));

            if (ward.getAvailableBeds() == 0) {
                throw new BusinessRuleException("No beds available in " + ward.getCategoryName() + " ward");
            }
            ward.setAvailableBeds(ward.getAvailableBeds() - 1);
        }

        VisitStatus prev = visit.getStatus();
        visit.setStatus(VisitStatus.TREATMENT_IN_PROGRESS);

        visitStatusLogRepository.save(new VisitStatusLog(
                visit, prev, VisitStatus.TREATMENT_IN_PROGRESS, actingUser, LocalDateTime.now()));

        return toVisitResponse(visit);
    }

    @Transactional(readOnly = true)
    public VisitResponse getVisit(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));
        return toVisitResponse(visit);
    }

    private VisitResponse toVisitResponse(Visit v) {
        return new VisitResponse(
                v.getVisitId(),
                v.getPatient().getPatientId(),
                v.getPatient().getFirstName() + " " + v.getPatient().getLastName(),
                v.getIssue(),
                v.getDoctor().getFullName(),
                v.getPatientType(),
                v.getWardCategory() != null ? v.getWardCategory().getCategoryName() : null,
                v.getStatus(),
                v.getEntryTime(),
                v.getDischargeTime(),
                v.getPrescriptionPath() != null,
                v.getPrescriptionUploadedAt());
    }
}
