import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Link } from "react-router-dom";

interface Stats {
  total_requests: number;
  completed: number;
  adverse_reactions: number;
  emergency_releases: number;
  pending_crossmatch: number;
  ready_to_issue: number;
}

interface AuditEntry {
  id: number;
  action: string;
  user: string;
  resource: string;
  severity: string;
  timestamp: string;
}

const STAT_CARDS = [
  { key: "total_requests", label: "Total Requests", color: "text-brand-600", bg: "bg-brand-50" },
  { key: "completed", label: "Completed", color: "text-medical-600", bg: "bg-medical-50" },
  { key: "adverse_reactions", label: "Adverse Reactions", color: "text-danger-600", bg: "bg-danger-50" },
  { key: "emergency_releases", label: "Emergency Releases", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "pending_crossmatch", label: "Pending XM", color: "text-purple-600", bg: "bg-purple-50" },
  { key: "ready_to_issue", label: "Ready to Issue", color: "text-teal-600", bg: "bg-teal-50" },
] as const;

const severityColor: Record<string, string> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useApi<Stats>("/data/stats");
  const { data: audit, loading: auditLoading } = useApi<AuditEntry[]>("/data/audit");

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Admin"}`}
        subtitle="Blood Bank Operations Overview"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        {STAT_CARDS.map(({ key, label, color, bg }) => (
          <Card key={key} className="text-center">
            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>
              <span className={`text-lg font-bold ${color}`}>
                {statsLoading ? "-" : (stats as unknown as Record<string, number>)?.[key] ?? 0}
              </span>
            </div>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardTitle>Quick Actions</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Issue / Verify", to: "/issue", color: "bg-brand-600 hover:bg-brand-700" },
              { label: "Emergency Release", to: "/emergency", color: "bg-danger-600 hover:bg-danger-700" },
              { label: "View Inventory", to: "/inventory", color: "bg-medical-600 hover:bg-medical-700" },
              { label: "Audit Trail", to: "/audit", color: "bg-gray-700 hover:bg-gray-800" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${action.color}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Audit Log */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Recent Activity</CardTitle>
            <Link to="/audit" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {auditLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-3">
              {audit?.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <Badge color={severityColor[entry.severity] || "gray"}>
                    {entry.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{entry.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-500">
                      {entry.user} &middot; {entry.resource} &middot; {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
