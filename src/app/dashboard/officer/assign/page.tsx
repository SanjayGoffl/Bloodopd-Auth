'use client'

import { useState, Suspense } from 'react'
import { UserCheck, Droplets, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const REQUESTS: Record<string, {
  id: string; patient: string; uhid: string; ward: string
  product: string; bloodGroup: string; units: number; urgency: string
  indication: string; requestedBy: string; requestedAt: string
}> = {
  'REQ-2026-001': {
    id: 'REQ-2026-001', patient: 'Arun Kumar', uhid: 'UHID-2024-001',
    ward: 'Ward 3B', product: 'Packed Red Blood Cells', bloodGroup: 'B+',
    units: 2, urgency: 'routine', indication: 'Pre-op haemoglobin correction',
    requestedBy: 'Dr. Priya Nair', requestedAt: '2026-03-06 08:14',
  },
  'REQ-2026-003': {
    id: 'REQ-2026-003', patient: 'Rajesh Sharma', uhid: 'UHID-2024-003',
    ward: 'Haematology', product: 'Platelets', bloodGroup: 'O+',
    units: 1, urgency: 'emergency', indication: 'Severe thrombocytopaenia, platelet <10k',
    requestedBy: 'Dr. Priya Nair', requestedAt: '2026-03-06 10:05',
  },
}

const LAB_TECHS = [
  { id: 'lt-001', name: 'Anita Sharma', workload: 2, available: true },
  { id: 'lt-002', name: 'Ramesh Kumar', workload: 4, available: true },
  { id: 'lt-003', name: 'Priti Singh', workload: 1, available: true },
  { id: 'lt-004', name: 'Dev Menon', workload: 5, available: false },
]

export default function AssignRequestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <AssignRequestInner />
    </Suspense>
  )
}

function AssignRequestInner() {
  const searchParams = useSearchParams()
  const reqId = searchParams.get('req') ?? 'REQ-2026-001'
  const req = REQUESTS[reqId] ?? Object.values(REQUESTS)[0]

  const [selectedTech, setSelectedTech] = useState('')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')
  const [assigned, setAssigned] = useState(false)

  const tech = LAB_TECHS.find(t => t.id === selectedTech)

  const handleAssign = () => {
    if (!selectedTech) return
    setAssigned(true)
  }

  if (assigned && tech) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center fade-in">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Request Assigned</h2>
          <p className="text-gray-500 mt-1">
            <strong>{req.id}</strong> has been assigned to <strong>{tech.name}</strong>
          </p>
          <p className="text-sm text-gray-400 mt-2">A notification has been sent to the lab workstation.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-left w-full">
          <div><strong>Patient:</strong> {req.patient} ({req.uhid})</div>
          <div><strong>Product:</strong> {req.product} × {req.units}</div>
          <div><strong>Assigned To:</strong> {tech.name}</div>
          <div><strong>Priority:</strong> {priority}</div>
        </div>
        <a href="/dashboard/officer/requests" className="text-blue-600 hover:underline text-sm">
          ← Back to all requests
        </a>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" />
          Assign Request to Lab
        </h1>
        <p className="text-sm text-gray-500 mt-1">Route this transfusion request to a lab technician</p>
      </div>

      {/* Request card */}
      <div className={`rounded-xl border-2 p-5 ${req.urgency === 'emergency' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-mono text-sm text-blue-700">{req.id}</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{req.patient}</div>
            <div className="text-sm text-gray-500">{req.ward} · {req.uhid}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
            req.urgency === 'emergency' ? 'bg-red-600 text-white' :
            req.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
          }`}>{req.urgency}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-red-400" />
            <span>{req.product} × {req.units} ({req.bloodGroup})</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{req.requestedAt}</span>
          </div>
          <div className="col-span-2 text-gray-600"><strong>Indication:</strong> {req.indication}</div>
          <div className="col-span-2 text-gray-600"><strong>Requested by:</strong> {req.requestedBy}</div>
        </div>
      </div>

      {/* Assignment form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-800">Assignment Details</h2>

        {/* Lab tech selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Lab Technician</label>
          <div className="space-y-2">
            {LAB_TECHS.map((tech) => (
              <button
                key={tech.id}
                disabled={!tech.available}
                onClick={() => setSelectedTech(tech.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-sm transition-all ${
                  !tech.available
                    ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : selectedTech === tech.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${tech.available ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-medium">{tech.name}</span>
                  {!tech.available && <span className="text-xs text-gray-400">(Offline)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {tech.workload} active {tech.workload === 1 ? 'task' : 'tasks'}
                  {tech.workload >= 4 && <span className="ml-1 text-orange-600 font-medium">· High load</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Priority override */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lab Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent — Process immediately</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes to Lab</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for the lab technician..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Assign button */}
        <button
          onClick={handleAssign}
          disabled={!selectedTech}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Assign to Lab
          <ArrowRight className="w-4 h-4" />
        </button>

        {!selectedTech && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <AlertCircle className="w-4 h-4" />
            Please select a lab technician to proceed
          </div>
        )}
      </div>
    </div>
  )
}
