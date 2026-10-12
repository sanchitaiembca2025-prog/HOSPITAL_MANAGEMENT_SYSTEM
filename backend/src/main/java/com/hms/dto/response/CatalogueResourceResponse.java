package com.hms.dto.response;

import java.math.BigDecimal;

public record CatalogueResourceResponse(Long resourceId, String resourceName, BigDecimal costPerUnit, Boolean isActive) {}
