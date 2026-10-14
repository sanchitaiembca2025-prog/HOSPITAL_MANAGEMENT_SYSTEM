package com.hms.entity;

import com.hms.enums.VisitStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visit_status_log")
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

    public VisitStatusLog() {}

    public VisitStatusLog(Visit visit, VisitStatus from, VisitStatus to, User actedBy, LocalDateTime changedAt) {
        this.visit = visit;
        this.fromStatus = from;
        this.toStatus = to;
        this.actedBy = actedBy;
        this.changedAt = changedAt;
    }

    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }

    public Visit getVisit() { return visit; }
    public void setVisit(Visit visit) { this.visit = visit; }

    public VisitStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(VisitStatus fromStatus) { this.fromStatus = fromStatus; }

    public VisitStatus getToStatus() { return toStatus; }
    public void setToStatus(VisitStatus toStatus) { this.toStatus = toStatus; }

    public User getActedBy() { return actedBy; }
    public void setActedBy(User actedBy) { this.actedBy = actedBy; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
