import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatMessage } from '../../types/chat';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  ExternalLink, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  Calendar
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  onActionClick?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  onActionClick
}) => {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown renderer for bold, lists, headers, and code
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Empty line -> spacing
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Headers (### or ## or #)
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-[#1F2937] text-sm mt-2 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={idx} className="font-bold text-[#1F2937] text-base mt-2 mb-1">
            {line.replace(/^#+\s*/, '')}
          </h3>
        );
      }

      // Bullet lists (- or *)
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.replace(/^[-*]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 text-xs md:text-sm pl-1 my-0.5">
            <span className="text-[#A78BFA] font-bold shrink-0 mt-0.5 leading-none">•</span>
            <span className="text-[#1F2937] leading-relaxed">{formatInline(itemText)}</span>
          </div>
        );
      }

      // Numbered lists (1. or 2.)
      const numMatch = line.match(/^(\d+)\.\s*(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs md:text-sm pl-1 my-0.5">
            <span className="font-bold text-[#4C1D95] shrink-0 text-xs mt-0.5">
              {numMatch[1]}.
            </span>
            <span className="text-[#1F2937] leading-relaxed">{formatInline(numMatch[2])}</span>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-xs md:text-sm leading-relaxed my-0.5 text-[#1F2937]">
          {formatInline(line)}
        </p>
      );
    });
  };

  // Format bold (**text**), italics (*text*), and code (`code`)
  const formatInline = (text: string) => {
    // Split by bold (**...**)
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#1F2937]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-[#F5F3FF] border border-[#DDD6FE] px-1 py-0.5 rounded text-[11px] font-mono text-[#4C1D95]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 my-2.5">
        <div className="max-w-[85%] flex flex-col items-end">
          <div className="bg-[#4C1D95] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-sm text-xs md:text-sm leading-relaxed border border-[#3B0764]">
            <p className="whitespace-pre-wrap select-text">{message.content}</p>
          </div>

          <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-[#6B7280]">
            <span>{message.timestamp}</span>
            {message.status === 'error' && (
              <span className="text-red-500 font-medium flex items-center gap-1">
                • Failed
                {onRetry && (
                  <button 
                    onClick={() => onRetry(message.id)}
                    className="underline hover:text-red-600 flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Retry
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[#4C1D95] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 my-3">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-[#4C1D95] border border-[#A78BFA] text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 max-w-[88%]">
        {/* Thinking Accordion if thinking mode was active */}
        {message.thinking && (
          <div className="mb-2 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-2.5 text-xs text-[#1F2937]">
            <button
              type="button"
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center justify-between w-full font-medium text-[#4C1D95] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-[#4C1D95]" />
                <span>Thinking Process (High Reasoning)</span>
              </span>
              {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showThinking && (
              <div className="mt-2 pt-2 border-t border-[#DDD6FE] text-[11px] text-[#6B7280] leading-relaxed font-mono whitespace-pre-wrap">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-[#DDD6FE] text-[#1F2937] relative group">
          <div className="space-y-1">
            {renderFormattedContent(message.content)}
          </div>

          {/* Copy button */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#DDD6FE]/60 text-[11px] text-[#6B7280]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
              Home Tutor AI • {message.timestamp}
            </span>

            <button
              onClick={handleCopy}
              type="button"
              title="Copy response"
              className="p-1 hover:text-[#4C1D95] hover:bg-[#F5F3FF] rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#4C1D95]" />
                  <span className="text-[10px] text-[#4C1D95] font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggested Actions (e.g. direct buttons to book or view tutors) */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestedActions.map((action, i) => (
              <Link
                key={i}
                to={action.href}
                onClick={onActionClick}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5F3FF] hover:bg-[#DDD6FE]/60 text-[#4C1D95] border border-[#DDD6FE] hover:border-[#A78BFA] rounded-xl px-2.5 py-1.5 transition-all shadow-2xs hover:shadow-xs"
              >
                <Calendar className="w-3 h-3 text-[#4C1D95]" />
                <span>{action.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#6B7280]" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
