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

interface SessionNote {
  id: string
  appointment_id: string
  therapist_name: string
  notes: string
  created_at: string
  updated_at: string
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
  
  // Session Notes State
  const [sessionNotes, setSessionNotes] = useState('')
  const [therapistName] = useState('Dr. Smith') // In real app, get from auth
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Session State
  const [sessionEnded, setSessionEnded] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)

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

  // Fetch session notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`http://localhost:8000/appointments/${appointmentId}/notes`)
        if (response.ok) {
          const data: SessionNote = await response.json()
          setSessionNotes(data.notes)
          setLastSaved(new Date(data.updated_at))
        }
      } catch (error) {
        // Notes don't exist yet, that's fine
        console.log('No notes found yet')
      }
    }

    fetchNotes()
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
      
      // Check for SESSION_ENDED event
      if (data.type === 'SESSION_ENDED') {
        setSessionEnded(true)
        setMessages(prev => [...prev, {
          type: 'system',
          sender: 'therapist',
          content: data.message,
          timestamp: data.timestamp
        }])
      } else {
        setMessages(prev => [...prev, data])
      }
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
    if (!inputValue.trim() || !ws || !isConnected || sessionEnded) return

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

  // End session handler
  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this session? This action cannot be undone.')) {
      return
    }

    setIsEndingSession(true)
    try {
      // Call REST API to end session
      const response = await fetch(`http://localhost:8000/appointments/${appointmentId}/end-session`, {
        method: 'POST'
      })

      if (response.ok) {
        // Send WebSocket event to broadcast to both parties
        if (ws) {
          ws.send(JSON.stringify({
            type: 'END_SESSION'
          }))
        }
        
        setSessionEnded(true)
      } else {
        alert('Failed to end session')
      }
    } catch (error) {
      console.error('Error ending session:', error)
      alert('Failed to end session')
    } finally {
      setIsEndingSession(false)
    }
  }

  // Save session notes
  const saveNotes = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`http://localhost:8000/appointments/${appointmentId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          therapist_name: therapistName,
          notes: sessionNotes
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setIsSaving(false)
    }
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👨‍⚕️</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Therapist Session
                </h1>
                <p className="text-sm text-gray-600">
                  {sessionEnded ? (
                    <span className="text-gray-500">● Session Completed</span>
                  ) : isConnected ? (
                    <span className="text-green-600">● Connected</span>
                  ) : (
                    <span className="text-red-600">● Disconnected</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* End Session Button */}
            {!sessionEnded && isConnected && (
              <button
                onClick={handleEndSession}
                disabled={isEndingSession}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isEndingSession
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isEndingSession ? 'Ending...' : '🛑 End Session'}
              </button>
            )}
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

      {/* Split Layout: Chat (Left) | Session Notes (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section (Left - 60%) */}
        <div className="flex-1 flex flex-col bg-white border-r border-gray-200" style={{ width: '60%' }}>
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
                        ? 'bg-white text-gray-800 shadow-md border border-gray-200'
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
            {sessionEnded ? (
              <div className="text-center py-3 bg-gray-100 rounded-lg">
                <p className="text-gray-600 font-semibold">Session has ended - Chat is now read-only</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message to patient..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                  disabled={!isConnected || sessionEnded}
                />
                <button
                  type="submit"
                  disabled={!isConnected || sessionEnded}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Session Notes Panel (Right - 40%) */}
        <div className="bg-gradient-to-b from-amber-50 to-yellow-50 flex flex-col" style={{ width: '40%' }}>
          <div className="p-4 border-b border-amber-200 bg-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-amber-900">📝 Session Notes</h2>
                <p className="text-sm text-amber-700">Private notes - not visible to patient</p>
              </div>
              <button
                onClick={saveNotes}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isSaving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
            {lastSaved && (
              <p className="text-xs text-amber-600 mt-2">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Write your private session notes here...

Examples:
- Patient mood and demeanor
- Key topics discussed
- Progress observations
- Treatment plan updates
- Next session goals"
              className="w-full h-full p-4 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 resize-none bg-white"
              style={{ minHeight: '400px' }}
            />
          </div>

          <div className="p-4 bg-amber-100 border-t border-amber-200">
            <div className="text-xs text-amber-800">
              <p className="font-semibold mb-1">⚠️ Privacy Notice:</p>
              <p>These notes are private and secure. They are NEVER shared with the patient or visible in the chat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
