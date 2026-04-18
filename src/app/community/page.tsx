"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * CommunityPage provides a simple in-app chat experience. Messages are not
 * persisted or shared between users—this is a local demo. In a real
 * implementation you would connect to a WebSocket or real-time database
 * (e.g. Firebase, Supabase) to broadcast messages to other users.
 */
export default function CommunityPage() {
  const [messages, setMessages] = useState<{ user: string; text: string; timestamp: number }[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { user: 'You', text: input.trim(), timestamp: Date.now() }]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="mx-auto max-w-3xl py-16 px-6 flex flex-col h-[75vh]">
      <h1 className="text-3xl font-bold mb-4">Community Chat</h1>
      <div className="flex-1 overflow-y-auto border border-surface-300 rounded-lg p-4 space-y-2 bg-surface-200">
        {messages.length === 0 ? (
          <p className="text-gray-400">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-sm font-medium text-accent-200">{msg.user}</span>
              <span className="text-gray-300">{msg.text}</span>
              <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-lg bg-surface-200 border border-surface-300 px-4 py-2 text-gray-200 focus:outline-none focus:border-accent-200"
          placeholder="Type your message..."
        />
        <Button variant="primary" onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}