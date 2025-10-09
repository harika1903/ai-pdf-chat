'use client';

import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../app/components/ui/input';
import { Button } from '../app/components/ui/button';
import Message from '../app/components/message'; // We will create this component next

// Define the shape of a message for TypeScript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatComponent = () => {
  // Log #1: Confirm the component is rendering
  console.log("--- 1. ChatComponent has rendered. ---");

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Log #2: Confirm the form submission is working
    console.log("--- 2. handleSubmit called with input:", input, "---");

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Log #3: Confirm we are about to call the backend
      console.log("--- 3. Calling backend API at /api/chat... ---");

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }), // Send the user's message
      });
      
      // Log #4: Log the raw API response
      console.log("--- 4. Backend response received:", response, "---");

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log #5: Log the parsed JSON data from the backend
      console.log("--- 5. Parsed JSON data from backend:", data, "---");

      // IMPORTANT: Make sure the key 'aiResponse' matches what your backend sends
      const aiMessageContent = data.aiResponse || data.message || "Sorry, I couldn't get a response.";

      const aiMessage: Message = {
        role: 'assistant',
        content: aiMessageContent,
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      // Log #6: If anything fails, this will catch it
      console.error("--- ❌ 6. CRITICAL FAILURE in handleSubmit ❌ ---", error);
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, an error occurred. Please check the console.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-h-screen overflow-hidden" id="chat">
      <div
        ref={messageContainerRef}
        className="absolute top-0 inset-x-0 p-3 overflow-y-auto"
        style={{ height: 'calc(100% - 4rem)' }}
      >
        {messages.map((m, index) => (
          <Message key={index} role={m.role} content={m.content} />
        ))}
        {isLoading && (
          <div className="text-center p-4">
            <p className="text-gray-500">AI is thinking...</p>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="absolute bottom-0 inset-x-0 px-2 py-4 bg-white border-t"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question..."
            className="w-full"
            disabled={isLoading}
          />
          <Button className="bg-blue-600 ml-2" type="submit" disabled={isLoading}>
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;