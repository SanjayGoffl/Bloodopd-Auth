'use client'

import { useState } from 'react'
import { ClipboardCheck, Search, Eye, Download, CheckCircle2, Droplets } from 'lucide-react'

type Report = {
  id: string
  requestId: string
  patient: string
  uhid: string
  bloodGroup: string
  rhFactor: 'positive' | 'negative'
  crossmatch: 'compatible' | 'incompatible'
  antibodyScreen: 'negative' | 'positive'
  product: string
  units: number
  performedBy: string
  verifiedBy: string
  finalizedAt: string
  status: 'pending' | 'finalized' | 'issued'
}

const REPORTS: Report[] = [
  {
    id: 'RPT-GXM-001',
    requestId: 'REQ-2026-001',
    patient: 'Arun Kumar',
    uhid: 'UHID-2024-001',
    bloodGroup: 'B',
    rhFactor: 'positive',
    crossmatch: 'compatible',
    antibodyScreen: 'negative',
    product: 'Packed Red Blood Cells',
    units: 2,
    performedBy: 'Anita Sharma',
    verifiedBy: 'Lab Supervisor',
    finalizedAt: '2026-03-06 09:45',
    status: 'finalized',
  },
  {
    id: 'RPT-GXM-002',
    requestId: 'REQ-2026-002',
    patient: 'Meera Iyer',
    uhid: 'UHID-2024-002',
    bloodGroup: 'A',
    rhFactor: 'positive',
    crossmatch: 'compatible',
    antibodyScreen: 'negative',
    product: 'Fresh Frozen Plasma',
    units: 4,
    performedBy: 'Anita Sharma',
    verifiedBy: 'Lab Supervisor',
    finalizedAt: '2026-03-06 10:10',
    status: 'issued',
  },
  {
    id: 'RPT-GXM-003',
    requestId: 'REQ-2026-003',
    patient: 'Rajesh Sharma',
    uhid: 'UHID-2024-003',
    bloodGroup: 'O',
    rhFactor: 'positive',
    crossmatch: 'compatible',
    antibodyScreen: 'negative',
    product: 'Platelets',
    units: 1,
    performedBy: 'Ramesh Kumar',
    verifiedBy: 'Lab Supervisor',
    finalizedAt: '2026-03-05 16:00',
    status: 'finalized',
  },
]

const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-800',
  finalized: 'bg-blue-100 text-blue-800',
  issued: 'bg-green-100 text-green-800',
}

export default function WorkstationReportsPage() {
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const filtered = REPORTS.filter(r =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.requestId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          Grouping & Crossmatch Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">Finalized laboratory reports archive</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reports', value: REPORTS.length, color: 'text-blue-600' },
          { label: 'Finalized', value: REPORTS.filter(r => r.status === 'finalized').length, color: 'text-blue-600' },
          { label: 'Issued', value: REPORTS.filter(r => r.status === 'issued').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient, report ID, or request ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Report ID', 'Patient', 'Blood Group', 'Product', 'Crossmatch', 'Antibody Screen', 'Finalized', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-gray-400">No reports found.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700">{r.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{r.patient}</div>
                  <div className="text-xs text-gray-400">{r.uhid}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 font-bold text-gray-800">
                    <Droplets className="w-3.5 h-3.5 text-red-400" />
                    {r.bloodGroup}{r.rhFactor === 'positive' ? '+' : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{r.product} ×{r.units}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.crossmatch === 'compatible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {r.crossmatch === 'compatible' ? <CheckCircle2 className="w-3 h-3" /> : null}
                    {r.crossmatch}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    r.antibodyScreen === 'negative' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {r.antibodyScreen}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{r.finalizedAt}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReport(r)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Report: {selectedReport.id}</h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
              <div className="font-semibold text-blue-800">Patient Information</div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Name:</span> {selectedReport.patient}</div>
                <div><span className="text-gray-500">UHID:</span> {selectedReport.uhid}</div>
                <div><span className="text-gray-500">Blood Group:</span> <strong>{selectedReport.bloodGroup}{selectedReport.rhFactor === 'positive' ? '+' : '-'}</strong></div>
                <div><span className="text-gray-500">Request ID:</span> {selectedReport.requestId}</div>
              </div>
            </div>

            <div className="text-sm space-y-2">
              <div className="font-semibold text-gray-800">Laboratory Results</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Crossmatch', value: selectedReport.crossmatch, ok: selectedReport.crossmatch === 'compatible' },
                  { label: 'Antibody Screen', value: selectedReport.antibodyScreen, ok: selectedReport.antibodyScreen === 'negative' },
                ].map(f => (
                  <div key={f.label} className={`rounded-lg p-3 ${f.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="text-xs text-gray-400">{f.label}</div>
                    <div className={`font-bold capitalize mt-0.5 ${f.ok ? 'text-green-700' : 'text-red-700'}`}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><span className="text-gray-500">Product:</span> {selectedReport.product}</div>
                <div><span className="text-gray-500">Units:</span> {selectedReport.units}</div>
                <div><span className="text-gray-500">Performed By:</span> {selectedReport.performedBy}</div>
                <div><span className="text-gray-500">Verified By:</span> {selectedReport.verifiedBy}</div>
                <div className="col-span-2"><span className="text-gray-500">Finalized:</span> {selectedReport.finalizedAt}</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedReport(null)}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
