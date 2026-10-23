import { Student, NextClassInfo } from '../types';
import { INITIAL_STUDENTS } from '../data/mockData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { scheduleService } from './scheduleService';

const STUDENTS_STORAGE_KEY = 'home_tutor_students_v3';

let memoryStudents: Student[] | null = null;

function getStoredStudents(): Student[] {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached students:', e);
    }
  }
  return memoryStudents || INITIAL_STUDENTS;
}

function saveStoredStudents(students: Student[]): void {
  memoryStudents = students;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save cached students:', e);
    }
  }
}

export const studentService = {
  /**
   * Get all students with live Next Class calculation
   */
  async getStudents(options: {
    tutorId?: string;
    search?: string;
    status?: string;
  } = {}): Promise<{ students: Student[]; source: 'supabase' | 'local' }> {
    const supabase = getSupabaseClient();
    let studentList: Student[] = [];
    let source: 'supabase' | 'local' = 'local';

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('students').select('*');
        if (options.tutorId) query = query.eq('assigned_tutor_id', options.tutorId);
        if (options.status && options.status !== 'All') query = query.eq('status', options.status);
        if (options.search?.trim()) {
          query = query.ilike('full_name', `%${options.search.trim()}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          studentList = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            fullName: row.full_name,
            gradeLevel: row.grade_level,
            subjects: row.subjects || [],
            assignedTutorId: row.assigned_tutor_id,
            assignedTutorName: row.assigned_tutor_name || 'Assigned Tutor',
            parentName: row.parent_name,
            parentPhone: row.parent_phone,
            parentEmail: row.parent_email,
            city: row.city || 'Lahore',
            address: row.address,
            teachingMode: row.teaching_mode || 'Home Tuition',
            enrollmentDate: row.enrollment_date,
            status: row.status || 'active',
            monthlyFee: Number(row.monthly_fee || 0),
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          source = 'supabase';
        }
      } catch (err) {
        console.warn('Supabase student query error, using local fallback:', err);
      }
    }

    if (studentList.length === 0) {
      studentList = getStoredStudents();
      if (options.tutorId) {
        studentList = studentList.filter(s => s.assignedTutorId === options.tutorId);
      }
      if (options.status && options.status !== 'All') {
        studentList = studentList.filter(s => s.status === options.status);
      }
      if (options.search?.trim()) {
        const q = options.search.toLowerCase().trim();
        studentList = studentList.filter(s => 
          s.fullName.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.gradeLevel.toLowerCase().includes(q) ||
          s.subjects.some(sub => sub.toLowerCase().includes(q))
        );
      }
    }

    // Attach computed Next Class for each student
    const todayStr = new Date().toISOString().split('T')[0];
    const { sessions } = await scheduleService.getClassSessions();

    const enrichedStudents = studentList.map(student => {
      // Find the next upcoming scheduled session for this student
      const upcomingSessions = sessions
        .filter(s => s.studentId === student.id && s.status === 'scheduled' && s.sessionDate >= todayStr)
        .sort((a, b) => {
          const dComp = a.sessionDate.localeCompare(b.sessionDate);
          if (dComp !== 0) return dComp;
          return a.startTime.localeCompare(b.startTime);
        });

      let nextClass: NextClassInfo | undefined = student.nextClass;

      if (upcomingSessions.length > 0) {
        const next = upcomingSessions[0];
        nextClass = {
          studentName: student.fullName,
          tutorName: next.tutorName || student.assignedTutorName || 'Assigned Tutor',
          classGrade: next.classGrade || student.gradeLevel,
          subject: next.subject,
          nextClassDate: next.sessionDate,
          startTime: next.startTime,
          endTime: next.endTime,
          teachingMode: next.teachingMode,
          sessionId: next.id,
          isToday: next.sessionDate === todayStr
        };
      }

      return {
        ...student,
        nextClass
      };
    });

    return { students: enrichedStudents, source };
  },

  /**
   * Get single student by ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    const { students } = await this.getStudents();
    return students.find(s => s.id === id) || null;
  },

  /**
   * Save (create or update) student record
   */
  async saveStudent(studentData: Partial<Student>): Promise<{
    success: boolean;
    student?: Student;
    error?: string;
  }> {
    if (!studentData.fullName?.trim()) {
      return { success: false, error: 'Student full name is required' };
    }
    if (!studentData.gradeLevel?.trim()) {
      return { success: false, error: 'Grade / Class level is required' };
    }
    if (!studentData.parentName?.trim()) {
      return { success: false, error: 'Parent / Guardian name is required' };
    }
    if (!studentData.parentPhone?.trim()) {
      return { success: false, error: 'Parent phone number is required' };
    }

    const id = studentData.id || `std-${Date.now()}`;
    const completeStudent: Student = {
      id,
      userId: studentData.userId,
      fullName: studentData.fullName.trim(),
      gradeLevel: studentData.gradeLevel,
      subjects: studentData.subjects && studentData.subjects.length > 0 ? studentData.subjects : ['General Studies'],
      assignedTutorId: studentData.assignedTutorId,
      assignedTutorName: studentData.assignedTutorName,
      parentName: studentData.parentName.trim(),
      parentPhone: studentData.parentPhone.trim(),
      parentEmail: studentData.parentEmail?.trim(),
      city: studentData.city || 'Lahore',
      address: studentData.address || '',
      teachingMode: studentData.teachingMode || 'Home Tuition',
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
      status: studentData.status || 'active',
      monthlyFee: Number(studentData.monthlyFee || 0),
      notes: studentData.notes || '',
      nextClass: studentData.nextClass,
      updatedAt: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('students').upsert({
          id: completeStudent.id,
          full_name: completeStudent.fullName,
          grade_level: completeStudent.gradeLevel,
          subjects: completeStudent.subjects,
          assigned_tutor_id: completeStudent.assignedTutorId,
          parent_name: completeStudent.parentName,
          parent_phone: completeStudent.parentPhone,
          parent_email: completeStudent.parentEmail,
          city: completeStudent.city,
          address: completeStudent.address,
          teaching_mode: completeStudent.teachingMode,
          enrollment_date: completeStudent.enrollmentDate,
          status: completeStudent.status,
          monthly_fee: completeStudent.monthlyFee,
          notes: completeStudent.notes,
          updated_at: completeStudent.updatedAt
        });
      } catch (e) {
        console.warn('Supabase student upsert error:', e);
      }
    }

    const current = getStoredStudents();
    const idx = current.findIndex(s => s.id === completeStudent.id);
    let updated: Student[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = completeStudent;
    } else {
      updated = [completeStudent, ...current];
    }
    saveStoredStudents(updated);

    return { success: true, student: completeStudent };
  },

  /**
   * Delete student
   */
  async deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('students').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase student delete error:', e);
      }
    }

    const current = getStoredStudents();
    saveStoredStudents(current.filter(s => s.id !== id));
    return { success: true };
  }
};
