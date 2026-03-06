import { NextRequest, NextResponse } from "next/server";

const DEMO_USERS: Record<string, { password: string; role: string; name: string }> = {
  "hod@hospital.in":      { password: "Demo@1234", role: "hod",       name: "Dr. Vikram HOD" },
  "officer@hospital.in":  { password: "Demo@1234", role: "officer",   name: "Officer Rajan" },
  "labtech@hospital.in":  { password: "Demo@1234", role: "lab_tech",  name: "Anita Sharma" },
  "clinician@hospital.in":{ password: "Demo@1234", role: "clinician", name: "Dr. Priya Nair" },
  "nurse@hospital.in":    { password: "Demo@1234", role: "nurse",     name: "Nurse Kavitha" },
};

const MFA_ROLES = ["hod", "officer", "lab_tech"];

export async function POST(req: NextRequest) {
  const { email, password, totp } = await req.json();

  const user = DEMO_USERS[email?.toLowerCase()];
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // MFA step
  if (MFA_ROLES.includes(user.role)) {
    if (!totp) {
      // Signal that MFA is needed
      return NextResponse.json({ mfa_required: true, role: user.role });
    }
    // Accept any 6-digit code for demo
    if (!/^\d{6}$/.test(totp)) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 401 });
    }
  }

  const session = JSON.stringify({ email: email.toLowerCase(), role: user.role, name: user.name });

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set("demo_session", session, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: "lax",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("demo_session", "", { maxAge: 0, path: "/" });
  return res;
}
