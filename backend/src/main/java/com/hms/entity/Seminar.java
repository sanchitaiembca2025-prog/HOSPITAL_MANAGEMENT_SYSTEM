package com.hms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "seminars")
@Getter @Setter @NoArgsConstructor
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
}
