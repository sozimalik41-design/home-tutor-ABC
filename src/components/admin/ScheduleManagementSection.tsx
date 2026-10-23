import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Search, 
  Users, 
  GraduationCap, 
  MapPin, 
  Video,
  X,
  CalendarCheck,
  Sparkles
} from 'lucide-react';
import { ClassSession, Student, Tutor } from '../../types';
import { scheduleService } from '../../services/scheduleService';
import { studentService } from '../../services/studentService';
import { tutorService } from '../../services/tutorService';

export const ScheduleManagementSection: React.FC = () => {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterTutor, setFilterTutor] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeView, setActiveView] = useState<'today' | 'upcoming' | 'all'>('today');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<ClassSession | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Add form state
  const [formData, setFormData] = useState<{
    studentId: string;
    tutorId: string;
    subject: string;
    classGrade: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    teachingMode: 'Home Tuition' | 'Online' | 'Hybrid';
    meetingLinkOrAddress: string;
    internalNotes: string;
  }>({
    studentId: '',
    tutorId: '',
    subject: 'Mathematics',
    classGrade: 'Matric / O-Levels (Grade 10)',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '18:30',
    teachingMode: 'Home Tuition',
    meetingLinkOrAddress: '',
    internalNotes: ''
  });

  // Reschedule form state
  const [rescheduleData, setRescheduleData] = useState<{
    sessionDate: string;
    startTime: string;
    endTime: string;
    notes: string;
  }>({
    sessionDate: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sessRes, stdRes, tutRes] = await Promise.all([
        scheduleService.getClassSessions(),
        studentService.getStudents(),
        tutorService.getTutors()
      ]);
      setSessions(sessRes.sessions);
      setStudents(stdRes.students);
      setTutors(tutRes.tutors);

      if (stdRes.students.length > 0 && tutRes.tutors.length > 0) {
        setFormData(prev => ({
          ...prev,
          studentId: prev.studentId || stdRes.students[0].id,
          tutorId: prev.tutorId || tutRes.tutors[0].id,
          subject: stdRes.students[0].subjects[0] || 'Mathematics',
          classGrade: stdRes.students[0].gradeLevel
        }));
      }
    } catch (e) {
      console.warn('Error loading schedule data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Aaj Ki Classes (Today's classes)
  const todayClasses = sessions.filter(s => s.sessionDate === todayStr);

  // Agli Classes (Upcoming classes after today)
  const upcomingClasses = sessions.filter(s => s.sessionDate > todayStr && s.status === 'scheduled');

  const displayedSessions = activeView === 'today' 
    ? todayClasses 
    : activeView === 'upcoming' 
    ? upcomingClasses 
    : sessions;

  const filteredSessions = displayedSessions.filter(s => {
    if (filterTutor !== 'All' && s.tutorId !== filterTutor) return false;
    if (filterStatus !== 'All' && s.status !== filterStatus) return false;
    return true;
  });

  const handleStudentSelectInForm = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        tutorId: student.assignedTutorId || prev.tutorId,
        subject: student.subjects[0] || prev.subject,
        classGrade: student.gradeLevel,
        teachingMode: student.teachingMode,
        meetingLinkOrAddress: student.address || ''
      }));
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);

    const student = students.find(s => s.id === formData.studentId);
    const tutor = tutors.find(t => t.id === formData.tutorId);

    const res = await scheduleService.saveClassSession({
      ...formData,
      studentName: student ? student.fullName : 'Student',
      tutorName: tutor ? tutor.name : 'Tutor'
    });

    if (res.success) {
      setActionMessage({ type: 'success', text: 'Class session scheduled successfully.' });
      setIsAddModalOpen(false);
      loadAllData();
    } else {
      setConflictWarning(res.error || 'Conflict detected');
    }
  };

  const handleOpenReschedule = (session: ClassSession) => {
    setRescheduleSession(session);
    setRescheduleData({
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      notes: ''
    });
    setConflictWarning(null);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleSession) return;
    setConflictWarning(null);

    const res = await scheduleService.rescheduleSession(
      rescheduleSession.id,
      rescheduleData.sessionDate,
      rescheduleData.startTime,
      rescheduleData.endTime,
      rescheduleData.notes
    );

    if (res.success) {
      setActionMessage({ type: 'success', text: 'Session rescheduled successfully.' });
      setRescheduleSession(null);
      loadAllData();
    } else {
      setConflictWarning(res.error || 'Conflict detected');
    }
  };

  const handleMarkCompleted = async (session: ClassSession) => {
    await scheduleService.updateSessionStatus(session.id, 'completed', 'Marked as completed by Admin.');
    setActionMessage({ type: 'success', text: `Session for ${session.studentName} marked as Completed.` });
    loadAllData();
  };

  const handleCancelSession = async (session: ClassSession) => {
    await scheduleService.updateSessionStatus(session.id, 'cancelled', 'Cancelled by Admin.');
    setActionMessage({ type: 'success', text: 'Session status set to Cancelled.' });
    loadAllData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Class Schedule & Timetable Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor "Aaj Ki Classes" (Today's sessions), "Agli Classes" (Upcoming), and resolve schedule conflicts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(true);
            setConflictWarning(null);
          }}
          className="inline-flex items-center gap-2 bg-[#00FF48] hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>Schedule New Class</span>
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Switcher: Today's Classes vs Upcoming vs All */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'today'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#00FF48]" />
            <span>Aaj Ki Classes / Today ({todayClasses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'upcoming'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#00FF48]" />
            <span>Agli Classes / Upcoming ({upcomingClasses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Sessions ({sessions.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Tutor:</span>
            <select
              value={filterTutor}
              onChange={(e) => setFilterTutor(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
            >
              <option value="All">All Tutors</option>
              {tutors.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
            >
              <option value="All">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Student & Grade</th>
                <th className="px-4 py-3">Assigned Tutor</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Session Date & Time</th>
                <th className="px-4 py-3">Teaching Mode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Schedule Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No class sessions found in this view.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isPast = scheduleService.isSessionPast(session);
                  return (
                    <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block text-xs">
                          {session.studentName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {session.classGrade}
                        </span>
                      </td>

                      {/* Tutor */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {session.tutorName}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800">
                          {session.subject}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{session.sessionDate}</span>
                          {session.sessionDate === todayStr && (
                            <span className="text-[9px] bg-[#00FF48] text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                              TODAY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                      </td>

                      {/* Mode */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600 block">
                          {session.teachingMode}
                        </span>
                        {session.meetingLinkOrAddress && (
                          <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">
                            {session.meetingLinkOrAddress}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          session.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          session.status === 'scheduled' ? (isPast ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800') :
                          session.status === 'rescheduled' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {session.status === 'scheduled' && isPast ? 'TIME PASSED' : session.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {session.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(session)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                              title="Mark this session as completed"
                            >
                              Completed
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenReschedule(session)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Reschedule session"
                          >
                            Reschedule
                          </button>

                          {session.status === 'scheduled' && (
                            <button
                              type="button"
                              onClick={() => handleCancelSession(session)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Cancel Session"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                Reschedule Session
              </h3>
              <button onClick={() => setRescheduleSession(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rescheduling class for <strong>{rescheduleSession.studentName}</strong> with <strong>{rescheduleSession.tutorName}</strong> ({rescheduleSession.subject}).
            </p>

            {conflictWarning && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Session Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleData.sessionDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, sessionDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Time (PKT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.startTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Time (PKT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.endTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reschedule Reason / Internal Note
                </label>
                <input
                  type="text"
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                  placeholder="e.g. Student exam schedule change requested by parent"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleSession(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#00FF48] hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Session Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Schedule New Class Session
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictWarning && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Student <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => handleStudentSelectInForm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.gradeLevel})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Tutor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.tutorId}
                    onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    {tutors.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.gender || 'Educator'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Session Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Time (PKT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Time (PKT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teaching Mode
                </label>
                <select
                  value={formData.teachingMode}
                  onChange={(e) => setFormData({ ...formData, teachingMode: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                >
                  <option value="Home Tuition">Home Tuition (In-Person)</option>
                  <option value="Online">Online Sessions</option>
                  <option value="Hybrid">Hybrid Mode</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location Address or Online Meeting Link
                </label>
                <input
                  type="text"
                  value={formData.meetingLinkOrAddress}
                  onChange={(e) => setFormData({ ...formData, meetingLinkOrAddress: e.target.value })}
                  placeholder="e.g. House 42, Sector F-8/2 or https://meet.google.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#00FF48] hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
