package com.hms.dto.response;

import com.hms.enums.Gender;

import java.time.LocalDateTime;
import java.util.List;

public record PatientResponse(
        Long patientId,
        String firstName,
        String lastName,
        String phone,
        String address,
        Gender gender,
        Integer age,
        LocalDateTime registeredAt,
        List<VisitSummary> visits) {

    public record VisitSummary(
            Long visitId,
            String issue,
            String doctorName,
            LocalDateTime entryTime,
            LocalDateTime dischargeTime,
            String status,
            Long invoiceId,
            java.math.BigDecimal amountPaid) {}
}
