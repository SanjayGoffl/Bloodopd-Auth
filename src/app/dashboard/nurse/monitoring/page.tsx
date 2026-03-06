'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, Clock, CheckCircle, Thermometer, Heart, Wind } from 'lucide-react'

type VitalsEntry = {
  time: number // minutes since start
  bp_sys: number
  bp_dia: number
  pulse: number
  spo2: number
  temp: number
  resp: number
  note: string
}

const MOCK_TRANSFUSIONS = [
  {
    id: 'TXN-004',
    patient: 'Arun Kumar',
    uhid: 'UHID-2024-001',
    ward: 'Ward 3B',
    product: 'Packed Red Blood Cells',
    bloodGroup: 'B+',
    unitId: 'UNIT-B-1234',
    startedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    durationMin: 240,
  },
]

const CHECKPOINTS = [0, 15, 30, 60]

const BASELINE: VitalsEntry = { time: 0, bp_sys: 118, bp_dia: 76, pulse: 82, spo2: 98, temp: 36.8, resp: 18, note: 'Pre-transfusion baseline' }
const MOCK_ENTRIES: VitalsEntry[] = [
  BASELINE,
  { time: 15, bp_sys: 122, bp_dia: 78, pulse: 86, spo2: 98, temp: 36.9, resp: 18, note: '' },
  { time: 30, bp_sys: 120, bp_dia: 80, pulse: 88, spo2: 97, temp: 37.1, resp: 19, note: 'Mild flush reported' },
]

function isAbnormal(key: string, val: number): boolean {
  if (key === 'bp_sys' && (val < 90 || val > 160)) return true
  if (key === 'bp_dia' && (val < 60 || val > 100)) return true
  if (key === 'pulse' && (val < 50 || val > 120)) return true
  if (key === 'spo2' && val < 95) return true
  if (key === 'temp' && val > 38.0) return true
  if (key === 'resp' && (val < 12 || val > 25)) return true
  return false
}

export default function NurseMonitoringPage() {
  const txn = MOCK_TRANSFUSIONS[0]
  const [entries, setEntries] = useState<VitalsEntry[]>(MOCK_ENTRIES)
  const [elapsed, setElapsed] = useState(0)
  const [form, setForm] = useState({ bp_sys: '', bp_dia: '', pulse: '', spo2: '', temp: '', resp: '', note: '' })
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Tick elapsed time
  useEffect(() => {
    const start = new Date(txn.startedAt).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 60000))
    update()
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [txn.startedAt])

  const nextCheckpoint = CHECKPOINTS.find(c => !entries.find(e => e.time === c))
  const hasAbnormal = entries.some(e =>
    ['bp_sys', 'bp_dia', 'pulse', 'spo2', 'temp', 'resp'].some(k => isAbnormal(k, (e as unknown as Record<string, number>)[k]))
  )

  const handleSave = () => {
    const t = nextCheckpoint ?? elapsed
    const entry: VitalsEntry = {
      time: t,
      bp_sys: Number(form.bp_sys),
      bp_dia: Number(form.bp_dia),
      pulse: Number(form.pulse),
      spo2: Number(form.spo2),
      temp: Number(form.temp),
      resp: Number(form.resp),
      note: form.note,
    }
    setEntries(prev => [...prev, entry].sort((a, b) => a.time - b.time))
    setSavedAt(t)
    setForm({ bp_sys: '', bp_dia: '', pulse: '', spo2: '', temp: '', resp: '', note: '' })
  }

  const progress = Math.min((elapsed / txn.durationMin) * 100, 100)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Transfusion Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">Vitals chart — record at 0, 15, 30, and 60 min</p>
        </div>
        {hasAbnormal && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm font-semibold">Abnormal vitals detected</span>
          </div>
        )}
      </div>

      {/* Patient card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-lg font-bold text-gray-900">{txn.patient}</div>
            <div className="text-gray-500">{txn.uhid} · {txn.ward}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-700">{txn.product}</div>
            <div className="text-gray-500">{txn.bloodGroup} · {txn.unitId}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {elapsed} min elapsed</span>
            <span>{txn.durationMin} min total</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Checkpoint markers */}
          <div className="relative mt-1">
            {CHECKPOINTS.map((c) => {
              const pct = (c / txn.durationMin) * 100
              const done = entries.find(e => e.time === c)
              return (
                <div key={c} className="absolute" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  <div className={`w-3 h-3 rounded-full border-2 ${done ? 'bg-green-500 border-green-600' : 'bg-white border-gray-400'}`} />
                  <div className="text-xs text-gray-400 mt-0.5 text-center">{c}m</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vitals table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">
          Recorded Vitals
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Time', 'BP (sys/dia)', 'Pulse', 'SpO₂', 'Temp °C', 'Resp', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{e.time === 0 ? 'Baseline' : `+${e.time} min`}</td>
                  <td className={`px-4 py-3 font-mono ${isAbnormal('bp_sys', e.bp_sys) || isAbnormal('bp_dia', e.bp_dia) ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                    {e.bp_sys}/{e.bp_dia}
                  </td>
                  <td className={`px-4 py-3 font-mono ${isAbnormal('pulse', e.pulse) ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{e.pulse}</td>
                  <td className={`px-4 py-3 font-mono ${isAbnormal('spo2', e.spo2) ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{e.spo2}%</td>
                  <td className={`px-4 py-3 font-mono ${isAbnormal('temp', e.temp) ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{e.temp}</td>
                  <td className={`px-4 py-3 font-mono ${isAbnormal('resp', e.resp) ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{e.resp}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.note || '—'}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No vitals recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry form */}
      {savedAt !== null && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm fade-in">
          <CheckCircle className="w-4 h-4" />
          Vitals recorded at +{savedAt} min
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="font-semibold text-gray-800 text-sm">
          Record Vitals {nextCheckpoint !== undefined ? `— checkpoint: +${nextCheckpoint} min` : `— +${elapsed} min (custom)`}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'bp_sys', label: 'BP Systolic', icon: Heart, unit: 'mmHg' },
            { key: 'bp_dia', label: 'BP Diastolic', icon: Heart, unit: 'mmHg' },
            { key: 'pulse', label: 'Pulse Rate', icon: Activity, unit: 'bpm' },
            { key: 'spo2', label: 'SpO₂', icon: Wind, unit: '%' },
            { key: 'temp', label: 'Temperature', icon: Thermometer, unit: '°C' },
            { key: 'resp', label: 'Resp. Rate', icon: Activity, unit: '/min' },
          ].map(({ key, label, unit }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label} <span className="text-gray-400">({unit})</span></label>
              <input
                type="number"
                step="0.1"
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (form as Record<string, string>)[key] && isAbnormal(key, Number((form as Record<string, string>)[key]))
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="—"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes / Symptoms</label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Any patient complaints or observations..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!form.bp_sys || !form.pulse}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Vitals
          </button>
          <a
            href="/adverse-reaction"
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors text-center"
          >
            STOP — Adverse Reaction
          </a>
        </div>
      </div>
    </div>
  )
}
