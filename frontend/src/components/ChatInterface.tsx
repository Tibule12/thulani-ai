"use client";

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Thulani AI. I can help you with text and generate images.', type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Reset input immediately
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content: currentInput, type: 'text' };
    setMessages(prev => [...prev, userMessage]);

    try {
      if (mode === 'chat') {
        const response = await fetch('https://thulani-api-341498038874.us-central1.run.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Failed to fetch response';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        const aiMessage: Message = { role: 'assistant', content: data.response, type: 'text' };
        setMessages(prev => [...prev, aiMessage]);

      } else {
        // Image Mode
        const response = await fetch('https://thulani-api-341498038874.us-central1.run.app/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: currentInput }),
        });

        if (!response.ok) {
           const errorText = await response.text();
           throw new Error(errorText || 'Failed to generate image');
        }

        const data = await response.json();
        // data.url is returned by image_router.py
        const aiMessage: Message = { 
          role: 'assistant', 
          content: `Generated image for: "${currentInput}"`, 
          type: 'image',
          imageUrl: data.url 
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}`, type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-white text-gray-900 border-x border-gray-100 shadow-xl">
      <header className="mb-4 pb-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thulani AI</h1>
          <p className="text-gray-500 text-sm">Powered by Llama 3 & Stable Diffusion</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setMode('chat')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              mode === 'chat' 
                ? 'bg-white shadow text-blue-600 font-bold' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMode('image')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              mode === 'image' 
                ? 'bg-white shadow text-purple-600 font-bold' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
          >
            Image
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {msg.type === 'image' && msg.imageUrl ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-500 mb-1">{msg.content}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.imageUrl} alt="Generated" className="rounded-lg max-w-full border border-gray-200" />
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`bg-white text-gray-800 border border-gray-200 shadow-sm rounded-lg p-3 ${
              mode === 'image' ? 'animate-pulse text-purple-600' : 'animate-pulse text-blue-600'
            }`}>
              {mode === 'chat' ? 'Thinking...' : 'Dreaming up an image...'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 sticky bottom-0 bg-white pt-2 pb-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'chat' ? "Type a message..." : "Describe an image to generate..."}
          disabled={isLoading}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors shadow-md ${
            mode === 'chat' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isLoading ? '...' : (mode === 'chat' ? 'Send' : 'Generate')}
        </button>
      </form>
    </div>
  );
}
