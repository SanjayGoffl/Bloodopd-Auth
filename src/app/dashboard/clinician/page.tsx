import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, UrgencyBadge } from "@/components/ui/badge";
import { formatDateTime, minutesSince } from "@/lib/utils";
import Link from "next/link";
import { Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ClinicianDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "clinician") redirect("/dashboard");

  // My active requests
  const { data: requests } = await supabase
    .from("transfusion_requests")
    .select(`*, patients(uhid, full_name, ward, bed_number, blood_group)`)
    .eq("requesting_clinician_id", user.id)
    .not("status", "in", '("completed","cancelled")')
    .order("created_at", { ascending: false })
    .limit(10);

  // Completed this week
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: completed } = await supabase
    .from("transfusion_requests")
    .select("id")
    .eq("requesting_clinician_id", user.id)
    .eq("status", "completed")
    .gte("updated_at", weekAgo);

  // Notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", user.id)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(5);

  const readyUnits = requests?.filter((r) => r.status === "crossmatched") || [];
  const inProgress = requests?.filter((r) => r.status === "in_progress") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Transfusion Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Dr. {profile.full_name} — {profile.department || "Clinical"} Department
          </p>
        </div>
        <Link href="/request/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Transfusion Request
          </Button>
        </Link>
      </div>

      {/* Alert: Units Ready */}
      {readyUnits.length > 0 && (
        <div className="bg-teal-50 border border-teal-300 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-teal-800">
              {readyUnits.length} unit{readyUnits.length > 1 ? "s" : ""} crossmatched and ready for collection
            </div>
            <div className="text-sm text-teal-700 mt-0.5">
              Notify your transfusion nurse to collect from the blood bank.
            </div>
          </div>
        </div>
      )}

      {/* In Progress Alert */}
      {inProgress.length > 0 && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-green-800">
              {inProgress.length} transfusion{inProgress.length > 1 ? "s" : ""} currently in progress
            </div>
            <div className="text-sm text-green-700 mt-0.5">
              Monitoring nurse will report vitals every 15 minutes.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{requests?.length || 0}</div>
                <div className="text-sm text-gray-500">Active Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completed?.length || 0}</div>
                <div className="text-sm text-gray-500">Completed This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{readyUnits.length}</div>
                <div className="text-sm text-gray-500">Ready for Collection</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No active transfusion requests.</p>
              <Link href="/request/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Submit a new request
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Urgency</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Raised</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => (
                    <tr
                      key={req.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {req.patients?.full_name || "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {req.patients?.uhid} · Bed {req.patients?.bed_number}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {req.units_requested}× {req.product_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <UrgencyBadge urgency={req.urgency} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {minutesSince(req.created_at)}m ago
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/clinician/request/${req.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unread Notifications */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    n.severity === "critical" ? "bg-red-50 border-red-200" :
                    n.severity === "urgent" ? "bg-amber-50 border-amber-200" :
                    "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{n.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{n.body}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
