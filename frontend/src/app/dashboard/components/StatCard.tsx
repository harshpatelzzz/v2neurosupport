import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  accent?: 'default' | 'green' | 'amber' | 'red'
}

const accentClasses = {
  default: 'border-l-indigo-500 bg-indigo-50/50',
  green: 'border-l-emerald-500 bg-emerald-50/50',
  amber: 'border-l-amber-500 bg-amber-50/50',
  red: 'border-l-red-500 bg-red-50/50',
}

export function StatCard({ title, value, subtitle, accent = 'default' }: StatCardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 border-l-4 bg-white p-4 shadow-sm ${accentClasses[accent]} dark:border-gray-700 dark:bg-gray-800`}
    >
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  )
}
