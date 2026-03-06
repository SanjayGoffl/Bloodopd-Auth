# TetherX — Blood Bank Transfusion Safety Management System

A healthcare-grade blood bank transfusion safety application built with **React + TypeScript** (frontend) and **FastAPI + Python** (backend). Designed for the VIT-TetherX Hackathon Round 2.

## Features

- **Role-Based Access Control (RBAC):** Admin, Clinician, and Patient roles with JWT auth
- **MFA for elevated roles:** HOD, Officer, and Lab Tech require 6-digit verification
- **Dual-Operator Verification:** Two independent staff members must verify before blood product release
- **ABO Compatibility Engine:** Real-time crossmatch compatibility checking with full matrix
- **Bedside 5-Step Verification:** Sequential patient-side safety checks before transfusion
- **Emergency O-Neg Release:** Protocol-driven uncrossmatched blood release for life-threatening emergencies
- **Adverse Reaction Reporting:** Structured reporting with severity classification
- **Real-time Vital Monitoring:** Vital sign tracking during active transfusions
- **Full Audit Trail:** Forensic logging of all blood bank operations (admin only)
- **Blood Inventory Matrix:** Stock levels by blood group and product type

## Architecture

```
tetherx-app/
├── backend/              # FastAPI Python backend
│   ├── requirements.txt
│   └── app/
│       ├── main.py       # FastAPI application entry
│       ├── core/         # Config, security (JWT, RBAC)
│       ├── models/       # In-memory demo user store
│       ├── routers/      # auth, data endpoints
│       └── schemas/      # Pydantic request/response models
├── frontend/             # React + TypeScript + Vite
│   ├── package.json
│   ├── vite.config.ts    # Proxy /api -> backend
│   └── src/
│       ├── api/          # API client with auto token refresh
│       ├── components/   # UI, Layout, Auth components
│       ├── context/      # AuthContext (login, MFA, logout)
│       ├── hooks/        # useApi data-fetching hook
│       ├── pages/        # All page components
│       └── styles/       # Tailwind + custom component classes
└── README.md
```

## Quick Start

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173` and proxies `/api/*` to the backend.

### 3. Open the app

Navigate to `http://localhost:5173` in your browser.

## Demo Accounts

All accounts use password: `Demo@1234`

| Email                | Name           | Role      | MFA Required |
|---------------------|----------------|-----------|:------------:|
| hod@hospital.in     | Dr. Vikram HOD | admin     | Yes          |
| officer@hospital.in | Officer Rajan  | admin     | Yes          |
| labtech@hospital.in | Anita Sharma   | clinician | Yes          |
| clinician@hospital.in | Dr. Priya Nair | clinician | No         |
| nurse@hospital.in   | Nurse Kavitha  | clinician | No           |
| patient@hospital.in | Ramesh Kumar   | patient   | No           |

For MFA, enter any 6-digit code (e.g., `123456`).

## Tech Stack

| Layer    | Technology                                     |
|----------|-------------------------------------------------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 3    |
| Backend  | FastAPI, Python 3.10+, python-jose, passlib      |
| Auth     | JWT (access + refresh tokens), OAuth2 Bearer      |
| Routing  | React Router v7 (client-side)                     |
| Styling  | Tailwind CSS with custom healthcare color palette  |

## API Endpoints

### Auth
- `POST /api/auth/login` — Login (returns tokens or MFA challenge)
- `POST /api/auth/mfa-verify` — Complete MFA
- `POST /api/auth/refresh` — Refresh access token
- `GET  /api/auth/me` — Current user info

### Data
- `GET /api/data/stats` — Dashboard statistics
- `GET /api/data/inventory` — Blood inventory (admin/clinician)
- `GET /api/data/requests` — Transfusion requests
- `GET /api/data/audit` — Audit trail (admin only)
- `GET /api/data/notifications` — Notifications

### System
- `GET /api/health` — Health check

## Notes

- This is a **demo/hackathon application**. No real patient data is used.
- In-memory data store — data resets on server restart.
- MFA accepts any 6-digit code (not production-grade).
- Designed to demonstrate transfusion safety workflows and RBAC patterns.

## License

Built for VIT-TetherX Hackathon. Educational use only.
