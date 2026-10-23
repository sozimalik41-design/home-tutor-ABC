import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  MapPin, 
  BookOpen, 
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Settings,
  Bell,
  Video,
  Check,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Lock,
  Phone
} from 'lucide-react';
import { TUTORS_LIST } from '../data/mockData';
import { Tutor, Student, ClassSession, TutorSalaryRecord } from '../types';
import { scheduleService } from '../services/scheduleService';
import { studentService } from '../services/studentService';
import { financialService } from '../services/financialService';
import { tutorService } from '../services/tutorService';
import { calculateNextClassCountdown } from '../utils/timeUtils';

export const TutorDashboardPage: React.FC = () => {
  // Available tutors for dashboard simulation
  const [tutorList, setTutorList] = useState<Tutor[]>(TUTORS_LIST);
  const [selectedTutorId, setSelectedTutorId] = useState<string>(TUTORS_LIST[1].id); // Dr. Ahmed Raza
  
  const currentTutor = tutorList.find(t => t.id === selectedTutorId) || tutorList[0];

  const [activeTab, setActiveTab] = useState<'schedule' | 'students' | 'requests' | 'earnings' | 'profile'>('schedule');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Real Data states
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<TutorSalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live timer for countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Appointment inquiries state
  const [requestStatus, setRequestStatus] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>({
    'req-1': 'pending',
    'req-2': 'pending'
  });

  // Filter for schedule
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  // Load all tutor-specific data
  const loadTutorData = async (tutorId: string) => {
    setIsLoading(true);
    try {
      const [tutorsRes, sessionsRes, studentsRes, salariesRes] = await Promise.all([
        tutorService.getTutors(),
        scheduleService.getSessions({ tutorId }),
        studentService.getStudents({ tutorId }),
        financialService.getTutorSalaries({ tutorId })
      ]);

      if (tutorsRes.tutors && tutorsRes.tutors.length > 0) {
        setTutorList(tutorsRes.tutors);
      }
      setSessions(sessionsRes.sessions);
      setAssignedStudents(studentsRes.students);
      setSalaryRecords(salariesRes.records);
    } catch (err) {
      console.warn('Error loading tutor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTutorData(selectedTutorId);
  }, [selectedTutorId]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Handle appointment inquiry actions
  const handleInquiryAction = (id: string, action: 'accepted' | 'declined') => {
    setRequestStatus(prev => ({ ...prev, [id]: action }));
    showNotification('success', `Appointment inquiry marked as ${action}. Student notified via SMS.`);
  };

  // Handle marking attendance
  const handleMarkAttendance = async (sessionId: string, status: 'present' | 'absent' | 'late') => {
    const res = await scheduleService.recordAttendance(sessionId, status);
    if (res.success) {
      showNotification('success', `Attendance marked: ${status.toUpperCase()} for session.`);
      loadTutorData(selectedTutorId);
    } else {
      showNotification('error', res.error || 'Failed to update attendance');
    }
  };

  // Calculate Next Class Indicator
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingSessions = sessions
    .filter(s => s.status === 'scheduled' || s.status === 'rescheduled')
    .sort((a, b) => {
      const dateCompare = a.sessionDate.localeCompare(b.sessionDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

  const nextClass = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  // Filtered sessions for list
  const filteredSessions = sessions.filter(s => {
    if (scheduleFilter === 'today') return s.sessionDate === todayStr;
    if (scheduleFilter === 'upcoming') return s.sessionDate >= todayStr && s.status === 'scheduled';
    return true;
  });

  // Calculate financial totals for this tutor
  const totalEarnedThisMonth = salaryRecords
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.amount, 0);

  const pendingPayoutThisMonth = salaryRecords
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header with Tutor Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-900">Tutor Portal (Phase 3 Verified)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Tutor Command Dashboard</span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#00FF48]/20 text-emerald-800 border border-[#00FF48]/40 rounded-full">
                Phase 3 Active
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, <strong>{currentTutor.name}</strong> • {currentTutor.qualification} ({currentTutor.gender})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tutor Profile Switcher for quick inspection */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Switch Profile:</span>
              <select
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {tutorList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.gender}) - {t.subjects[0]}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to={`/tutors/${currentTutor.id}`}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionMessage && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all shadow-xs ${
            actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* NEXT CLASS INDICATOR HERO BANNER (CRITICAL PHASE 3)       */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF48]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-[#00FF48]">
                <Clock className="w-3.5 h-3.5 text-[#00FF48]" />
                <span>NEXT CLASS INDICATOR</span>
                {nextClass?.sessionDate === todayStr && (
                  <span className="bg-[#00FF48] text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black uppercase">
                    Today
                  </span>
                )}
              </div>

              {nextClass ? (() => {
                const countdown = calculateNextClassCountdown(
                  nextClass.sessionDate,
                  nextClass.startTime,
                  nextClass.endTime,
                  currentTime
                );
                return (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00FF48] text-slate-950 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping inline-block" />
                        {countdown.badgeLabel}
                      </span>
                      <span className="text-xs font-bold text-[#00FF48] bg-white/10 px-3 py-0.5 rounded-full">
                        ⏱️ {countdown.formattedCountdown}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {nextClass.subject} • {nextClass.classGrade}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Users className="w-4 h-4 text-[#00FF48]" />
                        Student: {nextClass.studentName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {nextClass.sessionDate === todayStr ? 'Today' : nextClass.sessionDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-white font-medium">
                        <Clock className="w-4 h-4 text-[#00FF48]" />
                        {countdown.pktTimeDisplay}
                      </span>
                      {countdown.localTimezoneName !== 'Asia/Karachi' && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            Your Local Time: {countdown.localTimeDisplay}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        nextClass.teachingMode === 'Home Tuition' 
                          ? 'bg-emerald-500/20 text-[#00FF48] border border-[#00FF48]/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      }`}>
                        {nextClass.teachingMode}
                      </span>
                    </div>

                    {nextClass.meetingLinkOrAddress && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00FF48] shrink-0" />
                        <span className="truncate">
                          <strong>Location / Link:</strong> {nextClass.meetingLinkOrAddress}
                        </span>
                      </div>
                    )}
                  </>
                );
              })() : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    No Upcoming Classes Scheduled
                  </h2>
                  <p className="text-xs text-slate-300">
                    Your calendar is currently clear. You can accept pending appointment inquiries or schedule a new student session from the Admin portal.
                  </p>
                </>
              )}
            </div>

            {nextClass && (
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
                {nextClass.teachingMode === 'Online' && nextClass.meetingLinkOrAddress ? (
                  <a
                    href={nextClass.meetingLinkOrAddress}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-[#00FF48] hover:bg-[#00e640] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#00FF48]/20"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Google Meet</span>
                  </a>
                ) : (
                  <button
                    onClick={() => handleMarkAttendance(nextClass.id, 'present')}
                    className="px-6 py-3 bg-[#00FF48] hover:bg-[#00e640] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#00FF48]/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check-in & Mark Present</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('schedule')}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View All Sessions ({sessions.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>My Paid Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              ${totalEarnedThisMonth.toLocaleString()}<span className="text-xs font-normal text-slate-400">.00</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pending payout: ${pendingPayoutThisMonth.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>My Scheduled Classes</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {sessions.length} Sessions
            </div>
            <div className="text-[11px] text-slate-500">
              {sessions.filter(s => s.sessionDate === todayStr).length} classes scheduled today
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Assigned Students</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {assignedStudents.length} Students
            </div>
            <div className="text-[11px] text-purple-700 font-semibold">
              Role-restricted private view
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Verification Status</span>
              <ShieldCheck className="w-4 h-4 text-[#00C938]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>{currentTutor.status === 'verified' ? 'Verified' : 'Active'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                100%
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              Degrees & background checked
            </div>
          </div>

        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Class Schedule & Attendance ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>My Assigned Students ({assignedStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Appointment Inquiries</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'earnings'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>My Earnings & Payouts ({salaryRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Profile & Working Hours</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SCHEDULE & ATTENDANCE MANAGEMENT                   */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Teaching Sessions & Live Attendance Tracker
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mark attendance for completed classes and launch direct online whiteboards.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                  {(['all', 'today', 'upcoming'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setScheduleFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors capitalize ${
                        scheduleFilter === filter
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredSessions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No sessions match this filter</h4>
                  <p className="text-xs text-slate-500">Check 'All' or schedule a new session from the admin panel.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredSessions.map((session) => {
                    const isToday = session.sessionDate === todayStr;
                    return (
                      <div key={session.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                        
                        <div className="flex items-start gap-4 flex-1">
                          {/* Date badge */}
                          <div className={`p-3 rounded-2xl font-mono text-center shrink-0 ${
                            isToday ? 'bg-[#00FF48]/20 border border-[#00FF48]/40 text-slate-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            <div className="text-[10px] font-bold uppercase text-slate-500">
                              {new Date(session.sessionDate).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-lg font-black tabular-nums">
                              {session.sessionDate.split('-')[2]}
                            </div>
                            {isToday && (
                              <span className="text-[9px] font-black uppercase text-emerald-700 block">
                                Today
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {session.studentName}
                              </h4>
                              <span className="text-xs text-slate-500 font-medium">({session.classGrade})</span>
                              
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                session.teachingMode === 'Home Tuition'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}>
                                {session.teachingMode}
                              </span>

                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md capitalize ${
                                session.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                                session.status === 'scheduled' ? 'bg-emerald-100 text-emerald-800' :
                                session.status === 'rescheduled' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                Status: {session.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-semibold">
                              Subject: {session.subject}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {session.startTime} - {session.endTime}
                              </span>

                              {session.meetingLinkOrAddress && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="truncate max-w-xs">{session.meetingLinkOrAddress}</span>
                                </span>
                              )}
                            </div>

                            {session.internalNotes && (
                              <p className="text-[11px] text-slate-500 italic pt-1">
                                Note: {session.internalNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interactive Attendance & Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto shrink-0">
                          {session.status !== 'completed' ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                              <span className="text-[11px] font-bold text-slate-500 px-1">Attendance:</span>
                              <button
                                onClick={() => handleMarkAttendance(session.id, 'present')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(session.id, 'late')}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Late
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(session.id, 'absent')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Absent
                              </button>
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Session Completed</span>
                            </span>
                          )}

                          {session.teachingMode === 'Online' && session.meetingLinkOrAddress && (
                            <a
                              href={session.meetingLinkOrAddress}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#00FF48] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Call</span>
                            </a>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY ASSIGNED STUDENTS (ROLE RESTRICTED PRIVACY)     */}
        {/* ========================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            
            {/* Privacy Guarantee Notice */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900">
                  Strict Role-Based Student Privacy Enforced
                </h4>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  As an educator, you only have authorization to view students officially paired to your profile. Other tutors' students, unrelated parent records, and external contact lists are securely hidden.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assignedStudents.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No students currently assigned</h4>
                  <p className="text-xs text-slate-500">
                    New student assignments from the administration portal will appear directly here.
                  </p>
                </div>
              ) : (
                assignedStudents.map((student) => (
                  <div key={student.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">
                            {student.fullName}
                          </h4>
                          <span className="text-xs font-semibold text-emerald-700">
                            {student.gradeLevel}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                          {student.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {student.subjects.map((sub, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-md font-medium">
                            {sub}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Teaching Mode:</span>
                          <span className="font-semibold text-slate-900">{student.teachingMode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">City / Location:</span>
                          <span className="font-semibold text-slate-900">{student.city}</span>
                        </div>
                        {student.nextClass && (
                          <div className="flex items-center justify-between text-emerald-700 font-bold">
                            <span>Next Class:</span>
                            <span>{student.nextClass.nextClassDate} at {student.nextClass.startTime}</span>
                          </div>
                        )}
                      </div>

                      {student.notes && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                          <strong>Academic Focus:</strong> {student.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Enrolled: {student.enrollmentDate}
                      </span>
                      <button
                        onClick={() => {
                          setActiveTab('schedule');
                          showNotification('success', `Viewing scheduled classes for ${student.fullName}`);
                        }}
                        className="text-xs font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-1"
                      >
                        <span>Schedule</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PENDING APPOINTMENT INQUIRIES                      */}
        {/* ========================================================= */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Incoming Student Appointment Inquiries
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review appointment requests submitted by parents for your subjects and tutoring zones.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-slate-900">Zainab Fatima (Parent: Mrs. Bilal)</div>
                  <div className="text-xs text-slate-600 mt-0.5">O-Level Mathematics • Wants In-Home visit at Gulberg III, Lahore</div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">Proposed Slot: Tuesday at 5:00 PM (Trial Class)</div>
                </div>

                <div className="flex items-center gap-2">
                  {requestStatus['req-1'] === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleInquiryAction('req-1', 'accepted')}
                        className="px-4 py-2 bg-[#00FF48] hover:bg-[#00e640] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Accept Appointment
                      </button>
                      <button
                        onClick={() => handleInquiryAction('req-1', 'declined')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      requestStatus['req-1'] === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Inquiry {requestStatus['req-1']}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-slate-900">Saad Rehman (FSc Pre-Engineering)</div>
                  <div className="text-xs text-slate-600 mt-0.5">Calculus & Integration • Online 1-on-1 Interactive Session</div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">Proposed Slot: Thursday at 7:00 PM (Weekly Course)</div>
                </div>

                <div className="flex items-center gap-2">
                  {requestStatus['req-2'] === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleInquiryAction('req-2', 'accepted')}
                        className="px-4 py-2 bg-[#00FF48] hover:bg-[#00e640] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Accept Appointment
                      </button>
                      <button
                        onClick={() => handleInquiryAction('req-2', 'declined')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      requestStatus['req-2'] === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Inquiry {requestStatus['req-2']}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MY EARNINGS & PAYOUTS (CONFIDENTIAL LEDGER)         */}
        {/* ========================================================= */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Personal Compensation Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct tutor payouts and verified bank deposits for completed sessions.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Strictly Confidential to {currentTutor.name}</span>
              </div>
            </div>

            {/* Payout Metric Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500 font-medium">Total Paid Out to Date</span>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  ${totalEarnedThisMonth.toLocaleString()}.00
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">Direct bank transfer</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1">
                <span className="text-xs text-amber-800 font-medium">Pending Payout Due</span>
                <div className="text-2xl font-extrabold text-amber-700 tabular-nums">
                  ${pendingPayoutThisMonth.toLocaleString()}.00
                </div>
                <span className="text-[11px] text-amber-700 font-semibold">Scheduled for month-end</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500 font-medium">Payment Agreement</span>
                <div className="text-xl font-extrabold text-slate-900 capitalize">
                  {currentTutor.salaryFrequency} Rate
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  ${currentTutor.salaryAmount || currentTutor.hourlyRate * 40} / {currentTutor.salaryFrequency}
                </span>
              </div>
            </div>

            {/* Table of records */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Billing Period</th>
                    <th className="py-3 px-4">Classes Taught</th>
                    <th className="py-3 px-4">Salary Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaryRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {record.billingPeriod}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-700">
                        {record.classesCount} Classes
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900 tabular-nums">
                        ${record.amount.toLocaleString()}.00
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {record.paymentMethod || 'Bank Deposit / Raast'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          record.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {record.status === 'paid' ? 'Paid to Bank' : 'Pending Payout'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Platform privacy guarantee: Tutors only see their agreed salary disbursements. Student tuition billing rates and platform operational margins remain private.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PROFILE & WORKING HOURS                            */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Educator Profile & Availability Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Control your active status, teaching zones, and public availability slots.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Personal Details</span>
                  <div className="text-sm font-bold text-slate-900">{currentTutor.name}</div>
                  <div className="text-xs text-slate-600">Gender: <strong>{currentTutor.gender}</strong></div>
                  <div className="text-xs text-slate-600">Qualification: <strong>{currentTutor.qualification}</strong></div>
                  <div className="text-xs text-slate-600">University: <strong>{currentTutor.university}</strong></div>
                  <div className="text-xs text-slate-600">Experience: <strong>{currentTutor.experienceYears} Years</strong></div>
                  <div className="text-xs text-slate-600">Teaching Mode: <strong>{currentTutor.mode.join(' / ')}</strong></div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Coverage Area</span>
                  <div className="text-xs text-slate-700">
                    City: <strong>{currentTutor.cities.join(', ')}</strong>
                  </div>
                  {currentTutor.teachingArea && (
                    <div className="text-xs text-slate-700">
                      Neighborhood: <strong>{currentTutor.teachingArea}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Weekly Availability Slots</span>
                  <div className="space-y-2">
                    {currentTutor.availability.map((slot, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center justify-between font-mono">
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{slot}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Active Slot
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">Verified Teaching Status</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Your profile badge is verified. New students can contact and book appointments with you directly from the Home Tutor directory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
