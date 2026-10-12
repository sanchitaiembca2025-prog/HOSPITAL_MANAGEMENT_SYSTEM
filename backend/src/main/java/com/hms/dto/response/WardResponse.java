package com.hms.dto.response;

public record WardResponse(Long categoryId, String categoryName, Integer totalBeds, Integer availableBeds) {}
