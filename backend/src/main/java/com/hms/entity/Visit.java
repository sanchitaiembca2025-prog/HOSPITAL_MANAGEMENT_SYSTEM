package com.hms.entity;

import com.hms.enums.PatientType;
import com.hms.enums.VisitStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
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

    private String testResultPath;
    private LocalDateTime testResultUploadedAt;

    private String postMortemPath;
    private String causeOfDeath;
    private LocalDateTime timeOfDeath;

    @OneToOne(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Invoice invoice;

    public Visit() {}

    public Long getVisitId() { return visitId; }
    public void setVisitId(Long visitId) { this.visitId = visitId; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }

    public PatientType getPatientType() { return patientType; }
    public void setPatientType(PatientType patientType) { this.patientType = patientType; }

    public WardCategory getWardCategory() { return wardCategory; }
    public void setWardCategory(WardCategory wardCategory) { this.wardCategory = wardCategory; }

    public VisitStatus getStatus() { return status; }
    public void setStatus(VisitStatus status) { this.status = status; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }

    public LocalDateTime getDischargeTime() { return dischargeTime; }
    public void setDischargeTime(LocalDateTime dischargeTime) { this.dischargeTime = dischargeTime; }

    public String getPrescriptionPath() { return prescriptionPath; }
    public void setPrescriptionPath(String prescriptionPath) { this.prescriptionPath = prescriptionPath; }

    public LocalDateTime getPrescriptionUploadedAt() { return prescriptionUploadedAt; }
    public void setPrescriptionUploadedAt(LocalDateTime prescriptionUploadedAt) { this.prescriptionUploadedAt = prescriptionUploadedAt; }

    public String getTestResultPath() { return testResultPath; }
    public void setTestResultPath(String testResultPath) { this.testResultPath = testResultPath; }

    public LocalDateTime getTestResultUploadedAt() { return testResultUploadedAt; }
    public void setTestResultUploadedAt(LocalDateTime testResultUploadedAt) { this.testResultUploadedAt = testResultUploadedAt; }

    public String getPostMortemPath() { return postMortemPath; }
    public void setPostMortemPath(String postMortemPath) { this.postMortemPath = postMortemPath; }

    public String getCauseOfDeath() { return causeOfDeath; }
    public void setCauseOfDeath(String causeOfDeath) { this.causeOfDeath = causeOfDeath; }

    public LocalDateTime getTimeOfDeath() { return timeOfDeath; }
    public void setTimeOfDeath(LocalDateTime timeOfDeath) { this.timeOfDeath = timeOfDeath; }

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
}
