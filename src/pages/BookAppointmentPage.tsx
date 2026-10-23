import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  CalendarCheck
} from 'lucide-react';
import { TUTORS_LIST, POPULAR_SUBJECTS, CLASSES_LEVELS, CITIES } from '../data/mockData';
import { PhaseNotice } from '../components/common/PhaseNotice';

export const BookAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedTutorId = searchParams.get('tutor') || '';

  // Form State
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [tutorId, setTutorId] = useState(preselectedTutorId || TUTORS_LIST[0].id);
  const [classLevel, setClassLevel] = useState(CLASSES_LEVELS[3]); // Matric / O-Levels default
  const [subject, setSubject] = useState(POPULAR_SUBJECTS[0].name);
  const [preferredDate, setPreferredDate] = useState('2026-10-18');
  const [preferredTime, setPreferredTime] = useState('16:00');
  const [sessionType, setSessionType] = useState<'In-Person' | 'Online'>('In-Person');
  const [city, setCity] = useState('Lahore');
  const [homeAddress, setHomeAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [learningGoals, setLearningGoals] = useState('');

  // UI Flow States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTutor = TUTORS_LIST.find((t) => t.id === tutorId) || TUTORS_LIST[0];

  useEffect(() => {
    if (preselectedTutorId) {
      setTutorId(preselectedTutorId);
    }
  }, [preselectedTutorId]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.studentName = 'Student name is required';
    if (!parentName.trim()) errs.parentName = 'Parent or guardian name is required';
    if (!phone.trim()) errs.phone = 'Contact phone number is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email address is required';
    if (sessionType === 'In-Person' && !homeAddress.trim()) {
      errs.homeAddress = 'Physical home address is required for in-home tutoring';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate frontend form submission latency
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedAppointment({
        id: `HT-APT-${Math.floor(100000 + Math.random() * 900000)}`,
        studentName,
        parentName,
        tutorName: selectedTutor.name,
        subject,
        classLevel,
        preferredDate,
        preferredTime,
        sessionType,
        city,
        homeAddress,
        phone,
        email,
        rate: `${selectedTutor.currency}${selectedTutor.hourlyRate}/hr`
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-2">
            <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#4C1D95]">Book Appointment</span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Schedule a Home Tutoring Appointment
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Book an introductory diagnostic session with a verified educator. Zero advance agent fees.
          </p>
        </div>

        {/* Phase Notice */}
        <PhaseNotice
          title="Appointment Booking Flow (Lavender Dream Edition)"
          description="This accessible form layout validates student details, tutor assignment, session delivery, and guardian contact with crisp responsive styling."
        />

        {/* Success Confirmation Card if submitted */}
        {submittedAppointment ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#DDD6FE] shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] text-[#4C1D95] border border-[#DDD6FE] flex items-center justify-center shrink-0">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F3FF] text-[#4C1D95] text-xs font-bold rounded-lg border border-[#DDD6FE] mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Appointment Booked Successfully</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#1F2937]">
                  Appointment Request Drafted!
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Reference Code: <span className="font-mono font-bold text-[#4C1D95]">{submittedAppointment.id}</span>
                </p>
              </div>
            </div>

            <div className="bg-[#F5F3FF] rounded-2xl p-6 border border-[#DDD6FE] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6B7280] font-medium block">Student</span>
                <span className="text-sm font-bold text-[#1F2937]">{submittedAppointment.studentName} ({submittedAppointment.classLevel})</span>
              </div>
              <div>
                <span className="text-[#6B7280] font-medium block">Assigned Tutor</span>
                <span className="text-sm font-bold text-[#1F2937]">{submittedAppointment.tutorName}</span>
              </div>
              <div>
                <span className="text-[#6B7280] font-medium block">Subject</span>
                <span className="text-sm font-bold text-[#1F2937]">{submittedAppointment.subject}</span>
              </div>
              <div>
                <span className="text-[#6B7280] font-medium block">Date & Time Slot</span>
                <span className="text-sm font-bold text-[#1F2937] font-mono">
                  {submittedAppointment.preferredDate} at {submittedAppointment.preferredTime}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] font-medium block">Session Delivery</span>
                <span className="text-sm font-bold text-[#4C1D95]">
                  {submittedAppointment.sessionType} ({submittedAppointment.city})
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] font-medium block">Guardian Contact</span>
                <span className="text-sm font-bold text-[#1F2937]">{submittedAppointment.phone}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs text-[#1F2937] leading-relaxed">
              <strong className="text-[#4C1D95]">Notice:</strong> This appointment was scheduled in your session and confirmed with the assigned instructor.
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmittedAppointment(null)}
                className="px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Book Another Appointment
              </button>

              <Link
                to="/tutors"
                className="px-5 py-2.5 bg-white border border-[#DDD6FE] hover:bg-[#F5F3FF] text-[#1F2937] rounded-xl text-xs font-bold transition-colors"
              >
                Return to Tutor Directory
              </Link>
            </div>
          </div>
        ) : (
          /* The Form Container */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DDD6FE] shadow-xs space-y-8">
            
            {/* Step 1: Student Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DDD6FE]/60">
                <span className="w-6 h-6 rounded-full bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-[#1F2937]">
                  Student & Academic Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="student-name" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Daniyal Khan"
                    className={`w-full bg-[#F5F3FF] border rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] ${
                      errors.studentName ? 'border-rose-400 bg-rose-50' : 'border-[#DDD6FE]'
                    }`}
                  />
                  {errors.studentName && <p className="text-[11px] text-rose-600 mt-1">{errors.studentName}</p>}
                </div>

                <div>
                  <label htmlFor="parent-name" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Parent / Guardian Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="parent-name"
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Tariq Khan"
                    className={`w-full bg-[#F5F3FF] border rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] ${
                      errors.parentName ? 'border-rose-400 bg-rose-50' : 'border-[#DDD6FE]'
                    }`}
                  />
                  {errors.parentName && <p className="text-[11px] text-rose-600 mt-1">{errors.parentName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="class-level" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Current Class / Grade Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="class-level"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  >
                    {CLASSES_LEVELS.slice(1).map((lvl, idx) => (
                      <option key={idx} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="target-subject" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Primary Subject Required <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="target-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  >
                    {POPULAR_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Tutor Selection & Session Preference */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DDD6FE]/60">
                <span className="w-6 h-6 rounded-full bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-[#1F2937]">
                  Tutor Selection & Session Type
                </h3>
              </div>

              {/* Tutor Selection Dropdown */}
              <div>
                <label htmlFor="assigned-tutor" className="block text-xs font-semibold text-[#1F2937] mb-1">
                  Selected Educator
                </label>
                <select
                  id="assigned-tutor"
                  value={tutorId}
                  onChange={(e) => setTutorId(e.target.value)}
                  className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] font-semibold focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                >
                  {TUTORS_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.title} ({t.currency}{t.hourlyRate}/hr)
                    </option>
                  ))}
                </select>

                <div className="mt-2 p-3 bg-[#F5F3FF] rounded-xl border border-[#DDD6FE] flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Selected Tutor Rate: <strong className="text-[#1F2937]">{selectedTutor.currency}{selectedTutor.hourlyRate}/hr</strong></span>
                  <Link to={`/tutors/${selectedTutor.id}`} className="text-[#4C1D95] font-semibold hover:underline">
                    View Tutor Credentials
                  </Link>
                </div>
              </div>

              {/* Session Type */}
              <div>
                <span className="block text-xs font-semibold text-[#1F2937] mb-2">
                  Session Delivery Mode
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionType('In-Person')}
                    className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      sessionType === 'In-Person'
                        ? 'border-[#4C1D95] bg-[#4C1D95] text-white shadow-xs'
                        : 'border-[#DDD6FE] bg-[#F5F3FF] text-[#1F2937] hover:bg-[#DDD6FE]/40'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#A78BFA]" />
                    <span>In-Person Home Visit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionType('Online')}
                    className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      sessionType === 'Online'
                        ? 'border-[#4C1D95] bg-[#4C1D95] text-white shadow-xs'
                        : 'border-[#DDD6FE] bg-[#F5F3FF] text-[#1F2937] hover:bg-[#DDD6FE]/40'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#A78BFA]" />
                    <span>Live 1-on-1 Online Session</span>
                  </button>
                </div>
              </div>

              {/* Date and Time slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="session-date" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Preferred Session Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="session-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <div>
                  <label htmlFor="session-time" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Preferred Time Slot <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="session-time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  >
                    <option value="15:00">03:00 PM - 04:00 PM (Afternoon)</option>
                    <option value="16:00">04:00 PM - 05:00 PM (Evening)</option>
                    <option value="17:30">05:30 PM - 06:30 PM (Evening)</option>
                    <option value="19:00">07:00 PM - 08:00 PM (Night)</option>
                    <option value="10:00">10:00 AM - 11:00 AM (Weekend Morning)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Contact & Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DDD6FE]/60">
                <span className="w-6 h-6 rounded-full bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-bold text-[#1F2937]">
                  Contact Information & Location
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className={`w-full bg-[#F5F3FF] border rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] ${
                      errors.phone ? 'border-rose-400 bg-rose-50' : 'border-[#DDD6FE]'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className={`w-full bg-[#F5F3FF] border rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] ${
                      errors.email ? 'border-rose-400 bg-rose-50' : 'border-[#DDD6FE]'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="contact-city" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="contact-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  >
                    {CITIES.slice(1).map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {sessionType === 'In-Person' && (
                <div>
                  <label htmlFor="home-address" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Home Address for Tutor Visit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="home-address"
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="House/Plot #, Street, Phase / Block, Area (e.g. Phase 5 DHA or Sadiqabad Hub)"
                    className={`w-full bg-[#F5F3FF] border rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] ${
                      errors.homeAddress ? 'border-rose-400 bg-rose-50' : 'border-[#DDD6FE]'
                    }`}
                  />
                  {errors.homeAddress && <p className="text-[11px] text-rose-600 mt-1">{errors.homeAddress}</p>}
                </div>
              )}

              <div>
                <label htmlFor="learning-notes" className="block text-xs font-semibold text-[#1F2937] mb-1">
                  Specific Learning Objectives / Problem Areas (Optional)
                </label>
                <textarea
                  id="learning-notes"
                  rows={3}
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g. Struggles with O-Level trigonometry past papers and needs preparation for upcoming examinations."
                  className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-3 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                />
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4 border-t border-[#DDD6FE]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <ShieldCheck className="w-4 h-4 text-[#4C1D95]" />
                <span>Zero advance agent registration fees</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#4C1D95]/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Appointment...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4 text-[#A78BFA]" />
                    <span>Confirm & Schedule Appointment</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
