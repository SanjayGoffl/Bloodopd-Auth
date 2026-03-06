'use client'

import { useState } from 'react'
import { Users, Search, Plus, CheckCircle, XCircle, AlertTriangle, Droplets } from 'lucide-react'

type Donor = {
  id: string; name: string; donorId: string; bloodGroup: string
  lastDonated: string; totalDonations: number; status: 'eligible' | 'deferred' | 'temp_deferred'
  contact: string; hbLevel: number; deferralReason?: string
}

const DONORS: Donor[] = [
  { id: '1', name: 'Arjun Menon', donorId: 'DNR-001', bloodGroup: 'O+', lastDonated: '2025-12-15', totalDonations: 8, status: 'eligible', contact: '9876543210', hbLevel: 14.2 },
  { id: '2', name: 'Sita Lakshmi', donorId: 'DNR-002', bloodGroup: 'A-', lastDonated: '2026-01-10', totalDonations: 3, status: 'temp_deferred', contact: '9876543211', hbLevel: 11.1, deferralReason: 'Hb < 12.5 g/dL' },
  { id: '3', name: 'Kiran Rao', donorId: 'DNR-003', bloodGroup: 'B+', lastDonated: '2025-11-20', totalDonations: 15, status: 'eligible', contact: '9876543212', hbLevel: 15.0 },
  { id: '4', name: 'Deepa Nair', donorId: 'DNR-004', bloodGroup: 'AB+', lastDonated: '2025-09-05', totalDonations: 2, status: 'deferred', contact: '9876543213', hbLevel: 13.0, deferralReason: 'Positive for HBsAg — permanent deferral' },
  { id: '5', name: 'Ravi Shankar', donorId: 'DNR-005', bloodGroup: 'O-', lastDonated: '2026-02-01', totalDonations: 22, status: 'eligible', contact: '9876543214', hbLevel: 16.1 },
  { id: '6', name: 'Ananya Pillai', donorId: 'DNR-006', bloodGroup: 'A+', lastDonated: '2026-01-25', totalDonations: 5, status: 'temp_deferred', contact: '9876543215', hbLevel: 12.0, deferralReason: 'Recent viral illness — 3-month deferral' },
]

const STATUS_MAP = {
  eligible: { label: 'Eligible', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  temp_deferred: { label: 'Temp. Deferred', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  deferred: { label: 'Permanently Deferred', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default function DonorRegistryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Donor | null>(null)

  const filtered = DONORS.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.donorId.toLowerCase().includes(search.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || d.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Donor Registry
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage blood donors, eligibility, and records</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register Donor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Donors', value: DONORS.length, color: 'text-blue-600' },
          { label: 'Eligible', value: DONORS.filter(d => d.status === 'eligible').length, color: 'text-green-600' },
          { label: 'Deferred', value: DONORS.filter(d => d.status !== 'eligible').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        {(['all', 'eligible', 'temp_deferred', 'deferred'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'temp_deferred' ? 'Temp. Deferred' : f === 'deferred' ? 'Permanent Deferral' : 'Eligible'}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search donor..."
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
              {['Donor ID', 'Name', 'Blood Group', 'Last Donated', 'Donations', 'Hb (g/dL)', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-gray-400">No donors found.</td></tr>
            )}
            {filtered.map((donor) => {
              const s = STATUS_MAP[donor.status]
              const Icon = s.icon
              return (
                <tr key={donor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{donor.donorId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{donor.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-red-400" />
                      <strong>{donor.bloodGroup}</strong>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{donor.lastDonated}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{donor.totalDonations}</td>
                  <td className={`px-4 py-3 font-medium ${donor.hbLevel < 12.5 ? 'text-red-600' : 'text-gray-700'}`}>
                    {donor.hbLevel}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      <Icon className="w-3 h-3" />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(donor)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Donor detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-400">Donor ID</span><p className="font-mono text-blue-700">{selected.donorId}</p></div>
                <div><span className="text-gray-400">Blood Group</span><p className="font-bold">{selected.bloodGroup}</p></div>
                <div><span className="text-gray-400">Contact</span><p>{selected.contact}</p></div>
                <div><span className="text-gray-400">Total Donations</span><p className="font-bold">{selected.totalDonations}</p></div>
                <div><span className="text-gray-400">Last Donated</span><p>{selected.lastDonated}</p></div>
                <div><span className="text-gray-400">Hb Level</span><p className={selected.hbLevel < 12.5 ? 'text-red-600 font-bold' : ''}>{selected.hbLevel} g/dL</p></div>
              </div>
              {selected.deferralReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Deferral Reason</p>
                  <p className="text-red-800 text-sm">{selected.deferralReason}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                Record New Donation
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Donor modal (simplified) */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 fade-in">
            <h3 className="font-bold text-gray-900">Register New Donor</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name', placeholder: 'Donor full name' },
                { label: 'Contact Number', placeholder: '10-digit mobile number' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hb Level (g/dL)</label>
                <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                Register
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
