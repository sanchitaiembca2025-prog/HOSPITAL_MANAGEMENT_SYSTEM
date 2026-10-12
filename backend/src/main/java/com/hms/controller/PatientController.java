package com.hms.controller;

import com.hms.dto.request.RegisterPatientRequest;
import com.hms.dto.response.PatientResponse;
import com.hms.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<Map<String, Object>> registerPatient(
            @Valid @RequestBody RegisterPatientRequest request) {
        Long patientId = patientService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("patientId", patientId, "message", "Patient registered successfully"));
    }

    @GetMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('CLERK','DOCTOR','LAB')")
    public ResponseEntity<PatientResponse> getPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientService.getPatient(patientId));
    }
}
