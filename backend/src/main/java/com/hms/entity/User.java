package com.hms.entity;

import com.hms.enums.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean isActive = true;

    private String phone;
    private String email;

    /** Only relevant for DOCTOR role */
    private Double consultationFee;

    /** FK to medical_sections — only for DOCTOR */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private MedicalSection section;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public MedicalSection getSection() { return section; }
    public void setSection(MedicalSection section) { this.section = section; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
