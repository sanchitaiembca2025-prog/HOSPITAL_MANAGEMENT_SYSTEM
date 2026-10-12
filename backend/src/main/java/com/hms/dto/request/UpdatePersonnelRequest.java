package com.hms.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdatePersonnelRequest(
        String fullName,
        @jakarta.validation.constraints.Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        @jakarta.validation.constraints.Email String email,
        Double consultationFee) {}
