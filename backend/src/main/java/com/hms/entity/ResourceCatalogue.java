package com.hms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "resource_catalogue")
public class ResourceCatalogue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;

    @Column(nullable = false)
    private String resourceName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerUnit;

    @Column(nullable = false)
    private Boolean isActive = true;

    public ResourceCatalogue() {}

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
