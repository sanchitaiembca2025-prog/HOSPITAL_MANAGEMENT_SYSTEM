package com.hms.dto.response;

import com.hms.enums.PaymentStatus;

import java.math.BigDecimal;

public record InvoiceResponse(
        Long invoiceId,
        BigDecimal doctorFee,
        BigDecimal testCost,
        BigDecimal equipmentCost,
        BigDecimal resourceCost,
        BigDecimal totalAmount,
        PaymentStatus paymentStatus) {}
