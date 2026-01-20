'use client'

/**
 * HUMAN-ONLY APPOINTMENT CHAT (THERAPIST VIEW)
 * NO AI CODE
 * NO CHATBOT IMPORTS
 * NO EMOTION DETECTION
 * ONLY THERAPIST <-> USER COMMUNICATION
 */

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface HumanMessage {
  type: 'message' | 'system'
  sender: 'user' | 'therapist'
  content: string
  timestamp: string
}

interface Appointment {
  id: string
  user_name: string
  therapist_name: string | null
  status: string
  created_from: string
  created_at: string
}

export default function TherapistAppointmentChatPage() {
  const params = useParams()
  const appointmentId = params.id as string
  
  const [messages, setMessages] = useState<HumanMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`http://localhost:8000/appointments/${appointmentId}`)
        const data = await response.json()
        setAppointment(data)
      } catch (error) {
        console.error('Error fetching appointment:', error)
      }
    }

    fetchAppointment()
  }, [appointmentId])

  // Connect to HUMAN-ONLY WebSocket as THERAPIST
  useEffect(() => {
    const websocket = new WebSocket(
      `ws://localhost:8000/ws/appointment-chat/${appointmentId}?role=therapist`
    )

    websocket.onopen = () => {
      console.log('Connected to appointment chat as THERAPIST')
      setIsConnected(true)
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages(prev => [...prev, data])
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    websocket.onclose = () => {
      console.log('Disconnected from appointment chat')
      setIsConnected(false)
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [appointmentId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !ws || !isConnected) return

    // Send HUMAN message to WebSocket
    ws.send(JSON.stringify({
      content: inputValue
    }))

    // Add to local state (will also come back from server)
    const therapistMessage: HumanMessage = {
      type: 'message',
      sender: 'therapist',
      content: inputValue,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, therapistMessage])

    setInputValue('')
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading appointment...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="text-3xl">👨‍⚕️</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Therapist Session
                </h1>
                <p className="text-sm text-gray-600">
                  {isConnected ? (
                    <span className="text-green-600">● Connected</span>
                  ) : (
                    <span className="text-red-600">● Disconnected</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <Link href="/therapist/appointments">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold">
              ← Back
            </button>
          </Link>
        </div>
        <div className="mt-3 text-sm text-gray-600 bg-teal-50 p-3 rounded-lg">
          <p><strong>Patient:</strong> {appointment.user_name}</p>
          <p><strong>Status:</strong> {appointment.status}</p>
          <p><strong>Created From:</strong> {appointment.created_from === 'ai' ? '🤖 AI Referral' : '📝 Manual Booking'}</p>
        </div>
      </div>

      {/* Messages Area - HUMAN ONLY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Session started</p>
            <p className="text-sm mt-2">You can now communicate with the patient</p>
          </div>
        )}
        
        {messages.map((msg, index) => {
          if (msg.type === 'system') {
            return (
              <div key={index} className="text-center">
                <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">
                  {msg.content}
                </span>
              </div>
            )
          }

          // THERAPIST messages on LEFT, USER messages on RIGHT
          const isTherapist = msg.sender === 'therapist'
          
          return (
            <div
              key={index}
              className={`flex ${isTherapist ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                  isTherapist
                    ? 'bg-white text-gray-800 shadow-md'
                    : 'bg-teal-600 text-white'
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${
                  isTherapist ? 'text-teal-600' : 'text-teal-200'
                }`}>
                  {isTherapist ? 'You (Therapist)' : 'Patient'}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className={`text-xs mt-1 ${
                  isTherapist ? 'text-gray-500' : 'text-teal-200'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - HUMAN ONLY */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message to patient..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
