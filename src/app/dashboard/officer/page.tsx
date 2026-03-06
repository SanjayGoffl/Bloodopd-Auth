import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, UrgencyBadge } from "@/components/ui/badge";
import { BLOOD_GROUPS, PRODUCT_TYPES, PRODUCT_LABELS, hoursUntilExpiry } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, Thermometer, Database, Inbox } from "lucide-react";

// Mock inventory for demo — in production this comes from get_inventory_counts() RPC
const MOCK_INVENTORY: Record<string, Record<string, { available: number; reserved: number; expiring48h: number }>> = {
  "A+": { PRC: { available: 14, reserved: 2, expiring48h: 1 }, FFP: { available: 3, reserved: 0, expiring48h: 0 }, PLT: { available: 0, reserved: 0, expiring48h: 0 }, CRYO: { available: 5, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "A-": { PRC: { available: 3, reserved: 0, expiring48h: 0 }, FFP: { available: 2, reserved: 0, expiring48h: 0 }, PLT: { available: 0, reserved: 0, expiring48h: 0 }, CRYO: { available: 1, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "B+": { PRC: { available: 9, reserved: 1, expiring48h: 0 }, FFP: { available: 8, reserved: 0, expiring48h: 0 }, PLT: { available: 1, reserved: 0, expiring48h: 0 }, CRYO: { available: 3, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "B-": { PRC: { available: 2, reserved: 0, expiring48h: 0 }, FFP: { available: 1, reserved: 0, expiring48h: 0 }, PLT: { available: 0, reserved: 0, expiring48h: 0 }, CRYO: { available: 0, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "AB+": { PRC: { available: 2, reserved: 0, expiring48h: 0 }, FFP: { available: 4, reserved: 0, expiring48h: 0 }, PLT: { available: 3, reserved: 0, expiring48h: 0 }, CRYO: { available: 2, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "AB-": { PRC: { available: 1, reserved: 0, expiring48h: 0 }, FFP: { available: 2, reserved: 0, expiring48h: 0 }, PLT: { available: 0, reserved: 0, expiring48h: 0 }, CRYO: { available: 0, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "O+": { PRC: { available: 9, reserved: 0, expiring48h: 0 }, FFP: { available: 6, reserved: 0, expiring48h: 0 }, PLT: { available: 2, reserved: 0, expiring48h: 1 }, CRYO: { available: 4, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
  "O-": { PRC: { available: 1, reserved: 0, expiring48h: 1 }, FFP: { available: 6, reserved: 0, expiring48h: 0 }, PLT: { available: 0, reserved: 0, expiring48h: 0 }, CRYO: { available: 2, reserved: 0, expiring48h: 0 }, WB: { available: 0, reserved: 0, expiring48h: 0 } },
};

function stockColor(n: number): string {
  if (n === 0) return "text-red-600 font-bold";
  if (n <= 2) return "text-amber-600 font-semibold";
  return "text-green-600 font-semibold";
}
function stockBg(n: number): string {
  if (n === 0) return "bg-red-50";
  if (n <= 2) return "bg-amber-50";
  return "bg-green-50";
}
function stockDot(n: number): string {
  if (n === 0) return "bg-red-500";
  if (n <= 2) return "bg-amber-500";
  return "bg-green-500";
}

export default async function OfficerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "officer") redirect("/dashboard");

  const { data: pendingRequests } = await supabase
    .from("transfusion_requests")
    .select(`*, patients(uhid, full_name, ward, blood_group)`)
    .in("status", ["requested", "sample_received", "grouping_complete"])
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: emergencyLogs } = await supabase
    .from("transfusion_requests")
    .select(`*, patients(uhid, full_name)`)
    .eq("urgency", "emergency")
    .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  const criticalUnits = Object.entries(MOCK_INVENTORY).flatMap(([bg, products]) =>
    Object.entries(products)
      .filter(([, v]) => v.available === 0 || v.expiring48h > 0)
      .map(([pt, v]) => ({ bg, pt, ...v }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Bank Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Dr. {profile.full_name} — Blood Bank Officer</p>
        </div>
        <div className="flex gap-3">
          <Link href="/emergency-release" className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-semibold transition-colors flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Emergency Release
          </Link>
          <Link href="/issue-auth" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-semibold transition-colors">
            Issue Authorization
          </Link>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalUnits.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">Critical Inventory Alerts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalUnits.map((u, i) => (
              <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-mono">
                {u.bg} {u.pt}: {u.available === 0 ? "OUT OF STOCK" : `${u.expiring48h} expiring`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Live Inventory — All Blood Products
          </CardTitle>
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Adequate (&gt;2)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Low (1–2)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical (0)</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 border border-gray-200">Blood Group</th>
                  {PRODUCT_TYPES.map((pt) => (
                    <th key={pt} className="text-center py-3 px-4 font-semibold text-gray-700 border border-gray-200">
                      <div>{pt}</div>
                      <div className="text-xs font-normal text-gray-400">{PRODUCT_LABELS[pt]}</div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 border border-gray-200">Expiring 48h</th>
                </tr>
              </thead>
              <tbody>
                {BLOOD_GROUPS.map((bg) => {
                  const row = MOCK_INVENTORY[bg] || {};
                  const expiring = Object.values(row).reduce((s, v) => s + (v.expiring48h || 0), 0);
                  return (
                    <tr key={bg} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900 border border-gray-200 bg-gray-50">
                        <span className="font-mono text-base">{bg}</span>
                      </td>
                      {PRODUCT_TYPES.map((pt) => {
                        const cell = row[pt] || { available: 0, reserved: 0, expiring48h: 0 };
                        return (
                          <td key={pt} className={`py-3 px-4 text-center border border-gray-200 ${stockBg(cell.available)}`}>
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stockDot(cell.available)}`} />
                              <span className={`text-base ${stockColor(cell.available)}`}>{cell.available}</span>
                            </div>
                            {cell.reserved > 0 && (
                              <div className="text-xs text-gray-400 mt-0.5">+{cell.reserved} reserved</div>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center border border-gray-200">
                        {expiring > 0 ? (
                          <span className="text-amber-700 font-semibold">{expiring} unit{expiring > 1 ? "s" : ""}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="w-4 h-4" />
              Requests Pending Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingRequests || pendingRequests.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No pending requests.</div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{req.patients?.full_name}</div>
                      <div className="text-xs text-gray-400">{req.patients?.uhid} · {req.product_type} × {req.units_requested}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge urgency={req.urgency} />
                      <Link href={`/dashboard/officer/assign?requestId=${req.id}`} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                        Assign
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Release Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Emergency Releases — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!emergencyLogs || emergencyLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No emergency releases in the past 7 days.</div>
            ) : (
              <div className="space-y-2">
                {emergencyLogs.map((req) => (
                  <div key={req.id} className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-red-900">{req.patients?.full_name}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-xs text-red-600 mt-1 truncate">{req.emergency_justification || "Emergency release"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Temperature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="w-4 h-4" />
            Cold Storage Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "PRC Refrigerator", temp: "4°C", status: "ok" },
              { name: "FFP Freezer", temp: "-30°C", status: "ok" },
              { name: "Platelet Incubator", temp: "22°C", status: "ok" },
              { name: "Quarantine Fridge", temp: "4°C", status: "ok" },
            ].map((store) => (
              <div key={store.name} className={`p-4 rounded-lg border ${store.status === "ok" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="font-semibold text-sm text-gray-800">{store.name}</div>
                <div className={`text-2xl font-bold mt-1 ${store.status === "ok" ? "text-green-700" : "text-red-700"}`}>{store.temp}</div>
                <div className={`text-xs mt-1 ${store.status === "ok" ? "text-green-600" : "text-red-600"}`}>
                  {store.status === "ok" ? "Normal" : "EXCURSION"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
