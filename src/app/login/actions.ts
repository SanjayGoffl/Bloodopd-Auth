"use server";

import { cookies } from "next/headers";

const DEMO_USERS: Record<string, { password: string; role: string; name: string }> = {
  "hod@hospital.in":       { password: "Demo@1234", role: "hod",       name: "Dr. Vikram HOD" },
  "officer@hospital.in":   { password: "Demo@1234", role: "officer",   name: "Officer Rajan" },
  "labtech@hospital.in":   { password: "Demo@1234", role: "lab_tech",  name: "Anita Sharma" },
  "clinician@hospital.in": { password: "Demo@1234", role: "clinician", name: "Dr. Priya Nair" },
  "nurse@hospital.in":     { password: "Demo@1234", role: "nurse",     name: "Nurse Kavitha" },
};

const MFA_ROLES = ["hod", "officer", "lab_tech"];

export type LoginResult =
  | { ok: true; mfa_required: false; role: string }
  | { ok: true; mfa_required: true; role: string }
  | { ok: false; error: string };

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const user = DEMO_USERS[email.toLowerCase()];
  if (!user || user.password !== password) {
    return { ok: false, error: "Invalid credentials. Please check your email and password." };
  }

  if (MFA_ROLES.includes(user.role)) {
    return { ok: true, mfa_required: true, role: user.role };
  }

  // Write cookie for non-MFA roles
  const cookieStore = await cookies();
  cookieStore.set("demo_session", JSON.stringify({ email: email.toLowerCase(), role: user.role, name: user.name }), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });

  return { ok: true, mfa_required: false, role: user.role };
}

export async function verifyMfaAction(email: string, password: string, totp: string): Promise<LoginResult> {
  const user = DEMO_USERS[email.toLowerCase()];
  if (!user || user.password !== password) {
    return { ok: false, error: "Session expired. Please log in again." };
  }

  if (!/^\d{6}$/.test(totp)) {
    return { ok: false, error: "Invalid verification code. Enter 6 digits." };
  }

  const cookieStore = await cookies();
  cookieStore.set("demo_session", JSON.stringify({ email: email.toLowerCase(), role: user.role, name: user.name }), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });

  return { ok: true, mfa_required: false, role: user.role };
}
