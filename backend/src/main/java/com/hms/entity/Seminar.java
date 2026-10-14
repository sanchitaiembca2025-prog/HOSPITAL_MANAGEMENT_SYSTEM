package com.hms.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "seminars")
public class Seminar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seminarId;

    @Column(nullable = false)
    private String seminarName;

    @Column(nullable = false)
    private LocalDate seminarDate;

    @Column(nullable = false)
    private Double durationHours;

    @Column(nullable = false)
    private String hallNumber;

    public Seminar() {}

    public Long getSeminarId() { return seminarId; }
    public void setSeminarId(Long seminarId) { this.seminarId = seminarId; }

    public String getSeminarName() { return seminarName; }
    public void setSeminarName(String seminarName) { this.seminarName = seminarName; }

    public LocalDate getSeminarDate() { return seminarDate; }
    public void setSeminarDate(LocalDate seminarDate) { this.seminarDate = seminarDate; }

    public Double getDurationHours() { return durationHours; }
    public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }

    public String getHallNumber() { return hallNumber; }
    public void setHallNumber(String hallNumber) { this.hallNumber = hallNumber; }
}
