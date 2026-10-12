package com.hms.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CatalogueEquipmentRequest(
        @NotBlank(message = "Equipment name is required") String equipmentName,
        @NotNull @DecimalMin("0.01") BigDecimal cost,
        Boolean isActive) {}
