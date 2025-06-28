import React, { useState, useRef, useEffect } from 'react';
import { Send, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Message } from '../types/booking';
import { ConversationEngine } from '../utils/conversationEngine';
import MessageBubble from './MessageBubble';
import TimeSlotSelector from './TimeSlotSelector';
import TypingIndicator from './TypingIndicator';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [engine] = useState(() => new ConversationEngine());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Send initial greeting
    const welcomeMessage: Message = {
      id: 'welcome',
      content: 'Hello! I\'m your AI appointment booking assistant. I can help you schedule meetings and check availability. Try saying something like "Book a meeting tomorrow at 2 PM" or "Do you have anything free next Friday?"',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const responses = await engine.processMessage(inputValue);
      
      setIsTyping(false);
      
      // Add responses with slight delays for natural feel
      for (let i = 0; i < responses.length; i++) {
        setTimeout(() => {
          setMessages(prev => [...prev, responses[i]]);
        }, i * 300);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTimeSlotSelect = (slotId: string) => {
    const slot = messages
      .flatMap(m => m.data?.slots || [])
      .find((s: any) => s.id === slotId);
    
    if (slot) {
      handleSendMessage();
      setInputValue(slot.startTime);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Booking Assistant</h1>
            <p className="text-sm text-gray-500">Smart appointment scheduling</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {message.type === 'time-slots' && (
              <TimeSlotSelector
                slots={message.data?.slots || []}
                onSelect={handleTimeSlotSelect}
              />
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (e.g., 'Book a meeting tomorrow at 2 PM')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Try: "Book a meeting tomorrow at 2 PM" • "What's available next Friday?" • "Schedule for next Monday morning"
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;