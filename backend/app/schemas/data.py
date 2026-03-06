"""Pydantic schemas for domain data endpoints."""

from pydantic import BaseModel
from typing import Optional, List


class InventoryItem(BaseModel):
    blood_group: str
    product_type: str
    available: int
    reserved: int
    expiring_48h: int


class TransfusionRequest(BaseModel):
    id: str
    patient_name: str
    uhid: str
    blood_group: str
    product: str
    units: int
    urgency: str
    status: str
    indication: str
    clinician: str
    created_at: str


class AuditEntry(BaseModel):
    id: int
    action: str
    user: str
    resource: str
    severity: str
    timestamp: str


class DashboardStats(BaseModel):
    total_requests: int
    completed: int
    adverse_reactions: int
    emergency_releases: int
    pending_crossmatch: int
    ready_to_issue: int


class Notification(BaseModel):
    id: int
    title: str
    body: str
    severity: str
    read: bool
    time: str
