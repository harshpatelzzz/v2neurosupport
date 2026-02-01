'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AIMessage {
  type: 'ai_message' | 'user_message'
  content: string
  timestamp: string
  appointment_created?: boolean
  appointment_id?: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [userName, setUserName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const [appointmentCreated, setAppointmentCreated] = useState(false)
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!nameSubmitted) return

    // Connect to AI chatbot WebSocket
    const websocket = new WebSocket(`ws://localhost:8000/ws/ai-chat/${sessionId}`)

    websocket.onopen = () => {
      console.log('Connected to AI chatbot')
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // Check for APPOINTMENT_BOOKED event
      if (data.type === 'APPOINTMENT_BOOKED') {
        // Add AI message to chat
        setMessages(prev => [...prev, {
          type: 'ai_message',
          content: data.content,
          timestamp: data.timestamp
        }])
        
        // Set appointment created state
        setAppointmentCreated(true)
        setCreatedAppointmentId(data.appointment_id)
      } else {
        // Normal message
        setMessages(prev => [...prev, data])
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      console.error('WebSocket URL:', `ws://localhost:8000/ws/ai-chat/${sessionId}`)
    }

    websocket.onclose = (event) => {
      console.log('Disconnected from AI chatbot', event.code, event.reason)
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [nameSubmitted, sessionId])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      setNameSubmitted(true)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !ws || appointmentCreated) return

    const userMessage: AIMessage = {
      type: 'user_message',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])

    // Send to AI chatbot WebSocket
    ws.send(JSON.stringify({
      content: inputValue,
      user_name: userName
    }))

    setInputValue('')
  }

  const handleEndChat = () => {
    if (ws) {
      ws.close()
    }
    router.push('/appointments')
  }

  if (!nameSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Chatbot</h1>
            <p className="text-gray-600">Let's get started with your name</p>
          </div>
          
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
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
            <button className="w-full mt-4 text-gray-600 hover:text-gray-800 font-semibold">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🤖</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Support Assistant</h1>
            <p className="text-sm text-gray-600">Always here to help</p>
          </div>
        </div>
        <Link href="/">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold">
            ← Home
          </button>
        </Link>
      </div>

      {/* Appointment Created Banner */}
      {appointmentCreated && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 m-4 rounded shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 text-lg">✅ Appointment Successfully Created!</p>
              <p className="text-sm text-green-700">Appointment ID: {createdAppointmentId?.substring(0, 8)}...</p>
              <p className="text-sm text-green-700 mt-1">A therapist will be available for you soon</p>
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

      {/* Messages Area */}
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
                <div className="text-xs font-semibold mb-1 text-indigo-600">AI Assistant</div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className={`text-xs mt-1 ${msg.type === 'user_message' ? 'text-indigo-200' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {appointmentCreated ? (
          <div className="text-center py-3 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold mb-2">✅ Appointment Successfully Created!</p>
            <p className="text-sm text-green-600 mb-3">You can now close this chat and view your appointment.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              disabled={appointmentCreated}
            />
            <button
              type="submit"
              disabled={appointmentCreated}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
