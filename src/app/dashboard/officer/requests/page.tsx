'use client'

import { useState } from 'react'
import { ClipboardList, Search, Filter, Clock, Droplets, User, ChevronRight } from 'lucide-react'

const REQUESTS = [
  {
    id: 'REQ-2026-001',
    patient: 'Arun Kumar',
    uhid: 'UHID-2024-001',
    ward: 'Ward 3B',
    product: 'Packed Red Blood Cells',
    bloodGroup: 'B+',
    units: 2,
    urgency: 'routine',
    status: 'crossmatch_pending',
    requestedAt: '2026-03-06 08:14',
    requestedBy: 'Dr. Priya Nair',
    assignedTo: 'Lab Tech Anita',
  },
  {
    id: 'REQ-2026-002',
    patient: 'Meera Iyer',
    uhid: 'UHID-2024-002',
    ward: 'ICU',
    product: 'Fresh Frozen Plasma',
    bloodGroup: 'A+',
    units: 4,
    urgency: 'urgent',
    status: 'ready_to_issue',
    requestedAt: '2026-03-06 09:30',
    requestedBy: 'Dr. Suresh Babu',
    assignedTo: 'Lab Tech Anita',
  },
  {
    id: 'REQ-2026-003',
    patient: 'Rajesh Sharma',
    uhid: 'UHID-2024-003',
    ward: 'Haematology',
    product: 'Platelets',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'emergency',
    status: 'pending_approval',
    requestedAt: '2026-03-06 10:05',
    requestedBy: 'Dr. Priya Nair',
    assignedTo: null,
  },
  {
    id: 'REQ-2026-004',
    patient: 'Sunita Devi',
    uhid: 'UHID-2024-004',
    ward: 'Obstetrics',
    product: 'Whole Blood',
    bloodGroup: 'AB+',
    units: 2,
    urgency: 'urgent',
    status: 'issued',
    requestedAt: '2026-03-06 07:00',
    requestedBy: 'Dr. Kavitha Rao',
    assignedTo: 'Lab Tech Ramesh',
  },
]

const URGENCY_STYLE: Record<string, string> = {
  routine: 'bg-gray-100 text-gray-700',
  urgent: 'bg-yellow-100 text-yellow-800',
  emergency: 'bg-red-100 text-red-800 font-bold',
}

const STATUS_STYLE: Record<string, string> = {
  pending_approval: 'bg-orange-100 text-orange-800',
  crossmatch_pending: 'bg-blue-100 text-blue-800',
  ready_to_issue: 'bg-green-100 text-green-800',
  issued: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-600',
}

const STATUS_LABEL: Record<string, string> = {
  pending_approval: 'Pending Approval',
  crossmatch_pending: 'Crossmatch Pending',
  ready_to_issue: 'Ready to Issue',
  issued: 'Issued',
  completed: 'Completed',
}

export default function OfficerRequestsPage() {
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  const filtered = REQUESTS.filter((r) => {
    const matchSearch =
      r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.uhid.toLowerCase().includes(search.toLowerCase())
    const matchUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter
    return matchSearch && matchUrgency
  })

  const counts = {
    all: REQUESTS.length,
    routine: REQUESTS.filter(r => r.urgency === 'routine').length,
    urgent: REQUESTS.filter(r => r.urgency === 'urgent').length,
    emergency: REQUESTS.filter(r => r.urgency === 'emergency').length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Active Transfusion Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">All pending and in-progress transfusion requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'routine', 'urgent', 'emergency'] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUrgencyFilter(u)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              urgencyFilter === u
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {u} ({counts[u]})
          </button>
        ))}
        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient / REQ ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Request ID', 'Patient', 'Product', 'Units', 'Urgency', 'Status', 'Assigned To', 'Time', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No requests match your filters.</td></tr>
            )}
            {filtered.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700">{req.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{req.patient}</div>
                  <div className="text-xs text-gray-400">{req.ward}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-gray-700">{req.product}</span>
                  </div>
                  <div className="text-xs text-gray-400">{req.bloodGroup}</div>
                </td>
                <td className="px-4 py-3 font-bold text-gray-800">{req.units}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${URGENCY_STYLE[req.urgency]}`}>
                    {req.urgency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[req.status]}`}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {req.assignedTo ?? <span className="text-orange-600 font-medium">Unassigned</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.requestedAt}</div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/dashboard/officer/assign?req=${req.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    {req.status === 'pending_approval' ? 'Assign' : 'View'}
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
