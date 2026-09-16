# Software Requirements Specification
## Smart Patient & Clinical Record Management System (SPCRMS)
### Version 1.0 | Term 1 Submission

---

**Document Control**

| Field | Detail |
|---|---|
| Project Title | Smart Patient & Clinical Record Management System |
| Version | 1.0 |
| Status | Draft |
| Target RDBMS | PostgreSQL 16 |
| Prepared for | BITS Pilani — Database Management Systems (Term 1) |
| Date | September 2026 |

---

## Table of Contents

1. Introduction
2. Overall Description
3. Specific Requirements
4. Use Cases
5. ER Diagram Description
6. Data Dictionary
7. Term 2 Extension Plan

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the Smart Patient & Clinical Record Management System (SPCRMS). The system is designed to digitize and centralise the management of hospital operations, patient records, clinical treatments, laboratory investigations, billing, and administrative reporting within a single healthcare facility.

This document serves as the authoritative reference for database design, application development, and academic evaluation during Term 1.

### 1.2 Scope

The SPCRMS shall provide a multi-role, relational-database-backed web application enabling the following operations:

- Secure registration and role-based login for Admin, Doctor, Clerk, and LabPersonnel
- Administration of hospital infrastructure including wards, beds, lab facilities, and equipment
- Patient registration and admission management by Clerks
- Clinical treatment documentation and discharge management by Doctors
- Invoice generation based on treatments and laboratory charges by Clerks
- Lab test management and charge entry by LabPersonnel
- Seminar and hospital-upgradation event tracking by Admin
- Aggregate report generation across all activities by Admin

The Term 1 implementation is restricted to structured, text-based relational data modelled in PostgreSQL. Multimodal data (medical images, lab PDFs, ECG signals, audio) is deferred to Term 2 (see Section 7).

### 1.3 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| SPCRMS | Smart Patient & Clinical Record Management System |
| RDBMS | Relational Database Management System |
| PK | Primary Key |
| FK | Foreign Key |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| CRUD | Create, Read, Update, Delete |
| RBAC | Role-Based Access Control |
| ICU | Intensive Care Unit |
| IV | Intravenous |
| 3NF | Third Normal Form |

### 1.4 References

- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- PostgreSQL 16 Official Documentation
- BITS Pilani DBMS Assignment Specification — Term 1 (2026)

### 1.5 Overview

Section 2 provides a high-level product description and user class definitions. Section 3 details functional and non-functional requirements per module with entity schemas. Section 4 presents use cases. Section 5 describes the ER model textually. Section 6 provides the full data dictionary. Section 7 outlines the Term 2 multimodal extension plan.

---

## 2. Overall Description

### 2.1 Product Perspective

The SPCRMS is a standalone web application for a single healthcare facility. It replaces paper-based and fragmented record-keeping with a unified PostgreSQL-backed system. All roles access the system through a web browser over the hospital's internal network. No integration with external hospital systems or insurance platforms is required in Term 1.

### 2.2 Product Functions

The system provides the following eight modules:

| Module | Summary |
|---|---|
| 1. Registration/Login | Secure account creation and role-based authentication for all user types |
| 2. Admin-Hospital | Hospital profile, ward configuration, bed management |
| 3. Admin-Lab | Lab facility catalogue and testing capability management |
| 4. Admin-Equipments | Equipment inventory tracking (ventilators, incubators, etc.) |
| 5. Clerks-Patients Data | Patient registration, admission, and historical record entry |
| 6. Doctors-Treatment | Treatment plans, medications, IV fluids, and discharge management |
| 7. Clerks-Invoice Generation | Itemised invoice creation from treatment, medicine, lab, and bed charges |
| 8. Reports | Admin-level aggregate reports on patients, tests, seminars, and revenue |

Additionally, Admin shall manage seminar records as part of hospital-upgradation tracking (linked to Module 8 reporting).

### 2.3 User Classes and Characteristics

| Role | Responsibilities | System Access |
|---|---|---|
| Admin | Hospital setup, lab/equipment management, seminar tracking, report generation | Full access to all read/write operations; exclusive access to hospital config and reports |
| Doctor | Treatment documentation, medication entry, discharge instructions | Patient treatment records; read access to patient admission data |
| Clerk | Patient registration and admission, invoice generation | Patient data module; invoice module; read access to treatment charges |
| LabPersonnel | Lab test entry, result recording, charge assignment | Lab test order module only |

### 2.4 Operating Environment

- **Database:** PostgreSQL 16 or later
- **Application Server:** Node.js / Python (Flask or Django) — Term 2; Term 1 focuses on schema and UI prototype
- **Client:** Web browser (Chrome, Firefox, Edge — latest two major versions)
- **Network:** Internal hospital LAN
- **Concurrency:** Up to 30 simultaneous users in Term 1

### 2.5 Design and Implementation Constraints

- All tables shall use surrogate SERIAL integer primary keys.
- Timestamps shall be stored in UTC using the TIMESTAMPTZ type.
- Passwords shall be stored as bcrypt hashes; plaintext storage is prohibited.
- The schema shall be normalised to at least Third Normal Form (3NF).
- Referential integrity shall be enforced through foreign key constraints with appropriate ON DELETE behaviour.
- Role-based access control shall be enforced at the application layer using the `role` column in the `users` table.

### 2.6 Assumptions and Dependencies

- One hospital facility is modelled; multi-branch support is out of scope.
- A patient may have multiple admissions over time.
- InPatient admissions are linked to a ward; OutPatient admissions are not.
- An invoice is generated per admission and aggregates treatment, medicine, lab, and bed charges.
- Bed charges are calculated by the system as `days_admitted × daily_bed_rate` based on ward type.
- Lab charges are entered directly by LabPersonnel per test.

---

## 3. Specific Requirements

---

### 3.1 Registration/Login Module

#### 3.1.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system shall allow new users to be registered by an Admin with a designated role (Admin, Doctor, Clerk, LabPersonnel). |
| FR-AUTH-02 | The system shall allow all registered users to log in using a unique username and password. |
| FR-AUTH-03 | The system shall authenticate users and establish a role-bound session upon successful login. |
| FR-AUTH-04 | The system shall restrict access to module screens based on the authenticated user's role. |
| FR-AUTH-05 | The system shall allow users to log out, terminating their session. |
| FR-AUTH-06 | The system shall allow an Admin to deactivate a user account (soft delete). |

#### 3.1.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-AUTH-01 | Passwords shall be stored using bcrypt with a minimum cost factor of 12. |
| NFR-AUTH-02 | Login responses shall be returned within 2 seconds. |
| NFR-AUTH-03 | A failed login shall not reveal whether the username or password was incorrect. |
| NFR-AUTH-04 | Sessions shall expire after 60 minutes of inactivity. |

#### 3.1.3 Entity Schema — users

| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | SERIAL | PK, NOT NULL | Unique user identifier |
| full_name | VARCHAR(150) | NOT NULL | Display name |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Login username |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| role | VARCHAR(20) | NOT NULL | Admin / Doctor / Clerk / LabPersonnel |
| is_active | BOOLEAN | DEFAULT TRUE | FALSE = deactivated account |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| last_login | TIMESTAMPTZ | | Timestamp of last successful login |

---

### 3.2 Admin-Hospital Module

#### 3.2.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-HOSP-01 | The system shall allow an Admin to create and update the hospital's profile including name and address. |
| FR-HOSP-02 | The system shall allow an Admin to record and update the total number of beds in the hospital. |
| FR-HOSP-03 | The system shall allow an Admin to record and update the number of wards and the number of beds per ward. |
| FR-HOSP-04 | The system shall allow an Admin to categorise each ward by type: ICU, Maternity, Outpatient, or InPatient. |
| FR-HOSP-05 | The system shall display a summary of ward occupancy (total beds vs available beds) per ward. |
| FR-HOSP-06 | The system shall record the Admin user and timestamp for each update to hospital or ward data. |

#### 3.2.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-HOSP-01 | Ward occupancy summary shall be computed from live admission data; no manual entry of occupancy counts. |
| NFR-HOSP-02 | Only users with the Admin role shall have write access to hospital and ward records. |

#### 3.2.3 Entity Schema — hospital_info, ward

**hospital_info**

| Column | Type | Constraints | Description |
|---|---|---|---|
| hospital_id | SERIAL | PK, NOT NULL | Unique hospital record ID |
| hospital_name | VARCHAR(200) | NOT NULL | Name of the hospital |
| address | TEXT | NOT NULL | Full address |
| total_beds | INTEGER | NOT NULL | Total bed count across all wards |
| total_wards | INTEGER | NOT NULL | Total number of wards |
| updated_by | INTEGER | FK → users | Admin who last updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**ward**

| Column | Type | Constraints | Description |
|---|---|---|---|
| ward_id | SERIAL | PK, NOT NULL | Unique ward identifier |
| hospital_id | INTEGER | FK → hospital_info, NOT NULL | Parent hospital |
| ward_name | VARCHAR(100) | NOT NULL | e.g., Ward A, ICU-1 |
| ward_type | VARCHAR(20) | NOT NULL | ICU / Maternity / Outpatient / InPatient |
| total_beds | INTEGER | NOT NULL | Beds in this ward |
| daily_bed_rate | NUMERIC(10,2) | DEFAULT 0 | Charge per bed per day (for billing) |
| updated_by | INTEGER | FK → users | Admin who last updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### 3.3 Admin-Lab Module

#### 3.3.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-LAB-01 | The system shall allow an Admin to add, update, and deactivate lab facility records. |
| FR-LAB-02 | Each lab facility record shall include the test name, test category, and availability status. |
| FR-LAB-03 | The system shall display all available lab facilities in a searchable list. |
| FR-LAB-04 | The system shall record which Admin updated each lab facility entry and when. |

#### 3.3.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-LAB-01 | Lab facility search shall return results within 1 second. |
| NFR-LAB-02 | Only Admin role users shall have write access to lab facility records. |

#### 3.3.3 Entity Schema — lab_facility

| Column | Type | Constraints | Description |
|---|---|---|---|
| lab_id | SERIAL | PK, NOT NULL | Unique lab facility ID |
| hospital_id | INTEGER | FK → hospital_info, NOT NULL | Parent hospital |
| test_name | VARCHAR(200) | NOT NULL | Name of the lab test (e.g., CBC, LFT) |
| test_category | VARCHAR(100) | NOT NULL | Category (e.g., Haematology, Biochemistry) |
| is_available | BOOLEAN | DEFAULT TRUE | Whether the test is currently available |
| updated_by | INTEGER | FK → users | Admin who last updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### 3.4 Admin-Equipments Module

#### 3.4.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-EQP-01 | The system shall allow an Admin to add and update equipment records. |
| FR-EQP-02 | Each equipment record shall include the equipment name, type, total count, and available count. |
| FR-EQP-03 | The system shall specifically support equipment types including Ventilator and Incubator. |
| FR-EQP-04 | The system shall display a summary of all equipment with total and available counts. |
| FR-EQP-05 | The system shall record which Admin last updated each equipment record. |

#### 3.4.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-EQP-01 | Equipment count updates shall reflect immediately in the equipment summary view. |
| NFR-EQP-02 | Only Admin role users shall have write access to equipment records. |

#### 3.4.3 Entity Schema — equipment

| Column | Type | Constraints | Description |
|---|---|---|---|
| equipment_id | SERIAL | PK, NOT NULL | Unique equipment record ID |
| hospital_id | INTEGER | FK → hospital_info, NOT NULL | Parent hospital |
| equipment_name | VARCHAR(200) | NOT NULL | Name of equipment |
| equipment_type | VARCHAR(50) | NOT NULL | Ventilator / Incubator / Other |
| total_count | INTEGER | NOT NULL | Total units owned |
| available_count | INTEGER | NOT NULL | Units currently available |
| updated_by | INTEGER | FK → users | Admin who last updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### 3.5 Clerks-Patients Data Module

#### 3.5.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-PAT-01 | The system shall allow a Clerk to register a new patient with name, date of birth, gender, and contact information. |
| FR-PAT-02 | The system shall allow a Clerk to record an admission for a patient specifying InPatient or OutPatient type. |
| FR-PAT-03 | For InPatient admissions, the system shall require the Clerk to assign a ward. |
| FR-PAT-04 | The system shall allow a Clerk to record the ailment and date of admission. |
| FR-PAT-05 | The system shall allow a Clerk to record the patient's past history of diagnosis. |
| FR-PAT-06 | The system shall allow a Clerk to search for patients by name or patient ID. |
| FR-PAT-07 | The system shall allow a Clerk to update admission status to Discharged when the patient is discharged. |

#### 3.5.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-PAT-01 | Patient search shall return results within 2 seconds for a database of up to 50,000 records. |
| NFR-PAT-02 | Patient records shall not be physically deleted; deactivation only. |

#### 3.5.3 Entity Schema — patient, admission

**patient**

| Column | Type | Constraints | Description |
|---|---|---|---|
| patient_id | SERIAL | PK, NOT NULL | Unique patient identifier |
| full_name | VARCHAR(150) | NOT NULL | Patient's full name |
| dob | DATE | NOT NULL | Date of birth |
| gender | VARCHAR(20) | NOT NULL | Male / Female / Other |
| phone | VARCHAR(20) | NOT NULL | Contact number |
| address | TEXT | | Residential address |
| past_diagnosis_history | TEXT | | Free-text past medical history |
| registered_by | INTEGER | FK → users | Clerk who registered the patient |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Registration timestamp |

**admission**

| Column | Type | Constraints | Description |
|---|---|---|---|
| admission_id | SERIAL | PK, NOT NULL | Unique admission ID |
| patient_id | INTEGER | FK → patient, NOT NULL | Admitted patient |
| patient_type | VARCHAR(20) | NOT NULL | InPatient / OutPatient |
| ward_id | INTEGER | FK → ward | Assigned ward (NULL for OutPatient) |
| ailment | VARCHAR(300) | NOT NULL | Presenting ailment/complaint |
| date_of_admission | DATE | NOT NULL | Admission date |
| date_of_discharge | DATE | | Discharge date (NULL if still admitted) |
| status | VARCHAR(20) | DEFAULT 'Admitted' | Admitted / Discharged |
| registered_by | INTEGER | FK → users | Clerk who created admission |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### 3.6 Doctors-Treatment Module

#### 3.6.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-TRT-01 | The system shall allow a Doctor to create a treatment record linked to an admission. |
| FR-TRT-02 | The treatment record shall include the number of days of treatment advised. |
| FR-TRT-03 | The system shall allow a Doctor to record medicines prescribed including name, quantity, unit, and unit cost. |
| FR-TRT-04 | The system shall allow a Doctor to record IV fluids and other intravenous treatments administered. |
| FR-TRT-05 | The system shall allow a Doctor to enter free-text treatment notes and clinical observations. |
| FR-TRT-06 | The system shall allow a Doctor to record discharge instructions and mark the treatment as complete. |
| FR-TRT-07 | The system shall allow a Doctor to update an existing treatment record. |

#### 3.6.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-TRT-01 | Treatment records shall be retained indefinitely and shall not be physically deleted. |
| NFR-TRT-02 | Only users with the Doctor role shall be permitted to create or modify treatment records. |

#### 3.6.3 Entity Schema — treatment, medicine_item

**treatment**

| Column | Type | Constraints | Description |
|---|---|---|---|
| treatment_id | SERIAL | PK, NOT NULL | Unique treatment record ID |
| admission_id | INTEGER | FK → admission, NOT NULL | Linked admission |
| doctor_id | INTEGER | FK → users, NOT NULL | Treating doctor |
| days_advised | INTEGER | | Number of treatment days advised |
| treatment_notes | TEXT | | Clinical observations and notes |
| iv_fluids | TEXT | | IV fluids and intravenous details |
| discharge_instructions | TEXT | | Post-discharge care instructions |
| is_complete | BOOLEAN | DEFAULT FALSE | TRUE when doctor finalises treatment |
| treatment_date | TIMESTAMPTZ | DEFAULT NOW() | Treatment entry timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last modification timestamp |

**medicine_item**

| Column | Type | Constraints | Description |
|---|---|---|---|
| item_id | SERIAL | PK, NOT NULL | Unique medicine line item ID |
| treatment_id | INTEGER | FK → treatment, NOT NULL | Parent treatment record |
| medicine_name | VARCHAR(200) | NOT NULL | Name of medicine prescribed |
| quantity | NUMERIC(8,2) | NOT NULL | Quantity dispensed |
| unit | VARCHAR(50) | NOT NULL | Tablet / ml / mg / vial |
| unit_cost | NUMERIC(10,2) | NOT NULL DEFAULT 0 | Cost per unit (for invoice) |

---

### 3.7 Clerks-Invoice Generation Module

#### 3.7.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-INV-01 | The system shall allow a Clerk to generate an invoice for an admission. |
| FR-INV-02 | The invoice shall automatically aggregate treatment charges, medicine charges, lab test charges, and bed charges. |
| FR-INV-03 | Bed charges shall be computed as: number of days admitted × daily bed rate of the assigned ward. |
| FR-INV-04 | Medicine charges shall be computed as: sum of (quantity × unit_cost) for all medicine items in the treatment. |
| FR-INV-05 | Lab charges shall be the sum of charges from all lab test orders linked to the admission. |
| FR-INV-06 | The system shall display an itemised invoice with a grand total. |
| FR-INV-07 | The system shall allow a Clerk to mark an invoice as Issued or Paid. |
| FR-INV-08 | The system shall prevent duplicate invoices for the same admission (one invoice per admission). |

#### 3.7.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-INV-01 | Invoice generation shall complete within 3 seconds regardless of line-item count. |
| NFR-INV-02 | Invoice records shall not be physically deleted. |
| NFR-INV-03 | A Paid invoice shall not be editable. |

#### 3.7.3 Entity Schema — invoice

| Column | Type | Constraints | Description |
|---|---|---|---|
| invoice_id | SERIAL | PK, NOT NULL | Unique invoice ID |
| admission_id | INTEGER | FK → admission, NOT NULL, UNIQUE | One invoice per admission |
| patient_id | INTEGER | FK → patient, NOT NULL | Patient being invoiced |
| generated_by | INTEGER | FK → users, NOT NULL | Clerk who generated the invoice |
| treatment_charges | NUMERIC(12,2) | DEFAULT 0 | Aggregated treatment service charges |
| medicine_charges | NUMERIC(12,2) | DEFAULT 0 | Aggregated medicine costs |
| lab_charges | NUMERIC(12,2) | DEFAULT 0 | Aggregated lab test charges |
| bed_charges | NUMERIC(12,2) | DEFAULT 0 | days × daily_bed_rate |
| total_amount | NUMERIC(12,2) | NOT NULL | Sum of all charge categories |
| status | VARCHAR(20) | DEFAULT 'Draft' | Draft / Issued / Paid |
| generated_at | TIMESTAMPTZ | DEFAULT NOW() | Invoice creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last status update timestamp |

---

### 3.8 Reports Module

#### 3.8.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-RPT-01 | The system shall allow an Admin to generate a Patients Treated report showing total admissions, InPatient vs OutPatient counts, and discharge rate within a date range. |
| FR-RPT-02 | The system shall allow an Admin to generate a Tests Conducted report showing total tests ordered, tests resulted, and counts by test category within a date range. |
| FR-RPT-03 | The system shall allow an Admin to generate a Seminars Conducted report listing all seminars with title, date, presenter, budget, and participant count. |
| FR-RPT-04 | The system shall allow an Admin to generate a Revenue Generated report showing total invoiced amount, total collected (Paid), and outstanding (Issued) within a date range. |
| FR-RPT-05 | All reports shall support filtering by date range. |
| FR-RPT-06 | Reports shall be displayable in tabular form within the application. |

#### 3.8.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-RPT-01 | Report queries shall complete within 5 seconds for data spanning up to 1 year. |
| NFR-RPT-02 | Only Admin role users shall access the Reports module. |

#### 3.8.3 Entity Schema — seminar

| Column | Type | Constraints | Description |
|---|---|---|---|
| seminar_id | SERIAL | PK, NOT NULL | Unique seminar ID |
| title | VARCHAR(300) | NOT NULL | Seminar title |
| description | TEXT | | Seminar description and objectives |
| conducted_date | DATE | NOT NULL | Date of the seminar |
| conducted_by | VARCHAR(200) | NOT NULL | Presenter/speaker name |
| budget | NUMERIC(12,2) | DEFAULT 0 | Seminar cost/budget |
| participants_count | INTEGER | DEFAULT 0 | Number of attendees |
| recorded_by | INTEGER | FK → users, NOT NULL | Admin who entered the record |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### 3.9 Lab Test Orders (LabPersonnel Module)

#### 3.9.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-LTST-01 | The system shall allow a LabPersonnel user to view pending lab test orders. |
| FR-LTST-02 | The system shall allow a LabPersonnel user to update the status of a test order (Ordered → Processing → Resulted). |
| FR-LTST-03 | The system shall allow a LabPersonnel user to enter test result notes. |
| FR-LTST-04 | The system shall allow a LabPersonnel user to enter the charge for a completed test. |
| FR-LTST-05 | The system shall allow a Doctor to raise a lab test order against an admission. |

#### 3.9.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-LTST-01 | Lab result entry shall be restricted to LabPersonnel; Doctors may only place orders. |
| NFR-LTST-02 | Test charges entered by LabPersonnel shall be automatically included in the patient's invoice calculation. |

#### 3.9.3 Entity Schema — lab_test_order

| Column | Type | Constraints | Description |
|---|---|---|---|
| test_order_id | SERIAL | PK, NOT NULL | Unique lab order ID |
| patient_id | INTEGER | FK → patient, NOT NULL | Patient being tested |
| admission_id | INTEGER | FK → admission | Linked admission (nullable) |
| lab_id | INTEGER | FK → lab_facility, NOT NULL | Test facility/type |
| ordered_by | INTEGER | FK → users, NOT NULL | Doctor who ordered the test |
| test_date | DATE | NOT NULL | Date test was ordered |
| result_notes | TEXT | | Lab result text entered by LabPersonnel |
| charges | NUMERIC(10,2) | DEFAULT 0 | Fee for this test |
| status | VARCHAR(20) | DEFAULT 'Ordered' | Ordered / Processing / Resulted |
| updated_by | INTEGER | FK → users | LabPersonnel who last updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

## 4. Use Cases

### UC-01: User Registration & Login

| Field | Detail |
|---|---|
| Use Case ID | UC-01 |
| Name | User Registration and Login |
| Actors | Admin (registration), All roles (login) |
| Preconditions | For registration: the actor is authenticated as Admin. For login: a user account exists. |
| **Main Flow** | 1. Admin navigates to User Management and selects "Add User". 2. Admin enters full name, username, temporary password, and selects a role. 3. System validates uniqueness of the username. 4. System creates the user account with is_active = TRUE. 5. User navigates to login screen. 6. User enters username and password. 7. System validates credentials and establishes a role-bound session. 8. System redirects the user to the role-appropriate dashboard. |
| **Alternate Flow A** | 3a. Username already exists → System displays "Username taken" error; account not created. |
| **Alternate Flow B** | 7a. Invalid credentials → System displays generic "Incorrect username or password" message; no session created. |
| Postconditions | A session is established for the authenticated user. Navigation is restricted to screens permitted by the user's role. |

---

### UC-02: Update Hospital & Ward Info

| Field | Detail |
|---|---|
| Use Case ID | UC-02 |
| Name | Update Hospital Information and Ward Configuration |
| Actors | Admin |
| Preconditions | Admin is authenticated. Hospital record exists or is being created for the first time. |
| **Main Flow** | 1. Admin navigates to Hospital Info module. 2. Admin views current hospital details. 3. Admin edits hospital name, address, total beds, and total wards. 4. Admin navigates to Ward list and adds or edits a ward specifying ward name, type (ICU/Maternity/Outpatient/InPatient), total beds, and daily bed rate. 5. System saves changes, recording the Admin's user_id and timestamp. 6. System displays updated occupancy summary. |
| **Alternate Flow A** | 4a. Ward type not in the allowed list → Form validation prevents submission. |
| Postconditions | Hospital and ward records are updated. Occupancy summary reflects new bed counts. |

---

### UC-03: Update Lab Facilities

| Field | Detail |
|---|---|
| Use Case ID | UC-03 |
| Name | Update Lab Facility Information |
| Actors | Admin |
| Preconditions | Admin is authenticated. |
| **Main Flow** | 1. Admin navigates to Lab Facilities module. 2. Admin selects "Add Lab Test" or selects an existing entry to edit. 3. Admin enters or updates test name, test category, and availability status. 4. System saves the record with the Admin's user_id and timestamp. 5. System displays the updated lab facility list. |
| **Alternate Flow A** | 3a. Test name already exists → System warns of a duplicate; Admin may proceed or cancel. |
| Postconditions | Lab facility record is created or updated. Updated availability is reflected in the Doctor's lab test ordering screen. |

---

### UC-04: Update Equipment Inventory

| Field | Detail |
|---|---|
| Use Case ID | UC-04 |
| Name | Update Equipment Inventory |
| Actors | Admin |
| Preconditions | Admin is authenticated. |
| **Main Flow** | 1. Admin navigates to Equipment module. 2. Admin selects "Add Equipment" or edits an existing record. 3. Admin enters equipment name, type (Ventilator/Incubator/Other), total count, and available count. 4. System saves the record with Admin's user_id and timestamp. 5. System displays the updated equipment summary. |
| **Alternate Flow A** | 3a. Available count exceeds total count → System rejects input with validation error. |
| Postconditions | Equipment record is created or updated. Summary reflects current availability. |

---

### UC-05: Register Patient and Create Admission

| Field | Detail |
|---|---|
| Use Case ID | UC-05 |
| Name | Register Patient and Create Admission |
| Actors | Clerk |
| Preconditions | Clerk is authenticated. For InPatient admission, at least one ward with available beds exists. |
| **Main Flow** | 1. Clerk navigates to Patients module and selects "Register New Patient". 2. Clerk enters patient full name, date of birth, gender, phone, address, and past diagnosis history. 3. System saves the patient record with a unique patient_id. 4. Clerk selects "Create Admission" for the patient. 5. Clerk selects patient type (InPatient/OutPatient), ailment, and date of admission. 6. For InPatient, Clerk selects an available ward from the dropdown. 7. System creates the admission record with status = Admitted. |
| **Alternate Flow A** | 6a. No beds available in any ward → System displays a warning; Clerk may select OutPatient or defer. |
| **Alternate Flow B** | 2a. Patient already registered (matching name + DOB) → System suggests existing record. |
| Postconditions | Patient and admission records created. For InPatient, ward occupancy is updated. |

---

### UC-06: Enter Treatment and Discharge Details

| Field | Detail |
|---|---|
| Use Case ID | UC-06 |
| Name | Enter Treatment and Discharge Details |
| Actors | Doctor |
| Preconditions | Doctor is authenticated. An active admission exists for the patient. |
| **Main Flow** | 1. Doctor searches for the patient and opens the active admission. 2. Doctor selects "Add Treatment". 3. Doctor enters number of days advised, treatment notes, IV fluids detail, and adds medicine items (name, quantity, unit, unit cost). 4. Doctor optionally places a lab test order by selecting a test from available lab facilities. 5. Doctor enters discharge instructions and marks treatment as complete. 6. System saves the treatment record linked to the admission. |
| **Alternate Flow A** | 3a. Doctor saves a partial treatment record and returns later to complete it (is_complete remains FALSE). |
| Postconditions | Treatment record saved with all medicine items. Lab orders placed if applicable. Discharge instructions recorded. |

---

### UC-07: Generate Patient Invoice

| Field | Detail |
|---|---|
| Use Case ID | UC-07 |
| Name | Generate Patient Invoice |
| Actors | Clerk |
| Preconditions | Clerk is authenticated. The admission has a completed or in-progress treatment. Patient is ready for discharge billing. |
| **Main Flow** | 1. Clerk opens the patient's admission record and selects "Generate Invoice". 2. System automatically computes: (a) medicine charges from medicine_item records, (b) lab charges from lab_test_order charges, (c) bed charges from days admitted × daily_bed_rate, (d) treatment charges as configured. 3. System displays itemised invoice preview with grand total. 4. Clerk reviews and confirms. 5. System saves invoice with status = Issued. 6. Clerk may subsequently mark the invoice as Paid upon receipt of payment. |
| **Alternate Flow A** | 1a. Invoice already exists for this admission → System displays existing invoice; editing is allowed only if status ≠ Paid. |
| **Alternate Flow B** | 4a. Clerk identifies an error → Clerk may adjust line items before confirming. |
| Postconditions | Invoice record saved. Revenue data available to Admin reports. |

---

### UC-08: Generate Admin Reports

| Field | Detail |
|---|---|
| Use Case ID | UC-08 |
| Name | Generate Administrative Reports |
| Actors | Admin |
| Preconditions | Admin is authenticated. Relevant data (admissions, tests, invoices, seminars) exists in the database. |
| **Main Flow** | 1. Admin navigates to Reports module. 2. Admin selects report type: Patients Treated / Tests Conducted / Seminars Conducted / Revenue Generated. 3. Admin sets date range filter. 4. System executes the appropriate aggregate query and displays results in a tabular format. 5. Admin optionally prints or exports the report (future enhancement). |
| **Alternate Flow A** | 4a. No data found in the selected range → System displays "No records found for the selected period". |
| Postconditions | Report displayed; no data is modified. |

---

## 5. ER Diagram Description

### Entities

| Entity | Primary Key | Key Attributes |
|---|---|---|
| users | user_id | username, role, is_active |
| hospital_info | hospital_id | hospital_name, total_beds, total_wards |
| ward | ward_id | ward_type, total_beds, daily_bed_rate |
| lab_facility | lab_id | test_name, test_category, is_available |
| equipment | equipment_id | equipment_name, equipment_type, total_count, available_count |
| patient | patient_id | full_name, dob, past_diagnosis_history |
| admission | admission_id | patient_type, ailment, date_of_admission, status |
| treatment | treatment_id | days_advised, iv_fluids, is_complete |
| medicine_item | item_id | medicine_name, quantity, unit_cost |
| lab_test_order | test_order_id | test_date, charges, status |
| invoice | invoice_id | total_amount, status |
| seminar | seminar_id | title, conducted_date, budget, participants_count |

### Relationships and Cardinality

| Relationship | Cardinality | Description |
|---|---|---|
| hospital_info → ward | 1 : N | A hospital has many wards |
| hospital_info → lab_facility | 1 : N | A hospital catalogues many lab tests |
| hospital_info → equipment | 1 : N | A hospital tracks many equipment records |
| patient → admission | 1 : N | A patient may have multiple admissions over time |
| ward → admission | 1 : N | A ward holds many InPatient admissions |
| admission → treatment | 1 : N | An admission may have one or more treatment records |
| treatment → medicine_item | 1 : N | A treatment contains one or more medicine line items |
| patient → lab_test_order | 1 : N | A patient may have many lab orders |
| admission → lab_test_order | 1 : N | An admission may generate multiple lab orders |
| lab_facility → lab_test_order | 1 : N | A lab facility type is referenced by many orders |
| admission → invoice | 1 : 1 | One invoice per admission |
| users → admission | 1 : N | A Clerk registers many admissions |
| users → treatment | 1 : N | A Doctor records many treatments |
| users → lab_test_order | 1 : N | A Doctor orders many tests; a LabPersonnel updates many results |
| users → invoice | 1 : N | A Clerk generates many invoices |
| users → seminar | 1 : N | An Admin records many seminar events |
| users → hospital_info / ward / lab_facility / equipment | 1 : N | Admin updates many facility records |

---

## 6. Data Dictionary

### users

| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | SERIAL | PK | Auto-incremented user ID |
| full_name | VARCHAR(150) | NOT NULL | User's display name |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Login handle |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| role | VARCHAR(20) | NOT NULL | Admin / Doctor / Clerk / LabPersonnel |
| is_active | BOOLEAN | DEFAULT TRUE | Soft-delete flag |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| last_login | TIMESTAMPTZ | | Last successful login |

### hospital_info

| Column | Type | Constraints | Description |
|---|---|---|---|
| hospital_id | SERIAL | PK | Auto-incremented ID |
| hospital_name | VARCHAR(200) | NOT NULL | Hospital name |
| address | TEXT | NOT NULL | Full address |
| total_beds | INTEGER | NOT NULL | Aggregate bed count |
| total_wards | INTEGER | NOT NULL | Number of wards |
| updated_by | INTEGER | FK → users | Last updating Admin |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### ward

| Column | Type | Constraints | Description |
|---|---|---|---|
| ward_id | SERIAL | PK | Auto-incremented ID |
| hospital_id | INTEGER | FK → hospital_info, NOT NULL | Parent hospital |
| ward_name | VARCHAR(100) | NOT NULL | Ward label |
| ward_type | VARCHAR(20) | NOT NULL | ICU / Maternity / Outpatient / InPatient |
| total_beds | INTEGER | NOT NULL | Beds in ward |
| daily_bed_rate | NUMERIC(10,2) | DEFAULT 0 | Per-day billing rate |
| updated_by | INTEGER | FK → users | Last updating Admin |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### lab_facility

| Column | Type | Constraints | Description |
|---|---|---|---|
| lab_id | SERIAL | PK | Auto-incremented ID |
| hospital_id | INTEGER | FK → hospital_info, NOT NULL | Parent hospital |
| test_name | VARCHAR(200) | NOT NULL | Test name (e.g., CBC) |
| test_category | VARCHAR(100) | NOT NULL | Category (e.g., Haematology) |
| is_available | BOOLEAN | DEFAULT TRUE | Availability flag |
| updated_by | INTEGER | FK → users | Last updating Admin |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### equipment

| Column | Type | Constraints | Description |
|---|---|---|---|
| equipment_id | SERIAL | PK | Auto-incremented ID |
| hospital_id | INTEGER | FK → hospital_info, NOT NULL | Parent hospital |
| equipment_name | VARCHAR(200) | NOT NULL | Equipment name |
| equipment_type | VARCHAR(50) | NOT NULL | Ventilator / Incubator / Other |
| total_count | INTEGER | NOT NULL | Total units |
| available_count | INTEGER | NOT NULL | Available units |
| updated_by | INTEGER | FK → users | Last updating Admin |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### patient

| Column | Type | Constraints | Description |
|---|---|---|---|
| patient_id | SERIAL | PK | Auto-incremented patient ID |
| full_name | VARCHAR(150) | NOT NULL | Patient's full name |
| dob | DATE | NOT NULL | Date of birth |
| gender | VARCHAR(20) | NOT NULL | Male / Female / Other |
| phone | VARCHAR(20) | NOT NULL | Contact number |
| address | TEXT | | Address |
| past_diagnosis_history | TEXT | | Historical diagnoses (free-text) |
| registered_by | INTEGER | FK → users | Clerk who registered |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Registration time |

### admission

| Column | Type | Constraints | Description |
|---|---|---|---|
| admission_id | SERIAL | PK | Auto-incremented admission ID |
| patient_id | INTEGER | FK → patient, NOT NULL | Admitted patient |
| patient_type | VARCHAR(20) | NOT NULL | InPatient / OutPatient |
| ward_id | INTEGER | FK → ward | Assigned ward (NULL for OutPatient) |
| ailment | VARCHAR(300) | NOT NULL | Presenting complaint |
| date_of_admission | DATE | NOT NULL | Admission date |
| date_of_discharge | DATE | | Discharge date |
| status | VARCHAR(20) | DEFAULT 'Admitted' | Admitted / Discharged |
| registered_by | INTEGER | FK → users | Clerk who created record |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |

### treatment

| Column | Type | Constraints | Description |
|---|---|---|---|
| treatment_id | SERIAL | PK | Auto-incremented ID |
| admission_id | INTEGER | FK → admission, NOT NULL | Linked admission |
| doctor_id | INTEGER | FK → users, NOT NULL | Treating doctor |
| days_advised | INTEGER | | Days of treatment advised |
| treatment_notes | TEXT | | Clinical observations |
| iv_fluids | TEXT | | IV fluid details |
| discharge_instructions | TEXT | | Post-discharge notes |
| is_complete | BOOLEAN | DEFAULT FALSE | Finalised flag |
| treatment_date | TIMESTAMPTZ | DEFAULT NOW() | Entry timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### medicine_item

| Column | Type | Constraints | Description |
|---|---|---|---|
| item_id | SERIAL | PK | Auto-incremented ID |
| treatment_id | INTEGER | FK → treatment, NOT NULL | Parent treatment |
| medicine_name | VARCHAR(200) | NOT NULL | Medicine name |
| quantity | NUMERIC(8,2) | NOT NULL | Dispensed quantity |
| unit | VARCHAR(50) | NOT NULL | Tablet / ml / mg / vial |
| unit_cost | NUMERIC(10,2) | DEFAULT 0 | Cost per unit |

### lab_test_order

| Column | Type | Constraints | Description |
|---|---|---|---|
| test_order_id | SERIAL | PK | Auto-incremented ID |
| patient_id | INTEGER | FK → patient, NOT NULL | Patient |
| admission_id | INTEGER | FK → admission | Linked admission |
| lab_id | INTEGER | FK → lab_facility, NOT NULL | Ordered test type |
| ordered_by | INTEGER | FK → users, NOT NULL | Ordering doctor |
| test_date | DATE | NOT NULL | Date ordered |
| result_notes | TEXT | | Lab result text |
| charges | NUMERIC(10,2) | DEFAULT 0 | Test fee |
| status | VARCHAR(20) | DEFAULT 'Ordered' | Ordered / Processing / Resulted |
| updated_by | INTEGER | FK → users | LabPersonnel who updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

### invoice

| Column | Type | Constraints | Description |
|---|---|---|---|
| invoice_id | SERIAL | PK | Auto-incremented ID |
| admission_id | INTEGER | FK → admission, NOT NULL, UNIQUE | One per admission |
| patient_id | INTEGER | FK → patient, NOT NULL | Patient billed |
| generated_by | INTEGER | FK → users, NOT NULL | Generating Clerk |
| treatment_charges | NUMERIC(12,2) | DEFAULT 0 | Treatment service fees |
| medicine_charges | NUMERIC(12,2) | DEFAULT 0 | Medicine cost total |
| lab_charges | NUMERIC(12,2) | DEFAULT 0 | Lab test cost total |
| bed_charges | NUMERIC(12,2) | DEFAULT 0 | Ward bed charges |
| total_amount | NUMERIC(12,2) | NOT NULL | Grand total |
| status | VARCHAR(20) | DEFAULT 'Draft' | Draft / Issued / Paid |
| generated_at | TIMESTAMPTZ | DEFAULT NOW() | Invoice creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last status update |

### seminar

| Column | Type | Constraints | Description |
|---|---|---|---|
| seminar_id | SERIAL | PK | Auto-incremented ID |
| title | VARCHAR(300) | NOT NULL | Seminar title |
| description | TEXT | | Content/objectives |
| conducted_date | DATE | NOT NULL | Date held |
| conducted_by | VARCHAR(200) | NOT NULL | Speaker/presenter name |
| budget | NUMERIC(12,2) | DEFAULT 0 | Cost incurred |
| participants_count | INTEGER | DEFAULT 0 | Attendance count |
| recorded_by | INTEGER | FK → users, NOT NULL | Admin who entered |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Entry timestamp |

---

## 7. Term 2 Extension Plan

### 7.1 Overview

Term 2 shall extend the SPCRMS to support multimodal clinical data. The relational schema defined in Term 1 forms the transactional backbone. Multimodal files shall be stored in object storage (MinIO or equivalent); metadata and references shall be managed in new PostgreSQL tables.

### 7.2 Planned Multimodal Data Types

| Data Type | Format | New Table | Storage |
|---|---|---|---|
| Medical Images | DICOM, JPEG, PNG | medical_image | Object storage; file key stored in DB |
| Lab Reports | PDF | lab_report_document | Object storage; linked to lab_test_order |
| ECG Recordings | CSV (signal), PNG | ecg_record | Object storage; time-series in separate table |
| Clinical Audio | MP3, WAV | clinical_audio | Object storage; linked to admission |
| Discharge Summaries | PDF | discharge_document | Object storage; linked to admission |

### 7.3 Planned Schema Extensions

Each new table shall store: PK, FK to patient/admission, file_reference (object storage key), file_type, uploaded_by (FK → users), uploaded_at (TIMESTAMPTZ), and descriptive metadata fields appropriate to the data type.

---

*End of SRS Document — Version 1.0*
