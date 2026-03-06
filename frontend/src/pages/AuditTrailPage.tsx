import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface AuditEntry {
  id: number;
  action: string;
  user: string;
  resource: string;
  severity: string;
  timestamp: string;
}

const severityColor: Record<string, string> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

export default function AuditTrailPage() {
  const { data: entries, loading } = useApi<AuditEntry[]>("/data/audit");

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Complete forensic log of all blood bank operations"
        back
      />

      {loading ? (
        <p className="text-sm text-gray-400">Loading audit log...</p>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries?.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{entry.id}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{entry.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {entry.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.user}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.resource}</td>
                    <td className="px-4 py-3">
                      <Badge color={severityColor[entry.severity] || "gray"}>
                        {entry.severity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
