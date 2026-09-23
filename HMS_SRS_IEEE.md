# Software Requirements Specification
## Hospital Management System (HMS)

| Field | Detail |
|---|---|
| **Document ID** | HMS-SRS-v1.0 |
| **Version** | 1.0 |
| **Status** | Final Draft |
| **Standard** | IEEE 830-1998 / ISO/IEC/IEEE 29148:2018 |
| **Project** | Hospital Management System |
| **Repository** | DBMS_PROJECT |

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience
   - 1.4 Project Scope
   - 1.5 Definitions, Acronyms, and Abbreviations
   - 1.6 References
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Functions Summary
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 Assumptions and Dependencies
3. [External Interface Requirements — Front End Specifications](#3-external-interface-requirements--front-end-specifications)
   - 3.1 User Interface Specifications
   - 3.2 Hardware Interfaces
   - 3.3 Software Interfaces
   - 3.4 Communication Interfaces
4. [Use Case Models](#4-use-case-models)
   - 4.1 Actors
   - 4.2 Use Case List
   - 4.3 Use Case Descriptions
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
   - 6.1 Performance Requirements
   - 6.2 Security Requirements
   - 6.3 Reliability Requirements
   - 6.4 Scalability Requirements
   - 6.5 Usability Requirements
   - 6.6 Maintainability Requirements
   - 6.7 Availability Requirements
   - 6.8 Auditability Requirements
7. [Domain Requirements](#7-domain-requirements)
8. [Data Dictionary](#8-data-dictionary)
9. [Assumptions and System Constraints](#9-assumptions-and-system-constraints)
   - 9.1 Assumptions
   - 9.2 System Constraints
10. [Backend Database Specifications, Connectivity, and Application](#10-backend-database-specifications-connectivity-and-application)
    - 10.1 DBMS Selection
    - 10.2 Schema Overview
    - 10.3 Application Layer and API Architecture
    - 10.4 Transaction Management
    - 10.5 Backup and Recovery
11. [Other Requirements](#11-other-requirements)
    - 11.1 Legal and Regulatory
    - 11.2 Installation and Deployment
    - 11.3 Maintainability

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete set of functional, non-functional, domain, and interface requirements for the **Hospital Management System (HMS)**. It is the authoritative reference for system design, database implementation, front-end development, testing, and acceptance. It supersedes all informal requirement notes.

### 1.2 Document Conventions

- **Shall** — mandatory requirement.
- **Should** — recommended, non-mandatory.
- **FR** prefix — Functional Requirement (FR1…FR38).
- **NFR** prefix — Non-Functional Requirement (NFR1…NFR20).
- **UC** prefix — Use Case.
- **PK / FK** — Primary Key / Foreign Key.
- Bold table headings mark required fields.

### 1.3 Intended Audience

| Audience | Sections of Primary Interest |
|---|---|
| Database designers | §8 Data Dictionary, §10 Backend Specs |
| Backend developers | §5 FRs, §10 Backend Specs |
| Frontend developers | §3 UI Specs, §4 Use Cases, §5 FRs |
| Testers / QA | §5 FRs, §6 NFRs, §4 Use Cases |
| Project managers | §1, §2, §9 Assumptions |
| Hospital domain experts | §7 Domain Requirements, §2.3 User Classes |

### 1.4 Project Scope

The HMS is a role-based web application that digitises the full lifecycle of a hospital patient visit — from initial registration through treatment, lab testing, invoicing, and discharge or death recording. It replaces manual paper-based workflows and provides real-time visibility into ward occupancy, lab resource usage, and billing. The system is **not** in scope for: appointment scheduling, insurance claims processing, pharmacy stock management, or integration with external healthcare networks (e.g. HL7/FHIR) in this version.

### 1.5 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| HMS | Hospital Management System |
| SRS | Software Requirements Specification |
| IEEE 830 | IEEE Standard for Software Requirements Specifications |
| Visit | A single episode of care for one patient |
| TIP | Treatment In Progress — visit status `TREATMENT_IN_PROGRESS` |
| ICU | Intensive Care Unit |
| Inpatient | Patient admitted to a ward bed |
| Outpatient | Patient receiving treatment without overnight bed allocation |
| Invoice | An itemised billing record for a single visit |
| Ward Category | Classification of ward bed: General, ICU, or Maternity |
| Resource | Consumable hospital supply (e.g. Blood, Oxygen, IV Fluid) |
| RBAC | Role-Based Access Control |
| BCNF | Boyce–Codd Normal Form |
| 3NF | Third Normal Form |
| DBMS | Database Management System |

### 1.6 References

| ID | Document |
|---|---|
| REF-1 | `HMS_FINAL.md` — Normalised SRS and Relational Database Schema v1.0 |
| REF-2 | `HMS_ER_DIAGRAM.md` / `HMS_ER_DIAGRAM.png` — Entity Relationship Diagram |
| REF-3 | IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications* |
| REF-4 | ISO/IEC/IEEE 29148:2018, *Systems and Software Engineering — Life Cycle Processes — Requirements Engineering* |

---

## 2. Overall Description

### 2.1 Product Perspective

The HMS is a standalone, multi-user web application with a centralised relational database backend. It operates independently of any existing legacy system and does not require external API integrations in version 1.0. It replaces paper-based patient registration, ward assignment, lab order tracking, and manual billing processes.

```
  ┌─────────────────────────────────────────────────┐
  │              Web Browser (Client)               │
  │  [Clerk UI] [Doctor UI] [Lab UI] [Admin UI]     │
  └─────────────────────┬───────────────────────────┘
                        │ HTTPS
  ┌─────────────────────▼───────────────────────────┐
  │         Application Server (REST API)           │
  │         Node.js / Python / Java (TBD)           │
  └─────────────────────┬───────────────────────────┘
                        │ Connection Pool
  ┌─────────────────────▼───────────────────────────┐
  │         PostgreSQL Relational Database          │
  │         (18 tables — see §8 Data Dictionary)    │
  └─────────────────────────────────────────────────┘
                        │
  ┌─────────────────────▼───────────────────────────┐
  │       File Storage (server filesystem / S3)     │
  │  Prescriptions, Lab Results, Post-Mortem Files  │
  └─────────────────────────────────────────────────┘
```

### 2.2 Product Functions Summary

1. **Authentication and session management** for all roles.
2. **Patient registration and search** by clerks.
3. **Visit lifecycle management**: admission → treatment → discharge / death.
4. **Lab cost recording**: tests, equipment, and resources linked to a visit invoice.
5. **Test result file upload** by lab personnel (deferred from cost entry).
6. **Prescription upload** by doctors, gating lab data entry.
7. **Death recording** with mandatory cause-of-death form by doctors.
8. **Invoice generation and payment confirmation** by clerks.
9. **Ward bed count management** in real time.
10. **Master catalogue management** (tests, equipment, resources) by admins.
11. **Personnel management** (activate / deactivate accounts) by admins.
12. **Seminar scheduling** by admins.
13. **Immutable audit logging** of every visit status transition.

### 2.3 User Classes and Characteristics

| Role | Technical Skill | Access Level | Key Responsibility |
|---|---|---|---|
| **Admin** | Moderate — familiar with hospital operations | Full system configuration | Manages personnel, catalogues, wards, seminars |
| **Doctor** | Moderate | Own visits only (`TREATMENT_IN_PROGRESS`) | Prescriptions, death recording, profile self-edit |
| **Clerk** | Low–moderate | Patient registration + visit management | Registration, visit creation, invoicing, payment |
| **Lab Personnel** | Low | Lab data on active visits after prescription | Test/equipment/resource recording, test result upload |

### 2.4 Operating Environment

- **Client**: Any modern web browser (Chrome, Firefox, Edge, Safari — latest two versions).
- **Server OS**: Linux (Ubuntu 22.04 LTS or equivalent).
- **Database**: PostgreSQL 15+.
- **Network**: HTTPS over internal hospital LAN; internet access optional.
- **File Storage**: Server-side directory (or compatible object storage) outside the web root.
- **Concurrent Users**: Minimum 50 simultaneous users without performance degradation (see NFR4).

### 2.5 Design and Implementation Constraints

- All passwords **shall** be stored as bcrypt hashes — plaintext storage is prohibited.
- Ward bed allocation **shall** use database-level row locking (`SELECT … FOR UPDATE`) to prevent double-booking.
- Catalogue names for tests, equipment, and resources are fixed ENUM values; new values require a schema migration, not a UI form.
- File uploads are restricted to PDF format, maximum 10 MB per file.
- The system **shall** be accessible only via HTTPS; plain HTTP connections shall be redirected.
- The database schema **shall** be in Third Normal Form (3NF) as defined in `HMS_FINAL.md`.

### 2.6 Assumptions and Dependencies

- A single hospital instance is deployed per database; multi-tenancy is out of scope.
- Medical section codes (Cardiology, Neurology, etc.) are seeded at deployment and do not change dynamically.
- Catalogue costs (tests, equipment, resources) are pre-seeded at deployment and adjustable by admin, but the ENUM set of names is fixed per schema version.
- Internet connectivity is not required for core hospital operations.
- The hospital operates a 24/7 workflow; no scheduled downtime windows exist.
- A system administrator manages infrastructure; the Admin role within HMS is a hospital administrator, not an IT superuser.

---

## 3. External Interface Requirements — Front End Specifications

### 3.1 User Interface Specifications

#### 3.1.1 General UI Standards

- All pages **shall** display the hospital name/logo in the top navigation bar.
- The currently logged-in user's name and role **shall** be visible at all times.
- A **Logout** button **shall** be accessible from every screen.
- Error messages **shall** appear inline, adjacent to the field that caused the error.
- All destructive or irreversible actions (e.g. "Mark Deceased", "Payment Successful") **shall** display a confirmation dialog before executing.
- Date/time fields **shall** use a date-picker component; free-text entry is not permitted.
- The UI **shall** be responsive for screen widths ≥ 1024 px.

#### 3.1.2 Authentication Screen

| Element | Specification |
|---|---|
| **Route** | `/login` |
| **Fields** | Username (text, required), Password (password, required) |
| **Actions** | Login button |
| **On success** | Redirect to role-specific dashboard |
| **On failure** | Inline error: "Invalid username or password" |
| **Session timeout** | Redirect to `/login` with message "Session expired" |

#### 3.1.3 Clerk Interface

**3.1.3.1 Patient Registration — `/clerk/patients/new`**

| Element | Specification |
|---|---|
| **Fields** | First Name*, Last Name*, Phone* (10–15 digits), Address* (textarea), Gender* (dropdown: Male / Female / Other), Age* (numeric, 1–120) |
| **On submit** | System generates patient ID; redirect to Patient Page |
| **Validation** | All fields required; phone accepts digits only; age > 0 |

**3.1.3.2 Patient Search — `/clerk/patients`**

| Element | Specification |
|---|---|
| **Fields** | Patient ID (numeric input) |
| **On found** | Redirect to `/clerk/patients/:id` |
| **On not found** | Inline error: "No patient found with this ID" |

**3.1.3.3 Patient Page — `/clerk/patients/:id`**

Two tabs:

*History Tab*

| Element | Specification |
|---|---|
| **Columns shown** | Issue, Assigned Doctor, Entry Time, Discharge Time, Amount Paid, Invoice #, Status |
| **Sort order** | Descending by entry_time |

*Manage Visit Tab*

| Element | Specification |
|---|---|
| **Chief Complaint** | Textarea*, required |
| **Medical Section** | Dropdown (seeded list) — used only to filter doctor list, not stored |
| **Doctor** | Dropdown filtered by selected section |
| **Patient Type** | Radio: Inpatient / Outpatient |
| **Ward Category** | Dropdown (General / ICU / Maternity) — visible only when Inpatient selected |
| **"Admit / Start Treatment" button** | Enabled when all required fields filled; sets status → `TREATMENT_IN_PROGRESS`; bed count decremented |
| **"Generate Invoice" button** | Enabled only when `status = TREATMENT_IN_PROGRESS`; disabled otherwise |
| **"Payment Successful" button** | Enabled only after invoice generated; sets status → `DISCHARGED` |
| **Status badge** | Read-only display of current visit status |

#### 3.1.4 Lab Personnel Interface

**3.1.4.1 Patient Search — `/lab/patients`**

Same search screen as clerk. After finding the patient, the system checks:
1. Visit status is `TREATMENT_IN_PROGRESS` → otherwise show read-only banner
2. Doctor has uploaded prescription → otherwise show: *"Awaiting doctor prescription before lab data can be entered."*

**3.1.4.2 Patient Profile — `/lab/patients/:id`**

| Element | Specification |
|---|---|
| **Displayed** | Patient Name, Age, Assigned Doctor Name |
| **"Proceed" button** | Opens cost entry page |

**3.1.4.3 Cost Entry — `/lab/visits/:visit_id/costs`**

Three accordion sections:

| Section | Dropdown Values | Auto-filled Field |
|---|---|---|
| Add Test | All `tests.test_name` where `is_available = true` | `cost` from `tests` table |
| Add Equipment | All `equipment.equipment_name` where `is_active = true` | `cost` from `equipment` table |
| Add Resource | All `resources.resource_name` where `is_active = true` | `cost_per_unit` from `resources` table + `quantity` input |

- Each section has an **Add Row** button; multiple rows allowed per section.
- Each row shows: item name (dropdown), quantity (numeric), unit cost (read-only auto-fill), line total (computed).
- A **Save** button writes all entries to the database and updates the invoice.

**3.1.4.4 Test Result Upload — `/lab/visits/:visit_id/results`**

| Element | Specification |
|---|---|
| **Field** | Test Result File (PDF, max 10 MB, required) |
| **"Upload" button** | Saves file path to `visits.test_result_file` |
| **Access constraint** | Only available when `status = TREATMENT_IN_PROGRESS` |

#### 3.1.5 Doctor Interface

**3.1.5.1 Personal Profile — `/doctor/profile`**

| Element | Specification |
|---|---|
| **Displayed** | Name, Phone, Email, Medical Section, Consultation Fee |
| **Editable fields** | Phone, Email, Consultation Fee |
| **"Save Changes" button** | Persists edits to `doctors` table |

**3.1.5.2 Patient Management — `/doctor/patients`**

Search by Patient ID → access restricted to `TREATMENT_IN_PROGRESS` visits.

*Prescription Upload*

| Element | Specification |
|---|---|
| **Field** | Prescription File (PDF, max 10 MB) |
| **"Upload" button** | Saves to `visits.prescription_file`; records `prescription_uploaded_by`, `prescription_uploaded_at` |

*Mark as Deceased — Modal dialog*

| Element | Specification |
|---|---|
| **Fields** | Cause of Death* (textarea), Time of Death* (time picker), Date of Death* (date picker), Post-Mortem Report File* (PDF upload) |
| **"Confirm" button** | Sets `status = DECEASED`; populates inline death columns; increments bed count |
| **Constraint** | All four fields are required; form cannot be submitted with any field empty |

#### 3.1.6 Admin Interface

**3.1.6.1 Personnel Management — `/admin/personnel`**

| Element | Specification |
|---|---|
| **View** | Tabbed list: Clerks / Doctors / Lab Personnel; columns: Name, Email, Phone, Status |
| **Edit** | Inline form edit for each record |
| **Activate / Deactivate** | Toggle button per row; confirmation dialog |

**3.1.6.2 Catalogue Management — `/admin/catalogues`**

Three sub-tabs: Tests / Equipment / Resources.

| Action | Fields |
|---|---|
| Add Test | test_name (dropdown from ENUM), cost, is_available toggle |
| Add Equipment | equipment_name (dropdown from ENUM), cost, total_quantity, available_quantity, is_active toggle |
| Add Resource | resource_name (dropdown from ENUM), unit, cost_per_unit, available_quantity, is_active toggle |
| Edit | Any field on existing row; cost updates apply to future invoice entries only |
| Deactivate | Toggle; hides item from lab personnel selection |

**3.1.6.3 Ward Management — `/admin/wards`**

| Element | Specification |
|---|---|
| **Displayed** | Table: Ward Category, Total Beds, Available Beds |
| **Editable** | Total Beds (numeric input per row) |
| **Constraint** | Total Beds cannot be set below current occupied count |

**3.1.6.4 Seminar Management — `/admin/seminars`**

| Element | Specification |
|---|---|
| **Add fields** | Seminar Name*, Date* (date picker), Duration (hours, decimal, > 0)*, Hall Number* |
| **Edit** | All fields on existing seminar |
| **View** | Table sorted by seminar_date descending |

### 3.2 Hardware Interfaces

The HMS has no direct hardware interface requirements. It communicates with client devices exclusively through a web browser over HTTPS. No printer, scanner, or medical device integration is in scope for version 1.0.

### 3.3 Software Interfaces

| Interface | Details |
|---|---|
| **Database** | PostgreSQL 15+ via standard JDBC/ODBC or native driver (e.g. `pg` for Node.js, `psycopg2` for Python) |
| **File system / Object storage** | Local server filesystem or S3-compatible object store for uploaded files |
| **Browser** | Modern browser with JavaScript enabled; no browser plugins required |
| **OS** | Linux server; no OS-specific API calls |

### 3.4 Communication Interfaces

- All client–server communication **shall** use HTTPS (TLS 1.2 or higher).
- REST API responses **shall** use JSON.
- File uploads **shall** use `multipart/form-data` POST requests.
- No WebSocket or real-time push protocol is required; bed count updates are fetched on page load.

---

## 4. Use Case Models

> **ER Diagram:** See `HMS_ER_DIAGRAM.png` in this repository for the full entity-relationship diagram.

### 4.1 Actors

| Actor | Description |
|---|---|
| Clerk | Registers patients, manages visits, generates invoices |
| Doctor | Uploads prescriptions, records deaths, edits own profile |
| Lab Personnel | Records test/equipment/resource costs, uploads test results |
| Admin | Manages all personnel, catalogues, wards, and seminars |
| System | Performs automated side effects (bed count updates, timestamp recording) |

### 4.2 Use Case List

| ID | Name | Primary Actor |
|---|---|---|
| UC1 | Log In | All roles |
| UC2 | Register New Patient | Clerk |
| UC3 | Search Existing Patient | Clerk, Lab Personnel, Doctor |
| UC4 | Create Visit | Clerk |
| UC5 | Admit Patient / Start Treatment | Clerk |
| UC6 | Upload Prescription | Doctor |
| UC7 | Record Lab Costs | Lab Personnel |
| UC8 | Upload Test Result File | Lab Personnel |
| UC9 | Generate Invoice | Clerk |
| UC10 | Confirm Payment / Discharge | Clerk |
| UC11 | Record Patient Death | Doctor |
| UC12 | Edit Doctor Profile | Doctor |
| UC13 | Manage Personnel | Admin |
| UC14 | Manage Catalogues | Admin |
| UC15 | Manage Ward Beds | Admin |
| UC16 | Manage Seminars | Admin |

### 4.3 Use Case Descriptions

---

**UC1 — Log In**

| Field | Detail |
|---|---|
| **Actor** | Any authenticated user |
| **Preconditions** | User account exists and `is_active = true` |
| **Main Flow** | 1. User navigates to `/login`. 2. Enters username and password. 3. System validates credentials against bcrypt hash. 4. Session created; user redirected to role dashboard. |
| **Alternative Flow** | Invalid credentials → inline error displayed; no session created. Inactive account → "Account disabled" message. |
| **Postconditions** | Valid session token issued; `users.last_login` updated. |

---

**UC2 — Register New Patient**

| Field | Detail |
|---|---|
| **Actor** | Clerk |
| **Preconditions** | Clerk is logged in. |
| **Main Flow** | 1. Clerk opens Patient Registration form. 2. Enters first name, last name, phone, address, gender, age. 3. Submits form. 4. System generates sequential `patient_id`. 5. Patient row created; clerk redirected to Patient Page. |
| **Alternative Flow** | Missing required field → inline validation error; patient not created. |
| **Postconditions** | New row in `patients`; `registered_by` = clerk's `clerk_id`; `registered_at` = NOW(). |

---

**UC3 — Search Existing Patient**

| Field | Detail |
|---|---|
| **Actor** | Clerk, Lab Personnel, Doctor |
| **Preconditions** | User is logged in. |
| **Main Flow** | 1. User enters a numeric patient ID. 2. System looks up `patients.patient_id`. 3. Patient page opens. |
| **Alternative Flow** | No match → "No patient found with this ID". |
| **Postconditions** | Patient page displayed; role-appropriate view enforced. |

---

**UC4 — Create Visit**

| Field | Detail |
|---|---|
| **Actor** | Clerk |
| **Preconditions** | Patient exists (`UC2` or `UC3`). |
| **Main Flow** | 1. Clerk opens Manage Visit tab. 2. Enters chief complaint. 3. Selects medical section (for filtering only). 4. Selects doctor from filtered list. 5. Selects patient type; if Inpatient, selects ward category. 6. Submits — visit row created with `status = ADMITTED`. |
| **Alternative Flow** | No doctors available in selected section → dropdown empty; clerk must change section. |
| **Postconditions** | New row in `visits` with `status = ADMITTED`; no bed count change yet. |

---

**UC5 — Admit Patient / Start Treatment**

| Field | Detail |
|---|---|
| **Actor** | Clerk |
| **Preconditions** | Visit exists with `status = ADMITTED`. |
| **Main Flow** | 1. Clerk clicks "Admit / Start Treatment". 2. System acquires row lock on `ward_categories`. 3. Checks `available_beds > 0`. 4. Decrements `available_beds`. 5. Sets visit `status = TREATMENT_IN_PROGRESS`. |
| **Alternative Flow** | No beds available → error dialog "No beds available in selected category". Status unchanged. |
| **Postconditions** | `visits.status = TREATMENT_IN_PROGRESS`; `ward_categories.available_beds − 1`. |

---

**UC6 — Upload Prescription**

| Field | Detail |
|---|---|
| **Actor** | Doctor |
| **Preconditions** | Visit `status = TREATMENT_IN_PROGRESS`; doctor is assigned to the visit. |
| **Main Flow** | 1. Doctor searches patient. 2. Selects PDF file. 3. Clicks Upload. 4. File saved; `visits.prescription_file`, `prescription_uploaded_by`, `prescription_uploaded_at` set. |
| **Postconditions** | `visits.prescription_file` is non-null; lab personnel can now proceed to cost entry. |

---

**UC7 — Record Lab Costs**

| Field | Detail |
|---|---|
| **Actor** | Lab Personnel |
| **Preconditions** | Visit `status = TREATMENT_IN_PROGRESS`; `visits.prescription_file` is non-null. |
| **Main Flow** | 1. Lab personnel searches patient. 2. System verifies status and prescription gate. 3. Personnel selects tests, equipment, resources from enum dropdowns; costs auto-fill. 4. Clicks Save. 5. Junction rows written; `invoices.test_cost`, `equipment_cost`, `resource_cost` updated; `total_amount` recomputed. |
| **Alternative Flow** | Prescription not uploaded → gate message shown; cost entry form locked. |
| **Postconditions** | `visit_tests`, `visit_equipment`, `visit_resources` rows created; invoice costs updated. |

---

**UC8 — Upload Test Result File**

| Field | Detail |
|---|---|
| **Actor** | Lab Personnel |
| **Preconditions** | Visit `status = TREATMENT_IN_PROGRESS`. |
| **Main Flow** | 1. Lab personnel navigates to Test Result Upload. 2. Selects PDF. 3. Clicks Upload. 4. Path saved to `visits.test_result_file`. |
| **Postconditions** | `visits.test_result_file` non-null; `lab_file_uploaded_by` and `lab_file_uploaded_at` set. |

---

**UC9 — Generate Invoice**

| Field | Detail |
|---|---|
| **Actor** | Clerk |
| **Preconditions** | Visit `status = TREATMENT_IN_PROGRESS`. |
| **Main Flow** | 1. Clerk clicks "Generate Invoice". 2. System aggregates: `doctor_fee` (from `doctors.consultation_fee`), `test_cost`, `equipment_cost`, `resource_cost` (from junction tables). 3. `total_amount` computed and stored. 4. Invoice PDF generated and path saved to `visits.invoice_pdf_path`. |
| **Postconditions** | `invoices` row populated; `visits.invoice_id` set; `payment_status = PENDING`. |

---

**UC10 — Confirm Payment / Discharge**

| Field | Detail |
|---|---|
| **Actor** | Clerk |
| **Preconditions** | Invoice exists; `invoices.payment_status = PENDING`. |
| **Main Flow** | 1. Clerk clicks "Payment Successful" (confirmation dialog). 2. `visits.status = DISCHARGED`; `discharge_time = NOW()`. 3. `ward_categories.available_beds + 1` (for inpatients). 4. `invoices.payment_status = PAID`; `payment_confirmed_at = NOW()`. |
| **Postconditions** | Visit closed; bed restored; invoice marked PAID. |

---

**UC11 — Record Patient Death**

| Field | Detail |
|---|---|
| **Actor** | Doctor |
| **Preconditions** | Visit `status = TREATMENT_IN_PROGRESS`. |
| **Main Flow** | 1. Doctor clicks "Mark as Deceased". 2. Fills in: cause of death, time of death, date of death, post-mortem report file. 3. Confirms. 4. `visits.status = DECEASED`; death columns populated; bed restored. |
| **Alternative Flow** | Any required field missing → form validation error; status unchanged. |
| **Postconditions** | `visits.status = DECEASED`; death fields non-null; `ward_categories.available_beds + 1`. |

---

**UC12 — Edit Doctor Profile**

| Field | Detail |
|---|---|
| **Actor** | Doctor |
| **Preconditions** | Doctor is logged in. |
| **Main Flow** | 1. Doctor opens Personal Profile. 2. Edits phone, email, or consultation fee. 3. Saves. 4. Changes reflected in visit assignment displays. |
| **Postconditions** | `doctors` row updated. |

---

**UC13 — Manage Personnel**

| Field | Detail |
|---|---|
| **Actor** | Admin |
| **Main Flow** | 1. Admin views personnel lists per role. 2. Edits any field on any record. 3. Activates or deactivates account via toggle (confirmation dialog). |
| **Postconditions** | `users.is_active` updated; deactivated user cannot log in. |

---

**UC14 — Manage Catalogues**

| Field | Detail |
|---|---|
| **Actor** | Admin |
| **Main Flow** | 1. Admin selects Tests / Equipment / Resources tab. 2. Adds, edits, or deactivates entries. 3. Cost updates apply to new lab entries only; historical `cost_at_time` values unchanged. |
| **Postconditions** | Catalogue rows updated; availability flags respected in lab dropdowns. |

---

**UC15 — Manage Ward Beds**

| Field | Detail |
|---|---|
| **Actor** | Admin |
| **Main Flow** | 1. Admin views ward table. 2. Updates `total_beds` per category. 3. System prevents setting `total_beds` below current occupancy. |
| **Postconditions** | `ward_categories.total_beds` updated. |

---

**UC16 — Manage Seminars**

| Field | Detail |
|---|---|
| **Actor** | Admin |
| **Main Flow** | 1. Admin opens Seminar Management. 2. Adds new seminar with name, date, duration, hall number. 3. Views or edits existing seminars. |
| **Postconditions** | `seminars` row created or updated. |

---

## 5. Functional Requirements

All requirements below are mandatory (**shall**). Requirements are grouped thematically; each maps to one or more use cases.

### 5.1 Authentication

| ID | Requirement | UC |
|---|---|---|
| FR1 | The system **shall** require all users to authenticate with a username and password before accessing any screen. | UC1 |
| FR2 | The system **shall** enforce role-based access control; users **shall** only access functionality assigned to their role. | UC1 |
| FR3 | The system **shall** expire sessions after a configurable idle timeout; expired sessions **shall** redirect to the login screen. | UC1 |
| FR4 | Passwords **shall** be stored exclusively as bcrypt hashes; plaintext passwords **shall** never be stored or logged. | UC1 |

### 5.2 Patient Management

| ID | Requirement | UC |
|---|---|---|
| FR5 | The system **shall** allow a clerk to register a new patient by entering: first name, last name, phone number, address, gender (Male / Female / Other), and age. | UC2 |
| FR6 | The system **shall** automatically generate a unique, sequential patient ID upon successful patient registration. | UC2 |
| FR7 | The system **shall** allow clerks, lab personnel, and doctors to search for an existing patient by patient ID. | UC3 |

### 5.3 Visit Lifecycle

| ID | Requirement | UC |
|---|---|---|
| FR8 | The patient page **shall** present two tabs: **History** and **Manage Visit**. | UC3 |
| FR9 | The History tab **shall** display all past visits in descending date order with: issue, assigned doctor, entry time, discharge time, amount paid, invoice reference, and status. | UC3 |
| FR10 | The clerk **shall** create a visit by entering a chief complaint, selecting a doctor, selecting patient type, and (for inpatients) selecting a ward category. | UC4 |
| FR11 | The medical section selector **shall** filter the doctor dropdown only; the section value **shall not** be stored on the visit row. | UC4 |
| FR12 | Clicking "Admit / Start Treatment" **shall** set `visits.status = TREATMENT_IN_PROGRESS` and atomically decrement `ward_categories.available_beds` for the selected category (inpatients only). | UC5 |
| FR13 | The system **shall** prevent ward admission when `available_beds = 0` and display an appropriate error message. | UC5 |
| FR14 | The "Generate Invoice" button **shall** be enabled only when `visits.status = TREATMENT_IN_PROGRESS`. | UC9 |
| FR15 | Generating an invoice **shall** populate `invoices.doctor_fee`, `test_cost`, `equipment_cost`, `resource_cost`, and `total_amount`, and produce a PDF whose path is stored in `visits.invoice_pdf_path`. | UC9 |
| FR16 | The "Payment Successful" button **shall** be enabled only after an invoice has been generated; confirming it **shall** set `visits.status = DISCHARGED`, record `discharge_time`, set `invoices.payment_status = PAID`, and increment `available_beds` (inpatients only). | UC10 |

### 5.4 Lab Personnel Functions

| ID | Requirement | UC |
|---|---|---|
| FR17 | Lab personnel **shall** only be permitted to add data to visits with `status = TREATMENT_IN_PROGRESS`; all other visits **shall** be displayed as read-only. | UC7 |
| FR18 | The system **shall** verify that `visits.prescription_file` is non-null before allowing lab personnel to proceed to cost entry; if null, a descriptive gate message **shall** be shown. | UC7 |
| FR19 | The cost entry form **shall** present tests, equipment, and resources as enum-value dropdowns showing only items where `is_available / is_active = true`. | UC7 |
| FR20 | Selecting any catalogue item **shall** auto-populate the unit cost from the corresponding catalogue row. | UC7 |
| FR21 | Lab personnel **shall** be able to add multiple rows per category (tests, equipment, resources) in a single cost-entry session. | UC7 |
| FR22 | Saving cost entries **shall** write rows to `visit_tests`, `visit_equipment`, and `visit_resources`; the `cost_at_time` column **shall** snapshot the catalogue cost at the moment of entry. | UC7 |
| FR23 | Saving cost entries **shall** update `invoices.test_cost`, `equipment_cost`, `resource_cost`, and `total_amount` atomically. | UC7 |
| FR24 | Lab personnel **shall** be able to upload a test result file (PDF) independently of the cost entry step, provided the visit is still `TREATMENT_IN_PROGRESS`. | UC8 |

### 5.5 Doctor Functions

| ID | Requirement | UC |
|---|---|---|
| FR25 | The doctor **shall** be able to view and edit their own profile (phone, email, consultation fee). | UC12 |
| FR26 | The doctor's patient view **shall** be restricted to visits with `status = TREATMENT_IN_PROGRESS`. | UC6, UC11 |
| FR27 | The doctor **shall** be able to upload a prescription PDF for the current visit; this action **shall** set `prescription_file`, `prescription_uploaded_by`, and `prescription_uploaded_at`. | UC6 |
| FR28 | The doctor **shall** be able to mark a visit as Deceased by completing a mandatory form capturing: cause of death, time of death, date of death, and a post-mortem report file. | UC11 |
| FR29 | On confirming death, the system **shall** set `visits.status = DECEASED`, populate all inline death columns, and increment `ward_categories.available_beds` (inpatients only). | UC11 |

### 5.6 Admin Functions

| ID | Requirement | UC |
|---|---|---|
| FR30 | The admin **shall** have full view and edit access to all clerk, doctor, and lab personnel records. | UC13 |
| FR31 | The admin **shall** be able to activate or deactivate any personnel account; a deactivated account **shall** not be able to log in. | UC13 |
| FR32 | The admin **shall** be able to view, modify, and deactivate entries in the tests, equipment, and resources catalogues. | UC14 |
| FR33 | Cost modifications by admin **shall** apply only to future lab entries; historical `cost_at_time` values **shall** remain unchanged. | UC14 |
| FR34 | The admin **shall** be able to configure `total_beds` per ward category; the system **shall** prevent reducing `total_beds` below the current occupied count. | UC15 |
| FR35 | The admin dashboard **shall** display current total and available beds per ward category. | UC15 |
| FR36 | The admin **shall** be able to add, view, and edit seminars. | UC16 |

### 5.7 Audit Logging

| ID | Requirement | UC |
|---|---|---|
| FR37 | Every visit status transition **shall** be recorded in `visit_status_log` with: `visit_id`, `from_status`, `to_status`, `changed_by_user_id`, and `changed_at`. | All visit UCs |
| FR38 | `visit_status_log` rows **shall** be immutable; no update or delete operation **shall** be permitted on this table. | — |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement |
|---|---|
| NFR1 | Patient search by ID **shall** return results within **1 second** under normal load (≤ 50 concurrent users). |
| NFR2 | Invoice generation **shall** complete within **5 seconds** under normal load. |
| NFR3 | Ward bed count updates **shall** complete within **500 milliseconds**; they **shall** be atomic to prevent double-allocation. |
| NFR4 | The system **shall** support at least **50 concurrent users** without measurable performance degradation (response times within 2× baseline). |

### 6.2 Security Requirements

| ID | Requirement |
|---|---|
| NFR5 | Role-based access control **shall** be enforced on every API endpoint and UI route; server-side enforcement is mandatory and client-side hiding alone is insufficient. |
| NFR6 | Passwords **shall** be hashed using bcrypt with a cost factor ≥ 12. |
| NFR7 | All user actions **shall** be timestamped and associated with the acting user's ID to maintain an audit trail. |
| NFR8 | File uploads **shall** be validated for MIME type (PDF only) and size (≤ 10 MB); files **shall** be stored outside the web root to prevent direct URL access. |
| NFR9 | All HTTP traffic **shall** be served over HTTPS (TLS 1.2+); plain HTTP **shall** be redirected. |

### 6.3 Reliability Requirements

| ID | Requirement |
|---|---|
| NFR10 | Concurrent ward assignments **shall** be handled with serialisable isolation or `SELECT … FOR UPDATE` to prevent bed double-booking. |
| NFR11 | The database **shall** be backed up at minimum **once per day**; backups **shall** be stored on a separate physical device or remote storage. |
| NFR12 | The system **shall** maintain referential integrity via database-level foreign key constraints; orphaned records are not permitted. |

### 6.4 Scalability Requirements

| ID | Requirement |
|---|---|
| NFR13 | The application server **shall** be stateless so that horizontal scaling (adding server instances behind a load balancer) is possible without application changes. |
| NFR14 | Database connection pooling **shall** be used; the pool size **shall** be configurable via environment variable. |

### 6.5 Usability Requirements

| ID | Requirement |
|---|---|
| NFR15 | Each role's interface **shall** present only the sections and actions relevant to that role; inaccessible features **shall** not be visible. |
| NFR16 | All error messages **shall** be human-readable and actionable (i.e. specify what the user must do to resolve the error). |

### 6.6 Maintainability Requirements

| ID | Requirement |
|---|---|
| NFR17 | Application configuration (database URL, file storage path, session timeout, bcrypt cost, connection pool size) **shall** be externalized to environment variables; no configuration **shall** be hard-coded. |
| NFR18 | Database schema migrations **shall** be managed by a versioned migration tool (e.g. Flyway, Liquibase, or equivalent); manual schema edits on production are prohibited. |

### 6.7 Availability Requirements

| ID | Requirement |
|---|---|
| NFR19 | The system **shall** maintain a target uptime of **99.5%** during the hospital's operational hours (24/7). |

### 6.8 Auditability Requirements

| ID | Requirement |
|---|---|
| NFR20 | Every visit status transition (ADMITTED → TIP → DISCHARGED / DECEASED) **shall** be recorded in `visit_status_log` with timestamp and acting user ID; this log **shall** be append-only and non-modifiable. |

---

## 7. Domain Requirements

Domain requirements capture rules inherent to the hospital operations domain that constrain system behaviour independently of functional specifications.

| ID | Requirement |
|---|---|
| DR1 | A visit **shall** progress through statuses in a strict forward direction only: `ADMITTED → TREATMENT_IN_PROGRESS → DISCHARGED` or `→ DECEASED`. No backward transitions are permitted. |
| DR2 | A patient may have multiple visits over time; each visit is an independent episode of care with its own doctor, invoice, lab data, and status. |
| DR3 | A doctor belongs to exactly one medical section; the section cannot be changed without admin intervention. |
| DR4 | Bed occupancy is tracked at the ward-category level (General / ICU / Maternity), not at individual bed level. Available beds must never exceed total beds. |
| DR5 | An inpatient visit **shall** always reference a `bed_category_id`; an outpatient visit **shall** always have `bed_category_id = NULL`. |
| DR6 | Invoice costs are snapshotted at the time of entry (`cost_at_time` on junction rows); a subsequent change to a catalogue price **shall not** retroactively alter any existing invoice. |
| DR7 | A death record is permanent; once `visits.status = DECEASED`, the status **shall not** be changed and no invoice generation is applicable. |
| DR8 | Lab personnel **shall not** record costs on a visit unless the doctor has uploaded a prescription; this rule enforces clinical workflow order. |
| DR9 | A single visit **shall** have at most one invoice (`visits.invoice_id` is `UNIQUE`). |
| DR10 | The consultation fee used in an invoice **shall** be the doctor's fee at the time the invoice is generated, not a historical fee. It is snapshotted into `invoices.doctor_fee`. |
| DR11 | Patient demographic data (name, phone, address, age, gender) is recorded at registration and is not automatically updated on subsequent visits; re-registration is not required for repeat visits. |
| DR12 | Catalogue items (tests, equipment, resources) are defined by fixed ENUM values. New items require a schema-level migration; they cannot be added via the admin UI without an ENUM change. |

---

## 8. Data Dictionary

The Data Dictionary defines every table in the HMS relational schema. For each table, business rules specific to that table are listed below the column definitions.

---

### DD-01 `users`

**Purpose:** Central authentication table. Each HMS user has exactly one row; the `role` column determines which profile table applies.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `SERIAL` | PK | Auto-incremented unique user identifier |
| `username` | `VARCHAR(100)` | NOT NULL, UNIQUE | Login username |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Bcrypt hash of user's password |
| `role` | `ENUM('admin','doctor','clerk','lab')` | NOT NULL | Governs access scope and profile table |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | FALSE prevents login |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Account creation time |
| `last_login` | `TIMESTAMP` | NULLABLE | Updated on each successful login |

**Business Rules:**
- A deactivated user (`is_active = false`) **shall** be rejected at login.
- `username` is the user's login credential; it must be system-unique.
- `role` is immutable after account creation; changing a user's role requires admin intervention and potentially a new profile row.

---

### DD-02 `admins`

**Purpose:** Profile data for users with `role = 'admin'`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `admin_id` | `SERIAL` | PK | |
| `user_id` | `INT` | FK → users(user_id), UNIQUE, NOT NULL | 1:1 link to users |
| `first_name` | `VARCHAR(100)` | NOT NULL | |
| `last_name` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(20)` | NOT NULL | |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE | |

---

### DD-03 `doctors`

**Purpose:** Profile data for users with `role = 'doctor'`. Carries the consultation fee used in invoice generation and the medical section used for visit filtering.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `doctor_id` | `SERIAL` | PK | |
| `user_id` | `INT` | FK → users(user_id), UNIQUE, NOT NULL | 1:1 link to users |
| `first_name` | `VARCHAR(100)` | NOT NULL | |
| `last_name` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(20)` | NOT NULL | |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE | |
| `section_id` | `INT` | FK → medical_sections(section_id), NOT NULL | Doctor's department |
| `consultation_fee` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Snapshotted into `invoices.doctor_fee` at generation time |
| `is_available` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | If false, doctor does not appear in clerk's doctor dropdown |

**Business Rules:**
- `consultation_fee` changes affect only future invoices; existing invoices retain the snapshotted value.
- A doctor belongs to exactly one `medical_section`.

---

### DD-04 `clerks`

**Purpose:** Profile data for users with `role = 'clerk'`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `clerk_id` | `SERIAL` | PK | |
| `user_id` | `INT` | FK → users(user_id), UNIQUE, NOT NULL | 1:1 link to users |
| `first_name` | `VARCHAR(100)` | NOT NULL | |
| `last_name` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(20)` | NOT NULL | |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE | |

---

### DD-05 `lab_personnel`

**Purpose:** Profile data for users with `role = 'lab'`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `lab_id` | `SERIAL` | PK | |
| `user_id` | `INT` | FK → users(user_id), UNIQUE, NOT NULL | 1:1 link to users |
| `first_name` | `VARCHAR(100)` | NOT NULL | |
| `last_name` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(20)` | NOT NULL | |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE | |

---

### DD-06 `medical_sections`

**Purpose:** Master list of hospital departments. Used to filter the doctor dropdown for clerks; doctors belong to exactly one section.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `section_id` | `SERIAL` | PK | |
| `section_name` | `VARCHAR(150)` | NOT NULL, UNIQUE | E.g. "Cardiology", "Neurology", "Orthopaedics" |
| `description` | `TEXT` | NULLABLE | Optional notes about the section |

**Business Rules:**
- Sections are seeded at deployment; adding new sections requires admin action.
- A section cannot be deleted if doctors are assigned to it.

---

### DD-07 `patients`

**Purpose:** Demographic record for every patient registered at the hospital.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `patient_id` | `SERIAL` | PK | System-generated; used as the primary search key |
| `first_name` | `VARCHAR(100)` | NOT NULL | |
| `last_name` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(20)` | NOT NULL | |
| `address` | `TEXT` | NOT NULL | |
| `gender` | `ENUM('MALE','FEMALE','OTHER')` | NOT NULL | |
| `age` | `SMALLINT` | NOT NULL, CHECK > 0 | Age at time of registration |
| `registered_by` | `INT` | FK → clerks(clerk_id), NOT NULL | Clerk who created the record |
| `registered_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Business Rules:**
- A patient's demographic data is static after registration; corrections require admin or clerk intervention.
- A patient may have zero or more visits (`patients` 1:N `visits`).

---

### DD-08 `ward_categories`

**Purpose:** Tracks bed counts per ward type. No individual bed rows exist; allocation is managed by decrementing/incrementing this counter.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `category_id` | `SERIAL` | PK | |
| `category_name` | `ENUM('GENERAL','ICU','MATERNITY')` | NOT NULL, UNIQUE | |
| `total_beds` | `INT` | NOT NULL, CHECK ≥ 0 | Configured by admin |
| `available_beds` | `INT` | NOT NULL, CHECK ≥ 0 | Real-time; `available_beds ≤ total_beds` enforced |

**Business Rules:**
- `available_beds` is always `≤ total_beds`; enforced via CHECK constraint or trigger.
- Updates to `available_beds` **shall** use `SELECT … FOR UPDATE` within a transaction.
- Admins may only reduce `total_beds` if the reduction would not make `available_beds` go negative.

---

### DD-09 `tests`

**Purpose:** Master catalogue of available lab tests with fixed ENUM names and pre-seeded costs.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `test_id` | `SERIAL` | PK | |
| `test_name` | `ENUM('Blood Test','Urine Test','MRI Scan','CT Scan','X-Ray','Ultrasound','Thyroid Test','Liver Function Test','Kidney Function Test')` | NOT NULL, UNIQUE | Fixed set |
| `cost` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Predetermined cost; auto-filled on lab selection |
| `is_available` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | FALSE hides item from lab dropdown |

**Pre-seeded values:** Blood Test 300.00 · Urine Test 200.00 · MRI Scan 3000.00 · CT Scan 2500.00 · X-Ray 500.00 · Ultrasound 800.00 · Thyroid Test 600.00 · Liver Function Test 700.00 · Kidney Function Test 700.00

---

### DD-10 `equipment`

**Purpose:** Master catalogue of reusable medical equipment with quantity tracking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `equipment_id` | `SERIAL` | PK | |
| `equipment_name` | `ENUM('ECG Machine','MRI Machine','X-Ray Machine','Ventilator','Wheelchair','Infusion Pump','Pulse Oximeter','Defibrillator')` | NOT NULL, UNIQUE | Fixed set |
| `cost` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Cost per use; auto-filled on lab selection |
| `total_quantity` | `INT` | NOT NULL, CHECK ≥ 0 | Total units owned |
| `available_quantity` | `INT` | NOT NULL, CHECK ≥ 0 | `available_quantity ≤ total_quantity` enforced |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | FALSE hides item from lab dropdown |

**Business Rules:**
- `available_quantity` is decremented when lab adds equipment to a visit.
- `available_quantity ≤ total_quantity` is enforced via CHECK constraint or trigger.

**Pre-seeded values:** ECG Machine 500.00 · MRI Machine 5000.00 · X-Ray Machine 800.00 · Ventilator 2000.00 · Wheelchair 100.00 · Infusion Pump 300.00 · Pulse Oximeter 150.00 · Defibrillator 1000.00

---

### DD-11 `resources`

**Purpose:** Master catalogue of consumable hospital supplies (Blood, Oxygen, IV Fluids, etc.).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `resource_id` | `SERIAL` | PK | |
| `resource_name` | `ENUM('Blood','Oxygen','IV Fluid (Saline)','IV Fluid (Dextrose)','Bandage','Syringe')` | NOT NULL, UNIQUE | Fixed set |
| `unit` | `VARCHAR(50)` | NOT NULL | Measuring unit: "unit", "litre", "bag", etc. |
| `cost_per_unit` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Per-unit cost; auto-filled on selection |
| `available_quantity` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Real-time stock in `unit` |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | FALSE hides item from lab dropdown |

**Pre-seeded values:** Blood 1500.00/unit · Oxygen 50.00/litre · IV Fluid Saline 120.00/bag · IV Fluid Dextrose 130.00/bag · Bandage 30.00/unit · Syringe 20.00/unit

---

### DD-12 `visits`

**Purpose:** Central table for a single episode of care. Holds clinical, billing reference, prescription, lab result, and death data inline.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `visit_id` | `SERIAL` | PK | |
| `patient_id` | `INT` | FK → patients, NOT NULL | |
| `issue` | `TEXT` | NOT NULL | Chief complaint |
| `doctor_id` | `INT` | FK → doctors, NOT NULL | Assigned doctor; section derived via JOIN |
| `patient_type` | `ENUM('INPATIENT','OUTPATIENT')` | NOT NULL | |
| `bed_category_id` | `INT` | FK → ward_categories, NULLABLE | NULL for outpatients |
| `status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | NOT NULL, DEFAULT 'ADMITTED' | |
| `entry_time` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `discharge_time` | `TIMESTAMP` | NULLABLE | Set on DISCHARGED |
| `assigned_by` | `INT` | FK → clerks, NOT NULL | Clerk who created visit |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `prescription_file` | `VARCHAR(500)` | NULLABLE | Doctor-uploaded PDF path |
| `prescription_uploaded_by` | `INT` | FK → doctors, NULLABLE | |
| `prescription_uploaded_at` | `TIMESTAMP` | NULLABLE | |
| `test_result_file` | `VARCHAR(500)` | NULLABLE | Lab-uploaded PDF path |
| `lab_file_uploaded_by` | `INT` | FK → lab_personnel, NULLABLE | |
| `lab_file_uploaded_at` | `TIMESTAMP` | NULLABLE | |
| `invoice_id` | `INT` | FK → invoices, UNIQUE, NULLABLE | Back-reference; NULL until invoice created |
| `invoice_pdf_path` | `VARCHAR(500)` | NULLABLE | Generated invoice PDF path |
| `cause_of_death` | `TEXT` | NULLABLE | DECEASED visits only |
| `time_of_death` | `TIME` | NULLABLE | DECEASED visits only |
| `date_of_death` | `DATE` | NULLABLE | DECEASED visits only |
| `post_mortem_file` | `VARCHAR(500)` | NULLABLE | DECEASED visits only |
| `death_recorded_by` | `INT` | FK → doctors, NULLABLE | DECEASED visits only |

**Business Rules:**
- `status` transitions are strictly one-directional: ADMITTED → TIP → DISCHARGED or DECEASED.
- When `status = DECEASED`: `cause_of_death`, `time_of_death`, `date_of_death`, and `death_recorded_by` **shall** all be non-null.
- `bed_category_id` **shall** be NULL for OUTPATIENT; non-null for INPATIENT.
- `section_id` is **not** stored on this table; it is derived via `doctor_id → doctors.section_id`.

**Index:** `(patient_id, status)` for active-visit lookup.

---

### DD-13 `invoices`

**Purpose:** One invoice per visit (1:1). Holds snapshotted cost breakdown and payment status.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `invoice_id` | `SERIAL` | PK | |
| `visit_id` | `INT` | FK → visits, UNIQUE, NOT NULL | 1:1 |
| `doctor_fee` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0.00 | Snapshotted at generation |
| `test_cost` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0.00 | Sum of visit_tests costs |
| `equipment_cost` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0.00 | Sum of visit_equipment costs |
| `resource_cost` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0.00 | Sum of visit_resources costs |
| `total_amount` | `DECIMAL(10,2)` | NOT NULL, DEFAULT 0.00 | `doctor_fee + test_cost + equipment_cost + resource_cost` |
| `generated_by` | `INT` | FK → clerks, NULLABLE | Clerk who generated |
| `generated_at` | `TIMESTAMP` | NULLABLE | Generation timestamp |
| `payment_status` | `ENUM('PENDING','PAID')` | NOT NULL, DEFAULT 'PENDING' | |
| `payment_confirmed_at` | `TIMESTAMP` | NULLABLE | Set when PAID |

**Business Rules:**
- Exactly one invoice per visit; subsequent invoice generation is not permitted.
- Cost columns are snapshotted and **shall not** be recalculated after generation.
- `total_amount` is stored for fast retrieval; it equals the sum of the four cost components at generation time.

---

### DD-14 `visit_tests`

**Purpose:** Records each distinct test performed during a visit. Composite PK prevents duplicate test entries per visit.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `visit_id` | `INT` | FK → visits, PK (part 1) | |
| `test_id` | `INT` | FK → tests, PK (part 2) | |
| `quantity` | `INT` | NOT NULL, DEFAULT 1, CHECK > 0 | Times performed |
| `cost_at_time` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Snapshotted cost |
| `added_by` | `INT` | FK → lab_personnel, NOT NULL | |
| `added_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**PK:** `(visit_id, test_id)` — one row per distinct test per visit.

---

### DD-15 `visit_equipment`

**Purpose:** Records each distinct piece of equipment used during a visit.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `visit_id` | `INT` | FK → visits, PK (part 1) | |
| `equipment_id` | `INT` | FK → equipment, PK (part 2) | |
| `quantity` | `INT` | NOT NULL, DEFAULT 1, CHECK > 0 | Units used |
| `cost_at_time` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Snapshotted cost |
| `added_by` | `INT` | FK → lab_personnel, NOT NULL | |
| `added_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**PK:** `(visit_id, equipment_id)`.  
**Business Rule:** Adding equipment decrements `equipment.available_quantity` within the same transaction.

---

### DD-16 `visit_resources`

**Purpose:** Records consumable resources used during a visit; `quantity_used` is in the resource's own `unit`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `visit_id` | `INT` | FK → visits, PK (part 1) | |
| `resource_id` | `INT` | FK → resources, PK (part 2) | |
| `quantity_used` | `DECIMAL(10,2)` | NOT NULL, CHECK > 0 | Amount consumed in resource's unit |
| `cost_at_time` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Snapshotted cost per unit |
| `added_by` | `INT` | FK → lab_personnel, NOT NULL | |
| `added_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**PK:** `(visit_id, resource_id)`.  
**Business Rule:** Insertion decrements `resources.available_quantity` by `quantity_used` within the same transaction; the operation is blocked if stock is insufficient.

---

### DD-17 `seminars`

**Purpose:** Stores hospital seminar records managed by admins.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `seminar_id` | `SERIAL` | PK | |
| `seminar_name` | `VARCHAR(255)` | NOT NULL | |
| `seminar_date` | `DATE` | NOT NULL | |
| `duration_hours` | `DECIMAL(5,2)` | NOT NULL, CHECK > 0 | E.g. 1.5 = 90 minutes |
| `hall_number` | `VARCHAR(50)` | NOT NULL | |
| `created_by` | `INT` | FK → admins, NOT NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NULLABLE | Set on any edit |

---

### DD-18 `visit_status_log`

**Purpose:** Immutable audit trail of every status transition on every visit.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `log_id` | `SERIAL` | PK | |
| `visit_id` | `INT` | FK → visits, NOT NULL | |
| `from_status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | NULLABLE | NULL for initial creation |
| `to_status` | `ENUM('ADMITTED','TREATMENT_IN_PROGRESS','DISCHARGED','DECEASED')` | NOT NULL | |
| `changed_by_user_id` | `INT` | FK → users, NOT NULL | Actor of any role |
| `changed_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `notes` | `TEXT` | NULLABLE | Optional reason for transition |

**Business Rules:**
- No `UPDATE` or `DELETE` is permitted on this table.
- A row is inserted for every status transition, including the initial ADMITTED creation.

---

## 9. Assumptions and System Constraints

### 9.1 Assumptions

| ID | Assumption |
|---|---|
| A1 | The system is deployed for a single hospital; multi-hospital / multi-tenant deployment is out of scope. |
| A2 | Medical section names are stable and defined at deployment time; additions require a schema migration. |
| A3 | Catalogue ENUM values (test names, equipment names, resource names) are stable; additions require a schema migration. |
| A4 | All hospital personnel have a valid email address and a unique username prior to account creation. |
| A5 | Patients are always registered by a clerk before any visit is created; self-registration is not supported. |
| A6 | A doctor is always assigned at visit creation time; reassigning a doctor after admission is not supported in version 1.0. |
| A7 | File storage capacity on the server is sufficient for all prescription, lab result, and post-mortem uploads for the system's operational lifetime. |
| A8 | The hospital operates in a single time zone; all timestamps are stored in server local time or UTC consistently. |
| A9 | An outpatient visit does not require a bed allocation and `bed_category_id` is always NULL for outpatients. |
| A10 | Internet access is not required for core system operation; the system runs on the hospital's internal network. |

### 9.2 System Constraints

| ID | Constraint |
|---|---|
| C1 | The database **shall** be PostgreSQL 15 or higher; no other DBMS is supported without schema review. |
| C2 | File uploads are restricted to PDF format only; maximum file size is 10 MB per upload. |
| C3 | The ENUM set for test names, equipment names, and resource names is fixed at the schema level; adding new values requires a DBA-executed migration. |
| C4 | The application **shall** run on Linux; Windows Server hosting is not supported in version 1.0. |
| C5 | Minimum browser requirement: Chrome 110+, Firefox 110+, Edge 110+, or Safari 16+. |
| C6 | The `visit_status_log` table is append-only; the application role **shall** not be granted UPDATE or DELETE privileges on this table. |
| C7 | Ward bed counts are managed at category level only; there is no individual bed entity in the schema. |
| C8 | All authentication tokens **shall** expire; token-less persistent sessions are not supported. |

---

## 10. Backend Database Specifications, Connectivity, and Application

### 10.1 DBMS Selection

| Attribute | Value |
|---|---|
| **DBMS** | PostgreSQL 15+ |
| **Normalisation** | Third Normal Form (3NF) as specified in `HMS_FINAL.md` |
| **Character set** | UTF-8 |
| **Collation** | `en_US.UTF-8` or equivalent |
| **Schema migrations** | Flyway, Liquibase, or equivalent versioned migration tool |
| **Backups** | Daily full backup via `pg_dump`; retained for 30 days minimum |

### 10.2 Schema Overview

18 tables across three logical groups:

| Group | Tables |
|---|---|
| **Identity & Personnel** | `users`, `admins`, `doctors`, `clerks`, `lab_personnel`, `medical_sections` |
| **Clinical & Billing** | `patients`, `visits`, `invoices`, `ward_categories`, `visit_tests`, `visit_equipment`, `visit_resources`, `visit_status_log` |
| **Catalogue & Admin** | `tests`, `equipment`, `resources`, `seminars` |

Full ER diagram: `HMS_ER_DIAGRAM.png` (REF-2).

### 10.3 Connectivity and Application Layer

| Attribute | Specification |
|---|---|
| **API style** | RESTful HTTP API; JSON request/response bodies |
| **Authentication** | Session-based (server-side sessions stored in DB or Redis) or JWT; configurable |
| **Connection pooling** | PgBouncer or driver-level pool (e.g. `pg-pool` for Node.js); pool size configurable via `DB_POOL_SIZE` environment variable |
| **ORM / Query layer** | Framework-level ORM (e.g. Sequelize, SQLAlchemy, Hibernate) or prepared statements; raw string concatenation is prohibited |
| **File upload handling** | `multipart/form-data` POST; files saved to `FILE_STORAGE_PATH` env var directory; path stored in DB |
| **Environment variables** | `DATABASE_URL`, `DB_POOL_SIZE`, `SESSION_SECRET`, `FILE_STORAGE_PATH`, `BCRYPT_ROUNDS`, `SESSION_TIMEOUT_MINUTES` |

### 10.4 Transaction Management

Critical operations **shall** execute within explicit database transactions:

| Operation | Transaction Scope |
|---|---|
| Admit patient (UC5) | `SELECT … FOR UPDATE` on `ward_categories`; decrement `available_beds`; update `visits.status` |
| Discharge patient (UC10) | Update `visits.status`; increment `ward_categories.available_beds`; update `invoices.payment_status` |
| Record death (UC11) | Update `visits.status`; populate death columns; increment `ward_categories.available_beds` |
| Add lab costs (UC7) | Insert junction rows; update invoice cost columns; decrement resource/equipment availability |
| All status transitions | Append row to `visit_status_log` within the same transaction as the status update |

All transactions that modify `ward_categories.available_beds` **shall** use `SELECT … FOR UPDATE` to prevent concurrent double-booking (NFR10).

### 10.5 Backup and Recovery

| Attribute | Specification |
|---|---|
| **Backup frequency** | Daily full `pg_dump`; WAL archiving recommended for point-in-time recovery |
| **Retention** | Minimum 30 days |
| **Storage** | Separate physical device or remote object storage (not the same server as the database) |
| **Recovery time objective (RTO)** | ≤ 4 hours from a full backup |
| **Recovery point objective (RPO)** | ≤ 24 hours (daily backup); ≤ 5 minutes with WAL archiving |
| **Test restores** | Backup restoration **shall** be tested quarterly |

---

## 11. Other Requirements

### 11.1 Legal and Regulatory

| ID | Requirement |
|---|---|
| OR1 | Patient records **shall** be retained for the minimum period mandated by applicable local healthcare data retention laws (typically 7–10 years). Hard deletion of patient or visit records is not permitted within this period. |
| OR2 | Access to patient data **shall** be restricted to authenticated and authorised users only; no patient data **shall** be exposed in URLs, logs, or error messages. |
| OR3 | Audit logs (`visit_status_log`) **shall** be preserved for the same retention period as patient records and **shall not** be modifiable. |
| OR4 | File uploads containing patient health information (prescriptions, lab results, post-mortem reports) **shall** be stored in a location not directly accessible via HTTP/HTTPS URL; access **shall** be brokered by the application layer with authorisation checks. |

### 11.2 Installation and Deployment

| ID | Requirement |
|---|---|
| OR5 | The system **shall** be deployable using a documented, scripted process (e.g. Docker Compose or equivalent) that creates the database schema, seeds catalogue data, and starts the application server. |
| OR6 | All configuration **shall** be provided via environment variables; no credentials or file paths **shall** be hard-coded in source files. |
| OR7 | Database migrations **shall** be idempotent and versioned; re-running migrations on an already-migrated schema **shall** produce no side effects. |

### 11.3 Maintainability

| ID | Requirement |
|---|---|
| OR8 | The application **shall** produce structured logs (JSON format recommended) at INFO level for every API request and at ERROR level for every unhandled exception, including request ID, timestamp, user ID, and endpoint. |
| OR9 | Adding a new ENUM value to `test_name`, `equipment_name`, or `resource_name` **shall** require only a database migration and a corresponding seed data update; no application code changes **shall** be required. |
| OR10 | Unit and integration tests **shall** cover all FR-numbered functional requirements; test coverage **shall** be tracked and reported on every build. |
