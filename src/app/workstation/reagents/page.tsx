'use client'

import { useState } from 'react'
import { FlaskConical, Plus, AlertTriangle, CheckCircle, Calendar, RefreshCw } from 'lucide-react'

type ReagentEntry = {
  id: string
  name: string
  lotNumber: string
  expiryDate: string
  stockLevel: number
  unit: string
  status: 'ok' | 'low' | 'expired'
  lastChecked: string
}

const REAGENTS: ReagentEntry[] = [
  { id: 'R1', name: 'Anti-A Serum', lotNumber: 'LOT-A2024', expiryDate: '2026-09-30', stockLevel: 12, unit: 'vials', status: 'ok', lastChecked: '2026-03-06 08:00' },
  { id: 'R2', name: 'Anti-B Serum', lotNumber: 'LOT-B2024', expiryDate: '2026-09-30', stockLevel: 11, unit: 'vials', status: 'ok', lastChecked: '2026-03-06 08:00' },
  { id: 'R3', name: 'Anti-D Serum', lotNumber: 'LOT-D2024', expiryDate: '2026-06-15', stockLevel: 3, unit: 'vials', status: 'low', lastChecked: '2026-03-06 08:00' },
  { id: 'R4', name: 'Coombs Serum (AHG)', lotNumber: 'LOT-C2023', expiryDate: '2026-01-01', stockLevel: 0, unit: 'vials', status: 'expired', lastChecked: '2026-03-06 08:00' },
  { id: 'R5', name: 'Normal Saline', lotNumber: 'LOT-NS2025', expiryDate: '2027-03-01', stockLevel: 50, unit: 'bags', status: 'ok', lastChecked: '2026-03-06 08:00' },
  { id: 'R6', name: 'Group A Cells', lotNumber: 'LOT-GA2025', expiryDate: '2026-04-20', stockLevel: 6, unit: 'vials', status: 'ok', lastChecked: '2026-03-06 08:00' },
  { id: 'R7', name: 'Group B Cells', lotNumber: 'LOT-GB2025', expiryDate: '2026-04-20', stockLevel: 2, unit: 'vials', status: 'low', lastChecked: '2026-03-06 08:00' },
]

const EQUIPMENT = [
  { name: 'Blood Bank Refrigerator #1', temp: 3.8, status: 'ok', lastCalibrated: '2026-02-01' },
  { name: 'Blood Bank Refrigerator #2', temp: 4.2, status: 'ok', lastCalibrated: '2026-02-01' },
  { name: 'Platelet Incubator', temp: 22.1, status: 'ok', lastCalibrated: '2026-01-15' },
  { name: 'FFP Freezer', temp: -28.5, status: 'ok', lastCalibrated: '2026-02-01' },
  { name: 'Centrifuge #1', temp: null, status: 'maintenance', lastCalibrated: '2025-12-10' },
]

const STATUS_STYLE = {
  ok: 'bg-green-100 text-green-800',
  low: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  maintenance: 'bg-orange-100 text-orange-800',
}

export default function ReagentsPage() {
  const [showAdd, setShowAdd] = useState(false)

  const expired = REAGENTS.filter(r => r.status === 'expired').length
  const low = REAGENTS.filter(r => r.status === 'low').length

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-blue-600" />
            Reagents & Equipment Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track reagent stock, expiry, and equipment temperature</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Reagent
        </button>
      </div>

      {/* Alert banner */}
      {(expired > 0 || low > 0) && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-800">Reagent Alerts</div>
            <div className="text-sm text-red-700 mt-1">
              {expired > 0 && <span>{expired} reagent(s) have expired and must be discarded. </span>}
              {low > 0 && <span>{low} reagent(s) are running low — reorder immediately.</span>}
            </div>
          </div>
        </div>
      )}

      {/* Reagents table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">Reagent Inventory</span>
          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Reagent', 'Lot Number', 'Stock', 'Expiry Date', 'Last Checked', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {REAGENTS.map((r) => (
              <tr key={r.id} className={`hover:bg-gray-50 ${r.status === 'expired' ? 'bg-red-50' : r.status === 'low' ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.lotNumber}</td>
                <td className={`px-4 py-3 font-bold ${r.stockLevel === 0 ? 'text-red-600' : r.stockLevel < 4 ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {r.stockLevel} {r.unit}
                </td>
                <td className={`px-4 py-3 text-sm ${new Date(r.expiryDate) < new Date() ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {r.expiryDate}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{r.lastChecked}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}>
                    {r.status === 'ok' ? 'In Stock' : r.status === 'low' ? 'Low Stock' : 'Expired'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipment table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">Equipment Status</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Equipment', 'Temperature', 'Status', 'Last Calibrated'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {EQUIPMENT.map((e) => (
              <tr key={e.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                <td className="px-4 py-3 font-mono text-gray-700">
                  {e.temp !== null ? `${e.temp}°C` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[e.status as keyof typeof STATUS_STYLE]}`}>
                    {e.status === 'ok' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {e.lastCalibrated}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add reagent modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 fade-in">
            <h3 className="font-bold text-gray-900">Add Reagent Entry</h3>
            <div className="space-y-3">
              {[
                { label: 'Reagent Name', placeholder: 'e.g. Anti-A Serum' },
                { label: 'Lot Number', placeholder: 'e.g. LOT-A2025' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.placeholder} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock Level</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['vials', 'bags', 'boxes', 'kits'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
