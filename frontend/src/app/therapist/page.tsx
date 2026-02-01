'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, isTherapist } from '../lib/auth'

export default function TherapistDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !isTherapist()) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="text-7xl mb-6">👨‍⚕️</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Therapist Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Access and manage your appointments
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* View Appointments Card */}
          <Link href="/therapist/appointments">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-teal-500">
              <div className="flex items-center space-x-6">
                <div className="text-5xl">📋</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    View Appointments
                  </h2>
                  <p className="text-gray-600">
                    See all scheduled appointments and join sessions
                  </p>
                </div>
                <div className="text-3xl text-teal-500">→</div>
              </div>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link href="/therapist/analysis">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-purple-500">
              <div className="flex items-center space-x-6">
                <div className="text-5xl">📊</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    Analytics & Insights
                  </h2>
                  <p className="text-gray-600">
                    View comprehensive statistics and trends
                  </p>
                </div>
                <div className="text-3xl text-purple-500">→</div>
              </div>
            </div>
          </Link>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-teal-600">-</div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600">-</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600">-</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to User Portal */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="text-teal-600 hover:text-teal-800 font-semibold underline"
          >
            ← Back to User Portal
          </Link>
        </div>
      </div>
    </div>
  )
}
