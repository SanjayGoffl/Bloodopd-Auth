'use client'

import { useState } from 'react'
import { Users, ShieldAlert, Lock, Unlock, Search, Eye, EyeOff } from 'lucide-react'

type StaffMember = {
  id: string; name: string; role: string; roleKey: string
  email: string; lastLogin: string; status: 'active' | 'frozen' | 'inactive'
  actionsTodayCount: number; failedLogins: number
}

const STAFF: StaffMember[] = [
  { id: 's1', name: 'Dr. Priya Nair', role: 'Clinician', roleKey: 'clinician', email: 'clinician@bloodbank.demo', lastLogin: '2026-03-06 09:14', status: 'active', actionsTodayCount: 5, failedLogins: 0 },
  { id: 's2', name: 'Officer Rajan', role: 'Blood Bank Officer', roleKey: 'officer', email: 'officer@bloodbank.demo', lastLogin: '2026-03-06 08:55', status: 'active', actionsTodayCount: 12, failedLogins: 0 },
  { id: 's3', name: 'Anita Sharma', role: 'Lab Technician', roleKey: 'lab_tech', email: 'labtech@bloodbank.demo', lastLogin: '2026-03-06 08:30', status: 'active', actionsTodayCount: 7, failedLogins: 1 },
  { id: 's4', name: 'Nurse Kavitha', role: 'Nursing Staff', roleKey: 'nurse', email: 'nurse@bloodbank.demo', lastLogin: '2026-03-05 22:10', status: 'inactive', actionsTodayCount: 0, failedLogins: 0 },
  { id: 's5', name: 'Dr. Suresh Babu', role: 'Clinician', roleKey: 'clinician', email: 'clinician2@bloodbank.demo', lastLogin: '2026-03-06 07:45', status: 'frozen', actionsTodayCount: 0, failedLogins: 5 },
]

const ROLE_COLOR: Record<string, string> = {
  clinician: 'bg-blue-100 text-blue-800',
  officer: 'bg-purple-100 text-purple-800',
  lab_tech: 'bg-green-100 text-green-800',
  nurse: 'bg-pink-100 text-pink-800',
  hod: 'bg-red-100 text-red-800',
}

export default function HodStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(STAFF)
  const [search, setSearch] = useState('')
  const [confirmFreeze, setConfirmFreeze] = useState<string | null>(null)
  const [pin, setPin] = useState('')

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleFreeze = (id: string) => {
    if (pin !== '123456') { alert('Incorrect HOD PIN'); return }
    setStaff(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'frozen' ? 'active' : 'frozen' } : s
    ))
    setConfirmFreeze(null)
    setPin('')
  }

  const member = staff.find(s => s.id === confirmFreeze)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Staff Monitor
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor access, activity, and freeze accounts if needed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, color: 'text-gray-700' },
          { label: 'Active Now', value: staff.filter(s => s.status === 'active').length, color: 'text-green-600' },
          { label: 'Frozen', value: staff.filter(s => s.status === 'frozen').length, color: 'text-red-600' },
          { label: 'Failed Logins Today', value: staff.reduce((a, s) => a + s.failedLogins, 0), color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Staff table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Role', 'Email', 'Last Login', 'Actions Today', 'Failed Logins', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${s.status === 'frozen' ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[s.roleKey] ?? 'bg-gray-100'}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.lastLogin}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-700">{s.actionsTodayCount}</td>
                <td className={`px-4 py-3 text-center font-semibold ${s.failedLogins >= 3 ? 'text-red-600' : 'text-gray-700'}`}>
                  {s.failedLogins}
                  {s.failedLogins >= 3 && <ShieldAlert className="inline w-3.5 h-3.5 ml-1 text-red-500" />}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-green-100 text-green-800' :
                    s.status === 'frozen' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.status === 'frozen' ? <Lock className="w-3 h-3" /> : s.status === 'active' ? <Unlock className="w-3 h-3" /> : null}
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.roleKey !== 'hod' && (
                    <button
                      onClick={() => setConfirmFreeze(s.id)}
                      className={`text-xs font-medium ${s.status === 'frozen' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                    >
                      {s.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Freeze confirmation modal */}
      {confirmFreeze && member && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 fade-in">
            <div className="flex items-center gap-3">
              {member.status === 'frozen'
                ? <Unlock className="w-6 h-6 text-green-600" />
                : <Lock className="w-6 h-6 text-red-600" />}
              <h3 className="font-bold text-gray-900">
                {member.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {member.status === 'frozen'
                ? `This will restore login access for ${member.name}.`
                : `This will immediately revoke login access for ${member.name}. They will be unable to log in until unfrozen.`}
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <div><strong>Name:</strong> {member.name}</div>
              <div><strong>Role:</strong> {member.role}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">HOD PIN (demo: 123456)</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 6-digit PIN"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 tracking-widest text-center"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleFreeze(confirmFreeze)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white ${member.status === 'frozen' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Confirm
              </button>
              <button
                onClick={() => { setConfirmFreeze(null); setPin('') }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
