'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'therapist'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = role === 'user' 
        ? 'http://localhost:8000/auth/user/login'
        : 'http://localhost:8000/auth/therapist/login'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store token and user info
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('user_id', data.user_id)
        localStorage.setItem('username', data.username)

        // Redirect based on role
        if (role === 'user') {
          router.push('/')
        } else {
          router.push('/therapist')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Login failed')
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
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
          <p className="text-gray-600">Welcome back!</p>
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              role === 'user'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-teal-600 hover:bg-teal-700'
            } text-white disabled:bg-gray-400`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Register here
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
