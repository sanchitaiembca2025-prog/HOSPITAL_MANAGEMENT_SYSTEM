package com.hms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SaveLabCostsRequest(
        @NotNull List<@Valid TestLineItem> tests,
        @NotNull List<@Valid EquipmentLineItem> equipment,
        @NotNull List<@Valid ResourceLineItem> resources) {

    public record TestLineItem(
            @NotNull Long testId,
            @NotNull @jakarta.validation.constraints.Positive Integer quantity) {}

    public record EquipmentLineItem(
            @NotNull Long equipmentId,
            @NotNull @jakarta.validation.constraints.Positive Integer quantity) {}

    public record ResourceLineItem(
            @NotNull Long resourceId,
            @NotNull @jakarta.validation.constraints.Positive Double quantityUsed) {}
}
