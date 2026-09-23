# Hospital Management System — SRS & Relational Database Schema (3NF-Normalised)

> **This document supersedes `HMS_SRS_AND_SCHEMA.md`.**
> Three changes were applied to bring the schema fully into Third Normal Form:
>
> | # | Table | Column removed / fixed | Reason |
> |---|-------|------------------------|--------|
> | 1 | `visits` | `section_id` **removed** | Transitive dependency: `visit_id → doctor_id → section_id`. Derive via `JOIN doctors`. |
> | 2 | `invoices` | `resource_cost` **split onto its own row** | Doc bug — `resource_cost` was accidentally merged onto the same line as another column. |
>
> All other deliberate denormalizations (invoice cost snapshots, stored `total_amount`, inline prescription / lab / death columns) are retained unchanged — they are design-justified, not accidents.

---

## Part 1: Software Requirements Specification (SRS)

---

### 1. Introduction

#### 1.1 Purpose

This document specifies the functional and non-functional requirements for a **Hospital Management System (HMS)**. It serves as the primary reference for system design, development, and testing, and establishes the complete relational database schema underlying the system.

#### 1.2 Scope

The HMS is a role-based web application supporting four user roles: **Admin**, **Doctor**, **Clerk**, and **Lab Personnel**. The system manages the full lifecycle of a patient visit — from registration and ward assignment through treatment, lab testing, invoicing, discharge, or, where applicable, death recording. It also supports administrative functions including personnel management, test/equipment/resource catalogues, ward/bed configuration, and seminar scheduling.

#### 1.3 Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| HMS | Hospital Management System |
| Visit | A single episode of care for a patient |
| TIP | Treatment In Progress — a visit status |
| ICU | Intensive Care Unit |
| Inpatient | A patient admitted to a ward bed |
| Outpatient | A patient receiving treatment without a bed stay |
| Invoice | An itemised set of charges for a single visit |
| Ward Category | A classification of ward: General, ICU, or Maternity |
| Resource | A consumable hospital supply (e.g. Blood, Oxygen, IV Fluids) |

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
| **Admin** | System-wide configuration: personnel, wards, tests, equipment, resources, seminars |
| **Doctor** | Patient treatment management, prescriptions, death recording |
| **Clerk** | Patient registration, visit creation, doctor & ward assignment, invoicing, payment confirmation |
| **Lab Personnel** | Recording test, equipment, and resource usage, uploading lab files per visit |

#### 2.3 Operating Environment

- Multi-user concurrent access via web browser.
- Persistent relational database backend.
- File storage for PDFs (invoices), prescriptions, and lab result uploads.
- Real-time ward bed count reflecting current occupancy.
- Real-time availability tracking for equipment and consumable resources.

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
| CLK-07 | The clerk selects a **medical section** from a predefined list. This selection is used only to filter the doctor list (CLK-08); the section is not stored on the visit row — it is derived from the assigned doctor's `section_id`. |
| CLK-08 | The clerk selects a **doctor** filtered by the chosen medical section. No appointment time slots are involved; the doctor is simply associated with the visit at creation time. |
| CLK-09 | The clerk selects a **ward**, specifying patient type (Inpatient / Outpatient) and ward category (General / ICU / Maternity). Ward selection is only applicable for inpatients. |
| CLK-10 | Clicking **Admit / Start Treatment** sets the visit status to `TREATMENT_IN_PROGRESS` and decrements the available bed count for the assigned ward category. |
| CLK-11 | A **Generate Invoice** button is enabled only when the visit status is `TREATMENT_IN_PROGRESS`. Clicking it compiles charges — doctor's consultation fee, sum of lab test costs, sum of equipment costs, and sum of resource costs — into an invoice stored against the visit. The total amount is computed from these component values and is not stored separately. |
| CLK-12 | A **Payment Successful** button, enabled only after an invoice has been generated, sets the visit status to `DISCHARGED`, records the discharge timestamp, and increments the available bed count for the assigned ward category. |
| CLK-13 | All data created in the Manage Visit tab is scoped to the current visit, not the patient's entire record. |

---

#### 3.3 Lab Personnel Functionalities

| ID | Requirement |
|----|-------------|
| LAB-01 | Lab personnel search for a patient by patient ID. |
| LAB-02 | The system checks that the visit status is `TREATMENT_IN_PROGRESS`. If the visit is in any other state the page is read-only and no data entry is permitted. |
| LAB-03 | The system checks that the assigned doctor has already uploaded a prescription (`visits.prescription_file` is non-null). If the prescription is not yet uploaded, lab personnel are shown a message indicating that they must wait for the doctor to upload it before proceeding. |
| LAB-04 | Once the prescription check passes, the patient profile page displays: patient name, age, and the assigned doctor's name. A **Proceed** button opens the cost entry page with three sections: **Add Test**, **Add Equipment**, and **Add Resource**. Each section presents a dropdown of fixed enum values; selecting an item automatically populates its predetermined cost from the catalogue. Multiple items of each kind can be added. |
| LAB-05 | A **Save** button saves all added tests, equipment, and resource entries against the current visit. The costs are immediately attached to the visit's invoice record (`visit_tests`, `visit_equipment`, `visit_resources` junction rows are written; `invoices.test_cost`, `equipment_cost`, `resource_cost` are updated). |
| LAB-06 | The test result file is uploaded separately at a later time. Lab personnel can return to the visit (provided it is still `TREATMENT_IN_PROGRESS`) and upload the test result file (`visits.test_result_file`) independently of the cost entry step. |

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
| DOC-06 | The doctor can mark a visit status as **Deceased**. This action: (a) opens a mandatory form capturing cause of death, time of death, date of death, and an uploaded post-mortem report file, (b) saves all death details inline on the visit row, (c) sets visit status to `DECEASED`, and (d) increments the available bed count for the assigned ward category. |

---

#### 3.5 Admin Functionalities

##### 3.5.1 Manage Personnel

| ID | Requirement |
|----|-------------|
| ADM-01 | Admin has full view and edit access to all clerk, doctor, and lab personnel records. |
| ADM-02 | Doctor records include: medical section and fee structure (consultation fee), so that doctor search results elsewhere display correct fields. |
| ADM-03 | Admin can activate or deactivate any personnel account. |

##### 3.5.2 Manage Tests, Equipment & Resources

| ID | Requirement |
|----|-------------|
| ADM-04 | Admin can add new **test** entries with a name and associated cost to the test catalogue, and mark their availability. |
| ADM-05 | Admin can add new **equipment** entries with a name, cost, and total/available quantity to the equipment catalogue. |
| ADM-06 | Admin can add new **resource** entries (e.g. Blood, Oxygen, IV Fluids) with a name, unit, cost per unit, and available quantity. |
| ADM-07 | Admin can modify or deactivate any test, equipment, or resource entry. |

##### 3.5.3 Manage Wards / Rooms

| ID | Requirement |
|----|-------------|
| ADM-08 | Admin can view and configure the total bed count for each ward category (General, ICU, Maternity). |
| ADM-09 | Available beds per ward category update in real time: decremented when a clerk assigns a ward to an inpatient visit, incremented when a visit is discharged or marked deceased. |
| ADM-10 | The admin dashboard displays current total and available beds per category. |

##### 3.5.4 Manage Seminars

| ID | Requirement |
|----|-------------|
| ADM-11 | Admin can add a new seminar by specifying: seminar name, date, duration (in hours), and hall number. |
| ADM-12 | Admin can view and edit existing seminars. |

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
| NFR-07 | Performance | Invoice generation completes within 5 seconds. |
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
  (Issue, doctor &
   ward selected but
   not yet confirmed)
          │
          │ Clerk clicks
          │ "Admit / Start Treatment"
          │ (doctor + ward assigned,
          │  bed count decremented)
          ▼
  TREATMENT_IN_PROGRESS ◄──────────────────────┐
          │                                     │
          │                              (Lab adds tests,
          │                               equipment, resources,
          │                               files; Doctor adds
          │                               prescription)
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
| *(new)* | `ADMITTED` | Clerk | Saves visit form (issue, doctor, ward selected) | — |
| `ADMITTED` | `TREATMENT_IN_PROGRESS` | Clerk | Clicks "Admit / Start Treatment" | `ward_categories.available_beds − 1` |
| `TREATMENT_IN_PROGRESS` | `DISCHARGED` | Clerk | Invoice generated + "Payment Successful" clicked | `visits.discharge_time` set; `ward_categories.available_beds + 1` |
| `TREATMENT_IN_PROGRESS` | `DECEASED` | Doctor | "Mark as Deceased" + death form submitted | Death columns on `visits` row populated; `ward_categories.available_beds + 1` |

**Constraints:**
- Lab personnel can only add data to `TREATMENT_IN_PROGRESS` visits.
- Doctors can only view/edit `TREATMENT_IN_PROGRESS` visits.
- Invoice generation is disabled unless status is `TREATMENT_IN_PROGRESS`.
- A visit cannot revert to a prior state once advanced.

---
---

## Part 2: Relational Database Schema

---

### Design Summary

| Change | Effect |
|--------|--------|
| Split the unified `personnel` table into **five role tables**: `patients`, `admins`, `doctors`, `clerks`, `lab_personnel` | Each role has its own strongly-typed profile table |
| Remove `doctor_time_slots`; doctors are associated only with a `medical_section` and assigned to a visit at creation | −1 table, no slot booking |
| Remove `expected_discharge_date` and the entire doctor **recommendation** system | Simpler visit lifecycle |
| Split the old `catalog_items` into three master catalogues — `tests`, `equipment`, `resources` — each tracking **availability** in the hospital | Distinct domains with per-domain availability |
| **[3NF fix]** Remove `visits.section_id` | The medical section is fully determined by `doctor_id → doctors.section_id`; storing it on `visits` introduced a transitive dependency |
| Keep core visit data in the central **`visits`** table (patient, doctor, ward, prescription, lab file, death details inline); the visit references its invoice via `invoice_id` + `invoice_pdf_path` | Clean split of clinical vs. billing |
| Keep billing in a dedicated **`invoices`** table (PK `invoice_id`, 1:1 with a visit via `visit_id`) holding the cost breakdown components | Billing is a first-class entity |
| **[3NF fix]** Remove `invoices.total_amount` as a stored column | `total_amount` is fully determined by `doctor_fee + test_cost + equipment_cost + resource_cost` — compute it on read |
| Link the many tests / equipment / resources used per visit via three junction tables — `visit_tests`, `visit_equipment`, `visit_resources` — each with a composite PK `(visit_id, item_id)` and a quantity column | No surrogate keys; one row per item per visit |
| Remove the free-text `post_mortem_result` column; keep only the uploaded `post_mortem_file` | File-only post-mortem record |

---

### Schema Overview

```
users
  ├── admins
  ├── doctors        ──► section_id ──► medical_sections
  ├── clerks
  └── lab_personnel

patients (registered by clerks)
  └── visits  (patient, doctor, ward, prescription, lab file,
        │      death details inline; invoice_id, invoice_pdf_path)
        │      [section derived via doctors.section_id — not stored]
        ├── ward_categories        (bed_category_id; no individual bed rows)
        ├── invoices  (1:1; invoice_id PK, visit_id FK — cost breakdown components)
        ├── visit_tests      ──► tests        (PK visit_id, test_id)
        ├── visit_equipment  ──► equipment    (PK visit_id, equipment_id)
        ├── visit_resources  ──► resources    (PK visit_id, resource_id)
        └── visit_status_log       (audit)

medical_sections  ◄── doctors.section_id
seminars          (created by admins)
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

Profile table for admin users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `admin_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | One-to-one with users |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |

---

### 2.3 `doctors`

Profile table for doctors. Each doctor belongs to exactly one medical section and carries a fixed consultation fee used in invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `doctor_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | One-to-one with users |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |
| `section_id` | `INT` | **FK → medical_sections(section_id)** `NOT NULL` | Doctor's department |
| `consultation_fee` | `DECIMAL(10,2)` | `NOT NULL CHECK (consultation_fee >= 0)` | Fixed fee used in invoices |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Whether the doctor can be assigned to new visits |

---

### 2.4 `clerks`

Profile table for clerks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `clerk_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | One-to-one with users |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |

---

### 2.5 `lab_personnel`

Profile table for lab personnel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `lab_id` | `SERIAL` | **PK** | |
| `user_id` | `INT` | **FK → users(user_id)** `UNIQUE NOT NULL` | One-to-one with users |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | |

---

### 2.6 `medical_sections`

Predefined list of hospital departments (e.g. Cardiology, Neurology, Orthopaedics).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `section_id` | `SERIAL` | **PK** | |
| `section_name` | `VARCHAR(150)` | `NOT NULL UNIQUE` | E.g. "Cardiology", "Neurology" |
| `description` | `TEXT` | `NULLABLE` | Optional notes about the section |

---

### 2.7 `patients`

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

### 2.8 `ward_categories`

Tracks bed counts per ward category. Visits reference this table directly — there is no individual bed row. The `available_beds` count is updated atomically on each ward assignment, discharge, or death.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `category_id` | `SERIAL` | **PK** | |
| `category_name` | `ENUM('GENERAL','ICU','MATERNITY')` | `NOT NULL UNIQUE` | |
| `total_beds` | `INT` | `NOT NULL CHECK (total_beds >= 0)` | Configured by admin |
| `available_beds` | `INT` | `NOT NULL CHECK (available_beds >= 0)` | Real-time count; must not exceed `total_beds` |

**Constraint:** `available_beds <= total_beds` enforced via check constraint or trigger.

---

### 2.9 `tests`

Master catalogue of lab tests. The name is a fixed enum; each value has a predetermined cost that is pre-seeded into the table. When lab personnel selects a test, the cost auto-fills from this row.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `test_id` | `SERIAL` | **PK** | |
| `test_name` | `ENUM('Blood Test','Urine Test','MRI Scan','CT Scan','X-Ray','Ultrasound','Thyroid Test','Liver Function Test','Kidney Function Test')` | `NOT NULL UNIQUE` | Fixed set of available tests |
| `cost` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost >= 0)` | Predetermined unit cost; auto-populated on selection |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Whether the hospital currently offers this test |

**Pre-seeded costs (defaults):**

| test_name | cost |
|-----------|------|
| Blood Test | 300.00 |
| Urine Test | 200.00 |
| MRI Scan | 3000.00 |
| CT Scan | 2500.00 |
| X-Ray | 500.00 |
| Ultrasound | 800.00 |
| Thyroid Test | 600.00 |
| Liver Function Test | 700.00 |
| Kidney Function Test | 700.00 |

---

### 2.10 `equipment`

Master catalogue of reusable equipment with quantity tracking. The name is a fixed enum; each value has a predetermined cost that is pre-seeded into the table. When lab personnel selects a piece of equipment, the cost auto-fills from this row.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `equipment_id` | `SERIAL` | **PK** | |
| `equipment_name` | `ENUM('ECG Machine','MRI Machine','X-Ray Machine','Ventilator','Wheelchair','Infusion Pump','Pulse Oximeter','Defibrillator')` | `NOT NULL UNIQUE` | Fixed set of available equipment |
| `cost` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost >= 0)` | Predetermined cost per use; auto-populated on selection |
| `total_quantity` | `INT` | `NOT NULL CHECK (total_quantity >= 0)` | Total units owned by the hospital |
| `available_quantity` | `INT` | `NOT NULL CHECK (available_quantity >= 0)` | Currently available units |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Soft delete; inactive items hidden from selection |

**Constraint:** `available_quantity <= total_quantity` enforced via check constraint or trigger.

**Pre-seeded costs (defaults):**

| equipment_name | cost |
|----------------|------|
| ECG Machine | 500.00 |
| MRI Machine | 5000.00 |
| X-Ray Machine | 800.00 |
| Ventilator | 2000.00 |
| Wheelchair | 100.00 |
| Infusion Pump | 300.00 |
| Pulse Oximeter | 150.00 |
| Defibrillator | 1000.00 |

---

### 2.11 `resources`

Master catalogue of consumable resources. The name is a fixed enum; each value has a predetermined cost per unit that is pre-seeded into the table. When lab personnel selects a resource, the cost auto-fills from this row.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `resource_id` | `SERIAL` | **PK** | |
| `resource_name` | `ENUM('Blood','Oxygen','IV Fluid (Saline)','IV Fluid (Dextrose)','Bandage','Syringe')` | `NOT NULL UNIQUE` | Fixed set of consumable resources |
| `unit` | `VARCHAR(50)` | `NOT NULL` | Measuring unit, e.g. "unit", "litre", "ml", "bag" |
| `cost_per_unit` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost_per_unit >= 0)` | Predetermined cost per unit; auto-populated on selection |
| `available_quantity` | `DECIMAL(10,2)` | `NOT NULL CHECK (available_quantity >= 0)` | Real-time available quantity in `unit` |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Soft delete; inactive resources hidden from selection |

**Pre-seeded costs (defaults):**

| resource_name | unit | cost_per_unit |
|---------------|------|--------------|
| Blood | unit | 1500.00 |
| Oxygen | litre | 50.00 |
| IV Fluid (Saline) | bag | 120.00 |
| IV Fluid (Dextrose) | bag | 130.00 |
| Bandage | unit | 30.00 |
| Syringe | unit | 20.00 |

---

### 2.12 `visits`

The central table for a single episode of care. It holds the core visit data inline: patient and doctor assignment, ward, doctor prescription, lab result file, and death details (populated only for `DECEASED` visits). Billing is handled by a separate `invoices` table (§2.13), linked 1:1; the visit stores the `invoice_id` back-reference and the generated invoice PDF path. The tests, equipment, and resources *used* during the visit are recorded in the visit-scoped junction tables in §2.14–§2.16.

> **3NF note:** `section_id` has been removed from this table. The medical section for a visit is derived via `visits.doctor_id → doctors.section_id`. Storing it here would introduce the transitive dependency `visit_id → doctor_id → section_id`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_id` | `SERIAL` | **PK** | |
| `patient_id` | `INT` | **FK → patients(patient_id)** `NOT NULL` | |
| `issue` | `TEXT` | `NOT NULL` | Chief complaint entered by clerk |
| `doctor_id` | `INT` | **FK → doctors(doctor_id)** `NOT NULL` | Doctor assigned at visit creation; section derived from `doctors.section_id` |
| `patient_type` | `ENUM('INPATIENT','OUTPATIENT')` | `NOT NULL` | |
| `bed_category_id` | `INT` | **FK → ward_categories(category_id)** `NULLABLE` | NULL for outpatients; decrement/increment on status change |
| `status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | `NOT NULL DEFAULT 'ADMITTED'` | Current visit state |
| `entry_time` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | When visit was created |
| `discharge_time` | `TIMESTAMP` | `NULLABLE` | Set on DISCHARGED status |
| `assigned_by` | `INT` | **FK → clerks(clerk_id)** `NOT NULL` | Clerk who created the visit |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |
| **— Doctor Prescription (inline) —** | | | |
| `prescription_file` | `VARCHAR(500)` | `NULLABLE` | File path of doctor-uploaded prescription |
| `prescription_uploaded_by` | `INT` | **FK → doctors(doctor_id)** `NULLABLE` | Doctor who uploaded |
| `prescription_uploaded_at` | `TIMESTAMP` | `NULLABLE` | |
| **— Lab Result File (inline) —** | | | |
| `test_result_file` | `VARCHAR(500)` | `NULLABLE` | File path of the lab-uploaded test result |
| `lab_file_uploaded_by` | `INT` | **FK → lab_personnel(lab_id)** `NULLABLE` | Lab personnel who uploaded |
| `lab_file_uploaded_at` | `TIMESTAMP` | `NULLABLE` | |
| **— Invoice reference —** | | | |
| `invoice_id` | `INT` | **FK → invoices(invoice_id)** `UNIQUE NULLABLE` | The visit's invoice (1:1); NULL until the invoice row exists |
| `invoice_pdf_path` | `VARCHAR(500)` | `NULLABLE` | Path of the generated invoice PDF; full billing detail lives in `invoices` (§2.13) |
| **— Death Details (inline, DECEASED visits only) —** | | | |
| `cause_of_death` | `TEXT` | `NULLABLE` | |
| `time_of_death` | `TIME` | `NULLABLE` | |
| `date_of_death` | `DATE` | `NULLABLE` | |
| `post_mortem_file` | `VARCHAR(500)` | `NULLABLE` | Uploaded post-mortem report file path |
| `death_recorded_by` | `INT` | **FK → doctors(doctor_id)** `NULLABLE` | Doctor who recorded death |

> **Constraint:** When `status = 'DECEASED'`, the application must enforce that `cause_of_death`, `time_of_death`, `date_of_death`, and `death_recorded_by` are all non-null.

**Index:** `(patient_id, status)` for fast active-visit lookup.

---

### 2.13 `invoices`

One invoice per visit (1:1), created when the visit is created and finalised by the clerk on **Generate Invoice**. Holds the full cost breakdown, including the pre-computed total; the individual facilities that make up those costs live in the visit-scoped junction tables (§2.14–§2.16) and are reached through the shared visit (`invoices.visit_id`).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `invoice_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `UNIQUE NOT NULL` | One invoice per visit |
| `doctor_fee` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | From `doctors.consultation_fee` at generation time |
| `test_cost` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Sum of `visit_tests` costs × quantities |
| `equipment_cost` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Sum of `visit_equipment` costs × quantities |
| `resource_cost` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Sum of `visit_resources` costs × quantities |
| `total_amount` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | `doctor_fee + test_cost + equipment_cost + resource_cost`; stored at generation time |
| `generated_by` | `INT` | **FK → clerks(clerk_id)** `NULLABLE` | Clerk who generated the invoice |
| `generated_at` | `TIMESTAMP` | `NULLABLE` | Set when the invoice is finalised |
| `payment_status` | `ENUM('PENDING','PAID')` | `NOT NULL DEFAULT 'PENDING'` | Updated when clerk clicks "Payment Successful" |
| `payment_confirmed_at` | `TIMESTAMP` | `NULLABLE` | Set when status moves to PAID |

> `visits` stores the back-reference (`invoice_id`) and the generated PDF path (`invoice_pdf_path`); monetary totals and line-item costs live here; detailed line items are in the `visit_*` junction tables (§2.14–§2.16).

---

### 2.14 `visit_tests`

Junction table recording every test performed during a visit. Composite PK `(visit_id, test_id)` — one row per distinct test per visit; `quantity` tracks how many times it was performed.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_id` | `INT` | **FK → visits(visit_id)**, **PK (part 1)** | |
| `test_id` | `INT` | **FK → tests(test_id)**, **PK (part 2)** | |
| `quantity` | `INT` | `NOT NULL DEFAULT 1 CHECK (quantity > 0)` | Number of times the test was performed |
| `cost_at_time` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost_at_time >= 0)` | Test cost snapshotted when added |
| `added_by` | `INT` | **FK → lab_personnel(lab_id)** `NOT NULL` | Lab personnel who added the entry |
| `added_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

**Primary Key:** `(visit_id, test_id)`

---

### 2.15 `visit_equipment`

Junction table recording every piece of equipment used during a visit. Composite PK `(visit_id, equipment_id)`; `quantity` tracks the number of units.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_id` | `INT` | **FK → visits(visit_id)**, **PK (part 1)** | |
| `equipment_id` | `INT` | **FK → equipment(equipment_id)**, **PK (part 2)** | |
| `quantity` | `INT` | `NOT NULL DEFAULT 1 CHECK (quantity > 0)` | Number of units used |
| `cost_at_time` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost_at_time >= 0)` | Unit cost snapshotted when added |
| `added_by` | `INT` | **FK → lab_personnel(lab_id)** `NOT NULL` | Lab personnel who added the entry |
| `added_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

**Primary Key:** `(visit_id, equipment_id)`

---

### 2.16 `visit_resources`

Junction table recording every consumable resource (Blood, Oxygen, IV Fluids, etc.) used during a visit. Composite PK `(visit_id, resource_id)`; `quantity_used` tracks the amount consumed.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `visit_id` | `INT` | **FK → visits(visit_id)**, **PK (part 1)** | |
| `resource_id` | `INT` | **FK → resources(resource_id)**, **PK (part 2)** | |
| `quantity_used` | `DECIMAL(10,2)` | `NOT NULL CHECK (quantity_used > 0)` | Amount consumed, in the resource's `unit` |
| `cost_at_time` | `DECIMAL(10,2)` | `NOT NULL CHECK (cost_at_time >= 0)` | Cost per unit snapshotted when added |
| `added_by` | `INT` | **FK → lab_personnel(lab_id)** `NOT NULL` | Lab personnel who added the entry |
| `added_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |

**Primary Key:** `(visit_id, resource_id)`

---

### 2.17 `seminars`

Managed by admin only.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `seminar_id` | `SERIAL` | **PK** | |
| `seminar_name` | `VARCHAR(255)` | `NOT NULL` | |
| `seminar_date` | `DATE` | `NOT NULL` | |
| `duration_hours` | `DECIMAL(5,2)` | `NOT NULL CHECK (duration_hours > 0)` | Duration in hours (e.g. 1.5 for 90 minutes) |
| `hall_number` | `VARCHAR(50)` | `NOT NULL` | |
| `created_by` | `INT` | **FK → admins(admin_id)** `NOT NULL` | Admin who created the seminar |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Set on edit |

---

### 2.18 `visit_status_log` *(Audit Table)*

Immutable audit trail of every status transition on every visit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `log_id` | `SERIAL` | **PK** | |
| `visit_id` | `INT` | **FK → visits(visit_id)** `NOT NULL` | |
| `from_status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | `NULLABLE` | Null for initial status |
| `to_status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | `NOT NULL` | |
| `changed_by_user_id` | `INT` | **FK → users(user_id)** `NOT NULL` | Acting user (any role) |
| `changed_at` | `TIMESTAMP` | `NOT NULL DEFAULT NOW()` | |
| `notes` | `TEXT` | `NULLABLE` | E.g. reason for status change |

---

### 3. Entity Relationship Summary

```
users
  ├── admins ──────────────► seminars.created_by
  ├── doctors ─── section_id ──► medical_sections
  │      ├──► visits.doctor_id                 (assigned doctor; section derived from here)
  │      ├──► visits.prescription_uploaded_by  (inline)
  │      └──► visits.death_recorded_by         (inline)
  ├── clerks
  │      ├──► patients.registered_by
  │      ├──► visits.assigned_by
  │      └──► invoices.generated_by
  └── lab_personnel
         ├──► visits.lab_file_uploaded_by      (inline)
         ├──► visit_tests.added_by
         ├──► visit_equipment.added_by
         └──► visit_resources.added_by

patients ──► visits ─────────────────────────────┐
                 │  (inline: prescription, lab file, death; invoice_id, invoice_pdf_path)
                 │  [section NOT stored — derived via doctor_id → doctors.section_id]
                 ├──► invoices  (1:1, invoices.visit_id)
                 ├──► visit_tests      ──► tests        (PK visit_id, test_id)
                 ├──► visit_equipment  ──► equipment    (PK visit_id, equipment_id)
                 ├──► visit_resources  ──► resources    (PK visit_id, resource_id)
                 ├──► visit_status_log
                 └──► bed_category_id  ──► ward_categories
```

---

### 4. Key Relationships at a Glance

| Relationship | Type | Notes |
|---|---|---|
| `users` → `admins` / `doctors` / `clerks` / `lab_personnel` | 1:1 | Each role has its own profile table |
| `doctors` → `medical_sections` | N:1 | Each doctor belongs to exactly one section |
| `patients` → `visits` | 1:N | A patient can have many visits over time |
| `clerks` → `patients` | 1:N | Registering clerk |
| `clerks` → `visits` | 1:N | Visit creator |
| `clerks` → `invoices` | 1:N | Invoice generator |
| `doctors` → `visits` | 1:N | Assigned doctor per visit |
| `visits` → `medical_sections` | N:1 (derived) | **Read-only via JOIN:** `visits.doctor_id → doctors.section_id`; no FK column on `visits` |
| `visits` → `ward_categories` | N:1 | One category per inpatient visit; NULL for outpatients |
| `visits` ↔ `invoices` | 1:1 | Linked from both sides: `visits.invoice_id` and `invoices.visit_id` |
| `visits` → `visit_tests` | 1:N | Multiple tests per visit; PK `(visit_id, test_id)` |
| `visits` → `visit_equipment` | 1:N | Multiple equipment items per visit; PK `(visit_id, equipment_id)` |
| `visits` → `visit_resources` | 1:N | Multiple resources per visit; PK `(visit_id, resource_id)` |
| `visit_tests` → `tests` | N:1 | Test catalogue |
| `visit_equipment` → `equipment` | N:1 | Equipment catalogue |
| `visit_resources` → `resources` | N:1 | Resource catalogue |
| `visits.prescription_* / test_result_file` | inline | Doctor prescription & lab file stored as columns on the visit row |
| `visits.invoice_id / invoice_pdf_path` | inline | Link + PDF path to the invoice; billing detail in `invoices` |
| `visits.cause_of_death / …` | inline 1:1 | Death details stored as columns; non-null only for DECEASED |
| `admins` → `seminars` | 1:N | Admin-created seminars |

---

### 5. Invoice Calculation Logic

When the clerk triggers **Generate Invoice** for a `TREATMENT_IN_PROGRESS` visit, all breakdown columns — including `total_amount` — are written to the `invoices` row.

```
doctor_fee     = doctors.consultation_fee
                 WHERE doctors.doctor_id = visits.doctor_id

test_cost      = SUM(visit_tests.cost_at_time * visit_tests.quantity)
                 FROM visit_tests
                 WHERE visit_tests.visit_id = <visit>

equipment_cost = SUM(visit_equipment.cost_at_time * visit_equipment.quantity)
                 FROM visit_equipment
                 WHERE visit_equipment.visit_id = <visit>

resource_cost  = SUM(visit_resources.cost_at_time * visit_resources.quantity_used)
                 FROM visit_resources
                 WHERE visit_resources.visit_id = <visit>

total_amount   = doctor_fee + test_cost + equipment_cost + resource_cost
```

Costs are snapshotted (via `cost_at_time` on each junction row and the breakdown columns on the invoice) at the moment items are added / the invoice is generated, so subsequent catalogue price changes do not alter historical invoices. The generated PDF is written to `visits.invoice_pdf_path`.

---

### 6. Ward Bed Count Consistency

`ward_categories.available_beds` is the sole count; there is no individual `ward_beds` row. Allocation uses a row-level lock to prevent double-booking:

```sql
BEGIN;
SELECT available_beds FROM ward_categories
  WHERE category_id = <selected_category>
  FOR UPDATE;

-- proceed only if available_beds > 0:
UPDATE ward_categories
   SET available_beds = available_beds - 1
 WHERE category_id = <selected_category>;

UPDATE visits
   SET status = 'TREATMENT_IN_PROGRESS',
       bed_category_id = <selected_category>
 WHERE visit_id = <current_visit>;

COMMIT;
```

On discharge or death, the reverse transaction increments the count:

```sql
BEGIN;
UPDATE ward_categories
   SET available_beds = available_beds + 1
 WHERE category_id = (SELECT bed_category_id FROM visits WHERE visit_id = <visit>);

COMMIT;
```

---

### 7. Resource & Equipment Availability Consistency

Consumable `resources.available_quantity` and reusable `equipment.available_quantity` are decremented when a lab entry is added and (for equipment) restored when returned. As with beds, updates use a row-level lock to prevent overdraw:

```sql
BEGIN;
SELECT available_quantity FROM resources
  WHERE resource_id = <selected_resource>
  FOR UPDATE;

-- proceed only if available_quantity >= <quantity_used>:
UPDATE resources
   SET available_quantity = available_quantity - <quantity_used>
 WHERE resource_id = <selected_resource>;

INSERT INTO visit_resources (visit_id, resource_id, quantity_used, cost_at_time, added_by)
VALUES (<visit>, <selected_resource>, <quantity_used>, <cost_per_unit>, <lab_id>);

COMMIT;
```

---

### 8. Deliberate Denormalizations (Retained)

The following redundancies are intentional design decisions, not 3NF violations:

| Item | Reason |
|------|--------|
| `invoices.doctor_fee / test_cost / equipment_cost / resource_cost / total_amount` | Snapshotted at generation time so historical invoices are immutable when catalogue prices change. `total_amount` is stored for fast retrieval on billing screens without recomputing the sum every time. |
| `visit_tests / visit_equipment / visit_resources . cost_at_time` | Same snapshot rationale — depends on the composite key `(visit_id, item_id)`, not on the item alone, so 2NF and 3NF both hold. |
| Bidirectional 1:1 link (`visits.invoice_id` ↔ `invoices.visit_id`) | Allows fast lookup in either direction without a join; consistency enforced by the application layer and UNIQUE constraints. |
