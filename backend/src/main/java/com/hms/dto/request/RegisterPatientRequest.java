package com.hms.dto.request;

import com.hms.enums.Gender;
import jakarta.validation.constraints.*;

public record RegisterPatientRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required") String lastName,
        @NotBlank(message = "Phone is required") @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
        String address,
        @NotNull(message = "Gender is required") Gender gender,
        @Positive(message = "Age must be positive") @NotNull Integer age) {}
