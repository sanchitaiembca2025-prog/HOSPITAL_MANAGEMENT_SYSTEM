package com.hms.dto.response;

public record PersonnelResponse(
        Long userId,
        String fullName,
        String username,
        String role,
        String phone,
        String email,
        Boolean isActive,
        Double consultationFee,
        String sectionName) {}
