# Hospital Management System — ER Diagram

```mermaid
erDiagram

    users {
        serial  user_id        PK
        varchar username
        varchar password_hash
        enum    role
        boolean is_active
        timestamp created_at
        timestamp last_login
    }

    admins {
        serial  admin_id   PK
        int     user_id    FK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
    }

    doctors {
        serial  doctor_id        PK
        int     user_id          FK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
        int     section_id       FK
        decimal consultation_fee
        boolean is_available
    }

    clerks {
        serial  clerk_id   PK
        int     user_id    FK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
    }

    lab_personnel {
        serial  lab_id     PK
        int     user_id    FK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
    }

    medical_sections {
        serial  section_id   PK
        varchar section_name
        text    description
    }

    patients {
        serial    patient_id   PK
        varchar   first_name
        varchar   last_name
        varchar   phone
        text      address
        enum      gender
        smallint  age
        int       registered_by  FK
        timestamp registered_at
    }

    ward_categories {
        serial category_id   PK
        enum   category_name
        int    total_beds
        int    available_beds
    }

    tests {
        serial  test_id      PK
        enum    test_name
        decimal cost
        boolean is_available
    }

    equipment {
        serial  equipment_id       PK
        enum    equipment_name
        decimal cost
        int     total_quantity
        int     available_quantity
        boolean is_active
    }

    resources {
        serial  resource_id        PK
        enum    resource_name
        varchar unit
        decimal cost_per_unit
        decimal available_quantity
        boolean is_active
    }

    visits {
        serial    visit_id                  PK
        int       patient_id               FK
        text      issue
        int       doctor_id               FK
        enum      patient_type
        int       bed_category_id         FK
        enum      status
        timestamp entry_time
        timestamp discharge_time
        int       assigned_by             FK
        timestamp created_at
        varchar   prescription_file
        int       prescription_uploaded_by FK
        timestamp prescription_uploaded_at
        varchar   test_result_file
        int       lab_file_uploaded_by    FK
        timestamp lab_file_uploaded_at
        int       invoice_id              FK
        varchar   invoice_pdf_path
        text      cause_of_death
        time      time_of_death
        date      date_of_death
        varchar   post_mortem_file
        int       death_recorded_by       FK
    }

    invoices {
        serial    invoice_id          PK
        int       visit_id            FK
        decimal   doctor_fee
        decimal   test_cost
        decimal   equipment_cost
        decimal   resource_cost
        decimal   total_amount
        int       generated_by        FK
        timestamp generated_at
        enum      payment_status
        timestamp payment_confirmed_at
    }

    visit_tests {
        int       visit_id     FK
        int       test_id      FK
        int       quantity
        decimal   cost_at_time
        int       added_by     FK
        timestamp added_at
    }

    visit_equipment {
        int       visit_id     FK
        int       equipment_id FK
        int       quantity
        decimal   cost_at_time
        int       added_by     FK
        timestamp added_at
    }

    visit_resources {
        int       visit_id      FK
        int       resource_id   FK
        decimal   quantity_used
        decimal   cost_at_time
        int       added_by      FK
        timestamp added_at
    }

    seminars {
        serial    seminar_id     PK
        varchar   seminar_name
        date      seminar_date
        decimal   duration_hours
        varchar   hall_number
        int       created_by     FK
        timestamp created_at
        timestamp updated_at
    }

    visit_status_log {
        serial    log_id              PK
        int       visit_id            FK
        enum      from_status
        enum      to_status
        int       changed_by_user_id  FK
        timestamp changed_at
        text      notes
    }

    %% ── Authentication / profile links ──────────────────────────
    users ||--o| admins        : "profile"
    users ||--o| doctors       : "profile"
    users ||--o| clerks        : "profile"
    users ||--o| lab_personnel : "profile"

    %% ── Personnel → domain ──────────────────────────────────────
    medical_sections ||--o{ doctors   : "belongs to"
    admins           ||--o{ seminars  : "creates"

    %% ── Patient registration ────────────────────────────────────
    clerks ||--o{ patients : "registers"

    %% ── Visit creation & assignment ─────────────────────────────
    patients        ||--o{ visits : "has"
    clerks          ||--o{ visits : "creates (assigned_by)"
    doctors         ||--o{ visits : "assigned to (doctor_id)"
    ward_categories ||--o{ visits : "accommodates (bed_category_id)"

    %% ── Inline visit actions (separate FK roles) ────────────────
    doctors       ||--o{ visits : "uploads prescription"
    doctors       ||--o{ visits : "records death"
    lab_personnel ||--o{ visits : "uploads test result"

    %% ── Billing ─────────────────────────────────────────────────
    visits  ||--o| invoices : "billed via"
    clerks  ||--o{ invoices : "generates"

    %% ── Junction tables (lab cost entries) ──────────────────────
    visits        ||--o{ visit_tests      : "includes"
    tests         ||--o{ visit_tests      : "referenced in"
    lab_personnel ||--o{ visit_tests      : "adds"

    visits        ||--o{ visit_equipment  : "uses"
    equipment     ||--o{ visit_equipment  : "referenced in"
    lab_personnel ||--o{ visit_equipment  : "adds"

    visits        ||--o{ visit_resources  : "consumes"
    resources     ||--o{ visit_resources  : "referenced in"
    lab_personnel ||--o{ visit_resources  : "adds"

    %% ── Audit log ───────────────────────────────────────────────
    visits ||--o{ visit_status_log : "audited in"
    users  ||--o{ visit_status_log : "actor"
```
