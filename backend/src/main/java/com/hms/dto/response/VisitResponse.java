package com.hms.dto.response;

import com.hms.enums.PatientType;
import com.hms.enums.VisitStatus;

import java.time.LocalDateTime;

public record VisitResponse(
        Long visitId,
        Long patientId,
        String patientName,
        String issue,
        String doctorName,
        PatientType patientType,
        String wardCategory,
        VisitStatus status,
        LocalDateTime entryTime,
        LocalDateTime dischargeTime,
        Boolean prescriptionReady,
        LocalDateTime prescriptionUploadedAt) {}
