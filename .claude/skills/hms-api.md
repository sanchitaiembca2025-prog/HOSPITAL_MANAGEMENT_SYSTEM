# Skill: HMS API Design — Spring Boot + Hibernate/JPA + MySQL→PostgreSQL

## Trigger
Invoke when the user asks to:
- Generate, scaffold, or review any Spring Boot controller, service, repository, DTO, or entity for HMS
- Implement a specific API endpoint
- Check if a new endpoint fits the API design
- Generate request/response DTOs for any HMS operation
- Review security/role constraints on any endpoint

## Stack
- **Backend:** Java 17+, Spring Boot 3.x, Spring Security (JWT)
- **ORM:** Hibernate 6 + Spring Data JPA
- **DB (dev):** MySQL 8 → **(prod):** PostgreSQL 15+
- **Frontend:** React or Next.js (consumes JSON REST API)
- **File storage:** Server filesystem, paths stored in DB

---

## Project Package Structure

```
com.hms
├── controller         # @RestController — one per domain
├── service            # @Service — business logic, transactions
├── repository         # @Repository — JpaRepository extensions
├── entity             # @Entity — maps to DB tables
├── dto
│   ├── request        # Inbound payloads (@Valid annotated)
│   └── response       # Outbound payloads (never expose entity directly)
├── security           # JwtFilter, JwtUtil, UserDetailsServiceImpl
├── config             # SecurityConfig, CorsConfig, FileStorageConfig
├── exception          # GlobalExceptionHandler (@RestControllerAdvice)
└── enums              # Role, VisitStatus, PatientType, WardCategory, PaymentStatus
```

---

## Base URL

`/api/v1`

All endpoints require `Authorization: Bearer <jwt>` except `POST /api/v1/auth/login`.

---

## Roles & Spring Security

```java
// Roles map directly to DB users.role
enum Role { ADMIN, DOCTOR, CLERK, LAB }

// Secure controllers with:
@PreAuthorize("hasRole('CLERK')")
@PreAuthorize("hasAnyRole('CLERK','ADMIN')")
```

JWT payload: `{ sub: username, role: "CLERK", userId: 3, iat, exp }`

---

## Full API Reference

### AUTH

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login → returns JWT |
| POST | `/auth/logout` | Any | Invalidate session (stateless: client discards token) |

**POST /auth/login — Request**
```json
{ "username": "clerk01", "password": "secret" }
```
**Response 200**
```json
{ "token": "eyJ...", "role": "CLERK", "userId": 3, "name": "Alice Roy" }
```

---

### LOOKUP (shared, role-filtered at service layer)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/medical-sections` | CLERK | List all medical sections (for doctor filter dropdown) |
| GET | `/doctors?sectionId={id}` | CLERK | Doctors in a section (`is_available = true`) |
| GET | `/wards` | CLERK | Ward categories + available beds |
| GET | `/catalogue/tests` | LAB | Available tests (`is_available = true`) |
| GET | `/catalogue/equipment` | LAB | Active equipment (`is_active = true`) |
| GET | `/catalogue/resources` | LAB | Active resources (`is_active = true`) |

---

### PATIENTS — Clerk

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/patients` | CLERK | Register new patient |
| GET | `/patients/{patientId}` | CLERK, DOCTOR, LAB | Get patient demographics + visit history |

**POST /patients — Request**
```json
{
  "firstName": "Ravi",
  "lastName": "Sharma",
  "phone": "9876543210",
  "address": "123 MG Road, Bengaluru",
  "gender": "MALE",
  "age": 45
}
```
**Response 201**
```json
{ "patientId": 101, "message": "Patient registered successfully" }
```

**GET /patients/{patientId} — Response 200**
```json
{
  "patientId": 101,
  "firstName": "Ravi", "lastName": "Sharma",
  "phone": "9876543210", "address": "...", "gender": "MALE", "age": 45,
  "registeredAt": "2026-09-26T10:30:00",
  "visits": [
    {
      "visitId": 5,
      "issue": "Chest pain",
      "doctorName": "Dr. Mehta",
      "entryTime": "2026-09-26T11:00:00",
      "dischargeTime": null,
      "status": "TREATMENT_IN_PROGRESS",
      "invoiceId": null,
      "amountPaid": null
    }
  ]
}
```

---

### VISITS — Clerk

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/patients/{patientId}/visits` | CLERK | Create visit (status → ADMITTED) |
| PATCH | `/visits/{visitId}/admit` | CLERK | Start treatment (ADMITTED → TREATMENT_IN_PROGRESS) |
| GET | `/visits/{visitId}` | CLERK, DOCTOR, LAB | Get full visit detail |

**POST /patients/{patientId}/visits — Request**
```json
{
  "issue": "Chest pain",
  "doctorId": 7,
  "patientType": "INPATIENT",
  "wardCategoryId": 1
}
```
> `wardCategoryId` is null for OUTPATIENT.

**Response 201**
```json
{ "visitId": 5, "status": "ADMITTED" }
```

**PATCH /visits/{visitId}/admit — Request body: none**
- Service acquires `SELECT … FOR UPDATE` on `ward_categories`
- Checks `available_beds > 0`; decrements; sets status → `TREATMENT_IN_PROGRESS`

**Response 200**
```json
{ "visitId": 5, "status": "TREATMENT_IN_PROGRESS", "availableBeds": 12 }
```

---

### INVOICES — Clerk

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/visits/{visitId}/invoice` | CLERK | Generate invoice (visit must be TIP) |
| PATCH | `/visits/{visitId}/invoice/pay` | CLERK | Confirm payment → DISCHARGED |
| GET | `/visits/{visitId}/invoice` | CLERK | Get invoice detail |

**POST /visits/{visitId}/invoice — Response 201**
```json
{
  "invoiceId": 12,
  "doctorFee": 500.00,
  "testCost": 1200.00,
  "equipmentCost": 800.00,
  "resourceCost": 300.00,
  "totalAmount": 2800.00,
  "paymentStatus": "PENDING"
}
```

**PATCH /visits/{visitId}/invoice/pay — Response 200**
```json
{ "visitId": 5, "status": "DISCHARGED", "dischargeTime": "2026-09-27T14:00:00", "paymentStatus": "PAID" }
```

---

### DOCTOR

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/doctor/profile` | DOCTOR | Own profile |
| PUT | `/doctor/profile` | DOCTOR | Update phone / email / consultationFee |
| GET | `/doctor/patients/{patientId}` | DOCTOR | Search patient — only TIP visits visible |
| POST | `/visits/{visitId}/prescription` | DOCTOR | Upload prescription PDF |
| POST | `/visits/{visitId}/deceased` | DOCTOR | Mark deceased + death form + post-mortem file |

**PUT /doctor/profile — Request**
```json
{ "phone": "9999999999", "email": "drmetha@hms.in", "consultationFee": 600.00 }
```

**POST /visits/{visitId}/prescription — multipart/form-data**
```
field: file (PDF, max 10 MB)
```
**Response 200**
```json
{ "message": "Prescription uploaded", "prescriptionUploadedAt": "2026-09-26T12:00:00" }
```

**POST /visits/{visitId}/deceased — multipart/form-data**
```
field: causeOfDeath (text)
field: timeOfDeath  (HH:mm)
field: dateOfDeath  (YYYY-MM-DD)
field: postMortemFile (PDF, max 10 MB)
```
**Response 200**
```json
{ "visitId": 5, "status": "DECEASED" }
```
> Service increments `ward_categories.available_beds` within the same transaction.

---

### LAB PERSONNEL

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/lab/patients/{patientId}` | LAB | Search patient — TIP check + prescription gate |
| POST | `/visits/{visitId}/costs` | LAB | Save test/equipment/resource costs |
| POST | `/visits/{visitId}/test-result` | LAB | Upload test result PDF |

**GET /lab/patients/{patientId} — Response 200**
```json
{
  "patientId": 101,
  "name": "Ravi Sharma", "age": 45,
  "assignedDoctor": "Dr. Mehta",
  "visitId": 5,
  "prescriptionReady": true,
  "canProceed": true
}
```
> `canProceed: false` when visit is not TIP or prescription is null. Include a `gateMessage` field in that case.

**POST /visits/{visitId}/costs — Request**
```json
{
  "tests": [
    { "testId": 2, "quantity": 1 }
  ],
  "equipment": [
    { "equipmentId": 3, "quantity": 1 }
  ],
  "resources": [
    { "resourceId": 1, "quantityUsed": 2.0 }
  ]
}
```
> Service snapshots `cost_at_time` from catalogue within the same transaction. Updates `invoices.test_cost`, `equipment_cost`, `resource_cost`.

**Response 200**
```json
{ "message": "Lab costs saved", "updatedTotalAmount": 2800.00 }
```

**POST /visits/{visitId}/test-result — multipart/form-data**
```
field: file (PDF, max 10 MB)
```

---

### ADMIN — Personnel

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/personnel?role={DOCTOR\|CLERK\|LAB}` | ADMIN | List personnel by role |
| GET | `/admin/personnel/{userId}` | ADMIN | Get one personnel record |
| PUT | `/admin/personnel/{userId}` | ADMIN | Update personnel fields |
| PATCH | `/admin/personnel/{userId}/status` | ADMIN | Activate / deactivate account |

**PATCH /admin/personnel/{userId}/status — Request**
```json
{ "isActive": false }
```

---

### ADMIN — Catalogue

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/catalogue/tests` | ADMIN | List all tests |
| POST | `/admin/catalogue/tests` | ADMIN | Add test |
| PUT | `/admin/catalogue/tests/{testId}` | ADMIN | Update cost / availability |
| GET | `/admin/catalogue/equipment` | ADMIN | List all equipment |
| POST | `/admin/catalogue/equipment` | ADMIN | Add equipment |
| PUT | `/admin/catalogue/equipment/{id}` | ADMIN | Update |
| GET | `/admin/catalogue/resources` | ADMIN | List all resources |
| POST | `/admin/catalogue/resources` | ADMIN | Add resource |
| PUT | `/admin/catalogue/resources/{id}` | ADMIN | Update |

---

### ADMIN — Wards

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/wards` | ADMIN | List all ward categories with bed counts |
| PUT | `/admin/wards/{categoryId}` | ADMIN | Update total beds |

**PUT /admin/wards/{categoryId} — Request**
```json
{ "totalBeds": 30 }
```
> Service validates `totalBeds >= (totalBeds - availableBeds)` (i.e. cannot go below occupied count).

---

### ADMIN — Seminars

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/seminars` | ADMIN | List seminars (desc by date) |
| POST | `/admin/seminars` | ADMIN | Add seminar |
| PUT | `/admin/seminars/{seminarId}` | ADMIN | Update seminar |

**POST /admin/seminars — Request**
```json
{
  "seminarName": "Cardiology Advances 2026",
  "seminarDate": "2026-11-15",
  "durationHours": 3.5,
  "hallNumber": "H-2"
}
```

---

## Standard Error Response

All errors return:
```json
{
  "timestamp": "2026-09-26T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "No beds available in GENERAL ward",
  "path": "/api/v1/visits/5/admit"
}
```

| HTTP Status | When to use |
|-------------|-------------|
| 200 | Successful GET / PATCH |
| 201 | Successful POST (created) |
| 400 | Validation failure, business rule violation |
| 401 | Missing or invalid JWT |
| 403 | Role not permitted for this endpoint |
| 404 | Entity not found |
| 409 | Conflict (duplicate, status already advanced) |
| 500 | Unexpected server error |

---

## JPA / Hibernate Conventions

### Entity annotations
```java
@Entity
@Table(name = "visits")
public class Visit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus status;

    // Use @Column(columnDefinition = "TINYINT(1)") for MySQL booleans
}
```

### MySQL → PostgreSQL portability rules
- Use `GenerationType.IDENTITY` (works for both `AUTO_INCREMENT` and `SERIAL`)
- Use `@Enumerated(EnumType.STRING)` — MySQL ENUM and PostgreSQL CHECK/enum both work
- Avoid `@Column(columnDefinition = "...")` except for booleans; use `spring.jpa.properties.hibernate.dialect` in config
- Boolean columns: use `Boolean` Java type; Hibernate handles `TINYINT(1)` ↔ `BOOLEAN` via dialect
- `application-dev.properties`: `spring.datasource.url=jdbc:mysql://...`
- `application-prod.properties`: `spring.datasource.url=jdbc:postgresql://...`

### Transaction pattern for ward bed allocation
```java
@Transactional(isolation = Isolation.SERIALIZABLE) // or use pessimistic lock
public void admitPatient(Long visitId, Long actingUserId) {
    WardCategory ward = wardRepo.findByIdWithLock(wardCategoryId); // @Lock(PESSIMISTIC_WRITE)
    if (ward.getAvailableBeds() == 0) throw new NoBedAvailableException(...);
    ward.setAvailableBeds(ward.getAvailableBeds() - 1);
    // update visit status
    // append to visit_status_log
}
```

---

## Code Generation Instructions

When the user asks to generate code for an endpoint:

1. **Identify the endpoint** from the API reference above.
2. **Generate in this order:** Entity (if new) → DTO (Request + Response) → Repository → Service → Controller.
3. **DTO rules:**
   - Never return raw `@Entity` objects from controllers — always map to a Response DTO.
   - Use `record` types for immutable DTOs (Java 17+), or regular classes with Lombok `@Data`.
   - Validate request DTOs with `@Valid` + Bean Validation (`@NotBlank`, `@Positive`, `@Size`).
4. **Service rules:**
   - All business logic and DB writes in `@Transactional` methods.
   - Role guard checks (e.g. prescription gate, TIP status check) happen in the service layer, not the controller.
   - Throw typed exceptions (`VisitNotActiveException`, `PrescriptionMissingException`) — caught by `@RestControllerAdvice`.
5. **Controller rules:**
   - Thin controllers — call one service method, return ResponseEntity.
   - Annotate with `@PreAuthorize` matching the role column in the API table above.
   - File upload endpoints use `@RequestParam("file") MultipartFile file`.
6. **Repository rules:**
   - Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the ward bed fetch query.
   - Named queries for status-filtered lookups (e.g. `findByPatientIdAndStatus`).

---

## Visit Status Log

Every status transition **must** append a `VisitStatusLog` row **within the same transaction**:
```java
visitStatusLogRepo.save(new VisitStatusLog(
    visit, fromStatus, toStatus, actingUser, LocalDateTime.now()
));
```
This applies to: admit, discharge, death recording.

---

## File Upload Config

```java
@Value("${hms.file.storage-path}")
private String storagePath;

// Save file → return relative path stored in DB
// Reject if MIME type != application/pdf or size > 10 MB
```

Property key: `hms.file.storage-path` (never hard-coded).

---

## Arguments

$ARGUMENTS

If arguments are provided, use them to narrow the scope:
- A role name (e.g. "CLERK") → generate only endpoints for that role
- An endpoint path (e.g. "/visits/{visitId}/admit") → generate full stack for that endpoint
- "all" → generate the full project scaffold
- "review {endpoint}" → check the endpoint against the API design and flag any deviations
