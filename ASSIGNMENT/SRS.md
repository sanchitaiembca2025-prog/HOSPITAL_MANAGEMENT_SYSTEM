# Software Requirements Specification (SRS)
## Smart Patient & Clinical Record Management System

**Document Version:** 1.0
**Prepared for:** BITS Pilani — Database Management Systems Assignment, Part 1
**Target RDBMS:** PostgreSQL
**Date:** September 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [Use Cases](#4-use-cases)
5. [ER Diagram Description](#5-er-diagram-description)
6. [Data Dictionary](#6-data-dictionary)
7. [Term 2 Extension](#7-term-2-extension)

---

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to specify the software requirements for the **Smart Patient & Clinical Record Management System** (SPCRMS). This system is intended to digitise, centralise, and streamline the management of patient records, clinical workflows, and healthcare professional activities within a hospital or clinic setting. This SRS serves as the authoritative reference for database design, UI prototyping, and subsequent system development.

### 1.2 Scope

The SPCRMS shall provide the following capabilities:

- Registration and management of patients and healthcare professionals.
- Scheduling and tracking of patient appointments.
- Recording of diagnoses and clinical observations.
- Management of prescriptions and medication orders.
- Ordering and recording of laboratory investigations.
- Maintenance of longitudinal clinical records per patient.

The system shall be implemented as a web-based application backed by a PostgreSQL relational database. The scope of Part 1 (Term 1) is limited to structured, text-based relational data. Part 2 (Term 2) shall extend the system to support multimodal data including medical images, PDF reports, and audio/ECG signals.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SPCRMS | Smart Patient & Clinical Record Management System |
| SRS | Software Requirements Specification |
| RDBMS | Relational Database Management System |
| ER | Entity–Relationship |
| PK | Primary Key |
| FK | Foreign Key |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| ICD-10 | International Classification of Diseases, 10th Revision |
| EMR | Electronic Medical Record |
| RBAC | Role-Based Access Control |
| DICOM | Digital Imaging and Communications in Medicine |
| UI | User Interface |

### 1.4 References

1. IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications.
2. ICD-10 Clinical Modification (CM), Centers for Disease Control and Prevention.
3. PostgreSQL 15 Documentation — https://www.postgresql.org/docs/15/
4. HL7 FHIR R4 Standard — https://hl7.org/fhir/R4/

### 1.5 Overview

Section 2 provides a high-level description of the product, its user classes, operating environment, and constraints. Section 3 details functional and non-functional requirements for each module, along with entity attribute schemas. Section 4 presents use cases. Section 5 describes the ER model in textual form. Section 6 provides the data dictionary. Section 7 outlines planned extensions for Term 2.

---

## 2. Overall Description

### 2.1 Product Perspective

SPCRMS is a standalone, web-based healthcare information system. It shall interact with the PostgreSQL database for all persistent data operations. The system is not required to interface with external hospital systems in Term 1; integration with HL7 FHIR-compliant systems is deferred to a future phase. The system shall expose a role-based web interface accessible via a standard browser.

### 2.2 Product Functions

The system shall support the following high-level functional areas:

1. **Patient Management** — Registration, search, demographic record maintenance, and patient deactivation.
2. **Healthcare Professional Management** — Onboarding, specialty assignment, schedule management, and credential tracking.
3. **Appointment Scheduling** — Calendar-based slot creation, booking, rescheduling, and cancellation.
4. **Diagnosis Recording** — Association of ICD-10 coded diagnoses with patient visits.
5. **Prescription Management** — Creation, modification, and dispensing tracking of medication orders.
6. **Laboratory Investigation Management** — Test ordering, specimen tracking, and result entry.
7. **Clinical Record Management** — Longitudinal, chronological clinical notes per patient encounter.

### 2.3 User Classes and Characteristics

| User Class | Description | Primary Modules |
|------------|-------------|-----------------|
| **Administrator** | Manages users, roles, and system configuration. Full access to all modules. | User Management, All |
| **Doctor (Physician)** | Conducts consultations, records diagnoses, writes prescriptions, orders labs. | Diagnosis, Prescription, Lab, Clinical Record |
| **Nurse** | Assists with patient intake, records vitals, administers medications. | Patient, Clinical Record |
| **Lab Technician** | Processes lab orders, enters test results. | Lab Investigation |
| **Receptionist** | Registers patients, manages appointments. | Patient, Appointment |
| **Patient** (view-only, future) | Views own records, appointments, and prescriptions. | Read-only on own data |

### 2.4 Operating Environment

- **Server OS:** Linux (Ubuntu 22.04 LTS or equivalent)
- **RDBMS:** PostgreSQL 15+
- **Web Server:** Any WSGI-compatible server (e.g., Nginx + Gunicorn)
- **Client:** Any modern web browser (Chrome 110+, Firefox 110+, Safari 16+)
- **Network:** Internal hospital LAN; HTTPS enforced for all connections

### 2.5 Design and Implementation Constraints

- All data shall be stored in a normalised relational schema (3NF minimum).
- No direct SQL access shall be permitted from the UI layer; all queries shall be parameterised to prevent SQL injection.
- Passwords shall be stored as bcrypt hashes; plaintext storage is prohibited.
- The database schema shall use PostgreSQL-specific types where beneficial (e.g., `TIMESTAMPTZ`, `UUID`, `JSONB` for extensible attributes).
- The system shall enforce RBAC at the application layer.
- Medical record deletion shall not be permitted; records shall be soft-deleted (logical deletion via `is_active` flag).

### 2.6 Assumptions and Dependencies

- Each patient is uniquely identifiable by a system-generated UUID and a government-issued national ID.
- A single appointment corresponds to exactly one patient and one healthcare professional.
- A diagnosis is recorded in the context of a specific appointment/visit.
- A prescription may contain multiple line items (drugs) but belongs to one appointment.
- Lab investigation orders are raised per appointment; multiple tests may be ordered per appointment.
- The ICD-10 code list shall be pre-loaded as a static reference table in the database.

---

## 3. Specific Requirements

---

### 3.1 Patient Management

#### 3.1.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-PAT-001 | The system shall allow a receptionist or administrator to register a new patient by capturing all mandatory demographic fields. |
| FR-PAT-002 | The system shall assign a unique system-generated UUID (`patient_id`) to each patient upon registration. |
| FR-PAT-003 | The system shall validate that the national ID (`national_id`) is unique across all patient records. |
| FR-PAT-004 | The system shall allow authorised users to search for patients by name, national ID, phone number, or date of birth. |
| FR-PAT-005 | The system shall allow authorised users to update patient demographic information, maintaining an audit trail of changes. |
| FR-PAT-006 | The system shall support soft deletion of patient records via an `is_active` flag; hard deletion is not permitted. |
| FR-PAT-007 | The system shall display a patient's complete profile including linked appointments, diagnoses, prescriptions, lab results, and clinical notes. |
| FR-PAT-008 | The system shall record emergency contact information for each patient. |

#### 3.1.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-PAT-001 | Patient search results shall be returned within 2 seconds for a database of up to 500,000 patient records. |
| NFR-PAT-002 | All patient data shall be encrypted at rest using PostgreSQL-level tablespace encryption or equivalent. |
| NFR-PAT-003 | The system shall comply with applicable healthcare data privacy regulations (e.g., HIPAA principles). |

#### 3.1.3 Entity Attributes — `patients`

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `patient_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique patient identifier |
| `national_id` | VARCHAR(20) | UNIQUE, NOT NULL | Government-issued national ID |
| `first_name` | VARCHAR(100) | NOT NULL | Patient's first name |
| `last_name` | VARCHAR(100) | NOT NULL | Patient's last name |
| `date_of_birth` | DATE | NOT NULL | Date of birth |
| `gender` | VARCHAR(10) | CHECK IN ('Male','Female','Other') | Gender |
| `blood_group` | VARCHAR(5) | — | Blood group (e.g., A+, O-) |
| `phone_number` | VARCHAR(20) | NOT NULL | Primary contact number |
| `email` | VARCHAR(255) | — | Email address |
| `address` | TEXT | — | Residential address |
| `emergency_contact_name` | VARCHAR(200) | — | Emergency contact full name |
| `emergency_contact_phone` | VARCHAR(20) | — | Emergency contact phone |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

---

### 3.2 Healthcare Professional Management

#### 3.2.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-HCP-001 | The system shall allow an administrator to register healthcare professionals (doctors, nurses, lab technicians). |
| FR-HCP-002 | Each healthcare professional shall be assigned a unique `hcp_id` (UUID). |
| FR-HCP-003 | The system shall store professional credentials including license number, specialty, and department. |
| FR-HCP-004 | The system shall allow administrators to assign roles to healthcare professionals. |
| FR-HCP-005 | The system shall allow doctors to define their weekly availability schedule for appointment booking. |
| FR-HCP-006 | The system shall support soft deletion of healthcare professional records. |

#### 3.2.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-HCP-001 | Healthcare professional records shall be accessible to authorised roles within 1 second. |
| NFR-HCP-002 | License number uniqueness shall be enforced at the database level. |

#### 3.2.3 Entity Attributes — `healthcare_professionals`

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `hcp_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique HCP identifier |
| `user_id` | UUID | FK → users(user_id), NOT NULL | Linked system user account |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `role` | VARCHAR(50) | NOT NULL | Role: Doctor, Nurse, Lab Technician, etc. |
| `specialty` | VARCHAR(100) | — | Medical specialty (for doctors) |
| `department` | VARCHAR(100) | — | Hospital department |
| `license_number` | VARCHAR(50) | UNIQUE, NOT NULL | Medical license number |
| `phone_number` | VARCHAR(20) | — | Contact number |
| `email` | VARCHAR(255) | NOT NULL | Official email address |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation timestamp |

---

### 3.3 Appointment Scheduling

#### 3.3.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-APT-001 | The system shall allow a receptionist to create an appointment by selecting a patient, a healthcare professional, a date, and a time slot. |
| FR-APT-002 | The system shall prevent double-booking of the same healthcare professional for overlapping time slots. |
| FR-APT-003 | The system shall allow appointment status updates: Scheduled, Confirmed, Checked-In, Completed, Cancelled, No-Show. |
| FR-APT-004 | The system shall allow authorised users to reschedule or cancel appointments. |
| FR-APT-005 | The system shall record the reason for cancellation when an appointment is cancelled. |
| FR-APT-006 | The system shall display a daily/weekly appointment calendar view for each healthcare professional. |
| FR-APT-007 | The system shall enforce that appointments can only be booked within the healthcare professional's defined availability. |

#### 3.3.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-APT-001 | Availability checks and slot booking shall complete within 1 second under concurrent access from up to 50 users. |
| NFR-APT-002 | Appointment conflict detection shall be enforced at the database level using constraints or triggers. |

#### 3.3.3 Entity Attributes — `appointments`

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `appointment_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique appointment identifier |
| `patient_id` | UUID | FK → patients(patient_id), NOT NULL | Linked patient |
| `hcp_id` | UUID | FK → healthcare_professionals(hcp_id), NOT NULL | Attending HCP |
| `appointment_date` | DATE | NOT NULL | Date of appointment |
| `start_time` | TIME | NOT NULL | Appointment start time |
| `end_time` | TIME | NOT NULL | Appointment end time |
| `status` | VARCHAR(20) | CHECK IN ('Scheduled','Confirmed','CheckedIn','Completed','Cancelled','NoShow') | Appointment status |
| `visit_type` | VARCHAR(50) | — | e.g., Consultation, Follow-up, Emergency |
| `reason_for_visit` | TEXT | — | Patient-stated reason |
| `cancellation_reason` | TEXT | — | Reason if cancelled |
| `created_by` | UUID | FK → users(user_id) | User who created the appointment |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation timestamp |

---

### 3.4 Diagnosis Records

#### 3.4.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-DGN-001 | The system shall allow a doctor to record one or more diagnoses for a patient visit/appointment. |
| FR-DGN-002 | Each diagnosis shall be associated with a valid ICD-10 code selected from a pre-loaded reference table. |
| FR-DGN-003 | The system shall allow doctors to record diagnosis notes alongside the ICD-10 coded entry. |
| FR-DGN-004 | The system shall allow a diagnosis to be marked as primary or secondary for a given visit. |
| FR-DGN-005 | The system shall maintain a full diagnosis history per patient across all visits. |
| FR-DGN-006 | Diagnosis records shall not be deleted; amendments shall be tracked with a timestamp and amending user. |

#### 3.4.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-DGN-001 | ICD-10 code lookup shall return results within 500 milliseconds for a table of 70,000+ codes. |
| NFR-DGN-002 | Diagnosis history per patient shall load within 2 seconds. |

#### 3.4.3 Entity Attributes — `diagnoses`

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `diagnosis_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique diagnosis record identifier |
| `appointment_id` | UUID | FK → appointments(appointment_id), NOT NULL | Associated appointment/visit |
| `patient_id` | UUID | FK → patients(patient_id), NOT NULL | Patient (denormalised for query convenience) |
| `icd10_code` | VARCHAR(10) | FK → icd10_codes(code), NOT NULL | ICD-10 diagnosis code |
| `diagnosis_type` | VARCHAR(20) | CHECK IN ('Primary','Secondary','Differential') | Diagnosis classification |
| `notes` | TEXT | — | Clinician's free-text notes |
| `diagnosed_by` | UUID | FK → healthcare_professionals(hcp_id), NOT NULL | Diagnosing HCP |
| `diagnosed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Timestamp of diagnosis entry |
| `amended_by` | UUID | FK → users(user_id) | User who last amended this record |
| `amended_at` | TIMESTAMPTZ | — | Timestamp of last amendment |

---

### 3.5 Prescription Management

#### 3.5.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-PRE-001 | The system shall allow a doctor to create a prescription linked to a specific appointment. |
| FR-PRE-002 | A prescription shall contain one or more line items, each representing a single drug/medication. |
| FR-PRE-003 | Each prescription line item shall capture: drug name, dosage, route, frequency, duration, and special instructions. |
| FR-PRE-004 | The system shall allow prescriptions to be printed in a formatted, printable layout. |
| FR-PRE-005 | The system shall track the dispensing status of each prescription (Pending, Dispensed, Partially Dispensed). |
| FR-PRE-006 | The system shall maintain a full prescription history per patient. |

#### 3.5.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-PRE-001 | Prescription records shall be immutable once dispensed; amendments shall create a new version. |
| NFR-PRE-002 | Prescription data retrieval per patient shall complete within 1.5 seconds. |

#### 3.5.3 Entity Attributes — `prescriptions` and `prescription_items`

**`prescriptions`**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `prescription_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique prescription identifier |
| `appointment_id` | UUID | FK → appointments(appointment_id), NOT NULL | Linked appointment |
| `patient_id` | UUID | FK → patients(patient_id), NOT NULL | Patient |
| `prescribed_by` | UUID | FK → healthcare_professionals(hcp_id), NOT NULL | Prescribing doctor |
| `prescribed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Prescription timestamp |
| `status` | VARCHAR(30) | CHECK IN ('Pending','Dispensed','PartiallyDispensed','Cancelled') | Overall dispensing status |
| `notes` | TEXT | — | General prescription notes |

**`prescription_items`**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `item_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique line item identifier |
| `prescription_id` | UUID | FK → prescriptions(prescription_id), NOT NULL | Parent prescription |
| `drug_name` | VARCHAR(255) | NOT NULL | Medication name |
| `dosage` | VARCHAR(50) | NOT NULL | e.g., 500 mg |
| `route` | VARCHAR(50) | — | e.g., Oral, IV, Topical |
| `frequency` | VARCHAR(50) | NOT NULL | e.g., Twice daily, Every 8 hours |
| `duration_days` | INTEGER | — | Duration in days |
| `special_instructions` | TEXT | — | e.g., Take with food |
| `is_dispensed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Dispensing status for this item |

---

### 3.6 Laboratory Investigation Management

#### 3.6.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-LAB-001 | The system shall allow a doctor to order laboratory tests linked to a specific appointment. |
| FR-LAB-002 | The system shall maintain a reference catalogue of available lab tests with normal reference ranges. |
| FR-LAB-003 | The system shall allow a lab technician to update the status of a lab order (Ordered, Specimen Collected, Processing, Resulted, Reported). |
| FR-LAB-004 | The system shall allow a lab technician to enter numeric or text results for each ordered test. |
| FR-LAB-005 | The system shall flag results that fall outside the defined normal range. |
| FR-LAB-006 | The system shall maintain a complete lab investigation history per patient. |

#### 3.6.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-LAB-001 | Lab order status updates shall be reflected in the system within 5 seconds of submission. |
| NFR-LAB-002 | Abnormal result flags shall be calculated and stored at insert time for efficient querying. |

#### 3.6.3 Entity Attributes — `lab_orders` and `lab_results`

**`lab_orders`**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `order_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique lab order identifier |
| `appointment_id` | UUID | FK → appointments(appointment_id), NOT NULL | Linked appointment |
| `patient_id` | UUID | FK → patients(patient_id), NOT NULL | Patient |
| `ordered_by` | UUID | FK → healthcare_professionals(hcp_id), NOT NULL | Ordering doctor |
| `ordered_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Order timestamp |
| `status` | VARCHAR(30) | CHECK IN ('Ordered','SpecimenCollected','Processing','Resulted','Reported','Cancelled') | Order status |
| `urgent` | BOOLEAN | NOT NULL, DEFAULT FALSE | Urgent flag |
| `clinical_notes` | TEXT | — | Clinical context for the order |

**`lab_results`**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `result_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique result identifier |
| `order_id` | UUID | FK → lab_orders(order_id), NOT NULL | Parent lab order |
| `test_id` | UUID | FK → lab_test_catalogue(test_id), NOT NULL | Test from catalogue |
| `result_value` | TEXT | — | Numeric or text result value |
| `unit` | VARCHAR(30) | — | Unit of measurement |
| `reference_range_low` | NUMERIC | — | Normal range lower bound |
| `reference_range_high` | NUMERIC | — | Normal range upper bound |
| `is_abnormal` | BOOLEAN | NOT NULL, DEFAULT FALSE | Abnormal flag |
| `resulted_by` | UUID | FK → healthcare_professionals(hcp_id) | Lab tech who entered result |
| `resulted_at` | TIMESTAMPTZ | — | Result entry timestamp |
| `remarks` | TEXT | — | Technician remarks |

---

### 3.7 Clinical Record Management

#### 3.7.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-CLN-001 | The system shall allow a doctor or nurse to create a clinical note for each patient visit. |
| FR-CLN-002 | Clinical notes shall be structured with sections: Subjective (S), Objective (O), Assessment (A), Plan (P) — i.e., SOAP format. |
| FR-CLN-003 | The system shall record vital signs (BP, HR, Temperature, SpO2, Weight, Height) as part of the clinical record. |
| FR-CLN-004 | Clinical records shall be displayed in reverse-chronological order per patient. |
| FR-CLN-005 | Clinical records shall be immutable once finalised; addenda may be appended but original content shall not be overwritten. |
| FR-CLN-006 | The system shall link each clinical record to its corresponding appointment. |

#### 3.7.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-CLN-001 | The clinical record timeline for a patient shall load within 3 seconds for a history of up to 10 years. |
| NFR-CLN-002 | Clinical records shall be auditable; all creation and amendment events shall be logged. |

#### 3.7.3 Entity Attributes — `clinical_records`

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `record_id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique clinical record identifier |
| `appointment_id` | UUID | FK → appointments(appointment_id), NOT NULL | Linked appointment |
| `patient_id` | UUID | FK → patients(patient_id), NOT NULL | Patient |
| `recorded_by` | UUID | FK → healthcare_professionals(hcp_id), NOT NULL | Authoring HCP |
| `subjective` | TEXT | — | Patient's reported symptoms (S) |
| `objective` | TEXT | — | Clinician's observations (O) |
| `assessment` | TEXT | — | Clinician's assessment/interpretation (A) |
| `plan` | TEXT | — | Treatment plan (P) |
| `bp_systolic` | INTEGER | — | Blood pressure systolic (mmHg) |
| `bp_diastolic` | INTEGER | — | Blood pressure diastolic (mmHg) |
| `heart_rate` | INTEGER | — | Heart rate (bpm) |
| `temperature` | NUMERIC(4,1) | — | Body temperature (°C) |
| `spo2` | NUMERIC(5,2) | — | Oxygen saturation (%) |
| `weight_kg` | NUMERIC(5,2) | — | Weight (kg) |
| `height_cm` | NUMERIC(5,2) | — | Height (cm) |
| `is_finalised` | BOOLEAN | NOT NULL, DEFAULT FALSE | Finalisation flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `finalised_at` | TIMESTAMPTZ | — | Finalisation timestamp |

---

## 4. Use Cases

---

### UC-PAT-001: Register New Patient

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-PAT-001 |
| **Name** | Register New Patient |
| **Actors** | Receptionist, Administrator |
| **Preconditions** | Actor is authenticated and has the Patient Registration permission. |
| **Main Flow** | 1. Actor navigates to Patient Registration screen. 2. Actor enters all mandatory demographic fields (first name, last name, date of birth, gender, national ID, phone number). 3. Actor optionally enters email, address, blood group, and emergency contact. 4. System validates that the national ID is not already registered. 5. System generates a UUID for the patient. 6. System saves the record and displays the new patient profile. |
| **Alternate Flow A** | 4a. National ID already exists → System displays error "Patient with this national ID already registered." → Actor corrects or searches for existing patient. |
| **Alternate Flow B** | 4b. Mandatory field missing → System highlights the field with a validation error → Actor completes the form. |
| **Postconditions** | A new patient record is persisted in the `patients` table. The patient profile is accessible for subsequent operations. |

---

### UC-APT-001: Book Appointment

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-APT-001 |
| **Name** | Book Appointment |
| **Actors** | Receptionist |
| **Preconditions** | Patient is registered. Healthcare professional has defined availability. Actor is authenticated. |
| **Main Flow** | 1. Actor searches for and selects the patient. 2. Actor selects the desired healthcare professional and specialty. 3. System displays available time slots based on HCP availability. 4. Actor selects a date and available time slot. 5. Actor enters visit type and reason. 6. System checks for conflicts. 7. System creates appointment with status "Scheduled". 8. System displays confirmation. |
| **Alternate Flow A** | 6a. Slot conflict detected → System displays "This slot is no longer available." → Actor selects another slot. |
| **Postconditions** | An appointment record is persisted in the `appointments` table with status "Scheduled". |

---

### UC-DGN-001: Record Diagnosis

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-DGN-001 |
| **Name** | Record Diagnosis |
| **Actors** | Doctor |
| **Preconditions** | Patient has a Checked-In or Completed appointment. Doctor is authenticated and assigned to the appointment. |
| **Main Flow** | 1. Doctor opens the patient's active appointment. 2. Doctor navigates to Diagnosis Entry. 3. Doctor searches for the ICD-10 code by code or description. 4. Doctor selects the code and specifies Primary or Secondary. 5. Doctor optionally enters clinical notes. 6. System saves the diagnosis record linked to the appointment. |
| **Alternate Flow A** | 3a. ICD-10 code not found → Doctor refines search or uses a differential code. |
| **Postconditions** | A diagnosis record is persisted in the `diagnoses` table linked to the appointment. |

---

### UC-PRE-001: Write Prescription

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-PRE-001 |
| **Name** | Write Prescription |
| **Actors** | Doctor |
| **Preconditions** | Patient has a Checked-In or Completed appointment. Doctor is authenticated. |
| **Main Flow** | 1. Doctor opens patient's active appointment. 2. Doctor navigates to Prescription Writer. 3. Doctor adds one or more drug line items with dosage, route, frequency, and duration. 4. Doctor optionally adds special instructions. 5. Doctor submits the prescription. 6. System saves prescription with status "Pending". 7. Doctor optionally prints the prescription. |
| **Postconditions** | A prescription record with line items is persisted. Status is "Pending". |

---

### UC-LAB-001: Order Lab Investigation

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-LAB-001 |
| **Name** | Order Lab Investigation |
| **Actors** | Doctor |
| **Preconditions** | Patient has an active appointment. Doctor is authenticated. |
| **Main Flow** | 1. Doctor opens patient's active appointment. 2. Doctor navigates to Lab Investigation. 3. Doctor selects one or more tests from the test catalogue. 4. Doctor marks as urgent if required and enters clinical notes. 5. Doctor submits the order. 6. System saves lab order with status "Ordered". |
| **Postconditions** | A lab order is persisted in `lab_orders`. Lab technician is notified. |

---

### UC-LAB-002: Enter Lab Results

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-LAB-002 |
| **Name** | Enter Lab Results |
| **Actors** | Lab Technician |
| **Preconditions** | Lab order exists with status "Ordered" or "SpecimenCollected". Lab technician is authenticated. |
| **Main Flow** | 1. Lab technician opens the pending lab orders queue. 2. Lab technician selects the order. 3. Lab technician updates status to "SpecimenCollected" then "Processing". 4. Lab technician enters result values for each test. 5. System computes abnormal flags based on reference ranges. 6. Lab technician submits results. 7. System updates order status to "Resulted". |
| **Postconditions** | Results are persisted in `lab_results`. Abnormal flags are set. Doctor is notified. |

---

### UC-CLN-001: Create Clinical Record

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-CLN-001 |
| **Name** | Create Clinical Record |
| **Actors** | Doctor, Nurse |
| **Preconditions** | Patient has a Checked-In appointment. Actor is authenticated. |
| **Main Flow** | 1. Actor opens the patient's active appointment. 2. Actor navigates to Clinical Records. 3. Actor enters vital signs. 4. Actor enters SOAP note sections. 5. Actor saves as draft (not finalised). 6. Doctor reviews and finalises the record. 7. System sets `is_finalised = TRUE` and records `finalised_at`. |
| **Alternate Flow A** | 5a. Actor saves draft → record is editable until finalised. |
| **Postconditions** | A clinical record is persisted. Once finalised, it is immutable. |

---

## 5. ER Diagram Description

The following entities and relationships constitute the core data model of SPCRMS:

### Entities and Attributes

1. **patients** — Central entity. PK: `patient_id`. Holds all demographic data. Participates in appointments, diagnoses, prescriptions, lab orders, and clinical records.

2. **healthcare_professionals** — Represents doctors, nurses, and lab technicians. PK: `hcp_id`. FK: `user_id` → `users`. Participates in appointments, diagnoses, prescriptions, lab orders, and clinical records.

3. **users** — Authentication entity. PK: `user_id`. Attributes: `username`, `password_hash`, `role`, `is_active`. Referenced by `healthcare_professionals` and audit fields.

4. **appointments** — Central transactional entity linking patients and HCPs for a specific time slot. PK: `appointment_id`. FK: `patient_id`, `hcp_id`, `created_by`.

5. **diagnoses** — Diagnostic entries per visit. PK: `diagnosis_id`. FK: `appointment_id`, `patient_id`, `icd10_code`, `diagnosed_by`.

6. **icd10_codes** — Reference table for ICD-10 codes. PK: `code`. Attributes: `description`, `category`. Pre-loaded static data.

7. **prescriptions** — Prescription header per appointment. PK: `prescription_id`. FK: `appointment_id`, `patient_id`, `prescribed_by`.

8. **prescription_items** — Individual drug line items. PK: `item_id`. FK: `prescription_id`.

9. **lab_orders** — Lab investigation order per appointment. PK: `order_id`. FK: `appointment_id`, `patient_id`, `ordered_by`.

10. **lab_results** — Individual test result per lab order. PK: `result_id`. FK: `order_id`, `test_id`, `resulted_by`.

11. **lab_test_catalogue** — Reference table of available lab tests. PK: `test_id`. Attributes: `test_name`, `category`, `normal_range_low`, `normal_range_high`, `unit`.

12. **clinical_records** — SOAP-format clinical notes per appointment. PK: `record_id`. FK: `appointment_id`, `patient_id`, `recorded_by`.

13. **hcp_availability** — Weekly schedule slots for HCPs. PK: `availability_id`. FK: `hcp_id`. Attributes: `day_of_week`, `start_time`, `end_time`.

### Relationships

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| patients — appointments | 1 : N | A patient may have many appointments. |
| healthcare_professionals — appointments | 1 : N | An HCP may attend many appointments. |
| appointments — diagnoses | 1 : N | An appointment may have multiple diagnoses. |
| icd10_codes — diagnoses | 1 : N | An ICD-10 code may be used in many diagnoses. |
| appointments — prescriptions | 1 : 1 (or 1:N) | An appointment may generate one or more prescriptions. |
| prescriptions — prescription_items | 1 : N | A prescription has one or more drug items. |
| appointments — lab_orders | 1 : N | An appointment may generate multiple lab orders. |
| lab_orders — lab_results | 1 : N | A lab order contains results for one or more tests. |
| lab_test_catalogue — lab_results | 1 : N | A test from the catalogue appears in many results. |
| appointments — clinical_records | 1 : 1 | Each appointment has one clinical record (SOAP note). |
| healthcare_professionals — hcp_availability | 1 : N | An HCP has multiple weekly availability slots. |
| users — healthcare_professionals | 1 : 1 | Each HCP has exactly one login account. |

---

## 6. Data Dictionary

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK | System user identifier |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| `role` | VARCHAR(50) | NOT NULL | Admin, Doctor, Nurse, LabTech, Receptionist |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active flag |
| `last_login` | TIMESTAMPTZ | — | Last successful login |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation time |

### Table: `patients`

*(See Section 3.1.3)*

### Table: `healthcare_professionals`

*(See Section 3.2.3)*

### Table: `hcp_availability`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `availability_id` | UUID | PK | Availability slot identifier |
| `hcp_id` | UUID | FK → healthcare_professionals | Owning HCP |
| `day_of_week` | SMALLINT | CHECK 0–6 (0=Mon) | Day of week |
| `start_time` | TIME | NOT NULL | Slot start time |
| `end_time` | TIME | NOT NULL | Slot end time |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether this slot is active |

### Table: `appointments`

*(See Section 3.3.3)*

### Table: `icd10_codes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | VARCHAR(10) | PK | ICD-10 code (e.g., J06.9) |
| `description` | TEXT | NOT NULL | Full code description |
| `category` | VARCHAR(100) | — | Code category/chapter |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Active in catalogue |

### Table: `diagnoses`

*(See Section 3.4.3)*

### Table: `prescriptions`

*(See Section 3.5.3)*

### Table: `prescription_items`

*(See Section 3.5.3)*

### Table: `lab_test_catalogue`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `test_id` | UUID | PK | Test catalogue identifier |
| `test_name` | VARCHAR(255) | NOT NULL | Test name (e.g., CBC, Lipid Profile) |
| `category` | VARCHAR(100) | — | e.g., Haematology, Biochemistry |
| `normal_range_low` | NUMERIC | — | Default lower bound of normal range |
| `normal_range_high` | NUMERIC | — | Default upper bound of normal range |
| `unit` | VARCHAR(30) | — | Default result unit |
| `turnaround_hours` | INTEGER | — | Expected turnaround time in hours |

### Table: `lab_orders`

*(See Section 3.6.3)*

### Table: `lab_results`

*(See Section 3.6.3)*

### Table: `clinical_records`

*(See Section 3.7.3)*

---

## 7. Term 2 Extension

In Term 2, the SPCRMS shall be extended to support **multimodal clinical data**. The following data types and storage strategies are planned:

### 7.1 Medical Images (DICOM)

- **Data:** Radiology images (X-Ray, CT, MRI, Ultrasound) in DICOM format.
- **Storage Strategy:** Images shall be stored in an object storage service (e.g., MinIO or AWS S3). A new table `imaging_studies` shall store metadata (modality, body part, acquisition date, storage URL, patient ID, appointment ID). Retrieval shall be via pre-signed URLs. Full-text search on DICOM metadata shall be enabled via a dedicated DICOM viewer integration.

### 7.2 Lab Reports (PDF)

- **Data:** Scanned or digitally generated PDF lab reports from external labs.
- **Storage Strategy:** PDFs shall be stored in object storage. A `lab_documents` table shall link PDFs to `lab_orders` with metadata (file size, checksum, upload timestamp). Text extraction (OCR) shall be considered for searchability.

### 7.3 ECG and Audio Signals

- **Data:** Electrocardiogram waveform data and respiratory/cardiac audio recordings.
- **Storage Strategy:** ECG data shall be stored in a time-series-friendly format (e.g., compressed WFDB format in object storage). A `physiological_signals` table shall store metadata and references. Audio files (WAV/MP3) shall likewise be stored in object storage with metadata linking to `clinical_records`.

### 7.4 Database Implications

The relational PostgreSQL schema shall be extended with:
- `JSONB` columns for flexible metadata on media records.
- `tsvector` columns for full-text search on notes and reports.
- External foreign-key references to object storage paths.
- Possible use of PostgreSQL's `pg_vector` extension for AI-based similarity search on embeddings derived from clinical notes and images.

---

*End of SRS — Smart Patient & Clinical Record Management System, Part 1*
