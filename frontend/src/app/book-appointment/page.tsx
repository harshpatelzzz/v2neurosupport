'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BookAppointmentPage() {
  const [userName, setUserName] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          created_from: 'manual'
        }),
      })

      if (response.ok) {
        router.push('/appointments')
      } else {
        alert('Failed to book appointment')
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
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
