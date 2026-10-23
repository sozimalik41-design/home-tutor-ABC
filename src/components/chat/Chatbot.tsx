import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  GraduationCap, 
  Check, 
  AlertCircle,
  Minimize2,
  ChevronDown,
  BrainCircuit,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatQuickPrompts } from './ChatQuickPrompts';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg-001',
  role: 'assistant',
  content: `Hello! 👋 Welcome to **Home Tutor AI Assistant**.\n\nI can assist you with:\n- **Finding Verified Tutors:** Mathematics, Physics, Chemistry, English, Coding, and Primary Education.\n- **Appointment Booking:** Scheduling a free trial class or regular home tutor visits.\n- **Academic Assistance:** Explaining complex topics in Maths, Science, and Grammar step-by-step in clear, simple terms.\n\nFeel free to ask any question or choose one of the suggested prompts below:`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  status: 'sent',
  suggestedActions: [
    { label: 'Browse All Tutors', href: '/tutors' },
    { label: 'Book Trial Class', href: '/book-appointment' }
  ]
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = chatService.loadStoredMessages();
    return stored.length > 0 ? stored : [INITIAL_WELCOME_MESSAGE];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      // Auto-focus input after opening
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Persist messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      chatService.saveStoredMessages(messages);
    }
  }, [messages]);

  // Handle escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setError(null);
    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp,
      status: 'sending'
    };

    // Append user message immediately
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call server API (/api/chat)
      const response = await chatService.sendMessage(text, updatedMessages);

      // Mark user message as sent
      setMessages(prev => 
        prev.map(m => m.id === userMsgId ? { ...m, status: 'sent' } : m)
      );

      const botMsgId = `bot-${Date.now()}`;
      const newBotMessage: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        thinking: response.thinking,
        suggestedActions: response.suggestedActions
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to send message. Please try again.');
      // Mark user message as error
      setMessages(prev => 
        prev.map(m => m.id === userMsgId ? { ...m, status: 'error' } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (msgId: string) => {
    const failedMsg = messages.find(m => m.id === msgId);
    if (failedMsg) {
      handleSendMessage(failedMsg.content);
    }
  };

  const handleClearChat = () => {
    chatService.clearStoredMessages();
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setShowClearConfirm(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Home Tutor AI Assistant"
            className="group relative flex items-center gap-3 bg-[#4C1D95] hover:bg-[#3B0764] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl border-2 border-[#A78BFA] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {/* Glowing pulse ring */}
            <span className="absolute -inset-1 rounded-full bg-[#A78BFA] opacity-30 blur-sm group-hover:opacity-50 animate-pulse pointer-events-none" />

            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#3B0764] text-[#A78BFA] border border-[#DDD6FE]/40">
              <Bot className="w-5 h-5 text-[#A78BFA]" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#A78BFA] rounded-full border-2 border-[#4C1D95] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-bold leading-tight flex items-center gap-1.5 text-white">
                Chat with Tutor AI
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40">
                  Thinking Mode
                </span>
              </span>
              <span className="text-[11px] text-[#DDD6FE]">
                Available 24/7 • Instant Help
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Responsive Chat Panel Window */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 flex flex-col justify-end items-end max-w-full sm:max-w-[430px] w-full">
          {/* Chat Container */}
          <div className="w-full h-[88vh] sm:h-[600px] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4C1D95] to-[#3B0764] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#3B0764] shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#3B0764] border border-[#A78BFA] text-[#A78BFA] flex items-center justify-center shadow-xs">
                    <GraduationCap className="w-5 h-5 text-[#A78BFA]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#A78BFA] border-2 border-[#4C1D95] rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-wide text-white">
                      Home Tutor AI
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 font-medium">
                      Gemini 4 Thinking
                    </span>
                  </div>
                  <p className="text-[11px] text-[#DDD6FE] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
                    Verified Tutors • Homework Helper
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Clear Chat Confirmation Trigger */}
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  title="Clear conversation"
                  aria-label="Clear chat conversation"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Minimize / Close */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat window"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clear Chat Confirmation Modal */}
            {showClearConfirm && (
              <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-between text-xs text-amber-900 shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Clear conversation history?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-2xs cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Thinking Mode Sub-header banner */}
            <div className="bg-[#F5F3FF] border-b border-[#DDD6FE] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#4C1D95] shrink-0">
              <span className="flex items-center gap-1 font-medium">
                <BrainCircuit className="w-3.5 h-3.5 text-[#4C1D95]" />
                High-reasoning academic & booking assistance
              </span>
              <span className="text-[10px] text-[#6B7280] font-mono">
                Urdu / English
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 bg-[#F5F3FF]/40 space-y-1">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onRetry={handleRetry}
                  onActionClick={() => {
                    // On mobile, close chat when clicking a major action link to navigate smoothly
                    if (window.innerWidth < 640) {
                      setIsOpen(false);
                    }
                  }}
                />
              ))}

              {/* Quick Suggested Prompts (shown when only initial welcome message is present) */}
              {messages.length <= 1 && (
                <div className="mt-2 pt-2 border-t border-[#DDD6FE]">
                  <ChatQuickPrompts
                    onSelectPrompt={(prompt) => handleSendMessage(prompt)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Typing / Thinking Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 my-3 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-xl bg-[#4C1D95] border border-[#A78BFA] text-[#A78BFA] flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 animate-spin text-[#A78BFA]" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs border border-[#DDD6FE] flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#4C1D95] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#3B0764] animate-bounce" />
                    </div>
                    <span className="text-xs text-[#6B7280] font-medium ml-1">
                      Tutor AI is thinking deeply...
                    </span>
                  </div>
                </div>
              )}

              {/* Error banner with retry */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 my-2 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      className="mt-1 text-red-800 underline font-semibold flex items-center gap-1 hover:text-red-900 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Retry request
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips above input if more messages exist */}
            {messages.length > 1 && !isLoading && (
              <div className="px-3 pt-2 pb-1 bg-white border-t border-[#DDD6FE] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Mujhe Maths ka tutor chahiye.')}
                  className="shrink-0 text-[11px] bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 hover:text-[#4C1D95] border border-[#DDD6FE] rounded-full px-2.5 py-1 text-[#1F2937] cursor-pointer transition-colors"
                >
                  Maths Tutor
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Appointment kaise book karun?')}
                  className="shrink-0 text-[11px] bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 hover:text-[#4C1D95] border border-[#DDD6FE] rounded-full px-2.5 py-1 text-[#1F2937] cursor-pointer transition-colors"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Fractions ko asaan alfaaz mein samjhao.')}
                  className="shrink-0 text-[11px] bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 hover:text-[#4C1D95] border border-[#DDD6FE] rounded-full px-2.5 py-1 text-[#1F2937] cursor-pointer transition-colors"
                >
                  Explain Fractions
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Meri class ka schedule kaise dekhoon?')}
                  className="shrink-0 text-[11px] bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 hover:text-[#4C1D95] border border-[#DDD6FE] rounded-full px-2.5 py-1 text-[#1F2937] cursor-pointer transition-colors"
                >
                  My Schedule
                </button>
              </div>
            )}

            {/* Input Box */}
            <div className="p-3 bg-white border-t border-[#DDD6FE] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2 bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-1.5 focus-within:border-[#4C1D95] focus-within:ring-2 focus-within:ring-[#A78BFA]/30 transition-all"
              >
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sawaal poochein (Urdu, Roman Urdu, English)..."
                  rows={1}
                  maxLength={1500}
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-[#1F2937] placeholder-[#6B7280] focus:outline-none resize-none max-h-28 overflow-y-auto disabled:opacity-60"
                  style={{ minHeight: '36px' }}
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send Message"
                  className="w-9 h-9 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4 font-bold" />
                </button>
              </form>

              {/* Bottom footer status */}
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                  Powered by Gemini Thinking Mode
                </span>
                <span>{inputMessage.length}/1500</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
