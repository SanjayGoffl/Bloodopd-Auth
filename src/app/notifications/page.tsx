'use client'

import { useState } from 'react'
import { Bell, CheckCheck, AlertTriangle, Info, Droplets, ShieldAlert, X } from 'lucide-react'

type Notification = {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  body: string
  time: string
  read: boolean
  from: string
}

const ICONS = {
  critical: AlertTriangle,
  warning: ShieldAlert,
  info: Info,
  success: Droplets,
}

const TYPE_STYLE = {
  critical: 'border-l-4 border-red-500 bg-red-50',
  warning: 'border-l-4 border-yellow-500 bg-yellow-50',
  info: 'border-l-4 border-blue-400 bg-blue-50',
  success: 'border-l-4 border-green-500 bg-green-50',
}

const ICON_COLOR = {
  critical: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  success: 'text-green-600',
}

const INITIAL: Notification[] = [
  {
    id: 'N1', type: 'critical', read: false, from: 'System',
    title: 'Adverse Reaction Reported — UNIT-O-0991',
    body: 'Nurse Kavitha has reported a febrile non-haemolytic reaction for patient Rajesh Sharma (UHID-2024-003). Unit quarantined.',
    time: '2026-03-06 10:22',
  },
  {
    id: 'N2', type: 'warning', read: false, from: 'Blood Bank Officer',
    title: 'Emergency Uncrossmatched Release — REQ-2026-003',
    body: 'Officer Rajan issued O- PRBC without crossmatch for Rajesh Sharma. Justification: severe haemorrhage, no time for crossmatch.',
    time: '2026-03-06 10:05',
  },
  {
    id: 'N3', type: 'success', read: false, from: 'Lab Tech Anita',
    title: 'Crossmatch Completed — REQ-2026-001',
    body: 'Grouping and crossmatch for Arun Kumar (B+) complete. 2 units PRBC compatible and ready to issue.',
    time: '2026-03-06 09:45',
  },
  {
    id: 'N4', type: 'info', read: true, from: 'System',
    title: 'Blood Bank Refrigerator #1 — Temperature OK',
    body: 'Temperature logged at 3.8°C. Within acceptable range (2–6°C).',
    time: '2026-03-06 08:00',
  },
  {
    id: 'N5', type: 'warning', read: true, from: 'System',
    title: 'Low Reagent Stock — Anti-D Serum',
    body: 'Anti-D Serum stock is at 3 vials. Minimum threshold is 5. Please reorder.',
    time: '2026-03-05 17:30',
  },
  {
    id: 'N6', type: 'info', read: true, from: 'Dr. Priya Nair',
    title: 'New Transfusion Request — REQ-2026-004',
    body: 'Dr. Priya Nair submitted an urgent request for 2 units Whole Blood for Sunita Devi (AB+, Obstetrics).',
    time: '2026-03-05 07:00',
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const displayed = filter === 'all' ? notifications : notifications.filter(n => !n.read)
  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">System alerts, lab updates, and clinical notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {displayed.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No notifications
          </div>
        )}
        {displayed.map((n) => {
          const Icon = ICONS[n.type]
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`relative rounded-xl p-4 cursor-pointer transition-all fade-in ${TYPE_STYLE[n.type]} ${!n.read ? 'shadow-sm' : 'opacity-75'}`}
            >
              {/* Unread dot */}
              {!n.read && (
                <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-blue-600" />
              )}
              {/* Dismiss */}
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ICON_COLOR[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 leading-snug">{n.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{n.time}</span>
                    <span>·</span>
                    <span>From: {n.from}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
