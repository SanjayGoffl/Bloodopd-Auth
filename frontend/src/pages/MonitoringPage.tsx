import { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

interface VitalReading {
  time: string;
  temp: number;
  hr: number;
  bp_sys: number;
  bp_dia: number;
  spo2: number;
  rr: number;
}

function randomVital(base: number, variance: number): number {
  return +(base + (Math.random() - 0.5) * 2 * variance).toFixed(1);
}

function generateReadings(): VitalReading[] {
  const readings: VitalReading[] = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 15 * 60000);
    readings.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: randomVital(37.0, 0.4),
      hr: Math.round(randomVital(78, 8)),
      bp_sys: Math.round(randomVital(122, 10)),
      bp_dia: Math.round(randomVital(78, 6)),
      spo2: Math.round(randomVital(97, 1.5)),
      rr: Math.round(randomVital(16, 2)),
    });
  }
  return readings;
}

function vitalStatus(label: string, value: number): "normal" | "warning" | "danger" {
  switch (label) {
    case "temp":
      return value > 38.0 ? "danger" : value > 37.5 ? "warning" : "normal";
    case "hr":
      return value > 100 || value < 50 ? "danger" : value > 90 ? "warning" : "normal";
    case "spo2":
      return value < 92 ? "danger" : value < 95 ? "warning" : "normal";
    case "bp_sys":
      return value > 160 || value < 90 ? "danger" : value > 140 ? "warning" : "normal";
    default:
      return "normal";
  }
}

const statusColor = { normal: "text-medical-600", warning: "text-amber-600", danger: "text-danger-600" };

export default function MonitoringPage() {
  const [readings, setReadings] = useState<VitalReading[]>(generateReadings);

  // Simulate live updates every 30s — add a new reading
  useEffect(() => {
    const timer = setInterval(() => {
      setReadings((prev) => {
        const now = new Date();
        const next: VitalReading = {
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: randomVital(37.0, 0.4),
          hr: Math.round(randomVital(78, 8)),
          bp_sys: Math.round(randomVital(122, 10)),
          bp_dia: Math.round(randomVital(78, 6)),
          spo2: Math.round(randomVital(97, 1.5)),
          rr: Math.round(randomVital(16, 2)),
        };
        return [...prev.slice(-9), next];
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const latest = readings[readings.length - 1];
  const anyAlert = latest &&
    (vitalStatus("temp", latest.temp) !== "normal" ||
     vitalStatus("hr", latest.hr) !== "normal" ||
     vitalStatus("spo2", latest.spo2) !== "normal");

  const VITALS = [
    { key: "temp", label: "Temperature", unit: "\u00B0C", value: latest?.temp, icon: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" },
    { key: "hr", label: "Heart Rate", unit: "bpm", value: latest?.hr, icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
    { key: "bp_sys", label: "Blood Pressure", unit: "mmHg", value: latest ? `${latest.bp_sys}/${latest.bp_dia}` : "-", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
    { key: "spo2", label: "SpO2", unit: "%", value: latest?.spo2, icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
    { key: "rr", label: "Resp Rate", unit: "/min", value: latest?.rr, icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  ];

  return (
    <div>
      <PageHeader
        title="Transfusion Monitoring"
        subtitle="Real-time vital signs during active transfusion"
        back
      />

      {anyAlert && (
        <Alert variant="warning" className="mb-6">
          <strong>Vital sign deviation detected.</strong> Review patient status. If adverse reaction suspected, stop transfusion and report immediately.
        </Alert>
      )}

      {/* Patient info bar */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div><span className="text-gray-500">Patient:</span> <span className="font-medium">Fatima Begum</span></div>
          <div><span className="text-gray-500">UHID:</span> <span className="font-mono">UHID-2024-0002</span></div>
          <div><span className="text-gray-500">Group:</span> <span className="font-bold text-danger-600">B+</span></div>
          <div><span className="text-gray-500">Product:</span> <span className="font-mono">PRC x1</span></div>
          <div><span className="text-gray-500">Unit:</span> <span className="font-mono">BB-PRC-B+-042</span></div>
          <Badge color="info">In Progress</Badge>
        </div>
      </Card>

      {/* Vital cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {VITALS.map((v) => {
          const numVal = typeof v.value === "number" ? v.value : 0;
          const status = vitalStatus(v.key, numVal);
          return (
            <Card key={v.key} className="text-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`mx-auto mb-2 ${statusColor[status]}`}>
                <path d={v.icon} />
              </svg>
              <p className={`text-2xl font-bold ${statusColor[status]}`}>
                {v.value ?? "-"}
              </p>
              <p className="text-xs text-gray-400 mt-1">{v.unit}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{v.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Readings table */}
      <Card>
        <CardTitle>Vital Sign Trend</CardTitle>
        <CardDescription>Readings every 15 minutes</CardDescription>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Temp ({"\u00B0C"})</th>
                <th className="pb-3 pr-4">HR (bpm)</th>
                <th className="pb-3 pr-4">BP (mmHg)</th>
                <th className="pb-3 pr-4">SpO2 (%)</th>
                <th className="pb-3">RR (/min)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {readings.map((r, i) => (
                <tr key={i} className={i === readings.length - 1 ? "bg-brand-50/30 font-medium" : ""}>
                  <td className="py-2 pr-4 font-mono text-xs">{r.time}</td>
                  <td className={`py-2 pr-4 ${statusColor[vitalStatus("temp", r.temp)]}`}>{r.temp}</td>
                  <td className={`py-2 pr-4 ${statusColor[vitalStatus("hr", r.hr)]}`}>{r.hr}</td>
                  <td className={`py-2 pr-4 ${statusColor[vitalStatus("bp_sys", r.bp_sys)]}`}>{r.bp_sys}/{r.bp_dia}</td>
                  <td className={`py-2 pr-4 ${statusColor[vitalStatus("spo2", r.spo2)]}`}>{r.spo2}</td>
                  <td className="py-2">{r.rr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
