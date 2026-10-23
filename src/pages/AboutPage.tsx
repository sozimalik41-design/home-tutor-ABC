import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Users, 
  MapPin, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { PhaseNotice } from '../components/common/PhaseNotice';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F3FF] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Breadcrumbs & Title */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
            <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#4C1D95]">About Home Tutor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Elevating Education Through Verified, In-Home Personalized Mentorship
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed">
            Home Tutor was founded to bridge the gap between students seeking tailored academic guidance and highly qualified educators who inspire learning confidence.
          </p>
        </div>

        {/* Theme Notice */}
        <PhaseNotice 
          title="About Home Tutor (Lavender Dream Theme Edition)"
          description="This page establishes our verified tutoring standards, code of conduct, and educational framework with full responsive design and accessible typography."
        />

        {/* 3 Pillars of Home Tutor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-[#DDD6FE] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">
              Rigorous 5-Step Verification
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              Every tutor on our platform undergoes national identity verification, academic transcript audits, teaching demonstration interviews, and parent reference checks.
            </p>
            <ul className="space-y-2 text-xs text-[#1F2937] pt-2 border-t border-[#DDD6FE]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Verified university degrees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Clean background record</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>In-person safety protocol adherence</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#DDD6FE] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">
              Curriculum Mastery
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              Whether your child follows CAIE Cambridge (O & A-Levels), Edexcel, Federal Board, Punjab Board, or requires pre-med/pre-engineering entrance test coaching.
            </p>
            <ul className="space-y-2 text-xs text-[#1F2937] pt-2 border-t border-[#DDD6FE]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Targeted past-paper training</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Examiner mark-scheme breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Custom revision roadmaps</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#DDD6FE] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">
              Transparent & Direct
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              No hidden fees, no opaque commissions, and no locked contracts. Direct coordination between parents and tutors with complete calendar flexibility.
            </p>
            <ul className="space-y-2 text-xs text-[#1F2937] pt-2 border-t border-[#DDD6FE]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Hourly rates set transparently</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Direct trial lesson booking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4C1D95]" />
                <span>Regular parent progress reports</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Mission Statement Box */}
        <div className="bg-[#3B0764] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-[#4C1D95]">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
              Our Educational Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Every student possesses boundless potential when guided with patience, structured fundamentals, and individual attention.
            </h2>
            <p className="text-sm text-[#DDD6FE]/90 leading-relaxed">
              Traditional classroom settings often fail to address individual learning rhythms. Home Tutor restores the focus on the learner, allowing students to ask questions freely, overcome conceptual hurdles without hesitation, and develop a lasting love for discovery.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/tutors"
                className="px-6 py-3 bg-[#A78BFA] hover:bg-white text-[#3B0764] rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Find a Verified Tutor
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-[#4C1D95] hover:bg-[#3B0764] text-white border border-[#DDD6FE]/40 rounded-xl text-xs font-bold transition-all"
              >
                Apply as a Home Tutor
              </Link>
            </div>
          </div>
        </div>

        {/* Coverage & Cities */}
        <div className="bg-white rounded-2xl p-8 border border-[#DDD6FE] space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F5F3FF] text-[#4C1D95]">
              <MapPin className="w-5 h-5 text-[#4C1D95]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Active Service Coverage</h3>
              <p className="text-xs text-[#6B7280]">In-person home visits available across all major metropolitan areas.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
              <div className="font-bold text-[#4C1D95]">Sadiqabad Hub</div>
              <div className="text-[#6B7280] mt-0.5">The Inspire Business Academy, Main Campus</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
              <div className="font-bold text-[#4C1D95]">Lahore</div>
              <div className="text-[#6B7280] mt-0.5">DHA, Gulberg, Model Town, Johar Town, Bahria</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
              <div className="font-bold text-[#4C1D95]">Islamabad & Rawalpindi</div>
              <div className="text-[#6B7280] mt-0.5">F-6 to F-11, Bahria Town, Chaklala, Saddar</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
              <div className="font-bold text-[#4C1D95]">Online Worldwide</div>
              <div className="text-[#6B7280] mt-0.5">Interactive virtual whiteboard, screen-share & recordings</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
