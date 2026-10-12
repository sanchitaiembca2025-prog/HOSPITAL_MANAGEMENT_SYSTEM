package com.hms.controller;

import com.hms.dto.request.SaveLabCostsRequest;
import com.hms.dto.response.LabPatientResponse;
import com.hms.service.LabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LabController {

    private final LabService labService;

    @GetMapping("/lab/patients/{patientId}")
    @PreAuthorize("hasRole('LAB')")
    public ResponseEntity<LabPatientResponse> searchPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(labService.searchPatient(patientId));
    }

    @PostMapping("/visits/{visitId}/costs")
    @PreAuthorize("hasRole('LAB')")
    public ResponseEntity<Map<String, Object>> saveLabCosts(
            @PathVariable Long visitId,
            @Valid @RequestBody SaveLabCostsRequest request) {
        BigDecimal updatedTotal = labService.saveLabCosts(visitId, request);
        return ResponseEntity.ok(Map.of(
                "message", "Lab costs saved",
                "updatedTotalAmount", updatedTotal));
    }

    @PostMapping("/visits/{visitId}/test-result")
    @PreAuthorize("hasRole('LAB')")
    public ResponseEntity<Map<String, String>> uploadTestResult(
            @PathVariable Long visitId,
            @RequestParam("file") MultipartFile file) throws IOException {
        labService.uploadTestResult(visitId, file);
        return ResponseEntity.ok(Map.of("message", "Test result uploaded"));
    }
}
