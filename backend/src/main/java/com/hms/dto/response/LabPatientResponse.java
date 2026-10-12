package com.hms.dto.response;

public record LabPatientResponse(
        Long patientId,
        String name,
        Integer age,
        String assignedDoctor,
        Long visitId,
        Boolean prescriptionReady,
        Boolean canProceed,
        String gateMessage) {}
