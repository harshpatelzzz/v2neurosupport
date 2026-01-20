'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-800">
          NeuroSupport-V2
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Your Mental Health Support Platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Chatbot Support */}
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

          {/* Card 2: Book Appointment */}
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

          {/* Card 3: My Appointments */}
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
        </div>

        {/* Therapist Portal Link */}
        <div className="mt-16 text-center">
          <Link 
            href="/therapist" 
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
          >
            Therapist Portal →
          </Link>
        </div>
      </div>
    </div>
  )
}
