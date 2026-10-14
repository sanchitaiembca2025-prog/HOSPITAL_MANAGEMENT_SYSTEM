package com.hms.service;

import com.hms.config.FileStorageConfig;
import com.hms.dto.request.UpdateDoctorProfileRequest;
import com.hms.dto.response.DoctorProfileResponse;
import com.hms.dto.response.PatientResponse;
import com.hms.entity.*;
import com.hms.enums.VisitStatus;
import com.hms.exception.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final VisitStatusLogRepository visitStatusLogRepository;
    private final WardCategoryRepository wardCategoryRepository;
    private final FileStorageConfig fileStorageConfig;

    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(String username) {
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + username));
        return toProfileResponse(doctor);
    }

    @Transactional
    public DoctorProfileResponse updateProfile(String username, UpdateDoctorProfileRequest req) {
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + username));

        if (req.phone() != null) doctor.setPhone(req.phone());
        if (req.email() != null) doctor.setEmail(req.email());
        if (req.consultationFee() != null) doctor.setConsultationFee(req.consultationFee());

        return toProfileResponse(doctor);
    }

    @Transactional(readOnly = true)
    public PatientResponse searchPatient(Long patientId, String doctorUsername) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));

        List<Visit> tipVisits = patient.getVisits().stream()
                .filter(v -> v.getStatus() == VisitStatus.TREATMENT_IN_PROGRESS
                          && v.getDoctor().getUsername().equals(doctorUsername))
                .toList();

        if (tipVisits.isEmpty()) {
            throw new BusinessRuleException(
                    "No active treatment visit assigned to you was found for patient: " + patientId);
        }

        List<PatientResponse.VisitSummary> summaries = tipVisits.stream()
                .map(v -> new PatientResponse.VisitSummary(
                        v.getVisitId(), v.getIssue(), v.getDoctor().getFullName(),
                        v.getEntryTime(), v.getDischargeTime(), v.getStatus().name(),
                        v.getInvoice() != null ? v.getInvoice().getInvoiceId() : null,
                        v.getInvoice() != null ? v.getInvoice().getTotalAmount() : null))
                .toList();

        return new PatientResponse(patient.getPatientId(), patient.getFirstName(), patient.getLastName(),
                patient.getPhone(), patient.getAddress(), patient.getGender(), patient.getAge(),
                patient.getRegisteredAt(), summaries);
    }

    @Transactional
    public LocalDateTime uploadPrescription(Long visitId, String doctorUsername, MultipartFile file) throws IOException {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        if (visit.getStatus() != VisitStatus.TREATMENT_IN_PROGRESS) {
            throw new BusinessRuleException("Prescription can only be uploaded for active visits");
        }

        String path = fileStorageConfig.store(file, "prescriptions");
        visit.setPrescriptionPath(path);
        LocalDateTime now = LocalDateTime.now();
        visit.setPrescriptionUploadedAt(now);
        return now;
    }

    @Transactional
    public void markDeceased(Long visitId, String doctorUsername,
                              String causeOfDeath, String timeOfDeathStr, String dateOfDeathStr,
                              MultipartFile postMortemFile) throws IOException {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        if (visit.getStatus() != VisitStatus.TREATMENT_IN_PROGRESS) {
            throw new BusinessRuleException("Can only mark deceased for visits in TREATMENT_IN_PROGRESS");
        }

        User doctor = userRepository.findByUsername(doctorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorUsername));

        String postMortemPath = fileStorageConfig.store(postMortemFile, "postmortem");

        LocalDate dateOfDeath = LocalDate.parse(dateOfDeathStr);
        LocalTime timeOfDeath = LocalTime.parse(timeOfDeathStr);
        LocalDateTime deathDateTime = LocalDateTime.of(dateOfDeath, timeOfDeath);

        VisitStatus prev = visit.getStatus();
        visit.setStatus(VisitStatus.DECEASED);
        visit.setCauseOfDeath(causeOfDeath);
        visit.setTimeOfDeath(deathDateTime);
        visit.setPostMortemPath(postMortemPath);

        if (visit.getWardCategory() != null) {
            WardCategory ward = wardCategoryRepository.findByIdWithLock(visit.getWardCategory().getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
            ward.setAvailableBeds(ward.getAvailableBeds() + 1);
        }

        visitStatusLogRepository.save(new VisitStatusLog(
                visit, prev, VisitStatus.DECEASED, doctor, LocalDateTime.now()));
    }

    private DoctorProfileResponse toProfileResponse(User d) {
        return new DoctorProfileResponse(
                d.getUserId(), d.getFullName(), d.getUsername(),
                d.getPhone(), d.getEmail(), d.getConsultationFee(),
                d.getSection() != null ? d.getSection().getSectionName() : null);
    }
}
