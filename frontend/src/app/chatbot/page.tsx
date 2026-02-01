'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuthHeaders, isAuthenticated, isUser } from '../lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AIMessage {
  type: 'ai_message' | 'user_message'
  content: string
  timestamp: string
  appointment_created?: boolean
  appointment_id?: string
}

const getWsUrl = (sessionId: string) => {
  if (typeof window === 'undefined') return `ws://localhost:8000/ws/ai-chat/${sessionId}`
  const host = window.location.hostname
  return `ws://${host}:8000/ws/ai-chat/${sessionId}`
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [userName, setUserName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const [appointmentCreated, setAppointmentCreated] = useState(false)
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // When logged in, use account full_name so AI-created appointments show in My Appointments
  useEffect(() => {
    if (authChecked) return
    setAuthChecked(true)
    if (!isAuthenticated() || !isUser()) return
    setLoadingProfile(true)
    fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) return
        return res.json()
      })
      .then((data) => {
        if (data?.full_name?.trim()) {
          setUserName(data.full_name.trim())
          setNameSubmitted(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false))
  }, [authChecked])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (!nameSubmitted) return

    const wsUrl = getWsUrl(sessionId)
    const websocket = new WebSocket(wsUrl)
    setConnectionStatus('connecting')
    setConnectionError(null)

    websocket.onopen = () => {
      setConnectionStatus('connected')
      setConnectionError(null)
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'APPOINTMENT_BOOKED') {
          setMessages(prev => [...prev, {
            type: 'ai_message',
            content: data.content || 'Your appointment has been scheduled.',
            timestamp: data.timestamp || new Date().toISOString()
          }])
          setAppointmentCreated(true)
          setCreatedAppointmentId(data.appointment_id || null)
        } else {
          setMessages(prev => [...prev, {
            type: 'ai_message',
            content: data.content || '',
            timestamp: data.timestamp || new Date().toISOString()
          }])
        }
        setIsTyping(false)
      } catch {
        setIsTyping(false)
      }
    }

    websocket.onerror = () => {
      setConnectionStatus('error')
      setConnectionError('Could not connect to the chat. Is the backend running on port 8000?')
    }

    websocket.onclose = (event) => {
      setWs(null)
      if (event.code !== 1000) {
        setConnectionStatus('error')
        setConnectionError(event.reason || 'Connection closed. Is the backend running on port 8000?')
      }
    }

    setWs(websocket)
    return () => {
      websocket.close()
    }
  }, [nameSubmitted, sessionId])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) setNameSubmitted(true)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text || !ws || ws.readyState !== WebSocket.OPEN || appointmentCreated) return

    setMessages(prev => [...prev, {
      type: 'user_message',
      content: text,
      timestamp: new Date().toISOString()
    }])
    setInputValue('')
    setIsTyping(true)

    ws.send(JSON.stringify({
      content: text,
      user_name: userName
    }))
  }

  const handleEndChat = () => {
    if (ws) ws.close()
    router.push('/appointments')
  }

  if (!nameSubmitted) {
    if (loadingProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="text-center text-gray-600">Loading…</div>
        </div>
      )
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Health Assistant</h1>
            <p className="text-gray-600">Chat about your wellbeing and get guidance. Start with your name.</p>
            {!isAuthenticated() && (
              <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">
                Log in first so any appointment you book here will appear in My Appointments.
              </p>
            )}
          </div>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Chat
            </button>
          </form>
          <Link href="/">
            <button className="w-full mt-4 text-gray-600 hover:text-gray-800 font-semibold">← Back to Home</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🤖</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">NeuroSupport</h1>
            <p className="text-sm text-gray-600">
              {connectionStatus === 'connected' && 'Connected · Chat about your health'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'error' && 'Connection issue'}
            </p>
          </div>
        </div>
        <Link href="/">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold">← Home</button>
        </Link>
      </div>

      {connectionStatus === 'error' && connectionError && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {connectionError} Make sure the backend is running (e.g. <code className="bg-red-100 px-1 rounded">uvicorn main:app --reload --port 8000</code>).
        </div>
      )}

      {appointmentCreated && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 m-4 rounded shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-semibold text-green-800 text-lg">✅ Appointment created</p>
              <p className="text-sm text-green-700">ID: {createdAppointmentId?.substring(0, 8)}... · A therapist will join soon.</p>
            </div>
            <button
              onClick={handleEndChat}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md"
            >
              View My Appointments →
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === 'user_message' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                msg.type === 'user_message'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              {msg.type === 'ai_message' && (
                <div className="text-xs font-semibold mb-1 text-indigo-600">NeuroSupport</div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className={`text-xs mt-1 ${msg.type === 'user_message' ? 'text-indigo-200' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 shadow-md px-4 py-3 rounded-2xl">
              <span className="animate-pulse">NeuroSupport is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        {appointmentCreated ? (
          <div className="text-center py-3 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold mb-2">✅ Appointment created</p>
            <p className="text-sm text-green-600">You can close this chat and open your appointments.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share how you feel or ask about your health..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
              disabled={appointmentCreated || connectionStatus !== 'connected' || isTyping}
            />
            <button
              type="submit"
              disabled={appointmentCreated || connectionStatus !== 'connected' || isTyping || !inputValue.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
