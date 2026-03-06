# Integrating Thulani AI into AutoPromote

Since AutoPromote is built with React/Next.js, the easiest way to add the full Thulani AI interface is by using a **Floating Widget Component**.

This approach keeps your main app clean while embedding the full power of Thulani AI (Vision, Chat, Image Generation) via an isolated frame.

## Step 1: Create the Widget Component

Create a new file in your **AutoPromote** project at `components/ThulaniChatWidget.tsx` and paste the following code:

```tsx
"use client";

import { useState } from 'react';

export default function ThulaniChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // The deployed URL of your Thulani AI Frontend
  const AI_URL = "https://thulani-frontend-341498038874.us-central1.run.app";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      
      {/* Chat Window Implementation */}
      {isOpen && (
        <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-10">
          <iframe 
            src={AI_URL}
            className="w-full h-full border-0"
            title="Thulani AI Assistant"
            allow="microphone; camera; clipboard-write"
          />
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-purple-500/30'
        }`}
      >
        {isOpen ? (
          // Close Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Chat Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
```

## Step 2: Add to Your App Layout

In your **AutoPromote** project, open your root layout file (usually `app/layout.tsx` or `pages/_app.tsx`) and add the widget:

```tsx
import ThulaniChatWidget from '@/components/ThulaniChatWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Add the AI Widget here so it appears on all pages */}
        <ThulaniChatWidget />
        
      </body>
    </html>
  );
}
```

## Why This Method?
1. **Zero Conflicts**: The AI runs in its own isolated environment, so its styles (Tailwind v4) won't break your main app's styles.
2. **Instant Updates**: Any changes you deploy to Thulani AI (like new models) automatically appear in AutoPromote without redeploying AutoPromote.
3. **Performance**: The heavy AI frontend is only loaded when the user opens the chat widget.

---

## 🤖 Prompt for GitHub Copilot (Copy & Paste)

If you use GitHub Copilot in your AutoPromote workspace, just copy and paste this prompt into the chat window to have it do the work for you:

> I have an external AI service deployed at `https://thulani-frontend-341498038874.us-central1.run.app` that I want to integrate into this Next.js app as a floating chat widget.
>
> Please perform the following:
> 1. Create a new component `components/ThulaniChatWidget.tsx` that renders a floating button in the bottom-right corner.
> 2. When clicked, it should toggle an iframe pointing to the AI service URL.
> 3. Use Tailwind CSS for styling (glassmorphism effect, smooth animations).
> 4. Add the component to my `app/layout.tsx` (or root layout) so it appears globally.
>
> Here is the component reference code:
> ```tsx
> "use client";
> import { useState } from 'react';
> 
> export default function ThulaniChatWidget() {
>   const [isOpen, setIsOpen] = useState(false);
>   const AI_URL = "https://thulani-frontend-341498038874.us-central1.run.app";
> 
>   return (
>     <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
>       {isOpen && (
>         <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-10">
>           <iframe 
>             src={AI_URL}
>             className="w-full h-full border-0"
>             title="Thulani AI Assistant"
>             allow="microphone; camera; clipboard-write"
>           />
>         </div>
>       )}
>       <button
>         onClick={() => setIsOpen(!isOpen)}
>         className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 text-white ${
>           isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-blue-600 to-purple-600'
>         }`}
>       >
>         {isOpen ? "✕" : "💬"}
>       </button>
>     </div>
>   );
> }
> ```

---

## 🛠️ Advanced Integration Tips

### 1. Mobile Responsiveness
On mobile devices, a 400px wide widget might be too large. You can make it fullscreen on small screens by updating the container class:

```tsx
// Change the outer div className:
<div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 
  ${isOpen ? 'w-full h-full md:w-[400px] md:h-[600px] bottom-0 right-0' : ''}`}
>
```

### 2. Passing User Context (Optional)
If you want Thulani AI to know which user is chatting, you can pass their ID in the URL params:

```tsx
// Inside your component
const { user } = useAuth(); // Assuming you have an auth hook
const AI_URL = `https://thulani-frontend-341498038874.us-central1.run.app?userId=${user?.id}`;
```
*Note: You would need to update the Thulani AI backend to read this parameter.*

### 3. Troubleshooting "Refused to Connect"
If you see a blank white box or an error saying "refused to connect", it means your AutoPromote platform has a strict **Content Security Policy (CSP)**.
You may need to add this to your `next.config.js` or server headers in AutoPromote:

```javascript
// AutoPromote Security Headers
{
  key: 'Content-Security-Policy',
  value: "frame-src 'self' https://thulani-frontend-341498038874.us-central1.run.app;"
}
```

