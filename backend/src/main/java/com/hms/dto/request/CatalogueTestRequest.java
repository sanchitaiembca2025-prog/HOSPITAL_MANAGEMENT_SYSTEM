package com.hms.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CatalogueTestRequest(
        @NotBlank(message = "Test name is required") String testName,
        @NotNull @DecimalMin("0.01") BigDecimal cost,
        Boolean isAvailable) {}
