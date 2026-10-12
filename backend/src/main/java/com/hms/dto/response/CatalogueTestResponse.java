package com.hms.dto.response;

import java.math.BigDecimal;

public record CatalogueTestResponse(Long testId, String testName, BigDecimal cost, Boolean isAvailable) {}
