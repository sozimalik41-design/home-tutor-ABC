import { ClassSession } from '../types';
import { INITIAL_CLASS_SESSIONS } from '../data/mockData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

const SESSIONS_STORAGE_KEY = 'home_tutor_sessions_v3';

let memorySessions: ClassSession[] | null = null;

function getStoredSessions(): ClassSession[] {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached sessions:', e);
    }
  }
  return memorySessions || INITIAL_CLASS_SESSIONS;
}

function saveStoredSessions(sessions: ClassSession[]): void {
  memorySessions = sessions;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save cached sessions:', e);
    }
  }
}

// Convert "HH:MM" to minutes from midnight for easy comparison
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function isTimeRangeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  return minStartA < minEndB && minEndA > minStartB;
}

export const scheduleService = {
  /**
   * Conflict Detection Engine
   * Validates:
   * 1. End time must be strictly after start time.
   * 2. No overlapping session for the same tutor on the given date.
   * 3. No overlapping session for the same student on the given date.
   */
  async checkConflict(
    tutorId: string,
    studentId: string,
    sessionDate: string,
    startTime: string,
    endTime: string,
    excludeSessionId?: string
  ): Promise<{ hasConflict: boolean; reason?: string }> {
    // 1. Time boundary check
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      return {
        hasConflict: true,
        reason: 'End time must be after start time (Session duration must be greater than 0).'
      };
    }

    if (endMin - startMin < 15) {
      return {
        hasConflict: true,
        reason: 'Minimum session duration is 15 minutes.'
      };
    }

    // 2. Fetch existing sessions for this date
    const { sessions } = await this.getClassSessions({ date: sessionDate });
    const activeScheduledSessions = sessions.filter(
      s => (s.status === 'scheduled' || s.status === 'rescheduled') && s.id !== excludeSessionId
    );

    // 3. Tutor conflict check
    const tutorConflict = activeScheduledSessions.find(
      s => s.tutorId === tutorId && isTimeRangeOverlapping(startTime, endTime, s.startTime, s.endTime)
    );

    if (tutorConflict) {
      return {
        hasConflict: true,
        reason: `Tutor schedule conflict: The tutor already has a class booked from ${tutorConflict.startTime} to ${tutorConflict.endTime} on ${sessionDate} with ${tutorConflict.studentName || 'another student'}.`
      };
    }

    // 4. Student conflict check
    const studentConflict = activeScheduledSessions.find(
      s => s.studentId === studentId && isTimeRangeOverlapping(startTime, endTime, s.startTime, s.endTime)
    );

    if (studentConflict) {
      return {
        hasConflict: true,
        reason: `Student schedule conflict: This student already has another class scheduled from ${studentConflict.startTime} to ${studentConflict.endTime} on ${sessionDate}.`
      };
    }

    return { hasConflict: false };
  },

  /**
   * Get all class sessions (alias for getClassSessions)
   */
  async getSessions(options: {
    tutorId?: string;
    studentId?: string;
    date?: string;
    status?: string;
  } = {}): Promise<{ sessions: ClassSession[]; source: 'supabase' | 'local' }> {
    return this.getClassSessions(options);
  },

  /**
   * Get all class sessions with optional filters
   */
  async getClassSessions(options: {
    tutorId?: string;
    studentId?: string;
    date?: string;
    status?: string;
  } = {}): Promise<{ sessions: ClassSession[]; source: 'supabase' | 'local' }> {
    const supabase = getSupabaseClient();

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('class_sessions').select('*');

        if (options.tutorId) query = query.eq('tutor_id', options.tutorId);
        if (options.studentId) query = query.eq('student_id', options.studentId);
        if (options.date) query = query.eq('session_date', options.date);
        if (options.status && options.status !== 'All') query = query.eq('status', options.status);

        const { data, error } = await query.order('session_date', { ascending: true }).order('start_time', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped: ClassSession[] = data.map((row: any) => ({
            id: row.id,
            studentId: row.student_id,
            studentName: row.student_name,
            tutorId: row.tutor_id,
            tutorName: row.tutor_name,
            subject: row.subject,
            classGrade: row.class_grade,
            sessionDate: row.session_date,
            startTime: row.start_time?.slice(0, 5) || row.start_time,
            endTime: row.end_time?.slice(0, 5) || row.end_time,
            teachingMode: row.teaching_mode || 'Home Tuition',
            status: row.status || 'scheduled',
            meetingLinkOrAddress: row.meeting_link_or_address,
            internalNotes: row.internal_notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          return { sessions: mapped, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase sessions query error, using local dataset:', err);
      }
    }

    let list = getStoredSessions();

    if (options.tutorId) {
      list = list.filter(s => s.tutorId === options.tutorId);
    }
    if (options.studentId) {
      list = list.filter(s => s.studentId === options.studentId);
    }
    if (options.date) {
      list = list.filter(s => s.sessionDate === options.date);
    }
    if (options.status && options.status !== 'All') {
      list = list.filter(s => s.status === options.status);
    }

    list.sort((a, b) => {
      const dateCompare = a.sessionDate.localeCompare(b.sessionDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return { sessions: list, source: 'local' };
  },

  /**
   * Get Today's Classes ("Aaj Ki Classes")
   */
  async getTodayClasses(tutorId?: string): Promise<ClassSession[]> {
    const todayStr = new Date().toISOString().split('T')[0];
    const { sessions } = await this.getClassSessions({ tutorId, date: todayStr });
    return sessions;
  },

  /**
   * Get Upcoming Classes ("Agli Classes")
   */
  async getUpcomingClasses(tutorId?: string): Promise<ClassSession[]> {
    const todayStr = new Date().toISOString().split('T')[0];
    const { sessions } = await this.getClassSessions({ tutorId });
    return sessions.filter(s => s.sessionDate > todayStr && s.status === 'scheduled');
  },

  /**
   * Save (create or edit) a class session with conflict validation
   */
  async saveClassSession(sessionData: Partial<ClassSession>): Promise<{
    success: boolean;
    session?: ClassSession;
    error?: string;
  }> {
    if (!sessionData.studentId) return { success: false, error: 'Student is required' };
    if (!sessionData.tutorId) return { success: false, error: 'Tutor is required' };
    if (!sessionData.sessionDate) return { success: false, error: 'Session date is required' };
    if (!sessionData.startTime || !sessionData.endTime) {
      return { success: false, error: 'Start time and end time are required' };
    }

    // Run conflict engine
    const conflictCheck = await this.checkConflict(
      sessionData.tutorId,
      sessionData.studentId,
      sessionData.sessionDate,
      sessionData.startTime,
      sessionData.endTime,
      sessionData.id
    );

    if (conflictCheck.hasConflict) {
      return { success: false, error: conflictCheck.reason };
    }

    const id = sessionData.id || `sess-${Date.now()}`;
    const completeSession: ClassSession = {
      id,
      studentId: sessionData.studentId,
      studentName: sessionData.studentName || 'Student',
      tutorId: sessionData.tutorId,
      tutorName: sessionData.tutorName || 'Tutor',
      subject: sessionData.subject || 'General Studies',
      classGrade: sessionData.classGrade || 'Middle School',
      sessionDate: sessionData.sessionDate,
      startTime: sessionData.startTime.slice(0, 5),
      endTime: sessionData.endTime.slice(0, 5),
      teachingMode: sessionData.teachingMode || 'Home Tuition',
      status: sessionData.status || 'scheduled',
      meetingLinkOrAddress: sessionData.meetingLinkOrAddress || '',
      internalNotes: sessionData.internalNotes || '',
      updatedAt: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('class_sessions').upsert({
          id: completeSession.id,
          student_id: completeSession.studentId,
          tutor_id: completeSession.tutorId,
          subject: completeSession.subject,
          class_grade: completeSession.classGrade,
          session_date: completeSession.sessionDate,
          start_time: completeSession.startTime,
          end_time: completeSession.endTime,
          teaching_mode: completeSession.teachingMode,
          status: completeSession.status,
          meeting_link_or_address: completeSession.meetingLinkOrAddress,
          internal_notes: completeSession.internalNotes,
          updated_at: completeSession.updatedAt
        });
      } catch (e) {
        console.warn('Supabase session upsert error:', e);
      }
    }

    // Update local cache
    const current = getStoredSessions();
    const idx = current.findIndex(s => s.id === completeSession.id);
    let updated: ClassSession[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = completeSession;
    } else {
      updated = [...current, completeSession];
    }
    saveStoredSessions(updated);

    return { success: true, session: completeSession };
  },

  /**
   * Reschedule an existing session
   */
  async rescheduleSession(
    sessionId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string; session?: ClassSession }> {
    const current = getStoredSessions();
    const existing = current.find(s => s.id === sessionId);

    if (!existing) {
      return { success: false, error: 'Session not found' };
    }

    // Check conflict for new slot
    const conflict = await this.checkConflict(
      existing.tutorId,
      existing.studentId,
      newDate,
      newStartTime,
      newEndTime,
      sessionId
    );

    if (conflict.hasConflict) {
      return { success: false, error: conflict.reason };
    }

    return this.saveClassSession({
      ...existing,
      sessionDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'rescheduled',
      internalNotes: notes ? `${existing.internalNotes ? existing.internalNotes + ' | ' : ''}Rescheduled: ${notes}` : existing.internalNotes
    });
  },

  /**
   * Update session status (e.g. mark completed, cancelled)
   */
  async updateSessionStatus(
    sessionId: string,
    status: ClassSession['status'],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const current = getStoredSessions();
    const existing = current.find(s => s.id === sessionId);

    if (!existing) {
      return { success: false, error: 'Session not found' };
    }

    const updated = current.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status,
          internalNotes: notes ? `${s.internalNotes ? s.internalNotes + ' | ' : ''}${notes}` : s.internalNotes,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    saveStoredSessions(updated);

    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('class_sessions').update({
          status,
          updated_at: new Date().toISOString()
        }).eq('id', sessionId);
      } catch (e) {
        console.warn('Supabase status update error:', e);
      }
    }

    return { success: true };
  },

  /**
   * Mark attendance for a session
   */
  async recordAttendance(
    sessionId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    remarks?: string
  ): Promise<{ success: boolean; error?: string }> {
    const statusNote = `Attendance marked: ${status.toUpperCase()}${remarks ? ` (${remarks})` : ''}`;
    return this.updateSessionStatus(sessionId, 'completed', statusNote);
  },

  /**
   * Check if session has passed its scheduled end time
   */
  isSessionPast(session: ClassSession): boolean {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (session.sessionDate < todayStr) return true;
    if (session.sessionDate > todayStr) return false;

    // Same day: check end time
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const endMin = timeToMinutes(session.endTime);
    return currentMin > endMin;
  }
};
