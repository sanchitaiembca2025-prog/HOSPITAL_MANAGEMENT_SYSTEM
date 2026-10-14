package com.hms.controller;

import com.hms.dto.request.UpdateDoctorProfileRequest;
import com.hms.dto.response.DoctorProfileResponse;
import com.hms.dto.response.PatientResponse;
import com.hms.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/doctor/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/doctor/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateDoctorProfileRequest request) {
        return ResponseEntity.ok(doctorService.updateProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/doctor/patients/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PatientResponse> searchPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.searchPatient(patientId, userDetails.getUsername()));
    }

    @PostMapping("/visits/{visitId}/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> uploadPrescription(
            @PathVariable Long visitId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {
        LocalDateTime uploadedAt = doctorService.uploadPrescription(visitId, userDetails.getUsername(), file);
        return ResponseEntity.ok(Map.of(
                "message", "Prescription uploaded",
                "prescriptionUploadedAt", uploadedAt.toString()));
    }

    @PostMapping("/visits/{visitId}/deceased")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> markDeceased(
            @PathVariable Long visitId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("causeOfDeath") String causeOfDeath,
            @RequestParam("timeOfDeath") String timeOfDeath,
            @RequestParam("dateOfDeath") String dateOfDeath,
            @RequestParam("postMortemFile") MultipartFile postMortemFile) throws IOException {
        doctorService.markDeceased(visitId, userDetails.getUsername(), causeOfDeath, timeOfDeath, dateOfDeath, postMortemFile);
        return ResponseEntity.ok(Map.of("visitId", visitId, "status", "DECEASED"));
    }
}
