import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BarChart3, AlertTriangle, Users, TrendingUp, ShieldAlert, Download } from "lucide-react";

export default async function HODDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "hod") redirect("/dashboard");

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { data: adverseReactions } = await supabase
    .from("adverse_reactions")
    .select("id, investigation_status, created_at")
    .gte("created_at", thisMonth);

  const { data: emergencyReleases } = await supabase
    .from("transfusion_requests")
    .select("id")
    .eq("urgency", "emergency")
    .gte("created_at", thisMonth);

  const { data: allStaff } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, failed_login_count")
    .order("failed_login_count", { ascending: false });

  const { data: recentAudit } = await supabase
    .from("audit_logs")
    .select("*")
    .in("severity", ["warning", "critical"])
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: allRequests } = await supabase
    .from("transfusion_requests")
    .select("id, status")
    .gte("created_at", thisMonth);

  const completedCount = allRequests?.filter(r => r.status === "completed").length || 0;
  const totalCount = allRequests?.length || 0;
  const openReactions = adverseReactions?.filter(r => r.investigation_status === "open").length || 0;

  const suspiciousStaff = allStaff?.filter(s => (s.failed_login_count || 0) >= 3) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Haemovigilance Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Dr. {profile.full_name} — HOD / Medical Director</p>
        </div>
        <div className="flex gap-3">
          <Link href="/audit-trail" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
            View Audit Trail
          </Link>
          <Link href="/dashboard/hod/reports" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> Export Reports
          </Link>
        </div>
      </div>

      {/* Critical alerts */}
      {openReactions > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-800">{openReactions} Open Adverse Reaction Investigation{openReactions > 1 ? "s" : ""}</div>
            <div className="text-sm text-red-700">Immediate review required. Click to open investigation cases.</div>
          </div>
          <Link href="/dashboard/hod/reactions" className="ml-auto text-sm text-red-700 underline hover:text-red-900 whitespace-nowrap">
            Review Now
          </Link>
        </div>
      )}

      {suspiciousStaff.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-amber-800">{suspiciousStaff.length} staff account{suspiciousStaff.length > 1 ? "s" : ""} with repeated login failures</div>
            <div className="text-sm text-amber-700">
              {suspiciousStaff.map(s => s.full_name).join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-500 mt-1">Requests This Month</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{adverseReactions?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Adverse Reactions</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{emergencyReleases?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Emergency Releases</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Staff Activity Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(allStaff || []).slice(0, 8).map((staff) => (
                <div key={staff.id} className={`flex items-center justify-between p-3 rounded-lg border ${(staff.failed_login_count || 0) >= 3 ? "border-amber-200 bg-amber-50" : "border-gray-100"}`}>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{staff.full_name}</div>
                    <div className="text-xs text-gray-400 capitalize">{staff.role.replace("_", " ")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(staff.failed_login_count || 0) > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {staff.failed_login_count} failed logins
                      </span>
                    )}
                    <span className={`w-2 h-2 rounded-full ${staff.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Recent Flagged Audit Events
              </span>
              <Link href="/audit-trail" className="text-xs text-blue-600 hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentAudit || recentAudit.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No flagged events.</div>
            ) : (
              <div className="space-y-2">
                {recentAudit.map((log) => (
                  <div key={log.id} className={`p-3 rounded-lg border text-sm ${log.severity === "critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{log.action}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${log.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{log.resource_type} · {new Date(log.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Haemovigilance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Haemovigilance Summary — This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Transfusions", value: totalCount, color: "text-blue-600" },
              { label: "Adverse Reactions", value: adverseReactions?.length || 0, color: "text-red-600" },
              { label: "Emergency Releases", value: emergencyReleases?.length || 0, color: "text-orange-600" },
              { label: "Open Investigations", value: openReactions, color: "text-red-700" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
