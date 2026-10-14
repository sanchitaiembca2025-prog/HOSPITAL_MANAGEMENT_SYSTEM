package com.hms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "test_catalogue")
public class TestCatalogue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testId;

    @Column(nullable = false)
    private String testName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    public TestCatalogue() {}

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
