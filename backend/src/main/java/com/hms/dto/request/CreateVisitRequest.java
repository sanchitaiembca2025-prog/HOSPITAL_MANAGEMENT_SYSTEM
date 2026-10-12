package com.hms.dto.request;

import com.hms.enums.PatientType;
import jakarta.validation.constraints.*;

public record CreateVisitRequest(
        @NotBlank(message = "Issue description is required") String issue,
        @NotNull(message = "Doctor ID is required") Long doctorId,
        @NotNull(message = "Patient type is required") PatientType patientType,
        Long wardCategoryId) {}
