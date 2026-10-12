package com.hms.service;

import com.hms.dto.response.*;
import com.hms.entity.User;
import com.hms.enums.Role;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LookupService {

    private final MedicalSectionRepository medicalSectionRepository;
    private final UserRepository userRepository;
    private final WardCategoryRepository wardCategoryRepository;
    private final TestCatalogueRepository testCatalogueRepository;
    private final EquipmentCatalogueRepository equipmentCatalogueRepository;
    private final ResourceCatalogueRepository resourceCatalogueRepository;

    @Transactional(readOnly = true)
    public List<MedicalSectionResponse> listMedicalSections() {
        return medicalSectionRepository.findAll().stream()
                .map(s -> new MedicalSectionResponse(s.getSectionId(), s.getSectionName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> listDoctorsBySection(Long sectionId) {
        List<User> doctors = sectionId != null
                ? userRepository.findAllByRoleAndSectionSectionId(Role.DOCTOR, sectionId)
                : userRepository.findAllByRole(Role.DOCTOR);

        return doctors.stream()
                .filter(User::getIsActive)
                .map(d -> new DoctorProfileResponse(d.getUserId(), d.getFullName(), d.getUsername(),
                        d.getPhone(), d.getEmail(), d.getConsultationFee(),
                        d.getSection() != null ? d.getSection().getSectionName() : null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WardResponse> listWards() {
        return wardCategoryRepository.findAll().stream()
                .map(w -> new WardResponse(w.getCategoryId(), w.getCategoryName(), w.getTotalBeds(), w.getAvailableBeds()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatalogueTestResponse> listAvailableTests() {
        return testCatalogueRepository.findAllByIsAvailableTrue().stream()
                .map(t -> new CatalogueTestResponse(t.getTestId(), t.getTestName(), t.getCost(), t.getIsAvailable()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatalogueEquipmentResponse> listActiveEquipment() {
        return equipmentCatalogueRepository.findAllByIsActiveTrue().stream()
                .map(e -> new CatalogueEquipmentResponse(e.getEquipmentId(), e.getEquipmentName(), e.getCost(), e.getIsActive()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatalogueResourceResponse> listActiveResources() {
        return resourceCatalogueRepository.findAllByIsActiveTrue().stream()
                .map(r -> new CatalogueResourceResponse(r.getResourceId(), r.getResourceName(), r.getCostPerUnit(), r.getIsActive()))
                .toList();
    }
}
