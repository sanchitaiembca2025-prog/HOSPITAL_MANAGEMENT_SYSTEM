package com.hms.dto.response;

import java.math.BigDecimal;

public record CatalogueEquipmentResponse(Long equipmentId, String equipmentName, BigDecimal cost, Boolean isActive) {}
