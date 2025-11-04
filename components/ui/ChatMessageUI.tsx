import React from 'react';
import type { ChatMessage } from '../../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageUIProps {
  message?: ChatMessage;
  isLoading?: boolean;
}

const ChatMessageUI: React.FC<ChatMessageUIProps> = ({ message, isLoading }) => {
  const role = message?.role ?? 'assistant';
  const content = message?.content ?? '';

  if (isLoading) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          AI
        </div>
        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${role === 'user' ? 'justify-end' : ''}`}>
      {role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          AI
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${
          role === 'user'
            ? 'bg-brand-purple text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="text-sm prose prose-sm max-w-none">
             <MarkdownRenderer content={content} />
        </div>
      </div>
      {role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-brand-purple-dark font-bold text-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
};

export default ChatMessageUI;