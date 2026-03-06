"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

// Add global window extension for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  userImage?: string; // Base64 or URL of image uploaded by user
};

// --- Sub-Component: Image Display with Download Logic ---
const ImageMessage = ({ src, prompt }: { src: string, prompt: string }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchImage = async () => {
      try {
        setLoading(true);
        if (src.startsWith('data:') || src.startsWith('blob:')) {
             setImageSrc(src);
             setLoading(false);
             return;
        }
        const response = await fetch(src);
        if (!response.ok) throw new Error('Failed to load image');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error("Image fetch failed, falling back to direct URL", err);
        setImageSrc(src);
        setLoading(false);
      }
    };
    if (src) fetchImage();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  const handleDownload = async () => {
    if (!imageSrc) return;
    try {
        // Force download
        const a = document.createElement('a');
        a.href = imageSrc;
        a.download = `thulani-ai-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e) {
        window.open(imageSrc, '_blank');
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-3 items-center justify-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-inner h-64 w-64 animate-pulse">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-purple-800/60 text-xs font-medium tracking-wide">Creating Masterpiece...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100 text-red-600 text-sm">
        Image Failed
    </div>
  );

  return (
    <div className="flex flex-col gap-2 group relative max-w-sm">
      <div className="relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageSrc || ""} 
            alt="Generated" 
            className="w-full h-auto object-cover"
            onError={() => setError(true)} 
          />
          {/* Detailed Prompt Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white/90 text-xs line-clamp-3 font-light leading-relaxed">{prompt}</p>
          </div>
          
          <button 
            onClick={handleDownload}
            className="absolute top-3 right-3 bg-white/25 backdrop-blur-md hover:bg-white/40 text-white p-2.5 rounded-full shadow-lg border border-white/20 transition-all opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0"
            title="Download HD Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
      </div>
    </div>
  );
};

// --- Main Chat Interface ---
export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Thulani AI. Ready to chat or create amazing visuals.', type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Vision / File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load/Save History
  useEffect(() => {
    const saved = localStorage.getItem('thulani_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      localStorage.setItem('thulani_chat_history', JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  const clearHistory = () => {
    localStorage.removeItem('thulani_chat_history');
    setMessages([{ role: 'assistant', content: 'History cleared. What would you like to build next?', type: 'text' }]);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, previewUrl]);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMode('chat'); // Switch to chat mode for vision analysis
    }
  };

  const clearImage = () => {
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };
      recognition.start();
    } else {
      alert('Voice input not supported in this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageFile) return;

    const currentInput = input;
    const currentImage = imageFile;
    const currentPreview = previewUrl;
    
    // Reset inputs
    setInput('');
    clearImage(); // Clear image state but keep preview in message
    setIsLoading(true);

    // Add User Message
    const userMessage: Message = { 
        role: 'user', 
        content: currentInput, 
        type: 'text',
        userImage: currentPreview || undefined 
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // --- MODE: CHAT / VISION ---
      if (mode === 'chat') {
        const payload: any = { message: currentInput };
        
        // If image attached, convert to base64 for vision API
        if (currentImage) {
            payload.image = await convertToBase64(currentImage);
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to fetch response');
        
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, type: 'text' }]);

      } else {
        // --- MODE: IMAGE GENERATION ---
        let finalImageUrl = "";
        
        // 1. Try Server Proxy
        try {
             const response = await fetch('/api/generate-image', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ prompt: currentInput }),
             });
             
             if (response.ok) {
                 const blob = await response.blob();
                 finalImageUrl = URL.createObjectURL(blob);
             }
        } catch (e) {
             console.error("Proxy gen failed:", e);
        }

        // 2. Fallback to Backend
        if (!finalImageUrl) {
            const response = await fetch('https://thulani-api-341498038874.us-central1.run.app/api/image/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentInput }),
            });

            if (response.ok) {
                const data = await response.json();
                finalImageUrl = data.url;
            } else {
               throw new Error("Image generation failed.");
            }
        }

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Generated image for: "${currentInput}"`, 
          type: 'image',
          imageUrl: finalImageUrl 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${msg}`, type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* --- Header --- */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/60 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
                T
            </div>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 tracking-tight">Thulani AI</h1>
                <p className="text-xs text-slate-500 font-medium">Vision & Creative Suite</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
             {/* Mode Toggle Capsule */}
             <div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200 shadow-inner">
                <button
                    onClick={() => setMode('chat')}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    mode === 'chat' 
                        ? 'bg-white shadow text-blue-600 transform scale-105' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setMode('image')}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    mode === 'image' 
                        ? 'bg-white shadow text-purple-600 transform scale-105' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Create
                </button>
             </div>

             {messages.length > 1 && (
                <button 
                  onClick={clearHistory} 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Clear Conversation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
             )}
        </div>
      </header>

      {/* --- Chat Area --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.map((msg, index) => (
          <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Name Label */}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    {msg.role === 'user' ? 'You' : 'Thulani'}
                </span>

                {/* Message Bubble */}
                <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-md'
                }`}>
                    {/* Display User Uploaded Image if exists */}
                    {msg.userImage && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-white/20 shadow-md">
                            <img src={msg.userImage} alt="Uploaded" className="w-full h-auto max-h-60 object-cover" />
                        </div>
                    )}
                    
                    {/* Display AI Image or Text */}
                    {msg.type === 'image' && msg.imageUrl ? (
                        <ImageMessage src={msg.imageUrl} prompt={msg.content.replace('Generated image for: ', '')} />
                    ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start w-full">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${mode === 'chat' ? 'bg-blue-400' : 'bg-purple-400'}`} style={{ animationDelay: '0s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${mode === 'chat' ? 'bg-blue-500' : 'bg-purple-500'}`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${mode === 'chat' ? 'bg-blue-600' : 'bg-purple-600'}`} style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* --- Footer / Start Input --- */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
            
            {/* Image Preview Thumbnail */}
            {previewUrl && (
                <div className="mb-3 relative inline-block group animate-in fade-in slide-in-from-bottom-2">
                    <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200 shadow-md" />
                    <button 
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative group">
                {/* Floating Input Container */}
                <div className={`
                    flex items-center gap-2 p-2 rounded-2xl border shadow-lg transition-all duration-300
                    ${isListening ? 'border-red-400 ring-4 ring-red-50 bg-red-50/10' : 'border-slate-200 bg-white focus-within:ring-4 focus-within:ring-blue-50/50 focus-within:border-blue-300'}
                `}>
                    
                    {/* Upload Button */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Upload Image for Analysis"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>

                    {/* Text Input */}
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            isListening ? "Listening..." : 
                            mode === 'chat' && previewUrl ? "Ask about this image..." :
                            mode === 'chat' ? "Ask anything..." : 
                            "Describe an image to create..."
                        }
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 text-base py-2"
                        disabled={isLoading}
                    />

                    {/* Voice Button */}
                    <button
                        type="button"
                        onClick={startListening}
                        className={`p-3 rounded-xl transition-all ${
                            isListening 
                            ? 'text-red-500 bg-red-100 animate-pulse' 
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    </button>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={isLoading || (!input.trim() && !imageFile)}
                        className={`p-3 rounded-xl text-white shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${
                            mode === 'chat' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
                
                <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                    Powered by Llama 3 Vision & Stable Diffusion XL
                </p>
            </form>
        </div>
      </div>
    </div>
  );
}
