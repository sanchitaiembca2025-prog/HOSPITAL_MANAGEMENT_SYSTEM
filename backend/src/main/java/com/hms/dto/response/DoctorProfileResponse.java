package com.hms.dto.response;

public record DoctorProfileResponse(
        Long userId,
        String fullName,
        String username,
        String phone,
        String email,
        Double consultationFee,
        String sectionName) {}
