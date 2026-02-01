'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '../../components/NotificationBell'
import { isAuthenticated, isTherapist, getAuthHeaders, getAuthUser } from '../../lib/auth'

interface Appointment {
  id: string
  user_name: string
  therapist_name: string | null
  status: string
  created_from: string
  created_at: string
}

export default function TherapistAppointmentsListPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !isTherapist()) {
      router.push('/login')
      return
    }

    fetchAppointments()
  }, [router])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/appointments/all', {
        headers: getAuthHeaders(),
      })
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
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

  const getCreatedFromBadge = (createdFrom: string) => {
    return createdFrom === 'ai' 
      ? <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">🤖 AI Referred</span>
      : <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">📝 Manual</span>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Therapist - Appointments</h1>
            <p className="text-gray-600">View and join patient sessions</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell role="therapist" name="All Therapists" />
            <Link href="/therapist">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold">
                ← Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Appointments</h2>
            <p className="text-gray-600">No appointments scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Link key={appointment.id} href={`/therapist/appointments/${appointment.id}`}>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-teal-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          Patient: {appointment.user_name}
                        </h3>
                        {getCreatedFromBadge(appointment.created_from)}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Appointment ID: {appointment.id.substring(0, 8)}...</p>
                        <p>Created: {new Date(appointment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-2">💬</div>
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 text-sm">
                        Join Session
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
