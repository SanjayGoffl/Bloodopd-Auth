'use client'

import { BarChart2, TrendingDown, TrendingUp, Droplets, AlertTriangle, Package } from 'lucide-react'

const INVENTORY = [
  { group: 'A+', prbc: 12, ffp: 8, plt: 5, cryo: 3, wb: 2 },
  { group: 'A-', prbc: 3, ffp: 2, plt: 1, cryo: 0, wb: 0 },
  { group: 'B+', prbc: 18, ffp: 10, plt: 6, cryo: 4, wb: 3 },
  { group: 'B-', prbc: 2, ffp: 1, plt: 0, cryo: 0, wb: 0 },
  { group: 'AB+', prbc: 7, ffp: 5, plt: 3, cryo: 2, wb: 1 },
  { group: 'AB-', prbc: 1, ffp: 0, plt: 0, cryo: 0, wb: 0 },
  { group: 'O+', prbc: 22, ffp: 14, plt: 9, cryo: 5, wb: 6 },
  { group: 'O-', prbc: 5, ffp: 3, plt: 2, cryo: 1, wb: 1 },
]

const WASTAGE = [
  { month: 'Oct', units: 3 },
  { month: 'Nov', units: 5 },
  { month: 'Dec', units: 2 },
  { month: 'Jan', units: 7 },
  { month: 'Feb', units: 4 },
  { month: 'Mar', units: 1 },
]

const UTILISATION = [
  { product: 'Packed RBC', issued: 48, total: 70, pct: 69 },
  { product: 'Fresh Frozen Plasma', issued: 38, total: 43, pct: 88 },
  { product: 'Platelets', issued: 22, total: 26, pct: 85 },
  { product: 'Cryoprecipitate', issued: 11, total: 15, pct: 73 },
  { product: 'Whole Blood', issued: 10, total: 13, pct: 77 },
]

const maxWastage = Math.max(...WASTAGE.map(w => w.units))

export default function HodAnalyticsPage() {
  const totalUnits = INVENTORY.reduce((a, r) => a + r.prbc + r.ffp + r.plt + r.cryo + r.wb, 0)
  const criticalGroups = INVENTORY.filter(r => r.prbc < 4)
  const totalWastage = WASTAGE.reduce((a, w) => a + w.units, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          Inventory Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Blood component utilisation, wastage trends, and stock health</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Stock', value: totalUnits, sub: 'units across all products', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical Groups', value: criticalGroups.length, sub: 'blood groups < 4 PRBC', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Wastage (6m)', value: totalWastage, sub: 'units expired/discarded', icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg Utilisation', value: `${Math.round(UTILISATION.reduce((a, u) => a + u.pct, 0) / UTILISATION.length)}%`, sub: 'across all products', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((k) => (
          <div key={k.label} className={`${k.bg} border border-gray-200 rounded-xl p-4`}>
            <k.icon className={`w-5 h-5 ${k.color} mb-2`} />
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{k.label}</div>
            <div className="text-xs text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Inventory heatmap */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-red-400" />
            Current Stock by Blood Group
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left pb-2">Group</th>
                  <th className="pb-2">PRBC</th>
                  <th className="pb-2">FFP</th>
                  <th className="pb-2">PLT</th>
                  <th className="pb-2">CRYO</th>
                  <th className="pb-2">WB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {INVENTORY.map((row) => (
                  <tr key={row.group}>
                    <td className="py-2 font-bold text-gray-800">{row.group}</td>
                    {(['prbc', 'ffp', 'plt', 'cryo', 'wb'] as const).map((k) => {
                      const val = row[k]
                      return (
                        <td key={k} className={`py-2 text-center font-semibold rounded ${
                          val === 0 ? 'text-red-600 bg-red-50' :
                          val < 3 ? 'text-orange-600' :
                          val < 6 ? 'text-yellow-600' : 'text-green-700'
                        }`}>
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-3 text-xs text-gray-400">
            <span className="text-red-600">■ 0</span>
            <span className="text-orange-600">■ &lt;3</span>
            <span className="text-yellow-600">■ &lt;6</span>
            <span className="text-green-700">■ OK</span>
          </div>
        </div>

        {/* Wastage bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-500" />
            Monthly Wastage (last 6 months)
          </h2>
          <div className="flex items-end gap-3 h-40">
            {WASTAGE.map((w) => (
              <div key={w.month} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-semibold text-gray-600">{w.units}</span>
                <div
                  className="w-full rounded-t bg-orange-400"
                  style={{ height: `${(w.units / maxWastage) * 120}px` }}
                />
                <span className="text-xs text-gray-400">{w.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Total wastage this period: <strong className="text-orange-600">{totalWastage} units</strong></p>
        </div>
      </div>

      {/* Utilisation table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          Product Utilisation Rate
        </h2>
        <div className="space-y-4">
          {UTILISATION.map((u) => (
            <div key={u.product}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{u.product}</span>
                <span className="text-gray-500">{u.issued}/{u.total} units issued ({u.pct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${u.pct >= 85 ? 'bg-green-500' : u.pct >= 70 ? 'bg-blue-500' : 'bg-yellow-400'}`}
                  style={{ width: `${u.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical stock alerts */}
      {criticalGroups.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-2 font-semibold text-red-800 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Critical Stock Alert
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalGroups.map(g => (
              <span key={g.group} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                {g.group}: {g.prbc} PRBC
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
