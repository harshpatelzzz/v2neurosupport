'use client'

import React from 'react'
import type { DashboardSession } from '../types'
import { formatDate } from '../types'

interface SessionTableProps {
  sessions: DashboardSession[]
  isLoading?: boolean
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (s === 'completed') return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  if (s === 'scheduled') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
}

export function SessionTable({ sessions, isLoading }: SessionTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-3 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    )
  }

  if (!sessions.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No sessions found. Appointments will appear here once you have sessions.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Session ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Started
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              End
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Therapist
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sessions.map((row) => (
            <tr key={row.session_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">
                {row.session_id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(row.status)}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(row.started_at)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(row.end_date, { dateOnly: true })}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {row.therapist_assigned || 'Unassigned'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
