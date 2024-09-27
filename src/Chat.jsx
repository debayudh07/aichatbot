'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage } from './Api' // Assuming Api.js is in the same directory
import { Loader2, Menu, X, Send, Plus, Trash2, MessageSquare, User, Bot, ChevronDown } from 'lucide-react'

const Button = ({ children, onClick, className = '', ...props }) => (
  <button
    className={`px-4 py-2 rounded-md transition-all duration-200 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
)

const IconButton = ({ icon: Icon, onClick, className = '', ...props }) => (
  <button
    className={`p-2 rounded-full transition-all duration-200 ${className}`}
    onClick={onClick}
    {...props}
  >
    <Icon className="w-5 h-5" />
  </button>
)

const ChatBubble = ({ sender, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex items-start gap-3 ${
      sender === 'user' ? 'justify-end' : 'justify-start'
    }`}
  >
    <div
      className={`max-w-[80%] rounded-lg p-3 ${
        sender === 'user'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      <p className="text-sm md:text-base">{text}</p>
    </div>
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        sender === 'user'
          ? 'bg-blue-100 text-blue-500'
          : 'bg-cyan-100 text-cyan-500'
      }`}
    >
      {sender === 'user' ? (
        <User className="w-5 h-5" />
      ) : (
        <Bot className="w-5 h-5" />
      )}
    </div>
  </motion.div>
)

export default function Chat() {
  const [sessions, setSessions] = useState([{ id: 0, messages: [] }])
  const [currentSessionId, setCurrentSessionId] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const messagesEndRef = useRef(null)

  const getCurrentSession = () => sessions.find((session) => session.id === currentSessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [sessions])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { sender: 'user', text: input }
    const updatedSessions = sessions.map((session) => {
      if (session.id === currentSessionId) {
        return { ...session, messages: [...session.messages, userMessage] }
      }
      return session
    })

    setSessions(updatedSessions)
    setInput('')

    setLoading(true)

    try {
      const reply = await sendMessage(input)
      const botMessage = { sender: 'bot', text: reply }
      const updatedSessionsWithBotReply = updatedSessions.map((session) => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, botMessage] }
        }
        return session
      })

      setSessions(updatedSessionsWithBotReply)
    } catch (error) {
      console.error('Error receiving message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const createNewSession = () => {
    const newSession = { id: sessions.length, messages: [] }
    setSessions([...sessions, newSession])
    setCurrentSessionId(newSession.id)
    setIsMenuOpen(false)
  }

  const switchSession = (id) => {
    setCurrentSessionId(id)
    setIsMenuOpen(false)
  }

  const deleteSession = (id) => {
    if (sessions.length === 1) return
    const updatedSessions = sessions.filter((session) => session.id !== id)
    setSessions(updatedSessions)
    if (currentSessionId === id) {
      setCurrentSessionId(updatedSessions[0].id)
    }
  }

  const currentSession = getCurrentSession()

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">DHINCHAK Assistant</h1>
        <div className="relative">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={toggleMenu}
          >
            Session {currentSessionId + 1}
            <ChevronDown className="w-4 h-4 ml-2 inline" />
          </Button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <div className="py-1">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center px-4 py-2 hover:bg-gray-100">
                      <button
                        className={`flex-grow text-left text-sm ${
                          currentSessionId === session.id
                            ? 'text-cyan-500 font-medium'
                            : 'text-gray-700'
                        }`}
                        onClick={() => switchSession(session.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2 inline" />
                        Session {session.id + 1}
                      </button>
                      {sessions.length > 1 && (
                        <IconButton
                          icon={X}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          aria-label={`Delete session ${session.id + 1}`}
                        />
                      )}
                    </div>
                  ))}
                  <div className="border-t border-gray-100">
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={createNewSession}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Session
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentSession.messages.map((msg, index) => (
              <ChatBubble key={index} sender={msg.sender} text={msg.text} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-lg p-3 flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                  <span className="text-gray-600">DHINCHAK is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white border-t px-6 py-4 flex items-center gap-2 shadow-lg"
          >
            <textarea
              placeholder="Type your message..."
              className="flex-1 rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              className="bg-cyan-500 text-white hover:bg-cyan-600"
              onClick={handleSend}
            >
              <Send className="w-4 h-4 mr-2 inline" /> Send
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}