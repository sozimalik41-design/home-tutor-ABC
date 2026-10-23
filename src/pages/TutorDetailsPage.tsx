import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  TUTORS_LIST, 
  TESTIMONIALS 
} from '../data/mockData';
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  User, 
  MessageSquare
} from 'lucide-react';
import { PhaseNotice } from '../components/common/PhaseNotice';
import { tutorService } from '../services/tutorService';
import { Tutor } from '../types';

export const TutorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [imageError, setImageError] = useState(false);
  const [tutor, setTutor] = useState<Tutor | null>(() => {
    return TUTORS_LIST.find((t) => t.id === id) || TUTORS_LIST[0];
  });

  useEffect(() => {
    if (id) {
      tutorService.getTutorById(id).then(found => {
        if (found) setTutor(found);
      });
    }
  }, [id]);

  if (!tutor) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-[#DDD6FE] max-w-md text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F2937]">Tutor Not Found</h2>
          <p className="text-xs text-[#6B7280]">The tutor profile you requested does not exist or has been updated.</p>
          <Link to="/tutors" className="inline-block px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-colors">
            Back to Tutors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/tutors" className="hover:text-[#4C1D95] transition-colors">Find Tutors</Link>
          <span>/</span>
          <span className="text-[#4C1D95] font-bold">{tutor.name}</span>
        </div>

        {/* Notice */}
        <PhaseNotice
          title={`Profile View: ${tutor.name} (Lavender Dream Edition)`}
          description="Verified academic profile with subject syllabus breakdowns, parent evaluations, transparent rates, and direct session booking."
        />

        {/* Hero Profile Card */}
        <div className="bg-white rounded-3xl border border-[#DDD6FE] overflow-hidden shadow-xs">
          
          <div className="p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              
              {/* Profile Image */}
              <div className="relative shrink-0 mx-auto lg:mx-0">
                {imageError || !tutor.avatar ? (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#A78BFA]">
                    <User className="w-16 h-16" />
                  </div>
                ) : (
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-2 border-[#DDD6FE] shadow-md"
                  />
                )}
                {tutor.verified && (
                  <span className="absolute -bottom-2 -right-2 bg-[#4C1D95] text-[#A78BFA] p-2 rounded-2xl border-2 border-white shadow-md flex items-center gap-1 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {/* Bio & Details */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                      {tutor.name}
                    </h1>
                    <p className="text-sm font-semibold text-[#4C1D95] mt-0.5">
                      {tutor.title}
                    </p>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-center lg:justify-start gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200/60 self-center lg:self-auto">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold text-[#1F2937] tabular-nums">{tutor.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#6B7280] font-medium">({tutor.reviewCount} parent reviews)</span>
                  </div>
                </div>

                {/* Key metadata row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#A78BFA]" />
                    <span>{tutor.qualification}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#A78BFA]" />
                    <span className="tabular-nums">{tutor.experienceYears} Years Experience</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#A78BFA]" />
                    <span>{tutor.cities.join(', ')}</span>
                  </div>
                </div>

                {/* Badges & Gender */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                  {tutor.gender && tutor.gender !== 'Prefer not to say' && (
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      tutor.gender === 'Female' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-[#F5F3FF] text-[#4C1D95] border-[#DDD6FE]'
                    }`}>
                      {tutor.gender} Educator
                    </span>
                  )}
                  {tutor.teachingArea && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-[#F5F3FF] text-[#4C1D95] rounded-lg border border-[#DDD6FE]">
                      📍 {tutor.teachingArea}
                    </span>
                  )}
                  {tutor.badges.map((badge, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#F5F3FF] text-[#1F2937] rounded-lg border border-[#DDD6FE]"
                    >
                      {badge}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 text-xs font-semibold bg-[#F5F3FF] text-[#4C1D95] rounded-lg border border-[#DDD6FE]">
                    Teaching: {tutor.mode.join(' / ')}
                  </span>
                </div>

                <p className="text-sm text-[#6B7280] leading-relaxed pt-2 max-w-3xl">
                  {tutor.bio}
                </p>

              </div>

              {/* Price & Primary Booking Box */}
              <div className="w-full lg:w-72 bg-[#F5F3FF] rounded-2xl p-6 border border-[#DDD6FE] flex flex-col justify-between shrink-0 space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#4C1D95] uppercase tracking-wider block">
                    Session Rate
                  </span>
                  <div className="text-3xl font-extrabold text-[#1F2937] mt-1 tabular-nums">
                    {tutor.currency}{tutor.hourlyRate}
                    <span className="text-sm font-normal text-[#6B7280]"> / hour</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Direct billing, no registration fees, trial session guarantee.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/book-appointment?tutor=${tutor.id}`}
                    className="w-full py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <Calendar className="w-4 h-4 text-[#A78BFA]" />
                    <span>Book Appointment with {tutor.name.split(' ')[0]}</span>
                  </Link>

                  <Link
                    to="/contact"
                    className="w-full py-2.5 px-4 bg-white hover:bg-[#F5F3FF] border border-[#DDD6FE] text-[#1F2937] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#4C1D95]" />
                    <span>Ask Inquiry</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-[#DDD6FE] text-[11px] text-[#6B7280] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4C1D95]" />
                    <span>Identity verified by Home Tutor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4C1D95]" />
                    <span>Free reschedule up to 24 hrs prior</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Approach, Subjects, Availability */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Teaching Approach */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDD6FE] space-y-4">
              <h3 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#4C1D95]" />
                <span>Teaching Methodology & Approach</span>
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {tutor.teachingApproach}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
                  <div className="font-bold text-xs text-[#4C1D95]">Diagnostic Assessment</div>
                  <p className="text-xs text-[#6B7280] mt-1">Starts with a 20-minute gap analysis to isolate weak syllabus foundations.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
                  <div className="font-bold text-xs text-[#4C1D95]">Past Paper Mastery</div>
                  <p className="text-xs text-[#6B7280] mt-1">Weekly exam question walkthroughs graded according to official mark schemes.</p>
                </div>
              </div>
            </div>

            {/* Subjects and Classes */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDD6FE] space-y-6">
              <h3 className="text-lg font-bold text-[#1F2937]">
                Subjects & Classes Handled
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#4C1D95] uppercase tracking-wider block mb-2">
                    Subjects Taught
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((sub, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#F5F3FF] text-[#4C1D95] rounded-xl text-xs font-semibold border border-[#DDD6FE]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#4C1D95] uppercase tracking-wider block mb-2">
                    Class & Grade Levels
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tutor.classes.map((cls, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#F5F3FF] text-[#1F2937] rounded-xl text-xs font-semibold border border-[#DDD6FE]">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Availability */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDD6FE] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4C1D95]" />
                  <span>Standard Weekly Availability</span>
                </h3>
                <span className="text-xs text-[#6B7280]">Flexible upon appointment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tutor.availability.map((slot, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs">
                    <div className="font-bold text-[#4C1D95]">{slot.split(' ')[0]}</div>
                    <div className="text-[#6B7280] font-mono mt-0.5">{slot.substring(slot.indexOf(' ') + 1)}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col: Parent Reviews & Trust Box */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-[#DDD6FE] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F2937]">
                  Parent & Student Reviews
                </h3>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{tutor.rating.toFixed(1)} / 5.0</span>
                </span>
              </div>

              <div className="space-y-4">
                {TESTIMONIALS.map((review) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F2937]">{review.studentName}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] italic leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="text-[11px] text-[#4C1D95]">
                      {review.role} • {review.grade}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Home Safety Pledge */}
            <div className="bg-[#3B0764] text-white p-6 rounded-3xl border border-[#4C1D95] space-y-3">
              <div className="flex items-center gap-2 text-[#A78BFA] text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
                <span>Home Tutor Safety Protocol</span>
              </div>
              <h4 className="text-sm font-bold text-white">Safe & Protected Home Learning</h4>
              <p className="text-xs text-[#DDD6FE]/90 leading-relaxed">
                Parents are always present during home tutoring sessions. Tutors submit real-time arrival check-ins on our platform for transparency.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
