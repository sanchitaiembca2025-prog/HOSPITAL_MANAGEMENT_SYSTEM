package com.hms.entity;

import com.hms.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false, unique = true)
    private Visit visit;

    @Column(precision = 10, scale = 2)
    private BigDecimal doctorFee = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal testCost = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal equipmentCost = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal resourceCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public void recalculateTotal() {
        this.totalAmount = doctorFee.add(testCost).add(equipmentCost).add(resourceCost);
    }
}
