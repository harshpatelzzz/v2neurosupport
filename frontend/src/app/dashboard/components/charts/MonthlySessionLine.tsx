'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  month: string
  sessions: number
}

interface Props {
  data: DataPoint[]
}

export function MonthlySessionLine({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [value, 'Sessions']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="sessions"
          name="Sessions"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
