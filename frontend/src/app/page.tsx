'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isAuthenticated, isUser, isTherapist, logout } from './lib/auth'

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<'user' | 'therapist' | null>(null)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setUserRole(isUser() ? 'user' : (isTherapist() ? 'therapist' : null))
  }, [])

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    setUserRole(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-4xl w-full">
        {/* Header with Auth */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800">
            NeuroSupport-V2
          </h1>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Logged in as {userRole}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 mb-12 text-lg">
          Your Mental Health Support Platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Chatbot Support - Public */}
          <Link href="/chatbot">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-indigo-500">
              <div className="text-5xl mb-6 text-center">🤖</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                AI Chatbot Support
              </h2>
              <p className="text-gray-600 text-center">
                Chat with our AI assistant for immediate support and guidance
              </p>
            </div>
          </Link>

          {/* Card 2: Book Appointment - Requires Auth */}
          {authenticated && userRole === 'user' ? (
            <Link href="/book-appointment">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-purple-500">
                <div className="text-5xl mb-6 text-center">📅</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  Book Appointment
                </h2>
                <p className="text-gray-600 text-center">
                  Schedule a session with a professional therapist
                </p>
              </div>
            </Link>
          ) : (
            <div className="bg-gray-100 rounded-2xl shadow-lg p-8 border-2 border-gray-300 opacity-60">
              <div className="text-5xl mb-6 text-center">📅</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                Book Appointment
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Schedule a session with a professional therapist
              </p>
              <Link href="/login">
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                  Login to Book
                </button>
              </Link>
            </div>
          )}

          {/* Card 3: My Appointments - Requires Auth */}
          {authenticated && userRole === 'user' ? (
            <Link href="/appointments">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-green-500">
                <div className="text-5xl mb-6 text-center">📋</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  My Appointments
                </h2>
                <p className="text-gray-600 text-center">
                  View and manage your scheduled appointments
                </p>
              </div>
            </Link>
          ) : (
            <div className="bg-gray-100 rounded-2xl shadow-lg p-8 border-2 border-gray-300 opacity-60">
              <div className="text-5xl mb-6 text-center">📋</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                My Appointments
              </h2>
              <p className="text-gray-600 text-center mb-4">
                View and manage your scheduled appointments
              </p>
              <Link href="/login">
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                  Login to View
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Therapist Portal Link */}
        {authenticated && userRole === 'therapist' ? (
          <div className="mt-16 text-center">
            <Link 
              href="/therapist" 
              className="text-teal-600 hover:text-teal-800 font-semibold underline text-lg"
            >
              Therapist Portal →
            </Link>
          </div>
        ) : (
          <div className="mt-16 text-center">
            <Link 
              href="/therapist" 
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Therapist Portal →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
