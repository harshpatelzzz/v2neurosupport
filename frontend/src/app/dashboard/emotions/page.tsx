'use client'

import { useState, useEffect } from 'react'
import { getAuthToken } from '../../lib/auth'
import { getDashboardApiBase } from '../api'
import type { DashboardEmotions } from '../types'
import { ChartCard } from '../components/ChartCard'
import { EmotionPie } from '../components/charts/EmotionPie'
import { AvgRiskLine } from '../components/charts/AvgRiskLine'
import { EmotionBar } from '../components/charts/EmotionBar'
import { EMOTION_COLORS } from '../types'

export default function DashboardEmotionsPage() {
  const [data, setData] = useState<DashboardEmotions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }
    const base = getDashboardApiBase()
    fetch(`${base}/dashboard/user/emotions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized')
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
          <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <p className="font-medium">Could not load emotions data</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  const emotions = data!

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Emotion & risk analysis</h2>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Emotion legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(EMOTION_COLORS).map(([name, color]) => (
            <span key={name} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Emotion distribution">
          <EmotionPie data={emotions.emotion_distribution} />
        </ChartCard>
        <ChartCard title="Average risk score over time">
          <AvgRiskLine data={emotions.avg_risk_over_time} />
        </ChartCard>
      </div>

      <ChartCard title="Emotion frequency per month">
        <EmotionBar data={emotions.emotion_frequency_per_month} />
      </ChartCard>
    </div>
  )
}
