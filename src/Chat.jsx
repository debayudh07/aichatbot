import React, { useState } from 'react';
import { sendMessage } from './Api'; // Assuming Api.js is in the same directory

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput(''); // Clear the input

    setLoading(true);

    try {
      const reply = await sendMessage(input);
      const botMessage = { sender: 'bot', text: reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error receiving message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-black text-cyan-500 py-4 px-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">DHINCHAK Assistant</h1>
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-full p-2 hover:bg-black transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className="sr-only">Toggle chat history</span>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${msg.sender === 'user' ? 'text-muted-foreground' : 'text-cyan-500'}`}>
                <span className="text-sm font-bold">{msg.sender === 'user' ? 'YO' : 'OA'}</span>
              </div>
              <div className="grid gap-1">
                <div className={`font-bold ${msg.sender === 'user' ? 'text-muted-foreground' : 'text-cyan-500'}`}>{msg.sender === 'user' ? 'You' : 'DHINCHAK Assistant'}</div>
                <div className={`prose ${msg.sender === 'user' ? 'text-muted-foreground' : 'text-cyan-500'}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border flex items-center justify-center text-cyan-500">
                <span className="text-sm font-bold">OA</span>
              </div>
              <div className="grid gap-1">
                <div className="font-bold text-cyan-500">DHINCHAK Assistant</div>
                <div className="prose text-cyan-500">
                  <p className="animate-pulse">...</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-background border-t px-6 py-4 flex items-center gap-2">
          <textarea
            placeholder="Type your message..."
            className="flex-1 rounded-md border-neutral-400 shadow-sm p-2"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
