package com.hms.dto.request;

import jakarta.validation.constraints.*;

public record UpdateWardRequest(
        @NotNull @Positive(message = "Total beds must be positive") Integer totalBeds) {}
