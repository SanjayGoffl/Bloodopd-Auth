import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { UserProfile } from "@/types";

// Mock role → profile mapping (matches demo credentials)
const DEMO_PROFILES: Record<string, UserProfile> = {
  "hod@hospital.in": {
    id: "hod-001",
    email: "hod@hospital.in",
    full_name: "Dr. Vikram HOD",
    role: "hod",
    department: "Transfusion Medicine",
    is_active: true,
  },
  "officer@hospital.in": {
    id: "officer-001",
    email: "officer@hospital.in",
    full_name: "Officer Rajan",
    role: "officer",
    department: "Blood Bank",
    is_active: true,
  },
  "labtech@hospital.in": {
    id: "lab-001",
    email: "labtech@hospital.in",
    full_name: "Anita Sharma",
    role: "lab_tech",
    department: "Blood Bank Laboratory",
    is_active: true,
  },
  "clinician@hospital.in": {
    id: "clinician-001",
    email: "clinician@hospital.in",
    full_name: "Dr. Priya Nair",
    role: "clinician",
    department: "Internal Medicine",
    is_active: true,
  },
  "nurse@hospital.in": {
    id: "nurse-001",
    email: "nurse@hospital.in",
    full_name: "Nurse Kavitha",
    role: "nurse",
    department: "Ward 3B",
    is_active: true,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("demo_session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  let session: { email: string; role: string } | null = null;
  try {
    session = JSON.parse(sessionCookie);
  } catch {
    redirect("/login");
  }

  if (!session?.email) redirect("/login");

  const profile = DEMO_PROFILES[session.email];
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={profile} notificationCount={3} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
