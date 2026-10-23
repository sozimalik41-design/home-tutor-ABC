import React from 'react';
import { Sparkles, Calculator, Calendar, BookOpen, Clock } from 'lucide-react';

interface ChatQuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const SUGGESTED_QUESTIONS = [
  {
    text: 'I need an experienced Maths tutor.',
    icon: Calculator,
    category: 'Find Tutor',
    language: 'English'
  },
  {
    text: 'How do I book a trial tutoring session?',
    icon: Calendar,
    category: 'Booking Help',
    language: 'English'
  },
  {
    text: 'Explain algebraic fractions in simple terms.',
    icon: BookOpen,
    category: 'Academic Concept',
    language: 'English'
  },
  {
    text: 'How do I check tutor schedules and fees?',
    icon: Clock,
    category: 'Schedule',
    language: 'English'
  }
];

export const ChatQuickPrompts: React.FC<ChatQuickPromptsProps> = ({
  onSelectPrompt,
  disabled = false
}) => {
  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-1">
        <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
        <span>Suggested Questions</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {SUGGESTED_QUESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(item.text)}
              className="text-left text-xs bg-[#F5F3FF] hover:bg-[#DDD6FE]/40 hover:text-[#1F2937] border border-[#DDD6FE] hover:border-[#A78BFA] transition-all duration-150 rounded-xl px-3 py-2 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white border border-[#DDD6FE] flex items-center justify-center text-[#4C1D95] group-hover:text-[#3B0764] group-hover:border-[#A78BFA] shadow-2xs">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[#1F2937]">
                  {item.text}
                </span>
              </div>
              <span className="text-[10px] text-[#6B7280] font-mono group-hover:text-[#4C1D95] ml-2 shrink-0">
                {item.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
