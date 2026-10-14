package com.hms.entity;

import com.hms.enums.PaymentStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
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

    public Invoice() {}

    public void recalculateTotal() {
        this.totalAmount = doctorFee.add(testCost).add(equipmentCost).add(resourceCost);
    }

    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

    public Visit getVisit() { return visit; }
    public void setVisit(Visit visit) { this.visit = visit; }

    public BigDecimal getDoctorFee() { return doctorFee; }
    public void setDoctorFee(BigDecimal doctorFee) { this.doctorFee = doctorFee; }

    public BigDecimal getTestCost() { return testCost; }
    public void setTestCost(BigDecimal testCost) { this.testCost = testCost; }

    public BigDecimal getEquipmentCost() { return equipmentCost; }
    public void setEquipmentCost(BigDecimal equipmentCost) { this.equipmentCost = equipmentCost; }

    public BigDecimal getResourceCost() { return resourceCost; }
    public void setResourceCost(BigDecimal resourceCost) { this.resourceCost = resourceCost; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
