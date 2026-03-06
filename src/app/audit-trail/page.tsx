import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Search, ShieldAlert } from "lucide-react";

export default async function AuditTrailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "hod") redirect("/dashboard");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select(`*, profiles(full_name, role)`)
    .order("created_at", { ascending: false })
    .limit(100);

  const critical = logs?.filter(l => l.severity === "critical") || [];
  const warning = logs?.filter(l => l.severity === "warning") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Full Audit Trail</h1>
          <p className="text-gray-500 text-sm">Immutable forensic log — read only. Entries cannot be deleted.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-700">{logs?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Total Events</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">{warning.length}</div>
            <div className="text-sm text-gray-500 mt-1">Warnings</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{critical.length}</div>
            <div className="text-sm text-gray-500 mt-1">Critical Events</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Audit Log — Chronological
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No audit events recorded yet.</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border text-sm ${
                    log.severity === "critical" ? "bg-red-50 border-red-200" :
                    log.severity === "warning" ? "bg-amber-50 border-amber-200" :
                    "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={`w-2 h-2 rounded-full block mt-1 ${
                      log.severity === "critical" ? "bg-red-500" :
                      log.severity === "warning" ? "bg-amber-500" :
                      "bg-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{log.action}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        log.severity === "critical" ? "bg-red-100 text-red-700" :
                        log.severity === "warning" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{log.severity.toUpperCase()}</span>
                    </div>
                    <div className="text-gray-600 mt-0.5">
                      Resource: <span className="font-mono text-xs">{log.resource_type}</span>
                      {log.resource_id && <span className="font-mono text-xs text-gray-400"> · {log.resource_id.slice(0, 8)}...</span>}
                    </div>
                    {log.profiles && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        By: {log.profiles.full_name} ({log.profiles.role.replace("_", " ")})
                      </div>
                    )}
                    {log.new_value && (
                      <div className="mt-1 p-2 bg-white rounded border border-gray-200 font-mono text-xs text-gray-600 max-h-20 overflow-y-auto">
                        {JSON.stringify(log.new_value, null, 2)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDateTime(log.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
