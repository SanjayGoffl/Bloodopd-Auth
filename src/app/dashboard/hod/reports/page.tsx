'use client'

import { useState } from 'react'
import { FileText, Download, CheckCircle, Calendar, Globe } from 'lucide-react'

const REPORT_TYPES = [
  {
    id: 'hv_monthly',
    title: 'Monthly Haemovigilance Report',
    description: 'Adverse reactions, near-misses, and transfusion outcomes for the month',
    format: 'PDF',
    authority: 'NACO / State Blood Cell',
  },
  {
    id: 'inventory_quarterly',
    title: 'Quarterly Inventory Report',
    description: 'Stock utilisation, wastage, and procurement needs',
    format: 'XLSX',
    authority: 'Hospital Administration',
  },
  {
    id: 'donor_annual',
    title: 'Annual Donor Statistics',
    description: 'Voluntary non-remunerated donation rates, deferral analysis',
    format: 'PDF',
    authority: 'State Blood Transfusion Council',
  },
  {
    id: 'transfusion_log',
    title: 'Transfusion Logbook Export',
    description: 'Full chronological transfusion log with patient, product, and outcome data',
    format: 'CSV',
    authority: 'NABH / Accreditation Body',
  },
  {
    id: 'ttid_summary',
    title: 'TTID Serology Summary',
    description: 'Transfusion-Transmitted Infection Disease testing results and reactive rates',
    format: 'PDF',
    authority: 'NACO',
  },
]

const MOCK_HISTORY = [
  { id: 'RPT-001', title: 'Monthly Haemovigilance Report — February 2026', generatedAt: '2026-03-01 09:00', generatedBy: 'Dr. HOD', format: 'PDF' },
  { id: 'RPT-002', title: 'Quarterly Inventory Report — Q4 2025', generatedAt: '2026-01-05 10:15', generatedBy: 'Dr. HOD', format: 'XLSX' },
  { id: 'RPT-003', title: 'Annual Donor Statistics — 2025', generatedAt: '2026-01-10 14:30', generatedBy: 'Dr. HOD', format: 'PDF' },
]

export default function HodReportsPage() {
  const [month, setMonth] = useState('2026-03')
  const [generated, setGenerated] = useState<string[]>([])

  const generate = (id: string) => {
    setGenerated(prev => [...prev, id])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          National / Regulatory Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">Generate and export mandated reports for NACO, SBTC, and accreditation bodies</p>
      </div>

      {/* Period selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          Reporting Period:
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400 ml-2">Data will be scoped to the selected month</span>
      </div>

      {/* Report types */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Available Reports</h2>
        {REPORT_TYPES.map((r) => {
          const done = generated.includes(r.id)
          return (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{r.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.description}</div>
                  <div className="text-xs text-blue-600 mt-1">Authority: {r.authority}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{r.format}</span>
                {done ? (
                  <div className="flex items-center gap-1.5 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <button className="flex items-center gap-1 hover:text-green-800">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => generate(r.id)}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Past reports */}
      <div>
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Previously Generated Reports</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Report', 'Generated At', 'By', 'Format', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_HISTORY.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{h.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{h.generatedAt}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{h.generatedBy}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{h.format}</span></td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
