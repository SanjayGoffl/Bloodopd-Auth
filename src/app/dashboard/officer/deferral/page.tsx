'use client'

import { useState } from 'react'
import { ShieldOff, Search, Plus, AlertTriangle, Calendar, Clock } from 'lucide-react'

type Deferral = {
  id: string
  donorId: string
  donorName: string
  bloodGroup: string
  type: 'temporary' | 'permanent'
  reason: string
  category: string
  deferredOn: string
  deferredUntil?: string
  deferredBy: string
}

const DEFERRALS: Deferral[] = [
  {
    id: 'DEF-001', donorId: 'DNR-002', donorName: 'Sita Lakshmi', bloodGroup: 'A-',
    type: 'temporary', reason: 'Haemoglobin < 12.5 g/dL (11.1 g/dL recorded)', category: 'Low Hb',
    deferredOn: '2026-01-10', deferredUntil: '2026-04-10', deferredBy: 'Officer Rajan',
  },
  {
    id: 'DEF-002', donorId: 'DNR-004', donorName: 'Deepa Nair', bloodGroup: 'AB+',
    type: 'permanent', reason: 'Reactive for HBsAg (Hepatitis B Surface Antigen)', category: 'Infectious Disease',
    deferredOn: '2025-09-05', deferredBy: 'Officer Rajan',
  },
  {
    id: 'DEF-003', donorId: 'DNR-006', donorName: 'Ananya Pillai', bloodGroup: 'A+',
    type: 'temporary', reason: 'Recent viral upper respiratory illness', category: 'Recent Illness',
    deferredOn: '2026-01-25', deferredUntil: '2026-04-25', deferredBy: 'Officer Meena',
  },
  {
    id: 'DEF-004', donorId: 'DNR-007', donorName: 'Prakash Iyer', bloodGroup: 'B-',
    type: 'temporary', reason: 'Recent dental extraction — 3 day deferral', category: 'Dental Procedure',
    deferredOn: '2026-03-01', deferredUntil: '2026-03-04', deferredBy: 'Officer Rajan',
  },
]

const CATEGORIES = [
  'Low Hb', 'Infectious Disease', 'Recent Illness', 'Dental Procedure',
  'Recent Vaccination', 'Medication', 'Travel History', 'Pregnancy/Lactation', 'Other',
]

export default function DeferralPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'temporary' | 'permanent'>('all')
  const [showForm, setShowForm] = useState(false)
  const [newDeferral, setNewDeferral] = useState({ donorId: '', reason: '', category: CATEGORIES[0], type: 'temporary', deferredUntil: '' })

  const filtered = DEFERRALS.filter((d) => {
    const matchSearch =
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.donorId.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || d.type === typeFilter
    return matchSearch && matchType
  })

  const isExpired = (d: Deferral) => {
    if (!d.deferredUntil) return false
    return new Date(d.deferredUntil) < new Date()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldOff className="w-6 h-6 text-red-500" />
            Donor Deferral Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">Temporary and permanent donor deferrals log</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Deferral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Deferrals', value: DEFERRALS.length, color: 'text-gray-700' },
          { label: 'Temporary', value: DEFERRALS.filter(d => d.type === 'temporary').length, color: 'text-yellow-600' },
          { label: 'Permanent', value: DEFERRALS.filter(d => d.type === 'permanent').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        {(['all', 'temporary', 'permanent'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              typeFilter === t ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === 'all' ? 'All Types' : t}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search donor or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">No deferral records found.</div>
        )}
        {filtered.map((def) => {
          const expired = isExpired(def)
          return (
            <div key={def.id} className={`bg-white border rounded-xl p-4 ${def.type === 'permanent' ? 'border-red-300' : expired ? 'border-green-300' : 'border-yellow-300'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldOff className={`w-4 h-4 ${def.type === 'permanent' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <span className="font-semibold text-gray-900">{def.donorName}</span>
                    <span className="text-xs font-mono text-gray-400">{def.donorId}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{def.bloodGroup}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-6">{def.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    def.type === 'permanent' ? 'bg-red-100 text-red-800' : expired ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {def.type === 'permanent' ? 'Permanent' : expired ? 'Expired' : 'Active'}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{def.category}</span>
                </div>
              </div>
              <div className="mt-3 ml-6 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Deferred: {def.deferredOn}</span>
                {def.deferredUntil && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Until: {def.deferredUntil}</span>
                )}
                <span>By: {def.deferredBy}</span>
                <span className="font-mono">{def.id}</span>
              </div>
              {def.type === 'permanent' && (
                <div className="mt-2 ml-6 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  This donor must never be accepted for donation
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New deferral modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 fade-in">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShieldOff className="w-4 h-4 text-red-500" />
              Record Donor Deferral
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Donor ID</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. DNR-007"
                  value={newDeferral.donorId}
                  onChange={(e) => setNewDeferral(d => ({ ...d, donorId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deferral Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={newDeferral.type}
                  onChange={(e) => setNewDeferral(d => ({ ...d, type: e.target.value }))}
                >
                  <option value="temporary">Temporary</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={newDeferral.category}
                  onChange={(e) => setNewDeferral(d => ({ ...d, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Clinical reason for deferral..."
                  value={newDeferral.reason}
                  onChange={(e) => setNewDeferral(d => ({ ...d, reason: e.target.value }))}
                />
              </div>
              {newDeferral.type === 'temporary' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deferred Until</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={newDeferral.deferredUntil}
                    onChange={(e) => setNewDeferral(d => ({ ...d, deferredUntil: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                Record Deferral
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
