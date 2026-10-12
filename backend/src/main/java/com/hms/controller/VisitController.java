package com.hms.controller;

import com.hms.dto.request.CreateVisitRequest;
import com.hms.dto.response.VisitResponse;
import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;
    private final UserRepository userRepository;

    @PostMapping("/patients/{patientId}/visits")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<Map<String, Object>> createVisit(
            @PathVariable Long patientId,
            @Valid @RequestBody CreateVisitRequest request) {
        Long visitId = visitService.createVisit(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("visitId", visitId, "status", "ADMITTED"));
    }

    @PatchMapping("/visits/{visitId}/admit")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<Map<String, Object>> admitVisit(
            @PathVariable Long visitId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        VisitResponse response = visitService.admitVisit(visitId, user.getUserId());
        return ResponseEntity.ok(Map.of(
                "visitId", response.visitId(),
                "status", response.status().name(),
                "availableBeds", response.wardCategory() != null ? "updated" : "N/A"));
    }

    @GetMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('CLERK','DOCTOR','LAB')")
    public ResponseEntity<VisitResponse> getVisit(@PathVariable Long visitId) {
        return ResponseEntity.ok(visitService.getVisit(visitId));
    }
}
