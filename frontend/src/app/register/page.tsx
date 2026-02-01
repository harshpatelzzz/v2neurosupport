'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    license_number: '',
  })
  const [role, setRole] = useState<'user' | 'therapist'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = role === 'user'
        ? 'http://localhost:8000/auth/user/register'
        : 'http://localhost:8000/auth/therapist/register'

      const payload = role === 'user'
        ? {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            license_number: formData.license_number || null,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Registration successful, redirect to login
        router.push('/login?registered=true')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Register</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Role Selector */}
        <div className="mb-6 flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
              role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setRole('therapist')}
            className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
              role === 'therapist'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Therapist
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>

          {role === 'therapist' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number (Optional)
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                placeholder="Enter license number"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              role === 'user'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-teal-600 hover:bg-teal-700'
            } text-white disabled:bg-gray-400`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Login here
            </Link>
          </p>
        </div>

        <Link href="/">
          <button className="w-full mt-4 text-gray-600 hover:text-gray-800 font-semibold">
            ← Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}
