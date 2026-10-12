package com.hms.entity;

import com.hms.enums.VisitStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "visit_status_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class VisitStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    private Visit visit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acted_by_user_id", nullable = false)
    private User actedBy;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    public VisitStatusLog(Visit visit, VisitStatus from, VisitStatus to, User actedBy, LocalDateTime changedAt) {
        this.visit = visit;
        this.fromStatus = from;
        this.toStatus = to;
        this.actedBy = actedBy;
        this.changedAt = changedAt;
    }
}
