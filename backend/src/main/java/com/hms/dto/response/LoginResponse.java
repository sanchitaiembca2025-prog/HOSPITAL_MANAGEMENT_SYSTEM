package com.hms.dto.response;

public record LoginResponse(String token, String role, Long userId, String name) {}
