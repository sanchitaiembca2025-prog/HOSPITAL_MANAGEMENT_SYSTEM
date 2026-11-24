package com.hms.service;

import com.hms.dto.request.*;
import com.hms.dto.response.*;
import com.hms.entity.*;
import com.hms.enums.Role;
import com.hms.exception.BusinessRuleException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock UserRepository userRepository;
    @Mock MedicalSectionRepository medicalSectionRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock TestCatalogueRepository testCatalogueRepository;
    @Mock EquipmentCatalogueRepository equipmentCatalogueRepository;
    @Mock ResourceCatalogueRepository resourceCatalogueRepository;
    @Mock WardCategoryRepository wardCategoryRepository;
    @Mock SeminarRepository seminarRepository;

    @InjectMocks AdminService adminService;

    private User clerkUser;
    private WardCategory ward;

    @BeforeEach
    void setUp() {
        clerkUser = new User();
        clerkUser.setUserId(5L);
        clerkUser.setFullName("Clerk Bob");
        clerkUser.setUsername("clerk1");
        clerkUser.setRole(Role.CLERK);
        clerkUser.setIsActive(true);

        ward = new WardCategory();
        ward.setCategoryId(1L);
        ward.setCategoryName("GENERAL");
        ward.setTotalBeds(20);
        ward.setAvailableBeds(15);
    }

    // ── Personnel ────────────────────────────────────────────────────────────

    @Test
    void createUser_clerk_savesAndReturnsPersonnelResponse() {
        when(userRepository.findByUsername("newclerk")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(99L);
            return u;
        });

        CreateUserRequest req = new CreateUserRequest(
                "New Clerk", "newclerk", "pass123", Role.CLERK, "1234567890", "clerk@hms.com", null, null);

        PersonnelResponse response = adminService.createUser(req);

        assertThat(response.username()).isEqualTo("newclerk");
        assertThat(response.role()).isEqualTo("CLERK");
    }

    @Test
    void createUser_doctor_setsConsultationFeeAndSection() {
        MedicalSection section = new MedicalSection();
        section.setSectionId(1L);
        section.setSectionName("Cardiology");

        when(userRepository.findByUsername("doc2")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(medicalSectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateUserRequest req = new CreateUserRequest(
                "Dr. Bob", "doc2", "pass", Role.DOCTOR, "9876543210", "doc@hms.com", 750.0, 1L);

        PersonnelResponse response = adminService.createUser(req);

        assertThat(response.role()).isEqualTo("DOCTOR");
        assertThat(response.consultationFee()).isEqualTo(750.0);
        assertThat(response.sectionName()).isEqualTo("Cardiology");
    }

    @Test
    void createUser_adminRole_throwsBusinessRuleException() {
        CreateUserRequest req = new CreateUserRequest(
                "Admin2", "admin2", "pass", Role.ADMIN, null, null, null, null);

        assertThatThrownBy(() -> adminService.createUser(req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot create admin");
    }

    @Test
    void createUser_duplicateUsername_throwsBusinessRuleException() {
        when(userRepository.findByUsername("clerk1")).thenReturn(Optional.of(clerkUser));

        CreateUserRequest req = new CreateUserRequest(
                "Another Clerk", "clerk1", "pass", Role.CLERK, null, null, null, null);

        assertThatThrownBy(() -> adminService.createUser(req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void getPersonnel_existingUser_returnsPersonnelResponse() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(clerkUser));

        PersonnelResponse response = adminService.getPersonnel(5L);

        assertThat(response.userId()).isEqualTo(5L);
        assertThat(response.fullName()).isEqualTo("Clerk Bob");
    }

    @Test
    void getPersonnel_notFound_throwsResourceNotFoundException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.getPersonnel(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listPersonnel_byRole_returnsFilteredList() {
        when(userRepository.findAllByRole(Role.CLERK)).thenReturn(List.of(clerkUser));

        List<PersonnelResponse> result = adminService.listPersonnel(Role.CLERK);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).role()).isEqualTo("CLERK");
    }

    @Test
    void setPersonnelStatus_deactivatesUser() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(clerkUser));

        adminService.setPersonnelStatus(5L, new PersonnelStatusRequest(false));

        assertThat(clerkUser.getIsActive()).isFalse();
    }

    @Test
    void updatePersonnel_updatesFieldsPartially() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(clerkUser));

        UpdatePersonnelRequest req = new UpdatePersonnelRequest("Updated Clerk", "9999999999", "updated@hms.com", null);
        PersonnelResponse response = adminService.updatePersonnel(5L, req);

        assertThat(response.fullName()).isEqualTo("Updated Clerk");
        assertThat(clerkUser.getPhone()).isEqualTo("9999999999");
    }

    // ── Catalogue: Tests ──────────────────────────────────────────────────────

    @Test
    void addTest_savesAndReturnsCatalogueTestResponse() {
        when(testCatalogueRepository.save(any(TestCatalogue.class))).thenAnswer(inv -> {
            TestCatalogue t = inv.getArgument(0);
            t.setTestId(1L);
            return t;
        });

        CatalogueTestRequest req = new CatalogueTestRequest("CBC", BigDecimal.valueOf(200), true);
        CatalogueTestResponse response = adminService.addTest(req);

        assertThat(response.testName()).isEqualTo("CBC");
        assertThat(response.cost()).isEqualByComparingTo(BigDecimal.valueOf(200));
        assertThat(response.isAvailable()).isTrue();
    }

    @Test
    void updateTest_updatesExistingTest() {
        TestCatalogue test = new TestCatalogue();
        test.setTestId(1L);
        test.setTestName("CBC");
        test.setCost(BigDecimal.valueOf(200));
        test.setIsAvailable(true);
        when(testCatalogueRepository.findById(1L)).thenReturn(Optional.of(test));

        CatalogueTestRequest req = new CatalogueTestRequest(null, BigDecimal.valueOf(250), false);
        CatalogueTestResponse response = adminService.updateTest(1L, req);

        assertThat(response.cost()).isEqualByComparingTo(BigDecimal.valueOf(250));
        assertThat(response.isAvailable()).isFalse();
    }

    @Test
    void updateTest_notFound_throwsResourceNotFoundException() {
        when(testCatalogueRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.updateTest(99L, new CatalogueTestRequest(null, null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Wards ─────────────────────────────────────────────────────────────────

    @Test
    void updateWard_expandsBeds_adjustsAvailableBedsCorrectly() {
        when(wardCategoryRepository.findById(1L)).thenReturn(Optional.of(ward));

        // 20 total, 15 available → 5 occupied. Expand to 25 total.
        WardResponse response = adminService.updateWard(1L, new UpdateWardRequest(25));

        assertThat(response.totalBeds()).isEqualTo(25);
        assertThat(response.availableBeds()).isEqualTo(20); // 15 + 5 delta
    }

    @Test
    void updateWard_reduceBelowOccupied_throwsBusinessRuleException() {
        // 20 total, 15 available → 5 occupied
        when(wardCategoryRepository.findById(1L)).thenReturn(Optional.of(ward));

        // Try to reduce to 4 (< 5 occupied)
        assertThatThrownBy(() -> adminService.updateWard(1L, new UpdateWardRequest(4)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("occupied");
    }

    @Test
    void updateWard_notFound_throwsResourceNotFoundException() {
        when(wardCategoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.updateWard(99L, new UpdateWardRequest(10)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Seminars ───────────────────────────────────────────────────────────────

    @Test
    void addSeminar_savesAndReturnsSeminarResponse() {
        when(seminarRepository.save(any(Seminar.class))).thenAnswer(inv -> {
            Seminar s = inv.getArgument(0);
            s.setSeminarId(1L);
            return s;
        });

        SeminarRequest req = new SeminarRequest("CPR Training", java.time.LocalDate.of(2026, 12, 1), 4.0, "Hall A");
        SeminarResponse response = adminService.addSeminar(req);

        assertThat(response.seminarName()).isEqualTo("CPR Training");
        assertThat(response.hallNumber()).isEqualTo("Hall A");
    }

    @Test
    void updateSeminar_notFound_throwsResourceNotFoundException() {
        when(seminarRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.updateSeminar(99L,
                new SeminarRequest(null, null, null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
