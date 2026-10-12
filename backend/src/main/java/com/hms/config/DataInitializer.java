package com.hms.config;

import com.hms.entity.MedicalSection;
import com.hms.entity.User;
import com.hms.entity.WardCategory;
import com.hms.enums.Role;
import com.hms.repository.MedicalSectionRepository;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSections();
        seedWards();
        seedUsers();
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
}
