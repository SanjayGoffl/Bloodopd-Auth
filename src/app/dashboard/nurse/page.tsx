import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import Link from "next/link";
import { Syringe, ShieldCheck, AlertOctagon, Activity } from "lucide-react";

export default async function NurseDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "nurse") redirect("/dashboard");

  // Active transfusions in this nurse's ward
  const { data: activeOrders } = await supabase
    .from("transfusion_requests")
    .select(`*, patients(uhid, full_name, ward, bed_number, blood_group)`)
    .in("status", ["dual_verified", "issued", "in_progress"])
    .order("updated_at", { ascending: false });

  // Filter by ward
  const wardOrders = activeOrders?.filter(
    (o) => o.patients?.ward === profile.ward
  ) || [];

  const inProgress = wardOrders.filter((o) => o.status === "in_progress");
  const readyToCollect = wardOrders.filter((o) => ["dual_verified", "issued"].includes(o.status));

  const { data: completedToday } = await supabase
    .from("transfusion_requests")
    .select("id")
    .eq("status", "completed")
    .gte("updated_at", new Date(Date.now() - 86400000).toISOString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Transfusions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile.full_name} — Ward: {profile.ward || "All Wards"}
          </p>
        </div>
        <Link
          href="/adverse-reaction"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-semibold transition-colors"
        >
          <AlertOctagon className="w-4 h-4" />
          Report Adverse Reaction
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{inProgress.length}</div>
            <div className="text-sm text-gray-500 mt-1">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">{readyToCollect.length}</div>
            <div className="text-sm text-gray-500 mt-1">Ready to Collect</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{wardOrders.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-600">{completedToday?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Completed Today</div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Currently Infusing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgress.map((order) => {
                const startedAgo = order.updated_at
                  ? Math.floor((Date.now() - new Date(order.updated_at).getTime()) / 60000)
                  : 0;
                const hoursElapsed = Math.floor(startedAgo / 60);
                const minsElapsed = startedAgo % 60;
                const isNearing = startedAgo > 210;

                return (
                  <div key={order.id} className={`flex items-center justify-between p-4 rounded-lg border ${isNearing ? "border-amber-300 bg-amber-50" : "border-green-200 bg-green-50"}`}>
                    <div>
                      <div className="font-semibold text-gray-900">{order.patients?.full_name}</div>
                      <div className="text-xs text-gray-500">
                        Bed {order.patients?.bed_number} · {order.product_type} · BG: {order.patients?.blood_group}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${isNearing ? "text-amber-700" : "text-green-700"}`}>
                        {hoursElapsed}h {minsElapsed}m elapsed {isNearing ? "— approaching 4-hour limit" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status="in_progress" />
                      <Link href={`/dashboard/nurse/monitoring?requestId=${order.id}`} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
                        Monitor
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready to Collect */}
      {readyToCollect.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-yellow-600" />
              Units Ready for Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readyToCollect.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div>
                    <div className="font-semibold text-gray-900">{order.patients?.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {order.patients?.uhid} · Bed {order.patients?.bed_number} · {order.product_type} × {order.units_requested}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <Link href={`/bedside-verify?requestId=${order.id}`} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verify & Start
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {wardOrders.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Syringe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No active transfusion orders for your ward.</p>
        </div>
      )}
    </div>
  );
}
