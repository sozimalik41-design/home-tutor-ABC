import React from 'react';
import { Info, CheckCircle2, Clock } from 'lucide-react';

interface PhaseNoticeProps {
  title?: string;
  description?: string;
  phase?: 1 | 2;
  compact?: boolean;
}

export const PhaseNotice: React.FC<PhaseNoticeProps> = ({
  title = 'System Active: Lavender Dream Architecture',
  description = 'This screen demonstrates the production-grade UI and layout structure. Data persistence, tutor records, and schedule workflows are fully integrated.',
  compact = false
}) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F3FF] text-[#4C1D95] rounded-xl text-xs font-semibold border border-[#DDD6FE]">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#4C1D95]" />
        <span>Lavender Dream UI Built</span>
      </div>
    );
  }

  return (
    <div className="bg-[#4C1D95] text-white rounded-2xl p-4 sm:p-5 border border-[#3B0764] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#3B0764] text-[#A78BFA] shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 rounded-md">
              Active Theme
            </span>
          </div>
          <p className="text-xs text-[#DDD6FE] mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#DDD6FE]/80 shrink-0">
        <Clock className="w-4 h-4 text-[#A78BFA]" />
        <span>Lavender Dream Edition</span>
      </div>
    </div>
  );
};
