# Skill: DBMS Assignment Part 1 — Smart Patient & Clinical Record Management System

## Trigger
Invoke when the user asks to work on, generate, or complete Part 1 of the DBMS assignment.

## What this skill does
Generates two deliverables in the `ASSIGNMENT/` directory:
1. `SRS.md` — IEEE-style Software Requirements Specification
2. `UI_PROTOTYPE.html` — Single-file functional HTML/CSS/JS prototype

Before generating anything, check if `ASSIGNMENT/PROGRESS.md` exists. If it does, read it and skip completed steps. Only regenerate sections explicitly flagged as "needs update" or not yet done.

---

## System Modules (exact scope)

1. **Registration/Login Module** — Multi-role auth (Admin, Doctor, Clerk, LabPersonnel)
2. **Admin-Hospital Module** — Hospital info, facilities, wards, bed management
3. **Admin-Lab Module** — Lab facilities and testing capabilities
4. **Admin-Equipments Module** — Equipment inventory (ventilators, incubators, etc.)
5. **Clerks-Patients Data Module** — Patient registration and admission data
6. **Doctors-Treatment Module** — Treatment, medication, and discharge management
7. **Clerks-Invoice Generation Module** — Billing based on treatment and medicines
8. **Reports Module** — Admin-level aggregate reports

---

## User Roles

| Role | Description |
|---|---|
| Admin | Full system access; manages hospital info, lab, equipment, seminars, reports |
| Doctor | Enters and updates treatment details, medications, discharge info |
| Clerk | Registers patients, manages admission data, generates invoices |
| LabPersonnel | Updates test info and associated charges |

---

## Functional Requirements (verbatim from assignment)

**FR-01 — Registration/Login**
The system shall allow Registration and Login for Admin, Doctor, Clerk, and LabPersonnel. Each role shall have a distinct access level enforced at login.

**FR-02 — Admin: Hospital & Facilities**
Admin shall be able to login and update complete Hospital Info and its facilities including:
- Number of Beds
- Number of Wards
- Beds per Ward
- Type of Wards: ICU, Maternity, Outpatient, InPatient

**FR-03 — Admin: Lab Facilities**
Admin shall be able to update Lab facilities information with respect to testing facilities available.

**FR-04 — Admin: Equipment Info**
Admin shall be able to update equipment information including number of ventilators and incubators available.

**FR-05 — Clerks: Patient Data Entry**
Clerks shall be able to upload patient details including:
- Patient type: InPatient / OutPatient
- Patient Name
- Past History of Diagnosis
- Ailment
- Treatment given
- Ward Number
- Date of Admission

**FR-06 — Doctors: Treatment Details**
Doctors shall be able to upload treatment details including:
- Number of days advised
- Medicines provided (e.g., IV fluids)
- Discharge details

**FR-07 — Clerks: Invoice Generation**
Clerks shall be able to generate an invoice based on treatments provided and medicines provided.

**FR-08 — LabPersonnel: Test Updates**
Lab Personnel shall be able to update information regarding tests conducted and charges to be incurred.

**FR-09 — Admin: Seminars**
Admin shall be able to update data with respect to seminars conducted as part of Hospital Upgradation.

**FR-10 — Admin: Reports**
Admin shall be able to generate reports for:
- Patients Treated
- Tests Conducted
- Seminars Conducted
- Revenue Generated

---

## Step 1 — Generate SRS.md

Write to `ASSIGNMENT/SRS.md` using this structure (IEEE Std 830-style, academic formal tone):

```
1. Introduction
   1.1 Purpose
   1.2 Scope
   1.3 Definitions, Acronyms, Abbreviations
   1.4 References
   1.5 Overview

2. Overall Description
   2.1 Product Perspective
   2.2 Product Functions (summarise all 8 modules)
   2.3 User Classes and Characteristics (Admin, Doctor, Clerk, LabPersonnel)
   2.4 Operating Environment (PostgreSQL, web browser, LAN)
   2.5 Design and Implementation Constraints
   2.6 Assumptions and Dependencies

3. Specific Requirements — one subsection per module:
   3.1 Registration/Login Module
   3.2 Admin-Hospital Module
   3.3 Admin-Lab Module
   3.4 Admin-Equipments Module
   3.5 Clerks-Patients Data Module
   3.6 Doctors-Treatment Module
   3.7 Clerks-Invoice Generation Module
   3.8 Reports Module

   Each subsection contains:
     3.x.1 Functional Requirements (FR-XXX numbered, from the FR list above)
     3.x.2 Non-Functional Requirements (NFR-XXX: performance, security, availability)
     3.x.3 Schema — entity attributes as a markdown table (column | type | constraints | description)

4. Use Cases — one detailed UC per module (8 total):
   UC-01 User Registration & Login
   UC-02 Update Hospital & Ward Info
   UC-03 Update Lab Facilities
   UC-04 Update Equipment Inventory
   UC-05 Register Patient & Admission
   UC-06 Enter Treatment & Discharge
   UC-07 Generate Invoice
   UC-08 Generate Admin Reports
   Each UC: Use Case ID, Name, Actors, Preconditions, Main Flow (numbered steps), Alternate Flows, Postconditions

5. ER Diagram Description
   All entities, attributes (PK/FK called out), relationships, and cardinality

6. Data Dictionary
   Table-by-table column listing: name | type | constraints | description

7. Term 2 Extension (brief section)
   Multimodal data: medical images, lab PDFs, ECG/audio — storage approach
```

### Schema tables to define (PostgreSQL, 3NF, SERIAL PKs, TIMESTAMPTZ):

**users** — user_id PK, full_name, username UNIQUE, password_hash, role (Admin/Doctor/Clerk/LabPersonnel), is_active, created_at

**hospital_info** — hospital_id PK, hospital_name, address, total_beds, total_wards, updated_by FK→users, updated_at

**ward** — ward_id PK, hospital_id FK, ward_name, ward_type (ICU/Maternity/Outpatient/InPatient), total_beds, available_beds

**lab_facility** — lab_id PK, hospital_id FK, test_name, test_category, is_available, updated_by FK→users, updated_at

**equipment** — equipment_id PK, hospital_id FK, equipment_name, equipment_type (Ventilator/Incubator/Other), total_count, available_count, updated_by FK→users, updated_at

**patient** — patient_id PK, full_name, dob, gender, phone, address, past_diagnosis_history TEXT, patient_type (InPatient/OutPatient), registered_by FK→users, created_at

**admission** — admission_id PK, patient_id FK, ward_id FK (nullable for outpatient), ailment, date_of_admission, date_of_discharge (nullable), status (Admitted/Discharged), registered_by FK→users

**treatment** — treatment_id PK, admission_id FK, doctor_id FK→users, days_advised INT, treatment_notes TEXT, medicines_prescribed TEXT, iv_fluids TEXT, discharge_instructions TEXT, treatment_date TIMESTAMPTZ

**medicine_item** — item_id PK, treatment_id FK, medicine_name, quantity, unit, unit_cost NUMERIC(10,2)

**lab_test_order** — test_order_id PK, patient_id FK, admission_id FK (nullable), lab_id FK→lab_facility, ordered_by FK→users, test_date DATE, result_notes TEXT, charges NUMERIC(10,2), status (Ordered/Resulted), updated_by FK→users

**invoice** — invoice_id PK, patient_id FK, admission_id FK, generated_by FK→users, treatment_charges NUMERIC(10,2), medicine_charges NUMERIC(10,2), lab_charges NUMERIC(10,2), bed_charges NUMERIC(10,2), total_amount NUMERIC(10,2), generated_at TIMESTAMPTZ, status (Draft/Issued/Paid)

**seminar** — seminar_id PK, title, description, conducted_date DATE, conducted_by VARCHAR, budget NUMERIC(10,2), participants_count INT, recorded_by FK→users, created_at TIMESTAMPTZ

---

## Step 2 — Generate UI_PROTOTYPE.html

Write to `ASSIGNMENT/UI_PROTOTYPE.html` as a **single self-contained file** (HTML + inline CSS + vanilla JS only, no CDN).

### Screens (sidebar-navigable, role labels shown in UI):

| # | Screen | Accessible By |
|---|---|---|
| 1 | Login | All |
| 2 | Dashboard | All (role-filtered stats) |
| 3 | Hospital Info & Wards | Admin |
| 4 | Lab Facilities | Admin |
| 5 | Equipment Management | Admin |
| 6 | Patient Registration & Admission | Clerk |
| 7 | Treatment Entry | Doctor |
| 8 | Invoice Generation | Clerk |
| 9 | Lab Test Entry | LabPersonnel |
| 10 | Seminars Management | Admin |
| 11 | Reports | Admin |

### Design rules:
- Colors: background #FFFFFF, primary #0077B6, accent #ADE8F4, text #1A1A2E
- Sidebar with role badge (e.g., "Logged in as: Admin")
- Responsive: sidebar collapses on small screens
- Forms: proper `<label>`, `placeholder`, HTML5 validation attributes
- Dashboard: stat tiles for Patients Today, Active Beds, Pending Tests, Revenue (Month)
- Invoice screen: itemised table (treatment, medicines, lab, bed charges) + total row
- Reports screen: filter dropdowns (report type, date range) + placeholder table
- Mark at top of file: `<!-- PROTOTYPE ONLY — NOT CONNECTED TO DATABASE -->`
- Mark role-restricted screens with a visible banner: "Admin Only" / "Doctor Only" etc.

---

## Step 3 — Write PROGRESS.md

After generating both files, write `ASSIGNMENT/PROGRESS.md`:

```markdown
# Assignment Part 1 — Progress

## Completed
- [x] SRS.md — generated (date)
- [x] UI_PROTOTYPE.html — generated (date), screens: Login, Dashboard, Hospital Info, Lab Facilities, Equipment, Patient Registration, Treatment Entry, Invoice, Lab Test Entry, Seminars, Reports

## Modules covered
All 8 modules per assignment spec.

## Pending (Part 2)
- [ ] PostgreSQL schema SQL file (CREATE TABLE statements)
- [ ] Backend API / DB connection
- [ ] Authentication implementation
- [ ] Real CRUD operations
- [ ] Multimodal data support (Term 2)

## Changelog
<!-- Add entries here when the skill is re-run after changes -->
```

---

## Step 4 — Confirm completion

Report:
- File paths created
- SRS section count and approximate line count
- Screens in prototype
- What is deferred to Part 2

---

## Output directory
`/Users/I578498/Desktop/BITS/DBMS NOTES/ASSIGNMENT/`

## Notes
- No SQL schema file in Part 1 — that is Part 2.
- No backend logic — prototype is UI-only.
- SRS must be academically formal (passive voice, numbered FRs/NFRs, IEEE structure).
- On re-run: read PROGRESS.md first, apply only the delta.
