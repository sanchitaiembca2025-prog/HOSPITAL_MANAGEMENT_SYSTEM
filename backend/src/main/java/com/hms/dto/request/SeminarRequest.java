package com.hms.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record SeminarRequest(
        @NotBlank(message = "Seminar name is required") String seminarName,
        @NotNull(message = "Seminar date is required") LocalDate seminarDate,
        @Positive(message = "Duration must be positive") @NotNull Double durationHours,
        @NotBlank(message = "Hall number is required") String hallNumber) {}
