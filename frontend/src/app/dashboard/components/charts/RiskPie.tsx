'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { RISK_COLORS } from '../../types'

interface DataPoint {
  name: string
  value: number
}

interface Props {
  data: DataPoint[]
}

export function RiskPie({ data }: Props) {
  const filtered = data.filter((d) => d.value > 0)
  if (filtered.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No risk data yet
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {filtered.map((entry, index) => (
            <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#6b7280'} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value, 'Messages']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
