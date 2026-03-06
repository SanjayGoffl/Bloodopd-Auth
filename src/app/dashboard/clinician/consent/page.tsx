'use client'

import { useState } from 'react'
import { ClipboardList, Printer, CheckCircle, User, Droplets, AlertTriangle } from 'lucide-react'

const PATIENTS = [
  { uhid: 'UHID-2024-001', name: 'Arun Kumar', age: 45, ward: 'Ward 3B', bloodGroup: 'B+', diagnosis: 'Chronic Anaemia' },
  { uhid: 'UHID-2024-002', name: 'Meera Iyer', age: 62, ward: 'ICU', bloodGroup: 'A+', diagnosis: 'Post-operative bleeding' },
  { uhid: 'UHID-2024-003', name: 'Rajesh Sharma', age: 34, ward: 'Haematology', bloodGroup: 'O+', diagnosis: 'Thrombocytopaenia' },
]

const RISKS = [
  'Febrile reaction',
  'Allergic reaction',
  'Haemolytic reaction',
  'Transfusion-related lung injury (TRALI)',
  'Transfusion-associated circulatory overload (TACO)',
  'Infection transmission (rare)',
]

export default function ConsentFormPage() {
  const [selectedUhid, setSelectedUhid] = useState('')
  const [product, setProduct] = useState('Packed Red Blood Cells')
  const [units, setUnits] = useState('1')
  const [indication, setIndication] = useState('')
  const [signed, setSigned] = useState(false)
  const [generated, setGenerated] = useState(false)

  const patient = PATIENTS.find((p) => p.uhid === selectedUhid)

  const handleGenerate = () => {
    if (!patient || !indication) return
    setSigned(false)
    setGenerated(true)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Informed Consent Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">Generate and record patient consent for blood transfusion</p>
        </div>
        {generated && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        )}
      </div>

      {/* Form */}
      {!generated && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Consent Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
            <select
              value={selectedUhid}
              onChange={(e) => setSelectedUhid(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Patient --</option>
              {PATIENTS.map((p) => (
                <option key={p.uhid} value={p.uhid}>
                  {p.name} ({p.uhid})
                </option>
              ))}
            </select>
          </div>

          {patient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Age:</span> {patient.age} yrs</div>
              <div><span className="text-gray-500">Ward:</span> {patient.ward}</div>
              <div><span className="text-gray-500">Blood Group:</span> <strong>{patient.bloodGroup}</strong></div>
              <div className="col-span-3"><span className="text-gray-500">Diagnosis:</span> {patient.diagnosis}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Product</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Packed Red Blood Cells', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate', 'Whole Blood'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
              <input
                type="number"
                min="1"
                max="20"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Indication</label>
            <textarea
              rows={3}
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              placeholder="Describe the clinical reason for transfusion..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!patient || !indication}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Consent Form
          </button>
        </div>
      )}

      {/* Generated Consent */}
      {generated && patient && (
        <div className="bg-white border-2 border-gray-300 rounded-xl p-8 space-y-6 fade-in print:border-none print:shadow-none">
          {/* Hospital header */}
          <div className="text-center border-b border-gray-200 pb-4">
            <div className="text-lg font-bold text-gray-900">VIT Medical Centre</div>
            <div className="text-sm text-gray-500">Department of Transfusion Medicine</div>
            <div className="mt-2 text-xl font-semibold text-blue-800">INFORMED CONSENT FOR BLOOD TRANSFUSION</div>
          </div>

          {/* Patient info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div><strong>Patient Name:</strong> {patient.name}</div>
              <div><strong>UHID:</strong> {patient.uhid}</div>
              <div><strong>Age:</strong> {patient.age} years</div>
            </div>
            <div className="space-y-1">
              <div><strong>Ward / Unit:</strong> {patient.ward}</div>
              <div><strong>Blood Group:</strong> {patient.bloodGroup}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          {/* Transfusion details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
            <div className="font-semibold text-blue-800 flex items-center gap-2">
              <Droplets className="w-4 h-4" /> Transfusion Details
            </div>
            <div><strong>Product:</strong> {product}</div>
            <div><strong>Units:</strong> {units}</div>
            <div><strong>Indication:</strong> {indication}</div>
          </div>

          {/* Consent text */}
          <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
            <p>
              I, <strong>{patient.name}</strong>, hereby give my informed consent to receive a blood transfusion of{' '}
              <strong>{units} unit(s)</strong> of <strong>{product}</strong> as recommended by my attending physician.
            </p>
            <p>
              I understand that this transfusion is being administered for the following clinical reason:{' '}
              <em>{indication}</em>.
            </p>

            <div>
              <div className="flex items-center gap-2 font-semibold text-yellow-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Risks I Have Been Informed Of:
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {RISKS.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>

            <p>
              I understand that alternatives to transfusion have been discussed with me and that I have the right to
              refuse or withdraw consent at any time.
            </p>
          </div>

          {/* Signature block */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Patient / Guardian Signature</span>
              </div>
              {signed
                ? <div className="flex items-center gap-2 text-green-700 font-semibold"><CheckCircle className="w-4 h-4" /> Consent Recorded Digitally</div>
                : <button
                    onClick={() => setSigned(true)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Record Digital Consent
                  </button>
              }
            </div>
            <div className="text-sm">
              <div className="font-medium mb-2">Physician Signature</div>
              <div className="text-gray-500">Dr. ___________________________</div>
              <div className="text-gray-500 mt-4">Date: {new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setGenerated(false); setSigned(false) }}
            className="text-sm text-blue-600 underline"
          >
            ← Generate another consent form
          </button>
        </div>
      )}
    </div>
  )
}
