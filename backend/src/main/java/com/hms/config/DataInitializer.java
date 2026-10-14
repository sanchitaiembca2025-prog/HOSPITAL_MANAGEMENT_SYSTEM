package com.hms.config;

import com.hms.entity.EquipmentCatalogue;
import com.hms.entity.MedicalSection;
import com.hms.entity.ResourceCatalogue;
import com.hms.entity.TestCatalogue;
import com.hms.entity.User;
import com.hms.entity.WardCategory;
import com.hms.enums.Role;
import com.hms.repository.EquipmentCatalogueRepository;
import com.hms.repository.MedicalSectionRepository;
import com.hms.repository.ResourceCatalogueRepository;
import com.hms.repository.TestCatalogueRepository;
import com.hms.repository.UserRepository;
import com.hms.repository.WardCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WardCategoryRepository wardCategoryRepository;
    private final MedicalSectionRepository medicalSectionRepository;
    private final TestCatalogueRepository testCatalogueRepository;
    private final EquipmentCatalogueRepository equipmentCatalogueRepository;
    private final ResourceCatalogueRepository resourceCatalogueRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSections();
        seedWards();
        seedUsers();
        seedTests();
        seedEquipment();
        seedResources();
        log.info("=== Seed data loaded. Login credentials below ===");
        log.info("  ADMIN  : admin / admin123");
        log.info("  DOCTOR : doctor1 / doctor123");
        log.info("  CLERK  : clerk1 / clerk123");
        log.info("  LAB    : lab1 / lab123");
        log.info("  H2 console → http://localhost:8080/h2-console  JDBC URL: jdbc:h2:mem:hmsdb");
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        MedicalSection cardiology = medicalSectionRepository.findAll().stream()
                .filter(s -> s.getSectionName().equals("Cardiology"))
                .findFirst().orElseThrow();

        userRepository.save(createUser("Admin User", "admin",   "admin123",  Role.ADMIN,  null, null, null,        null));
        userRepository.save(createUser("Dr. Mehta",  "doctor1", "doctor123", Role.DOCTOR, 500.0, "9876500001", "drmetha@hms.in", cardiology));
        userRepository.save(createUser("Alice Roy",  "clerk1",  "clerk123",  Role.CLERK,  null, "9876500002", "alice@hms.in",   null));
        userRepository.save(createUser("Lab Tech",   "lab1",    "lab123",    Role.LAB,    null, "9876500003", "lab@hms.in",     null));
    }

    private User createUser(String fullName, String username, String rawPassword,
                             Role role, Double fee, String phone, String email, MedicalSection section) {
        User u = new User();
        u.setFullName(fullName);
        u.setUsername(username);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setRole(role);
        u.setIsActive(true);
        u.setConsultationFee(fee);
        u.setPhone(phone);
        u.setEmail(email);
        u.setSection(section);
        return u;
    }

    private void seedWards() {
        if (wardCategoryRepository.count() > 0) return;
        wardCategoryRepository.save(ward("GENERAL",   20, 20));
        wardCategoryRepository.save(ward("ICU",        5,  5));
        wardCategoryRepository.save(ward("MATERNITY", 10, 10));
    }

    private WardCategory ward(String name, int total, int available) {
        WardCategory w = new WardCategory();
        w.setCategoryName(name);
        w.setTotalBeds(total);
        w.setAvailableBeds(available);
        return w;
    }

    private void seedSections() {
        if (medicalSectionRepository.count() > 0) return;
        for (String name : new String[]{"Cardiology", "Neurology", "Orthopedics", "General"}) {
            MedicalSection s = new MedicalSection();
            s.setSectionName(name);
            medicalSectionRepository.save(s);
        }
    }

    private void seedTests() {
        if (testCatalogueRepository.count() > 0) return;
        Object[][] tests = {
            {"Complete Blood Count (CBC)",          150.00},
            {"Blood Glucose (Fasting)",              80.00},
            {"Blood Glucose (Post-Prandial)",        80.00},
            {"Lipid Profile",                       250.00},
            {"Liver Function Test (LFT)",           300.00},
            {"Kidney Function Test (KFT)",          300.00},
            {"Thyroid Function Test (TFT)",         350.00},
            {"Urine Routine & Microscopy",          100.00},
            {"Chest X-Ray",                         200.00},
            {"ECG (Electrocardiogram)",             150.00},
            {"Echocardiogram",                      800.00},
            {"Ultrasound Abdomen",                  500.00},
            {"MRI Brain",                          3000.00},
            {"CT Scan Chest",                      2500.00},
            {"HbA1c",                               200.00},
            {"Serum Electrolytes",                  200.00},
            {"Coagulation Profile (PT/APTT)",       250.00},
            {"Blood Culture & Sensitivity",         400.00},
            {"Urine Culture & Sensitivity",         350.00},
            {"COVID-19 RT-PCR",                     500.00},
        };
        for (Object[] row : tests) {
            TestCatalogue t = new TestCatalogue();
            t.setTestName((String) row[0]);
            t.setCost(java.math.BigDecimal.valueOf((Double) row[1]));
            t.setIsAvailable(true);
            testCatalogueRepository.save(t);
        }
    }

    private void seedEquipment() {
        if (equipmentCatalogueRepository.count() > 0) return;
        Object[][] equipment = {
            {"Ventilator (per day)",               1500.00},
            {"Cardiac Monitor (per day)",           500.00},
            {"Infusion Pump (per day)",             300.00},
            {"Pulse Oximeter (per day)",            100.00},
            {"Nebulizer (per session)",             150.00},
            {"Defibrillator (per use)",            1000.00},
            {"Suction Machine (per day)",           200.00},
            {"ECG Machine (per use)",               150.00},
            {"Dialysis Machine (per session)",     2500.00},
            {"Phototherapy Unit (per day)",         400.00},
            {"Oxygen Concentrator (per day)",       350.00},
            {"Surgical Lights (per hour)",          200.00},
            {"C-Arm Fluoroscopy (per use)",        1200.00},
            {"Endoscope (per procedure)",          1500.00},
            {"Laparoscopy Tower (per procedure)",  3000.00},
        };
        for (Object[] row : equipment) {
            EquipmentCatalogue e = new EquipmentCatalogue();
            e.setEquipmentName((String) row[0]);
            e.setCost(java.math.BigDecimal.valueOf((Double) row[1]));
            e.setIsActive(true);
            equipmentCatalogueRepository.save(e);
        }
    }

    private void seedResources() {
        if (resourceCatalogueRepository.count() > 0) return;
        Object[][] resources = {
            {"Surgical Gloves (pair)",               20.00},
            {"Sterile Gauze (pack)",                 30.00},
            {"IV Cannula",                           50.00},
            {"IV Fluid NS 500 ml",                   60.00},
            {"IV Fluid RL 500 ml",                   60.00},
            {"Syringe 5 ml",                         10.00},
            {"Syringe 10 ml",                        12.00},
            {"Urine Catheter (Foley)",               80.00},
            {"Nasogastric Tube",                     70.00},
            {"Oxygen Mask",                          50.00},
            {"Surgical Blade",                       25.00},
            {"Suture Pack (absorbable)",            120.00},
            {"Suture Pack (non-absorbable)",        100.00},
            {"Blood Collection Tube Set",            40.00},
            {"Wound Dressing Kit",                   90.00},
            {"Disposable Gown",                      35.00},
            {"Face Mask (N95)",                      40.00},
            {"Plaster of Paris (roll)",              80.00},
            {"Stool Bag (colostomy)",               150.00},
            {"Central Line Kit",                    500.00},
        };
        for (Object[] row : resources) {
            ResourceCatalogue r = new ResourceCatalogue();
            r.setResourceName((String) row[0]);
            r.setCostPerUnit(java.math.BigDecimal.valueOf((Double) row[1]));
            r.setIsActive(true);
            resourceCatalogueRepository.save(r);
        }
    }
}
