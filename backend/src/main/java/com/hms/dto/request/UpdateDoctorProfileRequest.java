package com.hms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record UpdateDoctorProfileRequest(
        @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        @Email(message = "Invalid email format") String email,
        @Positive(message = "Consultation fee must be positive") Double consultationFee) {}
