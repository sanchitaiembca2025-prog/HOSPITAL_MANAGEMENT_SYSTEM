package com.hms.controller;

import com.hms.dto.request.*;
import com.hms.dto.response.*;
import com.hms.enums.Role;
import com.hms.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── Personnel ──────────────────────────────────────────────────────────────

    @GetMapping("/personnel")
    public ResponseEntity<List<PersonnelResponse>> listPersonnel(@RequestParam Role role) {
        return ResponseEntity.ok(adminService.listPersonnel(role));
    }

    @GetMapping("/personnel/{userId}")
    public ResponseEntity<PersonnelResponse> getPersonnel(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getPersonnel(userId));
    }

    @PutMapping("/personnel/{userId}")
    public ResponseEntity<PersonnelResponse> updatePersonnel(
            @PathVariable Long userId,
            @Valid @RequestBody UpdatePersonnelRequest request) {
        return ResponseEntity.ok(adminService.updatePersonnel(userId, request));
    }

    @PatchMapping("/personnel/{userId}/status")
    public ResponseEntity<Void> setPersonnelStatus(
            @PathVariable Long userId,
            @Valid @RequestBody PersonnelStatusRequest request) {
        adminService.setPersonnelStatus(userId, request);
        return ResponseEntity.ok().build();
    }

    // ── Catalogue: Tests ───────────────────────────────────────────────────────

    @GetMapping("/catalogue/tests")
    public ResponseEntity<List<CatalogueTestResponse>> listTests() {
        return ResponseEntity.ok(adminService.listTests());
    }

    @PostMapping("/catalogue/tests")
    public ResponseEntity<CatalogueTestResponse> addTest(@Valid @RequestBody CatalogueTestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addTest(request));
    }

    @PutMapping("/catalogue/tests/{testId}")
    public ResponseEntity<CatalogueTestResponse> updateTest(
            @PathVariable Long testId,
            @Valid @RequestBody CatalogueTestRequest request) {
        return ResponseEntity.ok(adminService.updateTest(testId, request));
    }

    // ── Catalogue: Equipment ───────────────────────────────────────────────────

    @GetMapping("/catalogue/equipment")
    public ResponseEntity<List<CatalogueEquipmentResponse>> listEquipment() {
        return ResponseEntity.ok(adminService.listEquipment());
    }

    @PostMapping("/catalogue/equipment")
    public ResponseEntity<CatalogueEquipmentResponse> addEquipment(
            @Valid @RequestBody CatalogueEquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addEquipment(request));
    }

    @PutMapping("/catalogue/equipment/{id}")
    public ResponseEntity<CatalogueEquipmentResponse> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody CatalogueEquipmentRequest request) {
        return ResponseEntity.ok(adminService.updateEquipment(id, request));
    }

    // ── Catalogue: Resources ───────────────────────────────────────────────────

    @GetMapping("/catalogue/resources")
    public ResponseEntity<List<CatalogueResourceResponse>> listResources() {
        return ResponseEntity.ok(adminService.listResources());
    }

    @PostMapping("/catalogue/resources")
    public ResponseEntity<CatalogueResourceResponse> addResource(
            @Valid @RequestBody CatalogueResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addResource(request));
    }

    @PutMapping("/catalogue/resources/{id}")
    public ResponseEntity<CatalogueResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody CatalogueResourceRequest request) {
        return ResponseEntity.ok(adminService.updateResource(id, request));
    }

    // ── Wards ──────────────────────────────────────────────────────────────────

    @GetMapping("/wards")
    public ResponseEntity<List<WardResponse>> listWards() {
        return ResponseEntity.ok(adminService.listWards());
    }

    @PutMapping("/wards/{categoryId}")
    public ResponseEntity<WardResponse> updateWard(
            @PathVariable Long categoryId,
            @Valid @RequestBody UpdateWardRequest request) {
        return ResponseEntity.ok(adminService.updateWard(categoryId, request));
    }

    // ── Seminars ───────────────────────────────────────────────────────────────

    @GetMapping("/seminars")
    public ResponseEntity<List<SeminarResponse>> listSeminars() {
        return ResponseEntity.ok(adminService.listSeminars());
    }

    @PostMapping("/seminars")
    public ResponseEntity<SeminarResponse> addSeminar(@Valid @RequestBody SeminarRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addSeminar(request));
    }

    @PutMapping("/seminars/{seminarId}")
    public ResponseEntity<SeminarResponse> updateSeminar(
            @PathVariable Long seminarId,
            @Valid @RequestBody SeminarRequest request) {
        return ResponseEntity.ok(adminService.updateSeminar(seminarId, request));
    }
}
