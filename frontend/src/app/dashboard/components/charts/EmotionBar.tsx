'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { EMOTION_COLORS } from '../../types'

interface DataPoint {
  month: string
  [emotion: string]: string | number
}

interface Props {
  data: { month: string; emotion: string; count: number }[]
}

export function EmotionBar({ data }: Props) {
  const byMonth: Record<string, Record<string, number>> = {}
  data.forEach((d) => {
    if (!byMonth[d.month]) byMonth[d.month] = {}
    byMonth[d.month][d.emotion] = d.count
  })
  const months = [...new Set(data.map((d) => d.month))].sort()
  const emotions = [...new Set(data.map((d) => d.emotion))]
  const chartData: DataPoint[] = months.map((month) => {
    const row: DataPoint = { month }
    emotions.forEach((e) => (row[e] = byMonth[month]?.[e] ?? 0))
    return row
  })

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No emotion frequency data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
        <Tooltip />
        <Legend />
        {emotions.map((emotion) => (
          <Bar key={emotion} dataKey={emotion} stackId="a" fill={EMOTION_COLORS[emotion] || '#6b7280'} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
