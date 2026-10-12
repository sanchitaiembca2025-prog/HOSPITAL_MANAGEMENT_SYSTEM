package com.hms.repository;

import com.hms.entity.WardCategory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WardCategoryRepository extends JpaRepository<WardCategory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM WardCategory w WHERE w.categoryId = :id")
    Optional<WardCategory> findByIdWithLock(@Param("id") Long id);
}
