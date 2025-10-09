// ChatComponent.tsx

'use client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import * as React from 'react';

// Interfaces (no changes needed here)
interface Doc {
  pageContent?: string;
  metadata?: { // Corrected typo from metdata to metadata
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}
interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}



const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Effect to scroll to the bottom when new messages are added
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    // Add user message to state immediately
    const userMessage: IMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage(''); // Clear the input field

    // Fetch assistant's response
    try {
      const res = await fetch(`http://localhost:8000/chat?message=${message}`);
      const data = await res.json();
      
      const assistantMessage: IMessage = {
        role: 'assistant',
        content: data?.message,
        documents: data?.docs,
      };

      // Add assistant message to state
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to fetch chat response:", error);
      const errorMessage: IMessage = {
        role: 'assistant',
        content: 'Sorry, I ran into an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendChatMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-50">
      {/* Chat Messages Area */}
      <div className="flex-grow overflow-y-auto mb-20">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            } mb-4`}
          >
            <div
              className={`max-w-xl p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {/* Optionally display documents from the assistant */}
              {msg.role === 'assistant' && msg.documents && (
                <div className="mt-2 p-2 border-t border-gray-300">
                  <h4 className="font-bold text-sm mb-1">Sources:</h4>
                  {msg.documents.map((doc, i) => (
                    <div key={i} className="text-xs p-1 bg-gray-100 rounded mb-1">
                      <p>Page {doc.metadata?.loc?.pageNumber || 'N/A'}: "{doc.pageContent?.substring(0, 50)}..."</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Empty div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="flex items-center max-w-3xl mx-auto gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress} // Allow sending with Enter key
            placeholder="Type your message here..."
            className="flex-grow"
          />
          <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;