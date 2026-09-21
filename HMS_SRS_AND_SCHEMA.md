# Hospital Management System — SRS & Relational Database Schema

---

## Part 1: Software Requirements Specification (SRS)

---

### 1. Introduction

#### 1.1 Purpose

This document specifies the functional and non-functional requirements for a **Hospital Management System (HMS)**. It serves as the primary reference for system design, development, and testing, and establishes the complete relational database schema underlying the system.

#### 1.2 Scope

The HMS is a role-based web application supporting four user roles: **Admin**, **Doctor**, **Clerk**, and **Lab Personnel**. The system manages the full lifecycle of a patient visit — from registration and ward assignment through treatment, lab testing, invoicing, discharge, or, where applicable, death recording. It also supports administrative functions including personnel management, equipment catalogues, ward/bed configuration, and seminar scheduling.

#### 1.3 Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| HMS | Hospital Management System |
| Visit | A single episode of care for a patient |
| TIP | Treatment In Progress — a visit status |
| ICU | Intensive Care Unit |
| Inpatient | A patient admitted to a ward bed |
| Outpatient | A patient receiving treatment without a bed stay |
| Invoice | A PDF document itemising charges for a single visit |
| Ward Category | A classification of ward: General, ICU, or Maternity |

#### 1.4 Overview

- **Part 1** covers the full SRS: scope, user roles, functional requirements per role, and non-functional requirements.
- **Part 2** covers the normalised relational database schema: all entities, columns, data types, primary/foreign keys, and relationships.
- **Section 5** explains the visit status workflow in detail.

---

### 2. Overall Description

#### 2.1 Product Perspective

The HMS is a standalone, multi-user application backed by a relational database. It replaces manual, paper-based processes with a centralised digital system. Each user role sees a scoped interface; no role can access functionality outside its permission boundary.

#### 2.2 User Roles

| Role | Responsibility |
|------|---------------|
| **Admin** | System-wide configuration: personnel, wards, equipment, seminars |
| **Doctor** | Patient treatment management, prescriptions, recommendations, death recording |
| **Clerk** | Patient registration, visit creation, ward assignment, invoicing, payment confirmation |
| **Lab Personnel** | Recording test and equipment usage, uploading lab files per visit |

#### 2.3 Operating Environment

- Multi-user concurrent access via web browser.
- Persistent relational database backend.
- File storage for PDFs (invoices), prescriptions, and lab result uploads.
- Real-time ward bed count reflecting current occupancy.

#### 2.4 Assumptions and Dependencies

- Each visit is independent; patient history is visible but each visit's data is isolated.
- A doctor belongs to exactly one medical section.
- Ward bed counts are managed at the category level (General, ICU, Maternity).
- All cost figures (tests, equipment, doctor fees) are stored in the database and do not require manual entry at invoice time.
- File uploads are stored server-side; the database stores file paths/references.

---

### 3. Functional Requirements

---

#### 3.1 Authentication (All Roles)

| ID | Requirement |
|----|-------------|
| AUTH-01 | All users must log in with a username and password. |
| AUTH-02 | The system enforces role-based access; users can only access screens assigned to their role. |
| AUTH-03 | Sessions expire after a configurable idle timeout. |
| AUTH-04 | Passwords are stored as secure hashes (never plaintext). |

---

#### 3.2 Clerk Functionalities

##### 3.2.1 Patient Registration

| ID | Requirement |
|----|-------------|
| CLK-01 | The clerk can register a new patient by entering: first name, last name, phone number, address, gender (Male / Female / Other), and age. |
| CLK-02 | On successful registration, the system automatically generates a unique, sequential patient ID. |
| CLK-03 | The clerk can search for an existing patient by patient ID. |

##### 3.2.2 Existing Patient Page

| ID | Requirement |
|----|-------------|
| CLK-04 | Accessing a patient (new or existing) opens a two-tab page: **History** and **Manage Visit**. |
| CLK-05 | The **History** tab displays all past visits in descending date order, showing: issue description, assigned doctor, entry time, discharge time, amount paid, invoice reference, and visit status. |

##### 3.2.3 Manage Visit Tab

| ID | Requirement |
|----|-------------|
| CLK-06 | The clerk enters the current issue (chief complaint). |
| CLK-07 | The clerk selects a **medical section** from a predefined list. |
| CLK-08 | The clerk selects a **doctor** filtered by the chosen section and by the doctor's availability at a selected time slot. |
| CLK-09 | The clerk selects a **ward**, specifying patient type (Inpatient / Outpatient) and ward category (General / ICU / Maternity). Ward selection is only applicable for inpatients. |
| CLK-10 | Clicking **Admit / Start Treatment** sets the visit status to `TREATMENT_IN_PROGRESS` and decrements the available bed count for the assigned ward category. |
| CLK-11 | A **Generate Invoice** button is enabled only when the visit status is `TREATMENT_IN_PROGRESS`. Clicking it compiles charges — doctor's consultation fee, sum of lab test costs, sum of equipment costs, and ward charges — into a PDF invoice stored against the visit. |
| CLK-12 | A **Payment Successful** button, enabled only after an invoice has been generated, sets the visit status to `DISCHARGED`, records the discharge timestamp, and increments the available bed count for the assigned ward category. |
| CLK-13 | All data created in the Manage Visit tab is scoped to the current visit, not the patient's entire record. |

---

#### 3.3 Lab Personnel Functionalities

| ID | Requirement |
|----|-------------|
| LAB-01 | Lab personnel can search for a patient by patient ID. |
| LAB-02 | Access to add lab data is restricted to visits whose status is `TREATMENT_IN_PROGRESS`. |
| LAB-03 | The patient profile page displays: patient name, age, and the assigned doctor's name. |
| LAB-04 | A **Proceed** button opens the cost entry page with two sections: **Add Test** (select from predefined test catalogue with associated cost) and **Add Equipment** (select from predefined equipment catalogue with associated cost). Multiple tests and equipment items can be added. |
| LAB-05 | A second **Proceed** button opens the file upload page requiring two mandatory uploads: (a) the **test result file** and (b) the **doctor's prescription file**. |
| LAB-06 | A **Finish** button saves all tests, equipment entries, and uploaded files against the current visit. |

---

#### 3.4 Doctor Functionalities

##### 3.4.1 Dashboard

| ID | Requirement |
|----|-------------|
| DOC-01 | The doctor's dashboard has two sections: **Personal Profile** and **Manage Patients**. |
| DOC-02 | The personal profile section displays the doctor's own details (name, phone, email, medical section, fee) and allows the doctor to edit them. Changes are persisted and reflected in doctor search results. |

##### 3.4.2 Manage Patients

| ID | Requirement |
|----|-------------|
| DOC-03 | The doctor searches for a patient by patient ID. |
| DOC-04 | Patient access is restricted to visits whose status is `TREATMENT_IN_PROGRESS`. |
| DOC-05 | The doctor can upload a **prescription file** for the current visit. |
| DOC-06 | The doctor can **recommend another doctor** by searching for a medical field, selecting a doctor, and optionally adding notes. The recommendation is saved against the current visit. |
| DOC-07 | The doctor can set an **expected discharge date** for the current visit. |
| DOC-08 | The doctor can mark a visit status as **Deceased**. This action: (a) opens a mandatory form capturing cause of death, time of death, date of death, and post-mortem result or report, (b) saves all death details into a dedicated death records table linked to the visit, (c) sets visit status to `DECEASED`, and (d) increments the available bed count for the assigned ward category. |

---

#### 3.5 Admin Functionalities

##### 3.5.1 Manage Personnel

| ID | Requirement |
|----|-------------|
| ADM-01 | Admin has full view and edit access to all clerk, doctor, and lab personnel records. |
| ADM-02 | Doctor records include: medical section and fee structure (consultation fee), so that doctor search results elsewhere display correct fields. |
| ADM-03 | Admin can activate or deactivate any personnel account. |

##### 3.5.2 Manage Equipment

| ID | Requirement |
|----|-------------|
| ADM-04 | Admin can add new equipment entries with a name and associated cost to the equipment catalogue. |
| ADM-05 | Admin can modify the name or cost of an existing equipment entry. |
| ADM-06 | Admin can delete (or deactivate) an equipment entry. |

##### 3.5.3 Manage Wards / Rooms

| ID | Requirement |
|----|-------------|
| ADM-07 | Admin can view and configure the total bed count for each ward category (General, ICU, Maternity). |
| ADM-08 | Available beds per ward category update in real time: decremented when a clerk assigns a ward to an inpatient visit, incremented when a visit is discharged or marked deceased. |
| ADM-09 | The admin dashboard displays current total and available beds per category. |

##### 3.5.4 Manage Seminars

| ID | Requirement |
|----|-------------|
| ADM-10 | Admin can add a new seminar by specifying: seminar name, date, duration (in hours), and hall number. |
| ADM-11 | Admin can view and edit existing seminars. |

---

### 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Security | Role-based access control enforced on every API endpoint and UI route. |
| NFR-02 | Security | Passwords stored using a strong adaptive hash (e.g. bcrypt). |
| NFR-03 | Security | All user actions are timestamped and associated with the acting user's ID (audit trail). |
| NFR-04 | Security | File uploads validated for type and size; stored outside the web root. |
| NFR-05 | Performance | Patient search by ID returns results within 1 second under normal load. |
| NFR-06 | Performance | Ward bed count updates are atomic (transactional) to prevent double-allocation. |
| NFR-07 | Performance | Invoice PDF generation completes within 5 seconds. |
| NFR-08 | Reliability | The system must maintain data consistency during concurrent ward assignments (serialisable or select-for-update). |
| NFR-09 | Reliability | Database backups run at minimum once per day. |
| NFR-10 | Scalability | The system supports at least 50 concurrent users without degradation. |
| NFR-11 | Usability | Each role's interface presents only the sections and actions relevant to that role. |
| NFR-12 | Auditability | Every status change on a visit (admitted → TIP → discharged/deceased) is logged with a timestamp and the acting user. |
| NFR-13 | Availability | Target uptime of 99.5% during operational hours. |
| NFR-14 | Data Integrity | Foreign key constraints enforced at the database level to prevent orphan records. |

---

### 5. Visit Status Workflow

```
  [Visit Created by Clerk]
          │
          ▼
      ADMITTED
  (Issue, section,
   doctor & ward
   selected but not
   yet confirmed)
          │
          │ Clerk clicks
          │ "Admit / Start Treatment"
          │ (doctor + ward assigned,
          │  bed count decremented)
          ▼
  TREATMENT_IN_PROGRESS ◄──────────────────────┐
          │                                     │
          │                              (Lab adds tests,
          │                               equipment, files;
          │                               Doctor adds prescription,
          │                               recommendations,
          │                               expected discharge date)
          │
     ┌────┴────────────────────────┐
     │                             │
     │ Doctor marks                │ Clerk generates invoice,
     │ "Deceased"                  │ then clicks "Payment Successful"
     │                             │
     ▼                             ▼
  DECEASED                     DISCHARGED
  (Death form                  (Discharge time
   saved; bed                   recorded; bed
   count restored)              count restored)
```

**State Transition Rules:**

| From State | To State | Actor | Trigger | Side Effects |
|------------|----------|-------|---------|--------------|
| *(new)* | `ADMITTED` | Clerk | Saves visit form (issue, section, doctor, ward selected) | — |
| `ADMITTED` | `TREATMENT_IN_PROGRESS` | Clerk | Clicks "Admit / Start Treatment" | `ward_categories.available_beds − 1` |
| `TREATMENT_IN_PROGRESS` | `DISCHARGED` | Clerk | Invoice generated + "Payment Successful" clicked | `visits.discharge_time` set; `ward_categories.available_beds + 1` |
| `TREATMENT_IN_PROGRESS` | `DECEASED` | Doctor | "Mark as Deceased" + death form submitted | `death_records` row inserted; `ward_categories.available_beds + 1` |

**Constraints:**
- Lab personnel can only add data to `TREATMENT_IN_PROGRESS` visits.
- Doctors can only view/edit `TREATMENT_IN_PROGRESS` visits.
- Invoice generation is disabled unless status is `TREATMENT_IN_PROGRESS`.
- A visit cannot revert to a prior state once advanced.

---
---

## Part 2: Relational Database Schema

---

### Schema Overview

```
users
  └── admins
  └── doctors        ── medical_sections
  └── clerks
  └── lab_personnel

patients (registered by clerks)
  └── visits
        ├── ward_beds ── ward_categories
        ├── doctor_time_slots
        ├── visit_tests    ── test_catalog
        ├── visit_equipment ── equipment_catalog
        ├── lab_reports
        ├── doctor_prescriptions
        ├── doctor_recommendations ── medical_sections
        ├── invoices
        └── death_records

seminars (managed by admins)
```

---

### 2.1 `users`

Central authentication table. Each role has a corresponding profile table linked via `user_id`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `SERIAL` | **PK** | Auto-incremented unique ID |
| `username` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Login username |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hash of password |
| `role` | `ENUM('admin','doctor','clerk','lab')` | `NOT NULL` | Determines which profile table applies |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Admin can deactivate accounts |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | Account creation timestamp |
| `last_login` | `TIMESTAMP` | `NULLABLE` | Updated on each successful login |

---

### 2.2 `admins`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `admin_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | One-to-one with users |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |

---

### 2.3 `medical_sections`

Predefined list of hospital departments (e.g. Cardiology, Neurology, Orthopaedics).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `section_id` | `SERIAL` | **PK** | |
| `section_name` | `VARCHAR(150)` | `NOT NULL UNIQUE` | E.g. "Cardiology", "Neurology" |
| `description` | `TEXT` | `NULLABLE` | Optional notes about the section |

---

### 2.4 `doctors`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `doctor_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |
| `section_id` | `INT` | **FK → medical_sections(section_id)** `NOT NULL` | Doctor's department |
| `consultation_fee` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Fixed fee used in invoice calculation |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | General availability flag; slot-level availability in `doctor_time_slots` |

---

### 2.5 `doctor_time_slots`

Defines weekly recurring availability windows per doctor.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `slot_id` | `SERIAL` | **PK** | |
| `doctor_id` | `INT` | **FK → doctors(doctor_id)** `NOT NULL` | |
| `day_of_week` | `ENUM('MON','TUE','WED','THU','FRI','SAT','SUN')` | `NOT NULL` | |
| `start_time` | `TIME` | `NOT NULL` | Slot start |
| `end_time` | `TIME` | `NOT NULL` | Slot end |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Allows ad-hoc blocking of a slot |

**Index:** `(doctor_id, day_of_week, is_available)` for fast clerk-side filtering.

---

### 2.6 `clerks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `clerk_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |

---

### 2.7 `lab_personnel`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `lab_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |

---

### 2.8 `patients`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `patient_id` | `SERIAL` | **PK** | System-generated unique patient identifier |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `address` | `TEXT` | `NOT NULL` | |
| `gender` | `ENUM('MALE','FEMALE','OTHER')` | `NOT NULL` | |
| `age` | `SMALLINT` | `NOT NULL CHECK (age > 0)` | Age at time of registration |
| `registered_by` | `INT` | **FK → clerks(clerk_id)** `NOT NULL` | Clerk who registered the patient |
| `registered_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.9 `ward_categories`

Tracks bed availability at the category level. The `available_beds` column is updated atomically on each ward assignment, discharge, or death.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `category_id` | `SERIAL` | **PK** | |
| `category_name` | `ENUM('GENERAL','ICU','MATERNITY')` | `NOT NULL UNIQUE` | |
| `total_beds` | `INT` | `NOT NULL CHECK (total_beds >= 0)` | Configured by admin |
| `available_beds` | `INT` | `NOT NULL CHECK (available_beds >= 0)` | Real-time count; must not exceed total_beds |

**Constraint:** `available_beds <= total_beds` enforced via check constraint or trigger.

---

### 2.10 `ward_beds`

Individual bed records within a ward category for precise occupancy tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `bed_id` | `SERIAL` | **PK** | |
| `category_id` | `INT` | **FK → ward_categories(category_id)** `NOT NULL` | |
| `ward_number` | `VARCHAR(20)` | `NOT NULL` | E.g. "G-Block", "ICU-2" |
| `bed_number` | `VARCHAR(20)` | `NOT NULL` | E.g. "G-101", "ICU-205" |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | False when assigned to an active visit |

**Unique constraint:** `(category_id, ward_number, bed_number)`.

---

### 2.11 `test_catalog`

Predefined list of lab tests managed by admin.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `test_id` | `SERIAL` | **PK** | |
| `test_name` | `VARCHAR(200)` | `NOT NULL UNIQUE` | E.g. "Complete Blood Count" |
| `cost` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost >= 0)` | Unit cost of the test |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Soft delete; inactive tests hidden from selection |

---

### 2.12 `equipment_catalog`

Predefined list of equipment managed by admin.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `equipment_id` | `SERIAL` | **PK** | |
| `equipment_name` | `VARCHAR(200)` | `NOT NULL UNIQUE` | E.g. "Ventilator", "ECG Machine" |
| `cost` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost >= 0)` | Per-use cost |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Soft delete |

---

### 2.13 `visits`

Central table representing a single episode of care. All clinical, financial, and lab data is scoped to a visit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_id` | `SERIAL` | **PK** | |
| `patient_id` | `INT` | **FK → patients(patient_id)** `NOT NULL` | |
| `issue` | `TEXT` | `NOT NULL` | Chief complaint entered by clerk |
| `section_id` | `INT` | **FK → medical_sections(section_id)** `NOT NULL` | Selected medical section |
| `doctor_id` | `INT` | **FK → doctors(doctor_id)** `NOT NULL` | Assigned doctor |
| `slot_id` | `INT` | **FK → doctor_time_slots(slot_id)** `NULLABLE` | Chosen appointment slot |
| `patient_type` | `ENUM('INPATIENT','OUTPATIENT')` | `NOT NULL` | |
| `bed_id` | `INT` | **FK → ward_beds(bed_id)** `NULLABLE` | Null for outpatients |
| `status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | `NOT NULL DEFAULT 'ADMITTED'` | Current visit state |
| `entry_time` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | When visit was created |
| `expected_discharge_date` | `DATE` | `NULLABLE` | Set by doctor |
| `discharge_time` | `TIMESTAMP` | `NULLABLE` | Set on DISCHARGED status |
| `assigned_by` | `INT` | **FK → clerks(clerk_id)** `NOT NULL` | Clerk who created the visit |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

**Index:** `(patient_id, status)` for fast lookup of active visits.

---

### 2.14 `visit_tests`

Records which tests were applied during a visit (many-to-many between visits and test_catalog).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_test_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL` | |
| `test_id` | `INT` | **FK → test_catalog(test_id)** `NOT NULL` | |
| `added_by` | `INT` | **FK → lab_personnel(lab_id)** `NOT NULL` | |
| `added_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.15 `visit_equipment`

Records which equipment items were used during a visit (many-to-many between visits and equipment_catalog).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_equipment_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL` | |
| `equipment_id` | `INT` | **FK → equipment_catalog(equipment_id)** `NOT NULL` | |
| `quantity` | `INT` | `NOT NULL DEFAULT 1 CHECK (quantity > 0)` | Number of units used |
| `added_by` | `INT` | **FK → lab_personnel(lab_id)** `NOT NULL` | |
| `added_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.16 `lab_reports`

Stores the mandatory file uploads made by lab personnel per visit (one upload session per visit).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `report_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL UNIQUE` | One report record per visit |
| `test_result_file` | `VARCHAR(500)` | `NOT NULL` | Server-side file path for test results |
| `prescription_file` | `VARCHAR(500)` | `NOT NULL` | Server-side file path for doctor prescription received by lab |
| `uploaded_by` | `INT` | **FK → lab_personnel(lab_id)** `NOT NULL` | |
| `uploaded_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.17 `doctor_prescriptions`

Prescriptions uploaded directly by the doctor for a visit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `prescription_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL` | Multiple uploads allowed per visit |
| `file_path` | `VARCHAR(500)` | `NOT NULL` | Server-side file path |
| `uploaded_by` | `INT` | **FK → doctors(doctor_id)** `NOT NULL` | |
| `uploaded_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.18 `doctor_recommendations`

Captures a doctor's recommendation to consult a specialist in another section, scoped to a visit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `recommendation_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL` | |
| `recommending_doctor_id` | `INT` | **FK → doctors(doctor_id)** `NOT NULL` | Doctor making the recommendation |
| `recommended_section_id` | `INT` | **FK → medical_sections(section_id)** `NOT NULL` | Target medical field |
| `recommended_doctor_id` | `INT` | **FK → doctors(doctor_id)** `NULLABLE` | Specific doctor recommended, if selected |
| `notes` | `TEXT` | `NULLABLE` | Additional notes |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.19 `invoices`

One invoice per visit, generated by the clerk. Stores a breakdown of all charges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `invoice_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL UNIQUE` | One invoice per visit |
| `doctor_fee` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | From `doctors.consultation_fee` at generation time |
| `lab_test_cost` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Sum of all `visit_tests` costs |
| `equipment_cost` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Sum of all `visit_equipment` costs × quantities |
| `ward_charges` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Calculated from ward category + duration |
| `total_amount` | `DECIMAL(10,2)` | `NOT NULL` | `doctor_fee + lab_test_cost + equipment_cost + ward_charges` |
| `pdf_path` | `VARCHAR(500)` | `NULLABLE` | Generated PDF file path |
| `generated_by` | `INT` | **FK → clerks(clerk_id)** `NOT NULL` | |
| `generated_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |
| `payment_status` | `ENUM('PENDING','PAID')` | `NOT NULL DEFAULT 'PENDING'` | Updated when clerk clicks "Payment Successful" |
| `payment_confirmed_at` | `TIMESTAMP` | `NULLABLE` | Set when status moves to PAID |

---

### 2.20 `death_records`

Mandatory form data captured when a doctor marks a visit as `DECEASED`. One record per deceased visit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `death_record_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL UNIQUE` | One record per deceased visit |
| `cause_of_death` | `TEXT` | `NOT NULL` | |
| `time_of_death` | `TIME` | `NOT NULL` | |
| `date_of_death` | `DATE` | `NOT NULL` | |
| `post_mortem_result` | `TEXT` | `NULLABLE` | Post-mortem findings or report reference |
| `post_mortem_file` | `VARCHAR(500)` | `NULLABLE` | Optional file upload |
| `recorded_by` | `INT` | **FK → doctors(doctor_id)** `NOT NULL` | Doctor who recorded the death |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

---

### 2.21 `seminars`

Managed by admin only.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `seminar_id` | `SERIAL` | **PK** | |
| `seminar_name` | `VARCHAR(255)` | `NOT NULL` | |
| `seminar_date` | `DATE` | `NOT NULL` | |
| `duration_hours` | `DECIMAL(5,2)` | `NOT NULL CHECK (duration_hours > 0)` | Duration in hours (e.g. 1.5 for 90 minutes) |
| `hall_number` | `VARCHAR(50)` | `NOT NULL` | |
| `created_by` | `INT` | **FK → admins(admin_id)** `NOT NULL` | |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Set on edit |

---

### 2.22 `visit_status_log` *(Audit Table)*

Immutable audit trail of every status transition on every visit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `log_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL` | |
| `from_status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | `NULLABLE` | Null for initial status |
| `to_status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | `NOT NULL` | |
| `changed_by_user_id` | `INT` | **FK → users(user_id)** `NOT NULL` | |
| `changed_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |
| `notes` | `TEXT` | `NULLABLE` | E.g. reason for status change |

---

### 3. Entity Relationship Summary

```
users ──────────────────────────────────────────────────────┐
  │  (role = 'doctor')                                       │
  ├──► doctors ──── medical_sections ◄─── doctor_recommendations
  │      │                │
  │      │                └─── visits.section_id
  │      │
  │      └──► doctor_time_slots ◄─── visits.slot_id
  │      └──► doctor_prescriptions ◄─── visits
  │      └──► doctor_recommendations (recommending_doctor_id)
  │      └──► death_records ◄─── visits
  │
  │  (role = 'clerk')
  ├──► clerks ──► patients ──► visits ──────────────────────────┐
  │               │             │                               │
  │               │             ├──► visit_tests ── test_catalog │
  │               │             ├──► visit_equipment ─ equipment │
  │               │             ├──► lab_reports               │
  │               │             ├──► invoices                  │
  │               │             ├──► doctor_prescriptions       │
  │               │             ├──► doctor_recommendations     │
  │               │             ├──► death_records              │
  │               │             ├──► visit_status_log          │
  │               │             └──► ward_beds ─ ward_categories│
  │               └─── (registered_by → clerks)                │
  │                                                             │
  │  (role = 'lab')                                             │
  ├──► lab_personnel ──► visit_tests, visit_equipment, lab_reports
  │
  │  (role = 'admin')
  └──► admins ──► seminars
```

---

### 4. Key Relationships at a Glance

| Relationship | Type | Notes |
|---|---|---|
| `users` → `doctors` | 1:1 | A user with role='doctor' has exactly one doctors row |
| `users` → `clerks` | 1:1 | |
| `users` → `lab_personnel` | 1:1 | |
| `users` → `admins` | 1:1 | |
| `doctors` → `medical_sections` | N:1 | Each doctor belongs to one section |
| `patients` → `visits` | 1:N | A patient can have many visits over time |
| `visits` → `ward_beds` | N:1 | One bed per inpatient visit; null for outpatients |
| `ward_beds` → `ward_categories` | N:1 | Many beds per category |
| `visits` → `visit_tests` | 1:N | Multiple tests per visit |
| `visits` → `visit_equipment` | 1:N | Multiple equipment items per visit |
| `visits` → `invoices` | 1:1 | One invoice per visit |
| `visits` → `death_records` | 1:1 | Only for DECEASED visits |
| `visits` → `lab_reports` | 1:1 | One lab upload session per visit |
| `visits` → `doctor_recommendations` | 1:N | A doctor may make several recommendations |
| `visits` → `doctor_prescriptions` | 1:N | A doctor may upload multiple prescriptions |
| `admins` → `seminars` | 1:N | Admins create seminars |

---

### 5. Invoice Calculation Logic

When the clerk triggers **Generate Invoice** for a `TREATMENT_IN_PROGRESS` visit:

```
doctor_fee        = doctors.consultation_fee
                    WHERE doctors.doctor_id = visits.doctor_id

lab_test_cost     = SUM(test_catalog.cost)
                    FROM visit_tests
                    JOIN test_catalog USING (test_id)
                    WHERE visit_tests.visit_id = <current_visit>

equipment_cost    = SUM(equipment_catalog.cost * visit_equipment.quantity)
                    FROM visit_equipment
                    JOIN equipment_catalog USING (equipment_id)
                    WHERE visit_equipment.visit_id = <current_visit>

ward_charges      = calculated based on ward category rate × number of days
                    (rate table or fixed cost per category, to be configured
                     at application level or in a ward_rates config table)

total_amount      = doctor_fee + lab_test_cost + equipment_cost + ward_charges
```

All values are snapshotted into the `invoices` row at generation time so that subsequent changes to fee tables do not retroactively alter historical invoices.

---

### 6. Ward Bed Count Consistency

To prevent race conditions when multiple clerks assign beds simultaneously, ward bed allocation must use a **database-level transaction with a row lock**:

```sql
BEGIN;
SELECT available_beds FROM ward_categories
  WHERE category_id = <selected_category>
  FOR UPDATE;          -- row-level lock

-- if available_beds > 0:
UPDATE ward_beds SET is_available = FALSE WHERE bed_id = <chosen_bed>;
UPDATE ward_categories SET available_beds = available_beds - 1
  WHERE category_id = <selected_category>;
UPDATE visits SET status = 'TREATMENT_IN_PROGRESS', bed_id = <chosen_bed>
  WHERE visit_id = <current_visit>;

COMMIT;
```

On discharge or death, the reverse transaction runs:

```sql
BEGIN;
UPDATE ward_beds SET is_available = TRUE WHERE bed_id = <visit_bed_id>;
UPDATE ward_categories SET available_beds = available_beds + 1
  WHERE category_id = <bed_category>;
COMMIT;
```
