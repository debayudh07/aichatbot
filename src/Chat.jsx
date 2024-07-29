import React, { useState } from 'react';
import { sendMessage } from './Api'; // Assuming Api.js is in the same directory

export default function Chat() {
  const [sessions, setSessions] = useState([{ id: 0, messages: [] }]);
  const [currentSessionId, setCurrentSessionId] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getCurrentSession = () => sessions.find((session) => session.id === currentSessionId);

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { sender: 'user', text: input };
    const updatedSessions = sessions.map((session) => {
      if (session.id === currentSessionId) {
        return { ...session, messages: [...session.messages, userMessage] };
      }
      return session;
    });

    setSessions(updatedSessions);
    setInput(''); // Clear the input

    setLoading(true);

    try {
      const reply = await sendMessage(input);
      const botMessage = { sender: 'bot', text: reply };
      const updatedSessionsWithBotReply = updatedSessions.map((session) => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, botMessage] };
        }
        return session;
      });

      setSessions(updatedSessionsWithBotReply);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const createNewSession = () => {
    const newSession = { id: sessions.length, messages: [] };
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const switchSession = (id) => {
    setCurrentSessionId(id);
    setIsMenuOpen(false); // Close the menu on switch
  };

  const deleteSession = (id) => {
    if (sessions.length === 1) return; // Prevent deleting the last session
    const updatedSessions = sessions.filter((session) => session.id !== id);
    setSessions(updatedSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(updatedSessions[0].id); // Switch to the first session if the current was deleted
    }
  };

  const currentSession = getCurrentSession();

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-black text-cyan-500 py-4 px-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">DHINCHAK Assistant</h1>
        <div className="flex items-center gap-2">
          <button
            className="bg-white rounded-full p-2 hover:bg-black transition-colors"
            onClick={toggleMenu}
          >
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
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        {isMenuOpen && (
          <aside className="bg-gray-100 w-64 p-4 border-r overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Chat Sessions</h2>
            <ul>
              {sessions.map((session) => (
                <li key={session.id} className="mb-2 flex justify-between items-center">
                  <button
                    className={`font-bold ${currentSessionId === session.id ? 'text-cyan-500' : ''}`}
                    onClick={() => switchSession(session.id)}
                  >
                    Session {session.id + 1}
                  </button>
                  <button
                    className="ml-2 text-red-500"
                    onClick={() => deleteSession(session.id)}
                    disabled={sessions.length === 1}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={createNewSession}
            >
              New Session
            </button>
          </aside>
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentSession.messages.map((msg, index) => (
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
    </div>
  );
}
