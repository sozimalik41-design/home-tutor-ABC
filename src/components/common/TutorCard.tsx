import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tutor } from '../../types';
import { Star, ShieldCheck, MapPin, GraduationCap, ArrowRight, User } from 'lucide-react';

interface TutorCardProps {
  tutor: Tutor;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#DDD6FE] hover:border-[#A78BFA] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Card Area */}
      <div className="p-6">
        
        {/* Header: Avatar, Name, Verification, Rating */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {imageError || !tutor.avatar ? (
              <div className="w-16 h-16 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#4C1D95] font-bold text-lg">
                <User className="w-8 h-8 text-[#A78BFA]" />
              </div>
            ) : (
              <img
                src={tutor.avatar}
                alt={tutor.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-16 h-16 rounded-2xl object-cover border border-[#DDD6FE] group-hover:scale-105 transition-transform duration-200"
              />
            )}
            {tutor.verified && (
              <span 
                className="absolute -bottom-1 -right-1 bg-[#4C1D95] text-[#A78BFA] p-1 rounded-full border-2 border-white shadow-xs" 
                title="Verified & Background Checked"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link 
                to={`/tutors/${tutor.id}`}
                className="font-bold text-[#1F2937] hover:text-[#4C1D95] transition-colors text-base truncate block"
              >
                {tutor.name}
              </Link>
              
              <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-[#1F2937] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="tabular-nums">{tutor.rating.toFixed(1)}</span>
                <span className="text-[#6B7280] font-normal">({tutor.reviewCount})</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <p className="text-xs text-[#6B7280] font-medium">
                {tutor.title}
              </p>
              {tutor.gender && tutor.gender !== 'Prefer not to say' && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                  tutor.gender === 'Female' 
                    ? 'bg-rose-50 text-rose-700 border-rose-200/80' 
                    : 'bg-[#F5F3FF] text-[#4C1D95] border-[#DDD6FE]'
                }`}>
                  {tutor.gender} Educator
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
              <span className="truncate">{tutor.university}</span>
            </div>
          </div>
        </div>

        {/* Qualification & Bio snippet */}
        <div className="mt-4 pt-3.5 border-t border-[#DDD6FE]/60">
          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
            {tutor.bio}
          </p>
        </div>

        {/* Subjects list */}
        <div className="mt-4">
          <div className="text-[11px] font-bold text-[#4C1D95] uppercase tracking-wider mb-1.5">
            Key Subjects
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 3).map((subj, idx) => (
              <span 
                key={idx}
                className="text-xs font-medium text-[#4C1D95] bg-[#F5F3FF] px-2.5 py-1 rounded-lg border border-[#DDD6FE]/60"
              >
                {subj}
              </span>
            ))}
            {tutor.subjects.length > 3 && (
              <span className="text-xs text-[#6B7280] px-1 py-1">
                +{tutor.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Location & Teaching Mode */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280]">
          <div className="flex items-center gap-1 truncate max-w-[210px]">
            <MapPin className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
            <span className="truncate" title={`${tutor.cities.join(', ')}${tutor.teachingArea ? ` • ${tutor.teachingArea}` : ''}`}>
              {tutor.cities.slice(0, 2).join(', ')}{tutor.teachingArea ? ` (${tutor.teachingArea})` : ''}
            </span>
          </div>
          <div className="font-medium text-[#1F2937]">
            {tutor.mode.join(' · ')}
          </div>
        </div>

      </div>

      {/* Footer Rate and Actions */}
      <div className="px-6 py-4 bg-[#F5F3FF] border-t border-[#DDD6FE] flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-[#6B7280] font-medium block">Tuition rate</span>
          <div className="text-base font-extrabold text-[#1F2937] tabular-nums">
            {tutor.currency}{tutor.hourlyRate}
            <span className="text-xs font-normal text-[#6B7280]">/hr</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/tutors/${tutor.id}`}
            className="px-3 py-2 text-xs font-semibold text-[#4C1D95] hover:text-[#3B0764] hover:bg-white rounded-xl transition-colors whitespace-nowrap"
          >
            Profile
          </Link>

          <Link
            to={`/book-appointment?tutor=${tutor.id}`}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#4C1D95] hover:bg-[#3B0764] rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1 whitespace-nowrap"
          >
            <span>Book</span>
            <ArrowRight className="w-3 h-3 text-[#A78BFA]" />
          </Link>
        </div>
      </div>

    </div>
  );
};
