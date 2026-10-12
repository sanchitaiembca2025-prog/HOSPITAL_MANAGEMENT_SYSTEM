package com.hms.dto.request;

import jakarta.validation.constraints.NotNull;

public record PersonnelStatusRequest(
        @NotNull(message = "isActive flag is required") Boolean isActive) {}
