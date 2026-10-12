package com.hms.repository;

import com.hms.entity.TestCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCatalogueRepository extends JpaRepository<TestCatalogue, Long> {
    List<TestCatalogue> findAllByIsAvailableTrue();
}
