package com.hms.repository;

import com.hms.entity.EquipmentCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentCatalogueRepository extends JpaRepository<EquipmentCatalogue, Long> {
    List<EquipmentCatalogue> findAllByIsActiveTrue();
}
