import { TutorSalaryRecord, StudentFeeRecord } from '../types';
import { INITIAL_TUTOR_SALARIES, INITIAL_STUDENT_FEES } from '../data/mockData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

const SALARIES_STORAGE_KEY = 'home_tutor_salaries_v3';
const FEES_STORAGE_KEY = 'home_tutor_fees_v3';

let memorySalaries: TutorSalaryRecord[] | null = null;
let memoryFees: StudentFeeRecord[] | null = null;

function getStoredSalaries(): TutorSalaryRecord[] {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(SALARIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached salaries:', e);
    }
  }
  return memorySalaries || INITIAL_TUTOR_SALARIES;
}

function saveStoredSalaries(records: TutorSalaryRecord[]): void {
  memorySalaries = records;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save cached salaries:', e);
    }
  }
}

function getStoredFees(): StudentFeeRecord[] {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(FEES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached fees:', e);
    }
  }
  return memoryFees || INITIAL_STUDENT_FEES;
}

function saveStoredFees(records: StudentFeeRecord[]): void {
  memoryFees = records;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save cached fees:', e);
    }
  }
}

export const financialService = {
  // -------------------------------------------------------------
  // TUTOR COMPENSATION (SALARY) RECORDS
  // -------------------------------------------------------------
  async getTutorSalaries(options: {
    tutorId?: string;
    status?: string;
    billingPeriod?: string;
  } = {}): Promise<{ records: TutorSalaryRecord[]; source: 'supabase' | 'local' }> {
    const supabase = getSupabaseClient();

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('tutor_salaries').select('*');
        if (options.tutorId) query = query.eq('tutor_id', options.tutorId);
        if (options.status && options.status !== 'All') query = query.eq('status', options.status);
        if (options.billingPeriod && options.billingPeriod !== 'All') query = query.eq('billing_period', options.billingPeriod);

        const { data, error } = await query.order('due_date', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: TutorSalaryRecord[] = data.map((row: any) => ({
            id: row.id,
            tutorId: row.tutor_id,
            tutorName: row.tutor_name || 'Tutor',
            billingPeriod: row.billing_period,
            amount: Number(row.amount || 0),
            paymentFrequency: row.payment_frequency || 'monthly',
            classesCount: Number(row.classes_count || 0),
            dueDate: row.due_date,
            paidDate: row.paid_date,
            status: row.status || 'pending',
            paymentMethod: row.payment_method,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          return { records: mapped, source: 'supabase' };
        }
      } catch (e) {
        console.warn('Supabase salaries query error:', e);
      }
    }

    let list = getStoredSalaries();
    if (options.tutorId) list = list.filter(r => r.tutorId === options.tutorId);
    if (options.status && options.status !== 'All') list = list.filter(r => r.status === options.status);
    if (options.billingPeriod && options.billingPeriod !== 'All') list = list.filter(r => r.billingPeriod === options.billingPeriod);

    return { records: list, source: 'local' };
  },

  async saveTutorSalary(record: Partial<TutorSalaryRecord>): Promise<{
    success: boolean;
    record?: TutorSalaryRecord;
    error?: string;
  }> {
    if (!record.tutorId) return { success: false, error: 'Tutor is required' };
    if (!record.billingPeriod?.trim()) return { success: false, error: 'Billing period is required' };
    if (record.amount === undefined || record.amount < 0) {
      return { success: false, error: 'Valid compensation amount is required' };
    }
    if (!record.dueDate) return { success: false, error: 'Due date is required' };

    const id = record.id || `sal-${Date.now()}`;
    const complete: TutorSalaryRecord = {
      id,
      tutorId: record.tutorId,
      tutorName: record.tutorName || 'Tutor',
      billingPeriod: record.billingPeriod.trim(),
      amount: Number(record.amount),
      paymentFrequency: record.paymentFrequency || 'monthly',
      classesCount: Number(record.classesCount || 0),
      dueDate: record.dueDate,
      paidDate: record.paidDate,
      status: record.status || 'pending',
      paymentMethod: record.paymentMethod || 'Bank Transfer',
      notes: record.notes || '',
      updatedAt: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('tutor_salaries').upsert({
          id: complete.id,
          tutor_id: complete.tutorId,
          billing_period: complete.billingPeriod,
          amount: complete.amount,
          payment_frequency: complete.paymentFrequency,
          classes_count: complete.classesCount,
          due_date: complete.dueDate,
          paid_date: complete.paidDate,
          status: complete.status,
          payment_method: complete.paymentMethod,
          notes: complete.notes,
          updated_at: complete.updatedAt
        });
      } catch (e) {
        console.warn('Supabase salary upsert error:', e);
      }
    }

    const current = getStoredSalaries();
    const idx = current.findIndex(r => r.id === complete.id);
    const updated = idx >= 0 
      ? current.map((r, i) => i === idx ? complete : r) 
      : [complete, ...current];
    saveStoredSalaries(updated);

    return { success: true, record: complete };
  },

  async deleteTutorSalary(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('tutor_salaries').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase salary delete error:', e);
      }
    }

    const current = getStoredSalaries();
    saveStoredSalaries(current.filter(r => r.id !== id));
    return { success: true };
  },

  // -------------------------------------------------------------
  // STUDENT TUITION FEE CHARGES & PAYMENTS
  // -------------------------------------------------------------
  async getStudentFees(options: {
    studentId?: string;
    status?: string;
    billingPeriod?: string;
  } = {}): Promise<{ records: StudentFeeRecord[]; source: 'supabase' | 'local' }> {
    const supabase = getSupabaseClient();

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('student_fees').select('*');
        if (options.studentId) query = query.eq('student_id', options.studentId);
        if (options.status && options.status !== 'All') query = query.eq('status', options.status);
        if (options.billingPeriod && options.billingPeriod !== 'All') query = query.eq('billing_period', options.billingPeriod);

        const { data, error } = await query.order('due_date', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: StudentFeeRecord[] = data.map((row: any) => ({
            id: row.id,
            studentId: row.student_id,
            studentName: row.student_name || 'Student',
            billingPeriod: row.billing_period,
            amount: Number(row.amount || 0),
            amountPaid: Number(row.amount_paid || 0),
            dueDate: row.due_date,
            paidDate: row.paid_date,
            status: row.status || 'pending',
            paymentMethod: row.payment_method,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          return { records: mapped, source: 'supabase' };
        }
      } catch (e) {
        console.warn('Supabase fees query error:', e);
      }
    }

    let list = getStoredFees();
    if (options.studentId) list = list.filter(r => r.studentId === options.studentId);
    if (options.status && options.status !== 'All') list = list.filter(r => r.status === options.status);
    if (options.billingPeriod && options.billingPeriod !== 'All') list = list.filter(r => r.billingPeriod === options.billingPeriod);

    return { records: list, source: 'local' };
  },

  async saveStudentFee(record: Partial<StudentFeeRecord>): Promise<{
    success: boolean;
    record?: StudentFeeRecord;
    error?: string;
  }> {
    if (!record.studentId) return { success: false, error: 'Student is required' };
    if (!record.billingPeriod?.trim()) return { success: false, error: 'Billing period is required' };
    if (record.amount === undefined || record.amount < 0) {
      return { success: false, error: 'Valid tuition fee amount is required' };
    }
    if (!record.dueDate) return { success: false, error: 'Due date is required' };

    const amount = Number(record.amount);
    const amountPaid = Number(record.amountPaid || 0);

    // Derive status dynamically if not explicitly forced
    let derivedStatus: StudentFeeRecord['status'] = record.status || 'pending';
    if (amountPaid >= amount) {
      derivedStatus = 'paid';
    } else if (amountPaid > 0 && amountPaid < amount) {
      derivedStatus = 'partial';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (record.dueDate && record.dueDate < todayStr) {
        derivedStatus = 'overdue';
      }
    }

    const id = record.id || `fee-${Date.now()}`;
    const complete: StudentFeeRecord = {
      id,
      studentId: record.studentId,
      studentName: record.studentName || 'Student',
      billingPeriod: record.billingPeriod.trim(),
      amount,
      amountPaid,
      dueDate: record.dueDate,
      paidDate: record.paidDate,
      status: derivedStatus,
      paymentMethod: record.paymentMethod || 'Online Bank Transfer',
      notes: record.notes || '',
      updatedAt: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('student_fees').upsert({
          id: complete.id,
          student_id: complete.studentId,
          billing_period: complete.billingPeriod,
          amount: complete.amount,
          amount_paid: complete.amountPaid,
          due_date: complete.dueDate,
          paid_date: complete.paidDate,
          status: complete.status,
          payment_method: complete.paymentMethod,
          notes: complete.notes,
          updated_at: complete.updatedAt
        });
      } catch (e) {
        console.warn('Supabase fee upsert error:', e);
      }
    }

    const current = getStoredFees();
    const idx = current.findIndex(r => r.id === complete.id);
    const updated = idx >= 0 
      ? current.map((r, i) => i === idx ? complete : r) 
      : [complete, ...current];
    saveStoredFees(updated);

    return { success: true, record: complete };
  },

  async deleteStudentFee(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('student_fees').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase fee delete error:', e);
      }
    }

    const current = getStoredFees();
    saveStoredFees(current.filter(r => r.id !== id));
    return { success: true };
  },

  // -------------------------------------------------------------
  // DYNAMIC FINANCIAL CALCULATIONS (No hardcoded metrics)
  // -------------------------------------------------------------
  async calculateMetrics(tutorId?: string): Promise<{
    // Tutor Salaries
    totalSalariesAmount: number;
    totalSalariesPaid: number;
    totalSalariesPending: number;
    // Student Fees (Admin only)
    totalFeesInvoiced: number;
    totalFeesCollected: number;
    totalFeesOutstanding: number;
    // Net Platform (Admin only)
    netOperatingBalance: number;
  }> {
    const { records: salaries } = await this.getTutorSalaries({ tutorId });
    
    // When scoped to a tutor, platform student fees and overall operating margin are confidential to Admin only
    const fees = tutorId ? [] : (await this.getStudentFees()).records;

    const totalSalariesAmount = salaries.reduce((acc, s) => acc + s.amount, 0);
    const totalSalariesPaid = salaries
      .filter(s => s.status === 'paid')
      .reduce((acc, s) => acc + s.amount, 0);
    const totalSalariesPending = salaries
      .filter(s => s.status === 'pending')
      .reduce((acc, s) => acc + s.amount, 0);

    const totalFeesInvoiced = tutorId ? 0 : fees.reduce((acc, f) => acc + f.amount, 0);
    const totalFeesCollected = tutorId ? 0 : fees.reduce((acc, f) => acc + f.amountPaid, 0);
    const totalFeesOutstanding = tutorId ? 0 : fees.reduce((acc, f) => acc + (f.amount - f.amountPaid), 0);

    const netOperatingBalance = tutorId ? 0 : totalFeesCollected - totalSalariesPaid;

    return {
      totalSalariesAmount,
      totalSalariesPaid,
      totalSalariesPending,
      totalFeesInvoiced,
      totalFeesCollected,
      totalFeesOutstanding,
      netOperatingBalance
    };
  }
};
