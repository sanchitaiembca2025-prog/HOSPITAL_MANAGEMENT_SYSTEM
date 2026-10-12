package com.hms.controller;

import com.hms.dto.response.InvoiceResponse;
import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/visits")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @PostMapping("/{visitId}/invoice")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<InvoiceResponse> generateInvoice(@PathVariable Long visitId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.generateInvoice(visitId));
    }

    @PatchMapping("/{visitId}/invoice/pay")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<Object> confirmPayment(
            @PathVariable Long visitId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(invoiceService.confirmPayment(visitId, user.getUserId()));
    }

    @GetMapping("/{visitId}/invoice")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long visitId) {
        return ResponseEntity.ok(invoiceService.getInvoice(visitId));
    }
}
