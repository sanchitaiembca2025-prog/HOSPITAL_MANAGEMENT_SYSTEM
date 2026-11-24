package com.hms.service;

import com.hms.dto.response.*;
import com.hms.entity.*;
import com.hms.enums.Role;
import com.hms.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LookupServiceTest {

    @Mock MedicalSectionRepository medicalSectionRepository;
    @Mock UserRepository userRepository;
    @Mock WardCategoryRepository wardCategoryRepository;
    @Mock TestCatalogueRepository testCatalogueRepository;
    @Mock EquipmentCatalogueRepository equipmentCatalogueRepository;
    @Mock ResourceCatalogueRepository resourceCatalogueRepository;

    @InjectMocks LookupService lookupService;

    // ── Medical Sections ──────────────────────────────────────────────────────

    @Test
    void listMedicalSections_returnsMappedList() {
        MedicalSection s = new MedicalSection();
        s.setSectionId(1L);
        s.setSectionName("Cardiology");
        when(medicalSectionRepository.findAll()).thenReturn(List.of(s));

        List<MedicalSectionResponse> result = lookupService.listMedicalSections();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).sectionName()).isEqualTo("Cardiology");
    }

    @Test
    void listMedicalSections_returnsEmpty_whenNone() {
        when(medicalSectionRepository.findAll()).thenReturn(List.of());
        assertThat(lookupService.listMedicalSections()).isEmpty();
    }

    // ── Doctors by Section ────────────────────────────────────────────────────

    @Test
    void listDoctorsBySection_withNullSectionId_returnsAllActiveDoctors() {
        User activeDoctor = activeDoctor(1L, "Dr. Alice");
        User inactiveDoctor = inactiveDoctor(2L, "Dr. Bob");
        when(userRepository.findAllByRole(Role.DOCTOR)).thenReturn(List.of(activeDoctor, inactiveDoctor));

        List<DoctorProfileResponse> result = lookupService.listDoctorsBySection(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).fullName()).isEqualTo("Dr. Alice");
    }

    @Test
    void listDoctorsBySection_withSectionId_filtersToThatSection() {
        User doctor = activeDoctor(3L, "Dr. Carol");
        when(userRepository.findAllByRoleAndSectionSectionId(Role.DOCTOR, 5L))
                .thenReturn(List.of(doctor));

        List<DoctorProfileResponse> result = lookupService.listDoctorsBySection(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).fullName()).isEqualTo("Dr. Carol");
    }

    // ── Wards ─────────────────────────────────────────────────────────────────

    @Test
    void listWards_returnsMappedList() {
        WardCategory w = new WardCategory();
        w.setCategoryId(1L);
        w.setCategoryName("General");
        w.setTotalBeds(20);
        w.setAvailableBeds(5);
        when(wardCategoryRepository.findAll()).thenReturn(List.of(w));

        List<WardResponse> result = lookupService.listWards();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).categoryName()).isEqualTo("General");
        assertThat(result.get(0).availableBeds()).isEqualTo(5);
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    void listAvailableTests_returnsOnlyAvailable() {
        TestCatalogue t = new TestCatalogue();
        t.setTestId(1L);
        t.setTestName("CBC");
        t.setCost(BigDecimal.valueOf(150));
        t.setIsAvailable(true);
        when(testCatalogueRepository.findAllByIsAvailableTrue()).thenReturn(List.of(t));

        List<CatalogueTestResponse> result = lookupService.listAvailableTests();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).testName()).isEqualTo("CBC");
    }

    // ── Equipment ─────────────────────────────────────────────────────────────

    @Test
    void listActiveEquipment_returnsMappedList() {
        EquipmentCatalogue e = new EquipmentCatalogue();
        e.setEquipmentId(1L);
        e.setEquipmentName("ECG Machine");
        e.setCost(BigDecimal.valueOf(500));
        e.setIsActive(true);
        when(equipmentCatalogueRepository.findAllByIsActiveTrue()).thenReturn(List.of(e));

        List<CatalogueEquipmentResponse> result = lookupService.listActiveEquipment();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).equipmentName()).isEqualTo("ECG Machine");
    }

    // ── Resources ─────────────────────────────────────────────────────────────

    @Test
    void listActiveResources_returnsMappedList() {
        ResourceCatalogue r = new ResourceCatalogue();
        r.setResourceId(1L);
        r.setResourceName("Gloves");
        r.setCostPerUnit(BigDecimal.valueOf(10));
        r.setIsActive(true);
        when(resourceCatalogueRepository.findAllByIsActiveTrue()).thenReturn(List.of(r));

        List<CatalogueResourceResponse> result = lookupService.listActiveResources();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).resourceName()).isEqualTo("Gloves");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User activeDoctor(Long id, String name) {
        User u = new User();
        u.setUserId(id);
        u.setFullName(name);
        u.setUsername("doc" + id);
        u.setRole(Role.DOCTOR);
        u.setIsActive(true);
        return u;
    }

    private User inactiveDoctor(Long id, String name) {
        User u = activeDoctor(id, name);
        u.setIsActive(false);
        return u;
    }
}
