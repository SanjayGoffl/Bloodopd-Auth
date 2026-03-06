'use client'

import { useState } from 'react'
import { Search, FileText, Droplets, Calendar, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

const MOCK_HISTORY = [
  {
    id: 'TXN-001',
    patientName: 'Arun Kumar',
    uhid: 'UHID-2024-001',
    date: '2026-02-28',
    product: 'Packed Red Blood Cells',
    bloodGroup: 'B+',
    units: 2,
    requestedBy: 'Dr. Priya Nair',
    issuedBy: 'Officer Rajan',
    status: 'completed',
    reaction: null,
    notes: 'Pre-operative transfusion for elective surgery.',
  },
  {
    id: 'TXN-002',
    patientName: 'Meera Iyer',
    uhid: 'UHID-2024-002',
    date: '2026-03-01',
    product: 'Fresh Frozen Plasma',
    bloodGroup: 'A+',
    units: 4,
    requestedBy: 'Dr. Suresh Babu',
    issuedBy: 'Officer Rajan',
    status: 'completed',
    reaction: null,
    notes: 'Coagulopathy management.',
  },
  {
    id: 'TXN-003',
    patientName: 'Rajesh Sharma',
    uhid: 'UHID-2024-003',
    date: '2026-03-03',
    product: 'Platelets',
    bloodGroup: 'O+',
    units: 1,
    requestedBy: 'Dr. Priya Nair',
    issuedBy: 'Officer Rajan',
    status: 'adverse_reaction',
    reaction: 'Febrile Non-Haemolytic Transfusion Reaction',
    notes: 'Transfusion stopped at 30 min. Patient stabilised.',
  },
  {
    id: 'TXN-004',
    patientName: 'Arun Kumar',
    uhid: 'UHID-2024-001',
    date: '2026-03-05',
    product: 'Packed Red Blood Cells',
    bloodGroup: 'B+',
    units: 1,
    requestedBy: 'Dr. Priya Nair',
    issuedBy: 'Officer Rajan',
    status: 'in_progress',
    reaction: null,
    notes: 'Post-operative haemoglobin correction.',
  },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  adverse_reaction: { label: 'Adverse Reaction', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
}

export default function TransfusionHistoryPage() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = MOCK_HISTORY.filter(
    (t) =>
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.uhid.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Transfusion History
        </h1>
        <p className="text-sm text-gray-500 mt-1">Complete record of transfusions for your patients</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient name, UHID, or TXN ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Transfusions', value: MOCK_HISTORY.length, color: 'text-blue-600' },
          { label: 'Completed', value: MOCK_HISTORY.filter(t => t.status === 'completed').length, color: 'text-green-600' },
          { label: 'Adverse Reactions', value: MOCK_HISTORY.filter(t => t.status === 'adverse_reaction').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No records found.</div>
        )}
        {filtered.map((txn) => {
          const status = STATUS_MAP[txn.status] ?? { label: txn.status, color: 'bg-gray-100 text-gray-600' }
          const isOpen = expanded === txn.id
          return (
            <div key={txn.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Row header */}
              <button
                className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : txn.id)}
              >
                <div className="flex items-center gap-4">
                  <Droplets className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {txn.patientName}{' '}
                      <span className="text-gray-400 font-normal">· {txn.uhid}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {txn.id} · {txn.product} ({txn.units}u) · {txn.bloodGroup}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {txn.date}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  {txn.reaction && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 grid grid-cols-2 gap-x-8 gap-y-3 text-sm fade-in">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Requested By</span>
                    <p className="text-gray-800 font-medium">{txn.requestedBy}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Issued By</span>
                    <p className="text-gray-800 font-medium">{txn.issuedBy}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Product</span>
                    <p className="text-gray-800 font-medium">{txn.product}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Blood Group</span>
                    <p className="text-gray-800 font-medium">{txn.bloodGroup}</p>
                  </div>
                  {txn.reaction && (
                    <div className="col-span-2 bg-red-50 border border-red-200 rounded p-3">
                      <div className="flex items-center gap-2 text-red-700 font-semibold text-xs mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Adverse Reaction Reported
                      </div>
                      <p className="text-red-800 text-sm">{txn.reaction}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Clinical Notes</span>
                    <p className="text-gray-700 mt-1">{txn.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
