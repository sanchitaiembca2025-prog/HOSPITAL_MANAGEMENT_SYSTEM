# Skill: DBMS Assignment Part 1 — Smart Patient & Clinical Record Management System

## Trigger
Invoke when the user asks to work on, generate, or complete Part 1 of the DBMS assignment for the Smart Patient & Clinical Record Management System.

## What this skill does
Generates two deliverables in the `ASSIGNMENT/` directory:
1. `SRS.md` — Software Requirements Specification document
2. `UI_PROTOTYPE.md` — Functional UI prototype described as screen-by-screen wireframe + interaction flows

Both documents cover the following system modules:
- Patient management
- Healthcare professional management
- Appointment scheduling
- Diagnosis records
- Prescriptions
- Laboratory investigations
- Clinical records

---

## Instructions

When this skill is triggered, follow these steps in order:

### Step 1 — Clarify scope (ask the user ONLY if not already stated)
- Is this for Term 1 only (relational/text-based DB), or should the SRS also mention Term 2 multimodal extensions?
- Any specific RDBMS target (PostgreSQL, MySQL, SQLite, Oracle)?
- Any tech stack preference for the UI prototype (HTML/CSS mockup, React wireframe description, or plain text screen descriptions)?

If the user has already provided these details or asks you to proceed with defaults, use these defaults:
- Scope: Term 1 (relational DB), with a brief Term 2 extension section in SRS
- RDBMS: PostgreSQL
- UI prototype format: HTML + inline CSS static prototype saved as a single `.html` file

---

### Step 2 — Generate SRS.md

Write `/Users/I578498/Desktop/BITS/DBMS NOTES/ASSIGNMENT/SRS.md` with this structure:

```
1. Introduction
   1.1 Purpose
   1.2 Scope
   1.3 Definitions, Acronyms, Abbreviations
   1.4 References
   1.5 Overview

2. Overall Description
   2.1 Product Perspective
   2.2 Product Functions (high-level summary of all 7 modules)
   2.3 User Classes and Characteristics (Admin, Doctor, Nurse, Lab Technician, Receptionist, Patient)
   2.4 Operating Environment
   2.5 Design and Implementation Constraints
   2.6 Assumptions and Dependencies

3. Specific Requirements
   For each module (Patient, Healthcare Professional, Appointment, Diagnosis, Prescription, Lab Investigation, Clinical Record):
     3.x.1 Functional Requirements (FR-XXX numbered list)
     3.x.2 Non-Functional Requirements (NFR-XXX numbered list)
     3.x.3 Entity attributes (table schema in markdown table)

4. Use Cases
   At least one detailed use case per module with: Use Case ID, Name, Actors, Preconditions, Main Flow, Alternate Flows, Postconditions

5. ER Diagram Description
   Textual description of all entities, their attributes (PK/FK called out), and relationships with cardinality

6. Data Dictionary
   Table-by-table attribute listing: name, type, constraints, description

7. Term 2 Extension (brief section)
   Planned multimodal data: medical images (DICOM), lab PDFs, ECG/audio — storage strategy overview
```

---

### Step 3 — Generate UI_PROTOTYPE.html

Write `/Users/I578498/Desktop/BITS/DBMS NOTES/ASSIGNMENT/UI_PROTOTYPE.html` as a **single self-contained HTML file** with inline CSS and minimal vanilla JS.

Include these screens, navigable via a sidebar:
1. **Dashboard** — patient count, appointment count, pending labs (stat tiles)
2. **Patient Registration** — form with all demographic fields
3. **Patient Search & Profile** — search bar + profile card with tabs (History, Prescriptions, Labs)
4. **Appointment Scheduler** — calendar-style slots + booking form
5. **Diagnosis Entry** — linked to patient visit, ICD-10 code lookup (static)
6. **Prescription Writer** — drug name, dosage, frequency, duration; printable layout
7. **Lab Investigation** — order form + result entry form
8. **Clinical Records** — chronological record timeline per patient
9. **User Management** — role-based access list (Admin only view)

Design rules to follow:
- Clean, clinical look: white background, #0077B6 primary, #ADE8F4 accent
- Responsive layout, sidebar navigation
- No external CDN dependencies (everything inline)
- Forms must have proper labels, placeholders, and basic HTML5 validation
- Mark clearly: `<!-- PROTOTYPE ONLY — NOT CONNECTED TO DATABASE -->`

---

### Step 4 — Confirm completion

After writing both files, report:
- File paths created
- Word/line count of SRS
- Screens included in prototype
- What is NOT covered (e.g., actual DB connection, authentication logic) and which Part 2 items remain

---

## Output directory
All files go to: `/Users/I578498/Desktop/BITS/DBMS NOTES/ASSIGNMENT/`

## Notes
- Do not create a database schema SQL file — that belongs to Part 2.
- Do not implement backend logic or API routes — prototype is UI-only.
- Keep SRS academically formal (passive voice, numbered requirements, IEEE-style).
