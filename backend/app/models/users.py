"""In-memory demo user store. Replace with a real DB in production."""

from app.core.security import hash_password

DEMO_USERS = {
    "hod@hospital.in": {
        "email": "hod@hospital.in",
        "name": "Dr. Vikram HOD",
        "role": "admin",
        "department": "Pathology",
        "password_hash": hash_password("Demo@1234"),
        "mfa_required": True,
        "is_active": True,
    },
    "officer@hospital.in": {
        "email": "officer@hospital.in",
        "name": "Officer Rajan",
        "role": "admin",
        "department": "Blood Bank",
        "password_hash": hash_password("Demo@1234"),
        "mfa_required": True,
        "is_active": True,
    },
    "labtech@hospital.in": {
        "email": "labtech@hospital.in",
        "name": "Anita Sharma",
        "role": "clinician",
        "department": "Blood Bank Lab",
        "password_hash": hash_password("Demo@1234"),
        "mfa_required": True,
        "is_active": True,
    },
    "clinician@hospital.in": {
        "email": "clinician@hospital.in",
        "name": "Dr. Priya Nair",
        "role": "clinician",
        "department": "Cardiology",
        "password_hash": hash_password("Demo@1234"),
        "mfa_required": False,
        "is_active": True,
    },
    "nurse@hospital.in": {
        "email": "nurse@hospital.in",
        "name": "Nurse Kavitha",
        "role": "clinician",
        "department": "Nursing",
        "password_hash": hash_password("Demo@1234"),
        "mfa_required": False,
        "is_active": True,
    },
    "patient@hospital.in": {
        "email": "patient@hospital.in",
        "name": "Ramesh Kumar",
        "role": "patient",
        "department": "",
        "password_hash": hash_password("Demo@1234"),
        "mfa_required": False,
        "is_active": True,
    },
}


def get_user(email: str):
    return DEMO_USERS.get(email.lower())
