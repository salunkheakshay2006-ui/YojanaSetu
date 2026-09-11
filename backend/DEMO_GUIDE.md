# YojanaSetu — PS16 Hackathon Demo Guide

Welcome to the **YojanaSetu** Hackathon Demonstration Guide.

YojanaSetu is an autonomous scheme-bundle optimizer built for Problem Statement 16 (**PS16**):
> **Autonomous Scheme-Bundle Optimizer for Citizens**

Instead of forcing a citizen to browse hundreds of government portals and manually read complex circulars, YojanaSetu implements the full autonomous pipeline:

$$\text{Profile} \longrightarrow \text{Eligibility Reasoning} \longrightarrow \text{Conflict Detection} \longrightarrow \text{Optimized Bundle} \longrightarrow \text{Explanation} \longrightarrow \text{Application Checklist}$$

---

## 1. Quick Start — Running the Backend

Open your terminal in the `backend/` directory and run:

```bash
python -m uvicorn main:app --port 8000
```

Verify the server is healthy:
- Open your browser or call:
  ```http
  GET http://127.0.0.1:8000/health
  ```
- Expected response:
  ```json
  {
    "success": true,
    "message": "Backend is running",
    "data": {}
  }
  ```

---

## 2. Interactive Swagger Documentation

Open the interactive Swagger UI directly in your browser:
🔗 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

From here, judges can click **"Try it out"** on any endpoint and run live tests with one click.

---

## 3. Core API Endpoints

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/api/profile` | Create a new citizen profile |
| `GET` | `/api/profile/{id}` | Retrieve citizen profile details by ID |
| `GET` | `/api/schemes` | Scheme knowledge base catalog (20 official schemes) |
| `GET` | `/api/schemes/{id}` | Retrieve specific scheme details by ID |
| **`GET`** | **`/api/eligibility/{citizen_id}`** | ⭐ **MAIN DEMO ENDPOINT** — Executes eligibility check, conflict detection, bundle optimization, plain-English explanation, and application checklist in a single call |

---

## 4. Key Terminology (Explaining the Results)

### Eligibility Statuses
* **`confirmed_eligible`**: The citizen meets 100% of the verified conditions checked by YojanaSetu. There are no unresolved eligibility criteria left in our rules. The citizen is ready to apply.
* **`possibly_eligible`**: The citizen passes all demographic and structural rules (e.g., age, gender, state, farmer status), but the official scheme requires external verification that a self-reported profile cannot prove (e.g., SECC 2011 census inclusion, crop notification area, or ITI marks).
* **`not_eligible`**: The citizen fails at least one mandatory rule (e.g., age above maximum, wrong state for state-specific scheme, or lack of required disability).

### Document Checklist Statuses
* **`known_present`**: The citizen profile directly confirms they possess this requirement (e.g., `has_bank_account=True`, or `ration_card_type="PHH"`).
* **`known_missing`**: The citizen profile directly indicates this requirement is absent (e.g., `has_bank_account=False`). An immediate, actionable next step is provided.
* **`verification_required`**: Official documents (such as Aadhaar, Domicile, or Marksheets) that cannot be assumed without asking the citizen. YojanaSetu honestly flags these for the citizen to verify before applying.

---

## 5. Live Demo Scenarios for Judges

### Scenario 1 — Standard Citizen: Ravi Kumar
* **Citizen ID**: `6346f755-641a-4500-b259-a62dd6ed4a30`
* **Profile**: 35-year-old male, farmer in Maharashtra, `has_bank_account=False`, `ration_card_type="none"`.

#### Steps to Demonstrate:
1. Open Swagger at `GET /api/eligibility/{citizen_id}`.
2. Enter `citizen_id`: `6346f755-641a-4500-b259-a62dd6ed4a30` and click **Execute**.

#### What to Show the Judge:
- **Eligibility Summary**: 20 schemes evaluated (0 confirmed, 11 possibly eligible, 9 not eligible).
- **Conflicts**: `conflicts: []` (0 conflicts detected).
- **Optimized Bundle**: 11 schemes recommended without any conflict.
- **Bundle Explanation**: Plain-English explanation clearly stating that 0 schemes are confirmed because bank account and external verification are still required.
- **Application Checklist**:
  - `known_missing`: **Bank or Post-Office Account Passbook** and **Ration Card** are automatically identified as missing because Ravi's profile lacks them.
  - Actionable advice: Shows Ravi where and how to open an account.

---

### Scenario 2 — Female Beneficiary with Target Needs: Fatima Sheikh
* **Citizen ID**: `b8a364bc-f69e-48ec-8dfb-5b31c0c2c759`
* **Profile**: 28-year-old female, Maharashtra, `has_bank_account=True`, `is_bpl=True`, `ration_card_type="PHH"`, `is_pregnant_or_lactating=True`.

#### Steps to Demonstrate:
1. Call `GET /api/eligibility/b8a364bc-f69e-48ec-8dfb-5b31c0c2c759`.

#### What to Show the Judge:
- **Confirmed Tier**: **Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)** is `confirmed_eligible` and placed in `bundle.confirmed` because Fatima is aged 18–50 and has an active bank account.
- **Conditional Tier**: **Pradhan Mantri Matru Vandana Yojana (PMMVY)** is `possibly_eligible` and placed in `bundle.conditional` (demographics matched, pending MCP health card check).
- **Optimized Bundle**: 16 conflict-free schemes recommended.
- **Application Checklist**:
  - `known_present`: Both **Bank Account Passbook** and **Ration Card** are confirmed present from her profile.
  - `verification_required`: **MCP/RCHI card** is clearly listed for her maternity benefit.

---

### Scenario 3 — Autonomous Conflict Detection & Resolution (Active MUDRA Loan)
* **Goal**: Show that YojanaSetu detects verified government scheme conflicts and automatically prevents illegal simultaneous registrations.
* **Verified Rule**: Under official guidelines (*pmvishwakarma.gov.in*), an artisan with an active/unpaid MUDRA loan is legally ineligible to register for **PM Vishwakarma** until the loan is fully repaid.

#### Steps to Demonstrate:
1. Go to `POST /api/profile` in Swagger and paste:
   ```json
   {
     "name": "Arjun Artisan",
     "age": 35,
     "gender": "male",
     "state": "Maharashtra",
     "district": "Pune",
     "income": 150000.0,
     "occupation": "Artisan",
     "education": "10th Pass",
     "category": "OBC",
     "is_student": false,
     "is_farmer": false,
     "is_disabled": false,
     "has_bank_account": true,
     "is_bpl": false,
     "ration_card_type": "none",
     "owns_land": false,
     "is_pregnant_or_lactating": false,
     "owns_business": true,
     "has_active_mudra_loan": true
   }
   ```
2. Click **Execute** and copy the generated citizen `id`.
3. Call `GET /api/eligibility/{citizen_id}` with this new ID.

#### What to Show the Judge:
1. **`conflicts`**: Shows `pmv_vs_active_mudra_loan` with official citation.
2. **`bundle.excluded_schemes`**: **PM Vishwakarma is excluded from the bundle** with the exact legal reason.
3. **`bundle.bundle`**: **PMMY (Pradhan Mantri Mudra Yojana) remains in the bundle**.
4. **`bundle.explanation.conflict_resolution`**: Transparently explains to the citizen that PM Vishwakarma was omitted due to their outstanding MUDRA loan.
5. **`checklist`**: **PM Vishwakarma does NOT appear in the checklist**, preventing the citizen from wasting time gathering useless paperwork.

---

### Scenario 4 — Conflict Resolved (No Active MUDRA Loan)
* **Goal**: Prove that when the conflict condition is absent, the optimizer safely bundles both opportunities.

#### Steps to Demonstrate:
1. Go to `POST /api/profile` and create a citizen with `has_active_mudra_loan: false`:
   ```json
   {
     "name": "Sunil Artisan",
     "age": 35,
     "gender": "male",
     "state": "Maharashtra",
     "district": "Pune",
     "income": 150000.0,
     "occupation": "Artisan",
     "education": "10th Pass",
     "category": "OBC",
     "is_student": false,
     "is_farmer": false,
     "is_disabled": false,
     "has_bank_account": true,
     "is_bpl": false,
     "ration_card_type": "none",
     "owns_land": false,
     "is_pregnant_or_lactating": false,
     "owns_business": true,
     "has_active_mudra_loan": false
   }
   ```
2. Call `GET /api/eligibility/{citizen_id}`.

#### What to Show the Judge:
- **`conflicts`**: Empty `[]`.
- **`bundle.bundle`**: **Both PM Vishwakarma and PMMY coexist safely in the recommended bundle**.
- **`bundle.excluded_schemes`**: Empty `[]`.
- **`checklist`**: Requirements for both schemes appear together in the consolidated checklist.

---

## 6. Two-Minute Presentation Script for Judges

*(Read or speak this naturally during your demo)*

> *"Good morning/afternoon, judges!*
>
> *Across India, there are thousands of government welfare schemes and scholarships. But right now, citizens face three massive bottlenecks:
> 1. They don't know which schemes they actually qualify for.
> 2. They don't know when applying for Scheme A legally disqualifies them from Scheme B.
> 3. They get overwhelmed by endless confusing document checklists.
>
> *Today, we present **YojanaSetu**, an autonomous Scheme-Bundle Optimizer built for PS16.*
>
> *Here is our core innovation: A citizen fills their profile just once. Our backend immediately executes our autonomous reasoning engine.*
>
> *(Point to Swagger GET /api/eligibility/{citizen_id})*
>
> *Notice what happened in this single sub-50-millisecond call:
> 1. **Eligibility Engine**: It evaluated all 20 official schemes from myScheme.gov.in using deterministic rules—no hallucinated facts, no arbitrary scores.
> 2. **Conflict Detection**: When our artisan has an active MUDRA loan, official government circulars state they cannot register for PM Vishwakarma. YojanaSetu autonomously detects this conflict.
> 3. **Bundle Optimization**: Instead of dumping incompatible schemes, our optimizer prunes the blocked scheme and preserves the valid ones in a clean, conflict-free bundle.
> 4. **Transparent Explanations**: We tell the citizen in plain English why schemes are in confirmed versus conditional tiers, and exactly why conflicting schemes were excluded.
> 5. **Actionable Application Checklist**: It deduplicates all required paperwork across the bundle, highlighting documents they already have, documents they are missing with steps to fix them, and documents requiring portal verification.
>
> *YojanaSetu turns government bureaucracy into a one-click, personalized roadmap for every Indian citizen.*
>
> *Thank you, we welcome your questions!"*

---

## 7. System Architecture & Boundaries

```
[Citizen Profile]
       │
       ▼
[Eligibility Engine]  ── (Evaluates demographic & verified criteria)
       │
       ▼
[Conflict Engine]     ── (Resolves verified mutual exclusions e.g. PMV vs MUDRA)
       │
       ▼
[Bundle Optimizer]    ── (Partitions into Confirmed & Conditional Tiers)
       │
       ▼
[Checklist Engine]    ── (Deduplicates & evaluates document readiness)
       │
       ▼
Single Unified API Response: GET /api/eligibility/{citizen_id}
```

- **Database**: PostgreSQL (hosted on Supabase) with SQLAlchemy ORM.
- **Framework**: FastAPI (Python 3.14).
- **Data Integrity**: 20 official schemes sourced directly from myScheme dataset.
