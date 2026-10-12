package com.hms.entity;

import com.hms.enums.PatientType;
import com.hms.enums.VisitStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Getter @Setter @NoArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PatientType patientType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_category_id")
    private WardCategory wardCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus status = VisitStatus.ADMITTED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime entryTime = LocalDateTime.now();

    private LocalDateTime dischargeTime;

    private String prescriptionPath;
    private LocalDateTime prescriptionUploadedAt;

    private String postMortemPath;
    private String causeOfDeath;
    private LocalDateTime timeOfDeath;

    @OneToOne(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Invoice invoice;
}
