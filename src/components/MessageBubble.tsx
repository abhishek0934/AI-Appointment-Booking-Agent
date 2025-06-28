import React from 'react';
import { Message } from '../types/booking';
import { Bot, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
          }`}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
        }`}>
          {/* Message text */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-400'
          }`}>
            {format(message.timestamp, 'h:mm a')}
          </div>

          {/* Speech bubble tail */}
          <div className={`absolute top-3 w-0 h-0 ${
            isUser
              ? 'right-0 border-l-8 border-l-blue-600 border-t-4 border-t-transparent border-b-4 border-b-transparent'
              : 'left-0 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;