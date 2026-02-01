'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, isUser, getAuthHeaders } from '../lib/auth'

export default function BookAppointmentPage() {
  const [preferredTime, setPreferredTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !isUser()) {
      router.push('/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8000/appointments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          created_from: 'manual'
        }),
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.ok) {
        router.push('/appointments')
      } else {
        const errorData = await response.json()
        alert(errorData.detail || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Appointment</h1>
          <p className="text-gray-600">Schedule a session with our therapists</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Your appointment will be created using your registered account information.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Time (Optional)
            </label>
            <input
              type="text"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              placeholder="e.g., Tomorrow 2 PM"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>

        <Link href="/">
          <button className="w-full mt-4 text-gray-600 hover:text-gray-800 font-semibold">
            ← Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}
