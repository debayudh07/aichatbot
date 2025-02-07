"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { sendMessage } from "./Api"
import { Send, Loader2 } from "lucide-react"

const IconButton = ({ icon: Icon, onClick, className = "", ...props }) => (
  <button className={`p-2 rounded-full transition-all duration-200 ${className}`} onClick={onClick} {...props}>
    <Icon className="w-5 h-5" />
  </button>
)

const ChatBubble = ({ sender, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className={`flex items-start gap-2 ${sender === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[80%] rounded-2xl p-3 backdrop-blur-md ${
        sender === "user" ? "bg-blue-500/40 text-white" : "bg-gray-800/40 text-gray-200"
      }`}
    >
      <p className="text-sm">
        {sender === "user" ? "🧑 " : "🤖 "}
        {text}
      </p>
    </div>
  </motion.div>
)

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, []) // Updated dependency array

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { sender: "user", text: input }
    setMessages([...messages, userMessage])
    setInput("")
    setLoading(true)

    try {
      const reply = await sendMessage(input)
      const botMessage = { sender: "bot", text: reply }
      setMessages((prevMessages) => [...prevMessages, botMessage])
    } catch (error) {
      console.error("Error receiving message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800">
          <header className="bg-gray-800/50 backdrop-blur-md py-4 px-6 rounded-t-3xl">
            <h1 className="text-2xl font-bold">Dark Glassmorphic Chat 💬</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <ChatBubble key={index} sender={msg.sender} text={msg.text} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-gray-300">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-800/50 backdrop-blur-md border-t border-gray-700 px-6 py-4 rounded-b-3xl flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 rounded-full border border-gray-700 bg-gray-900/50 backdrop-blur-sm shadow-inner px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              icon={Send}
              onClick={handleSend}
              className="bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
              aria-label="Send message"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

