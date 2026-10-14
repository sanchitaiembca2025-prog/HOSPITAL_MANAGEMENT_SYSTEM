package com.hms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "medical_sections")
public class MedicalSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sectionId;

    @Column(nullable = false, unique = true)
    private String sectionName;

    public MedicalSection() {}

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }
}
