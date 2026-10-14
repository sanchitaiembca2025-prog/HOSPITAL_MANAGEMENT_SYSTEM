package com.hms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "equipment_catalogue")
public class EquipmentCatalogue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long equipmentId;

    @Column(nullable = false)
    private String equipmentName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(nullable = false)
    private Boolean isActive = true;

    public EquipmentCatalogue() {}

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
