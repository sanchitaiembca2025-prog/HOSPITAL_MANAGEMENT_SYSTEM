package com.hms.service;

import com.hms.dto.request.*;
import com.hms.dto.response.*;
import com.hms.entity.*;
import com.hms.enums.Role;
import com.hms.exception.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TestCatalogueRepository testCatalogueRepository;
    private final EquipmentCatalogueRepository equipmentCatalogueRepository;
    private final ResourceCatalogueRepository resourceCatalogueRepository;
    private final WardCategoryRepository wardCategoryRepository;
    private final SeminarRepository seminarRepository;

    // ── Personnel ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PersonnelResponse> listPersonnel(Role role) {
        return userRepository.findAllByRole(role).stream().map(this::toPersonnelResponse).toList();
    }

    @Transactional(readOnly = true)
    public PersonnelResponse getPersonnel(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return toPersonnelResponse(user);
    }

    @Transactional
    public PersonnelResponse updatePersonnel(Long userId, UpdatePersonnelRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (req.fullName() != null) user.setFullName(req.fullName());
        if (req.phone() != null) user.setPhone(req.phone());
        if (req.email() != null) user.setEmail(req.email());
        if (req.consultationFee() != null) user.setConsultationFee(req.consultationFee());
        return toPersonnelResponse(user);
    }

    @Transactional
    public void setPersonnelStatus(Long userId, PersonnelStatusRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setIsActive(req.isActive());
    }

    // ── Catalogue: Tests ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CatalogueTestResponse> listTests() {
        return testCatalogueRepository.findAll().stream()
                .map(t -> new CatalogueTestResponse(t.getTestId(), t.getTestName(), t.getCost(), t.getIsAvailable()))
                .toList();
    }

    @Transactional
    public CatalogueTestResponse addTest(CatalogueTestRequest req) {
        TestCatalogue t = new TestCatalogue();
        t.setTestName(req.testName());
        t.setCost(req.cost());
        t.setIsAvailable(req.isAvailable() != null ? req.isAvailable() : true);
        testCatalogueRepository.save(t);
        return new CatalogueTestResponse(t.getTestId(), t.getTestName(), t.getCost(), t.getIsAvailable());
    }

    @Transactional
    public CatalogueTestResponse updateTest(Long testId, CatalogueTestRequest req) {
        TestCatalogue t = testCatalogueRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + testId));
        if (req.cost() != null) t.setCost(req.cost());
        if (req.isAvailable() != null) t.setIsAvailable(req.isAvailable());
        return new CatalogueTestResponse(t.getTestId(), t.getTestName(), t.getCost(), t.getIsAvailable());
    }

    // ── Catalogue: Equipment ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CatalogueEquipmentResponse> listEquipment() {
        return equipmentCatalogueRepository.findAll().stream()
                .map(e -> new CatalogueEquipmentResponse(e.getEquipmentId(), e.getEquipmentName(), e.getCost(), e.getIsActive()))
                .toList();
    }

    @Transactional
    public CatalogueEquipmentResponse addEquipment(CatalogueEquipmentRequest req) {
        EquipmentCatalogue e = new EquipmentCatalogue();
        e.setEquipmentName(req.equipmentName());
        e.setCost(req.cost());
        e.setIsActive(req.isActive() != null ? req.isActive() : true);
        equipmentCatalogueRepository.save(e);
        return new CatalogueEquipmentResponse(e.getEquipmentId(), e.getEquipmentName(), e.getCost(), e.getIsActive());
    }

    @Transactional
    public CatalogueEquipmentResponse updateEquipment(Long id, CatalogueEquipmentRequest req) {
        EquipmentCatalogue e = equipmentCatalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + id));
        if (req.cost() != null) e.setCost(req.cost());
        if (req.isActive() != null) e.setIsActive(req.isActive());
        return new CatalogueEquipmentResponse(e.getEquipmentId(), e.getEquipmentName(), e.getCost(), e.getIsActive());
    }

    // ── Catalogue: Resources ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CatalogueResourceResponse> listResources() {
        return resourceCatalogueRepository.findAll().stream()
                .map(r -> new CatalogueResourceResponse(r.getResourceId(), r.getResourceName(), r.getCostPerUnit(), r.getIsActive()))
                .toList();
    }

    @Transactional
    public CatalogueResourceResponse addResource(CatalogueResourceRequest req) {
        ResourceCatalogue r = new ResourceCatalogue();
        r.setResourceName(req.resourceName());
        r.setCostPerUnit(req.costPerUnit());
        r.setIsActive(req.isActive() != null ? req.isActive() : true);
        resourceCatalogueRepository.save(r);
        return new CatalogueResourceResponse(r.getResourceId(), r.getResourceName(), r.getCostPerUnit(), r.getIsActive());
    }

    @Transactional
    public CatalogueResourceResponse updateResource(Long id, CatalogueResourceRequest req) {
        ResourceCatalogue r = resourceCatalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        if (req.costPerUnit() != null) r.setCostPerUnit(req.costPerUnit());
        if (req.isActive() != null) r.setIsActive(req.isActive());
        return new CatalogueResourceResponse(r.getResourceId(), r.getResourceName(), r.getCostPerUnit(), r.getIsActive());
    }

    // ── Wards ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<WardResponse> listWards() {
        return wardCategoryRepository.findAll().stream()
                .map(w -> new WardResponse(w.getCategoryId(), w.getCategoryName(), w.getTotalBeds(), w.getAvailableBeds()))
                .toList();
    }

    @Transactional
    public WardResponse updateWard(Long categoryId, UpdateWardRequest req) {
        WardCategory ward = wardCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found: " + categoryId));

        int occupied = ward.getTotalBeds() - ward.getAvailableBeds();
        if (req.totalBeds() < occupied) {
            throw new BusinessRuleException("Cannot reduce total beds below occupied count (" + occupied + ")");
        }

        int delta = req.totalBeds() - ward.getTotalBeds();
        ward.setTotalBeds(req.totalBeds());
        ward.setAvailableBeds(ward.getAvailableBeds() + delta);

        return new WardResponse(ward.getCategoryId(), ward.getCategoryName(), ward.getTotalBeds(), ward.getAvailableBeds());
    }

    // ── Seminars ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SeminarResponse> listSeminars() {
        return seminarRepository.findAll(Sort.by(Sort.Direction.DESC, "seminarDate")).stream()
                .map(s -> new SeminarResponse(s.getSeminarId(), s.getSeminarName(), s.getSeminarDate(), s.getDurationHours(), s.getHallNumber()))
                .toList();
    }

    @Transactional
    public SeminarResponse addSeminar(SeminarRequest req) {
        Seminar s = new Seminar();
        s.setSeminarName(req.seminarName());
        s.setSeminarDate(req.seminarDate());
        s.setDurationHours(req.durationHours());
        s.setHallNumber(req.hallNumber());
        seminarRepository.save(s);
        return new SeminarResponse(s.getSeminarId(), s.getSeminarName(), s.getSeminarDate(), s.getDurationHours(), s.getHallNumber());
    }

    @Transactional
    public SeminarResponse updateSeminar(Long seminarId, SeminarRequest req) {
        Seminar s = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar not found: " + seminarId));
        if (req.seminarName() != null) s.setSeminarName(req.seminarName());
        if (req.seminarDate() != null) s.setSeminarDate(req.seminarDate());
        if (req.durationHours() != null) s.setDurationHours(req.durationHours());
        if (req.hallNumber() != null) s.setHallNumber(req.hallNumber());
        return new SeminarResponse(s.getSeminarId(), s.getSeminarName(), s.getSeminarDate(), s.getDurationHours(), s.getHallNumber());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private PersonnelResponse toPersonnelResponse(User u) {
        return new PersonnelResponse(u.getUserId(), u.getFullName(), u.getUsername(),
                u.getRole().name(), u.getPhone(), u.getEmail(), u.getIsActive(),
                u.getConsultationFee(),
                u.getSection() != null ? u.getSection().getSectionName() : null);
    }
}
