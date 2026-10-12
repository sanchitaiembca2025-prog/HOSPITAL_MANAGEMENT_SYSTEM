package com.hms.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CatalogueResourceRequest(
        @NotBlank(message = "Resource name is required") String resourceName,
        @NotNull @DecimalMin("0.01") BigDecimal costPerUnit,
        Boolean isActive) {}
