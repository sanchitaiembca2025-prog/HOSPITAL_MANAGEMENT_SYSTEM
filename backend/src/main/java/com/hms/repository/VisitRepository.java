package com.hms.repository;

import com.hms.entity.Visit;
import com.hms.enums.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VisitRepository extends JpaRepository<Visit, Long> {

    List<Visit> findAllByPatientPatientId(Long patientId);

    @Query("SELECT v FROM Visit v WHERE v.patient.patientId = :patientId AND v.status = :status")
    Optional<Visit> findActiveVisit(@Param("patientId") Long patientId, @Param("status") VisitStatus status);
}
