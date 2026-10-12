package com.hms.repository;

import com.hms.entity.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface SeminarRepository extends JpaRepository<Seminar, Long> {
    List<Seminar> findAll(Sort sort);
}
