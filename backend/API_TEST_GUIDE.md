# HMS API Test Guide

Base URL: `http://localhost:8080/api/v1`

---

## Prerequisites

Start the app:
```bash
cd backend
mvn spring-boot:run -Pdev
```

H2 Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:hmsdb`
- User: `sa` | Password: *(leave blank)*

---

## 1. AUTH

### Login as CLERK
```
POST /auth/login
Content-Type: application/json

{
  "username": "clerk1",
  "password": "clerk123"
}
```
**Expected:** `200` — copy `token` from response.

### Login as DOCTOR
```
POST /auth/login
Content-Type: application/json

{
  "username": "doctor1",
  "password": "doctor123"
}
```

### Login as LAB
```
POST /auth/login
Content-Type: application/json

{
  "username": "lab1",
  "password": "lab123"
}
```

### Login as ADMIN
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <any_token>
```
**Expected:** `200` — stateless, client discards token.

---

## 2. LOOKUP

> All require CLERK token except catalogue endpoints which require LAB token.

### List medical sections
```
GET /medical-sections
Authorization: Bearer <clerk_token>
```

### List doctors (all)
```
GET /doctors
Authorization: Bearer <clerk_token>
```

### List doctors by section
```
GET /doctors?sectionId=1
Authorization: Bearer <clerk_token>
```

### List wards
```
GET /wards
Authorization: Bearer <clerk_token>
```

### List available tests (LAB)
```
GET /catalogue/tests
Authorization: Bearer <lab_token>
```

### List active equipment (LAB)
```
GET /catalogue/equipment
Authorization: Bearer <lab_token>
```

### List active resources (LAB)
```
GET /catalogue/resources
Authorization: Bearer <lab_token>
```

---

## 3. PATIENTS

### Register patient
```
POST /patients
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "firstName": "Ravi",
  "lastName": "Sharma",
  "phone": "9876543210",
  "address": "123 MG Road, Bengaluru",
  "gender": "MALE",
  "age": 45
}
```
**Expected:** `201` — note `patientId`.

### Get patient
```
GET /patients/{patientId}
Authorization: Bearer <clerk_token>
```
**Expected:** `200` — patient demographics + visit history.

### Validation failure (missing required field)
```
POST /patients
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "lastName": "Sharma",
  "phone": "9876543210",
  "gender": "MALE",
  "age": 45
}
```
**Expected:** `400` — missing `firstName`.

---

## 4. VISITS

### Create visit (INPATIENT)
```
POST /patients/{patientId}/visits
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "issue": "Chest pain",
  "doctorId": 2,
  "patientType": "INPATIENT",
  "wardCategoryId": 1
}
```
**Expected:** `201` — note `visitId`, status `ADMITTED`.

### Create visit (OUTPATIENT)
```
POST /patients/{patientId}/visits
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "issue": "Routine checkup",
  "doctorId": 2,
  "patientType": "OUTPATIENT"
}
```
**Expected:** `201` — `wardCategoryId` omitted for outpatient.

### Admit visit (ADMITTED → TREATMENT_IN_PROGRESS)
```
PATCH /visits/{visitId}/admit
Authorization: Bearer <clerk_token>
```
**Expected:** `200` — status `TREATMENT_IN_PROGRESS`.
**Verify in H2:** `WARD_CATEGORIES.AVAILABLE_BEDS` decremented by 1.

### Admit again (conflict check)
```
PATCH /visits/{visitId}/admit
Authorization: Bearer <clerk_token>
```
**Expected:** `409` — already in TREATMENT_IN_PROGRESS.

### Get visit
```
GET /visits/{visitId}
Authorization: Bearer <clerk_token>
```

---

## 5. DOCTOR

### Get own profile
```
GET /doctor/profile
Authorization: Bearer <doctor_token>
```

### Update profile
```
PUT /doctor/profile
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "phone": "9999999999",
  "email": "drmetha@hms.in",
  "consultationFee": 600.00
}
```

### Search patient (only TIP visits visible)
```
GET /doctor/patients/{patientId}
Authorization: Bearer <doctor_token>
```
**Expected:** `400` if patient has no active TIP visit.

### Upload prescription (PDF only, max 10 MB)
```
POST /visits/{visitId}/prescription
Authorization: Bearer <doctor_token>
Content-Type: multipart/form-data

file=<your_file.pdf>
```
**Expected:** `200` — `prescriptionUploadedAt` timestamp returned.

### Mark deceased
```
POST /visits/{visitId}/deceased
Authorization: Bearer <doctor_token>
Content-Type: multipart/form-data

causeOfDeath=Cardiac Arrest
timeOfDeath=14:30
dateOfDeath=2026-10-12
postMortemFile=<your_file.pdf>
```
**Expected:** `200` — status `DECEASED`.
**Verify in H2:** `WARD_CATEGORIES.AVAILABLE_BEDS` incremented back.

---

## 6. LAB

### Search patient (prescription gate)
```
GET /lab/patients/{patientId}
Authorization: Bearer <lab_token>
```
**Expected:** `canProceed: false` if prescription not uploaded, `true` after doctor uploads it.

### Save lab costs
```
POST /visits/{visitId}/costs
Authorization: Bearer <lab_token>
Content-Type: application/json

{
  "tests": [
    { "testId": 1, "quantity": 1 }
  ],
  "equipment": [
    { "equipmentId": 1, "quantity": 1 }
  ],
  "resources": [
    { "resourceId": 1, "quantityUsed": 2.0 }
  ]
}
```
**Expected:** `200` — `updatedTotalAmount` returned.
> Seed test/equipment/resource items via Admin endpoints first (see section 9).

### Upload test result (PDF only, max 10 MB)
```
POST /visits/{visitId}/test-result
Authorization: Bearer <lab_token>
Content-Type: multipart/form-data

file=<your_file.pdf>
```
**Expected:** `200`.

---

## 7. INVOICES

### Generate invoice (visit must be TREATMENT_IN_PROGRESS)
```
POST /visits/{visitId}/invoice
Authorization: Bearer <clerk_token>
```
**Expected:** `201` — `paymentStatus: PENDING`, cost breakdown returned.

### Generate invoice again (duplicate check)
```
POST /visits/{visitId}/invoice
Authorization: Bearer <clerk_token>
```
**Expected:** `409` — invoice already exists.

### Get invoice
```
GET /visits/{visitId}/invoice
Authorization: Bearer <clerk_token>
```

### Confirm payment (DISCHARGED)
```
PATCH /visits/{visitId}/invoice/pay
Authorization: Bearer <clerk_token>
```
**Expected:** `200` — `status: DISCHARGED`, `paymentStatus: PAID`, `dischargeTime` set.
**Verify in H2:** `WARD_CATEGORIES.AVAILABLE_BEDS` incremented back.

---

## 8. ADMIN — Personnel

### List doctors
```
GET /admin/personnel?role=DOCTOR
Authorization: Bearer <admin_token>
```

### List clerks
```
GET /admin/personnel?role=CLERK
Authorization: Bearer <admin_token>
```

### Get one personnel record
```
GET /admin/personnel/{userId}
Authorization: Bearer <admin_token>
```

### Update personnel
```
PUT /admin/personnel/{userId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "9111111111",
  "email": "updated@hms.in"
}
```

### Deactivate account
```
PATCH /admin/personnel/{userId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "isActive": false }
```
**Verify:** deactivated user login attempt should fail.

### Reactivate account
```
PATCH /admin/personnel/{userId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "isActive": true }
```

---

## 9. ADMIN — Catalogue

### Add test
```
POST /admin/catalogue/tests
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "testName": "Complete Blood Count", "cost": 450.00, "isAvailable": true }
```

### Update test
```
PUT /admin/catalogue/tests/{testId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "cost": 500.00, "isAvailable": true }
```

### Add equipment
```
POST /admin/catalogue/equipment
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "equipmentName": "ECG Machine", "cost": 800.00, "isActive": true }
```

### Add resource
```
POST /admin/catalogue/resources
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "resourceName": "IV Fluids", "costPerUnit": 150.00, "isActive": true }
```

---

## 10. ADMIN — Wards

### List wards
```
GET /admin/wards
Authorization: Bearer <admin_token>
```

### Update ward beds
```
PUT /admin/wards/{categoryId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "totalBeds": 30 }
```

### Reduce below occupied count (should fail)
```
PUT /admin/wards/{categoryId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "totalBeds": 0 }
```
**Expected:** `400` — cannot reduce below occupied bed count.

---

## 11. ADMIN — Seminars

### List seminars
```
GET /admin/seminars
Authorization: Bearer <admin_token>
```

### Add seminar
```
POST /admin/seminars
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "seminarName": "Cardiology Advances 2026",
  "seminarDate": "2026-11-15",
  "durationHours": 3.5,
  "hallNumber": "H-2"
}
```

### Update seminar
```
PUT /admin/seminars/{seminarId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "seminarName": "Cardiology Advances 2026 — Updated",
  "seminarDate": "2026-11-20",
  "durationHours": 4.0,
  "hallNumber": "H-3"
}
```

---

## 12. Role Enforcement

### CLERK hitting DOCTOR endpoint
```
GET /doctor/profile
Authorization: Bearer <clerk_token>
```
**Expected:** `403 Forbidden`.

### LAB hitting CLERK endpoint
```
POST /patients
Authorization: Bearer <lab_token>
Content-Type: application/json

{ "firstName": "Test", ... }
```
**Expected:** `403 Forbidden`.

### No token
```
GET /patients/1
```
**Expected:** `401 Unauthorized`.

---

## End-to-End Happy Path (run in order)

1. Login as ADMIN → seed catalogue items (tests, equipment, resources)
2. Login as CLERK → register patient → create INPATIENT visit → admit visit
3. Login as DOCTOR → upload prescription
4. Login as LAB → confirm `canProceed: true` → save lab costs
5. Login as CLERK → generate invoice → confirm payment
6. Verify in H2: visit `DISCHARGED`, `AVAILABLE_BEDS` restored, `VISIT_STATUS_LOG` has all transitions
