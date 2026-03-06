import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const roleRoutes: Record<string, string> = {
    hod: "/dashboard/hod",
    officer: "/dashboard/officer",
    lab_tech: "/dashboard/lab",
    clinician: "/dashboard/clinician",
    nurse: "/dashboard/nurse",
  };

  const destination = roleRoutes[profile?.role] || "/login";
  redirect(destination);
}
