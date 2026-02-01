'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, isTherapist, getAuthHeaders } from '../../lib/auth'

interface Analytics {
  total_appointments: number
  scheduled_appointments: number
  active_appointments: number
  completed_appointments: number
  ai_referred_appointments: number
  manual_appointments: number
  total_patients: number
  total_session_notes: number
  appointments_by_day: Array<{ date: string; count: number }>
  recent_appointments: Array<{
    id: string
    user_name: string
    therapist_name: string | null
    status: string
    created_from: string
    created_at: string
  }>
}

export default function TherapistAnalysisPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !isTherapist()) {
      router.push('/login')
      return
    }

    fetchAnalytics()
  }, [router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/analytics', {
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError('Failed to load analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaxCount = () => {
    if (!analytics?.appointments_by_day.length) return 1
    return Math.max(...analytics.appointments_by_day.map(d => d.count), 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-2xl text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-gray-600 mb-4">{error || 'Failed to load analytics'}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const maxCount = getMaxCount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into your practice</p>
            </div>
            <Link href="/therapist">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold">
                ← Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-800">{analytics.total_appointments}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-800">{analytics.active_appointments}</p>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">{analytics.total_patients}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Session Notes</p>
                <p className="text-3xl font-bold text-gray-800">{analytics.total_session_notes}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments by Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointments by Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Scheduled</span>
                  <span className="font-semibold text-gray-800">{analytics.scheduled_appointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.scheduled_appointments / Math.max(analytics.total_appointments, 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Active</span>
                  <span className="font-semibold text-gray-800">{analytics.active_appointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.active_appointments / Math.max(analytics.total_appointments, 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Completed</span>
                  <span className="font-semibold text-gray-800">{analytics.completed_appointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gray-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.completed_appointments / Math.max(analytics.total_appointments, 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments by Source */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointments by Source</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">🤖 AI Referred</span>
                  <span className="font-semibold text-gray-800">{analytics.ai_referred_appointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.ai_referred_appointments / Math.max(analytics.total_appointments, 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">📝 Manual Booking</span>
                  <span className="font-semibold text-gray-800">{analytics.manual_appointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${(analytics.manual_appointments / Math.max(analytics.total_appointments, 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointments Trend (Last 30 Days)</h2>
          {analytics.appointments_by_day.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.appointments_by_day.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-teal-500 rounded-t hover:bg-teal-600 transition-colors cursor-pointer"
                    style={{
                      height: `${(day.count / maxCount) * 100}%`,
                      minHeight: day.count > 0 ? '4px' : '0'
                    }}
                    title={`${day.date}: ${day.count} appointments`}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No appointments in the last 30 days</p>
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Appointments</h2>
          {analytics.recent_appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Patient</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Source</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recent_appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{appointment.user_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {appointment.created_from === 'ai' ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            🤖 AI
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            📝 Manual
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/therapist/appointments/${appointment.id}`}>
                          <button className="px-4 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
