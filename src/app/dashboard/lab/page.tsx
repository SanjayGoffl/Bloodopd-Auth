import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, UrgencyBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { FlaskConical, Thermometer, Package, ClipboardCheck, AlertTriangle } from "lucide-react";

export default async function LabDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "lab_tech") redirect("/dashboard");

  const { data: assigned } = await supabase
    .from("transfusion_requests")
    .select(`*, patients(uhid, blood_group)`)
    .eq("assigned_lab_tech_id", user.id)
    .in("status", ["sample_received", "grouping_complete"])
    .order("created_at", { ascending: false });

  const { data: finalized } = await supabase
    .from("crossmatch_reports")
    .select("id")
    .eq("lab_tech_id", user.id)
    .eq("finalized", true);

  const { data: pending } = await supabase
    .from("crossmatch_reports")
    .select("id")
    .eq("lab_tech_id", user.id)
    .eq("finalized", false);

  const reagentAlerts = [
    { name: "Anti-A Serum", expiry: "2026-03-08", status: "expiring" },
    { name: "Anti-B Serum", expiry: "2026-04-15", status: "ok" },
    { name: "Anti-D Serum", expiry: "2026-03-09", status: "expiring" },
    { name: "AHG Reagent", expiry: "2026-05-01", status: "ok" },
  ];

  const equipment = [
    { name: "Centrifuge C-01", status: "pass", calibrated: "2026-03-01" },
    { name: "Incubator I-02", status: "pass", calibrated: "2026-02-28" },
    { name: "Refrigerator R-01", status: "pass", calibrated: "2026-03-05" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workstation Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          {profile.full_name} — Workstation: {profile.workstation || "WS-01"}
        </p>
      </div>

      {/* Expiring Reagent Alert */}
      {reagentAlerts.some(r => r.status === "expiring") && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-amber-800">Reagent Expiry Warning</div>
            <div className="text-sm text-amber-700">
              {reagentAlerts.filter(r => r.status === "expiring").map(r => r.name).join(", ")} expiring within 48 hours.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{assigned?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Samples in Queue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">{pending?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Pending Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{finalized?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Reports Finalized Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">3/3</div>
            <div className="text-sm text-gray-500 mt-1">Equipment OK</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                Assigned Samples — {profile.workstation || "WS-01"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!assigned || assigned.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No samples currently assigned to your workstation.
                </div>
              ) : (
                <div className="space-y-3">
                  {assigned.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gray-700">
                            {req.patients?.uhid || "UHID-???"}
                          </span>
                          <UrgencyBadge urgency={req.urgency} />
                        </div>
                        <div className="text-xs text-gray-500">
                          Product: {req.product_type} × {req.units_requested} · Patient BG: {req.patients?.blood_group || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400">{formatDateTime(req.created_at)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={req.status} />
                        <Link
                          href={`/workstation/grouping?requestId=${req.id}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Equipment + Reagents */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="w-4 h-4" />
                Equipment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipment.map((e) => (
                  <div key={e.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{e.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.status === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {e.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="w-4 h-4" />
                Reagent Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reagentAlerts.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 text-xs">{r.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "ok" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.status === "ok" ? "OK" : "EXPIRING"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/workstation/grouping" className="block w-full text-center text-sm bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                New Grouping Entry
              </Link>
              <Link href="/workstation/reports" className="block w-full text-center text-sm border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors">
                View Finalized Reports
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
