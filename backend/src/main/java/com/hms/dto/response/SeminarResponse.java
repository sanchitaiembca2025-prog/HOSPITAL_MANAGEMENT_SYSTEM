package com.hms.dto.response;

import java.time.LocalDate;

public record SeminarResponse(
        Long seminarId,
        String seminarName,
        LocalDate seminarDate,
        Double durationHours,
        String hallNumber) {}
