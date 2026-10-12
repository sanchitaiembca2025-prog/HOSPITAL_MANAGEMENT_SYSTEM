package com.hms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medical_sections")
@Getter @Setter @NoArgsConstructor
public class MedicalSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sectionId;

    @Column(nullable = false, unique = true)
    private String sectionName;
}
