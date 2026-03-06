"""Dashboard data endpoints — inventory, requests, stats, audit, notifications."""

import random
from typing import List

from fastapi import APIRouter, Depends

from app.core.security import get_current_user, require_role
from app.schemas.data import (
    InventoryItem,
    TransfusionRequest,
    AuditEntry,
    DashboardStats,
    Notification,
)

router = APIRouter(prefix="/api/data", tags=["data"])

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
PRODUCTS = ["PRC", "FFP", "PLT", "CRYO", "WB"]


# ---------------------------------------------------------------------------
# Public health check (no auth required)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Dashboard stats (any authenticated user)
# ---------------------------------------------------------------------------
@router.get("/stats", response_model=DashboardStats)
def get_stats(user: dict = Depends(get_current_user)):
    return DashboardStats(
        total_requests=48,
        completed=42,
        adverse_reactions=2,
        emergency_releases=3,
        pending_crossmatch=2,
        ready_to_issue=1,
    )


# ---------------------------------------------------------------------------
# Inventory (admin + clinician)
# ---------------------------------------------------------------------------
@router.get("/inventory", response_model=List[InventoryItem])
def get_inventory(user: dict = Depends(require_role("admin", "clinician"))):
    items = []
    for bg in BLOOD_GROUPS:
        for pt in PRODUCTS:
            avail = random.randint(0, 12)
            if bg == "O-" and pt == "PRC":
                avail = 2  # critical
            items.append(
                InventoryItem(
                    blood_group=bg,
                    product_type=pt,
                    available=avail,
                    reserved=random.randint(0, 3),
                    expiring_48h=random.randint(0, 2),
                )
            )
    return items


# ---------------------------------------------------------------------------
# Transfusion requests (any authenticated)
# ---------------------------------------------------------------------------
@router.get("/requests", response_model=List[TransfusionRequest])
def get_requests(user: dict = Depends(get_current_user)):
    return [
        TransfusionRequest(
            id="REQ-001", patient_name="Rajesh Kumar", uhid="UHID-2024-0001",
            blood_group="A+", product="PRC", units=2, urgency="urgent",
            status="crossmatch_pending", indication="Post-op blood loss — CABG",
            clinician="Dr. Priya Nair", created_at="2026-03-05 09:30",
        ),
        TransfusionRequest(
            id="REQ-002", patient_name="Fatima Begum", uhid="UHID-2024-0002",
            blood_group="B+", product="PRC", units=1, urgency="routine",
            status="ready_to_issue", indication="Anaemia",
            clinician="Dr. Priya Nair", created_at="2026-03-05 11:15",
        ),
        TransfusionRequest(
            id="REQ-003", patient_name="Vikram Singh", uhid="UHID-2024-0003",
            blood_group="O-", product="PRC", units=2, urgency="emergency",
            status="pending_approval", indication="Trauma — MVA",
            clinician="Dr. Priya Nair", created_at="2026-03-05 14:00",
        ),
        TransfusionRequest(
            id="REQ-004", patient_name="Arun Kumar", uhid="UHID-2024-0004",
            blood_group="B+", product="FFP", units=1, urgency="routine",
            status="issued", indication="Liver disease",
            clinician="Dr. Priya Nair", created_at="2026-03-04 16:20",
        ),
    ]


# ---------------------------------------------------------------------------
# Audit trail (admin only)
# ---------------------------------------------------------------------------
@router.get("/audit", response_model=List[AuditEntry])
def get_audit(user: dict = Depends(require_role("admin"))):
    return [
        AuditEntry(id=1, action="DUAL_VERIFIED_ISSUE", user="Officer Rajan", resource="REQ-001", severity="info", timestamp="2026-03-05 15:30"),
        AuditEntry(id=2, action="ADVERSE_REACTION_REPORTED", user="Nurse Kavitha", resource="REQ-004", severity="critical", timestamp="2026-03-05 14:45"),
        AuditEntry(id=3, action="EMERGENCY_UNCROSSMATCHED_RELEASE", user="Officer Rajan", resource="BB-PRC-O--001", severity="critical", timestamp="2026-03-05 14:02"),
        AuditEntry(id=4, action="ABO_INCOMPATIBILITY_BLOCKED", user="System", resource="REQ-003", severity="critical", timestamp="2026-03-05 13:50"),
        AuditEntry(id=5, action="CROSSMATCH_FINALIZED", user="Anita Sharma", resource="RPT-GXM-001", severity="info", timestamp="2026-03-05 12:30"),
        AuditEntry(id=6, action="DONOR_DEFERRED", user="Officer Rajan", resource="DON-2024-0755", severity="warning", timestamp="2026-03-05 11:00"),
        AuditEntry(id=7, action="LOGIN", user="Dr. Vikram HOD", resource="Session", severity="info", timestamp="2026-03-05 08:00"),
    ]


# ---------------------------------------------------------------------------
# Notifications (any authenticated)
# ---------------------------------------------------------------------------
@router.get("/notifications", response_model=List[Notification])
def get_notifications(user: dict = Depends(get_current_user)):
    return [
        Notification(id=1, title="Adverse Reaction Reported", body="Fever + rigors during FFP transfusion for Arun Kumar.", severity="critical", read=False, time="10 min ago"),
        Notification(id=2, title="Emergency Uncrossmatched Release", body="O-Neg unit BB-PRC-O--001 released for Vikram Singh.", severity="critical", read=False, time="25 min ago"),
        Notification(id=3, title="Crossmatch Completed", body="RPT-GXM-001 for Rajesh Kumar finalized.", severity="info", read=False, time="1 hr ago"),
        Notification(id=4, title="Cold Storage Temperature OK", body="All refrigerators within 2-6°C range.", severity="info", read=True, time="3 hr ago"),
        Notification(id=5, title="Low Reagent Stock", body="Anti-D reagent below threshold (2 vials).", severity="warning", read=True, time="5 hr ago"),
    ]
