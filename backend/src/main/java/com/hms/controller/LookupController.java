package com.hms.controller;

import com.hms.dto.response.*;
import com.hms.service.LookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LookupController {

    private final LookupService lookupService;

    @GetMapping("/medical-sections")
    @PreAuthorize("hasAnyRole('CLERK','ADMIN')")
    public ResponseEntity<List<MedicalSectionResponse>> getMedicalSections() {
        return ResponseEntity.ok(lookupService.listMedicalSections());
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<List<DoctorProfileResponse>> getDoctors(
            @RequestParam(required = false) Long sectionId) {
        return ResponseEntity.ok(lookupService.listDoctorsBySection(sectionId));
    }

    @GetMapping("/wards")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<List<WardResponse>> getWards() {
        return ResponseEntity.ok(lookupService.listWards());
    }

    @GetMapping("/catalogue/tests")
    @PreAuthorize("hasRole('LAB')")
    public ResponseEntity<List<CatalogueTestResponse>> getTests() {
        return ResponseEntity.ok(lookupService.listAvailableTests());
    }

    @GetMapping("/catalogue/equipment")
    @PreAuthorize("hasRole('LAB')")
    public ResponseEntity<List<CatalogueEquipmentResponse>> getEquipment() {
        return ResponseEntity.ok(lookupService.listActiveEquipment());
    }

    @GetMapping("/catalogue/resources")
    @PreAuthorize("hasRole('LAB')")
    public ResponseEntity<List<CatalogueResourceResponse>> getResources() {
        return ResponseEntity.ok(lookupService.listActiveResources());
    }
}
