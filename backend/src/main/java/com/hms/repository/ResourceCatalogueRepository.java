package com.hms.repository;

import com.hms.entity.ResourceCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceCatalogueRepository extends JpaRepository<ResourceCatalogue, Long> {
    List<ResourceCatalogue> findAllByIsActiveTrue();
}
