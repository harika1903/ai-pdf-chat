'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const Message = ({ role, content }: MessageProps) => {
  return (
    <div
      className={cn('mb-3 flex items-start', {
        'justify-end': role === 'user',
      })}
    >
      {/* AI Icon */}
      {role === 'assistant' && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-black text-white">
          <Bot className="h-5 w-5" />
        </div>
      )}

      {/* Message Content */}
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <div className="prose break-words text-sm">
          <ReactMarkdown
            components={{
              p: (props) => <p {...props} className="mb-2 last:mb-0" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* User Icon */}
      {role === 'user' && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-gray-200 text-gray-800">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default Message;