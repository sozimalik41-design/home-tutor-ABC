import { AdmissionApplication } from '../types';

const ADMISSIONS_KEY = 'home_tutor_admissions_v1';

export const INITIAL_ADMISSIONS: AdmissionApplication[] = [
  {
    id: 'adm-101',
    studentName: 'Rayyan Shah',
    parentName: 'Shahid Mehmood',
    parentPhone: '+92 321 9845123',
    parentEmail: 'shahid.mehmood@example.com',
    gradeLevel: 'Matric / O-Levels (Grade 10)',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    teachingMode: 'Home Tuition',
    city: 'Lahore',
    address: 'House 14-B, DHA Phase 5, Lahore',
    preferredTiming: 'Evenings (5:00 PM - 7:00 PM)',
    budget: 3500,
    status: 'pending',
    submittedAt: '2026-10-18T14:30:00.000Z',
    notes: 'Urgent tutor requirement for CAIE upcoming mocks.'
  },
  {
    id: 'adm-102',
    studentName: 'Hania Asad',
    parentName: 'Dr. Asad Ullah',
    parentPhone: '+92 300 4455667',
    parentEmail: 'dr.asad@example.com',
    gradeLevel: 'FSc / A-Levels (Grade 12)',
    subjects: ['Biology & Life Sciences', 'Chemistry'],
    teachingMode: 'Home Tuition',
    city: 'Islamabad',
    address: 'Sector F-7/3, Street 12, House 8',
    preferredTiming: 'Afternoon (3:30 PM - 5:30 PM)',
    budget: 4000,
    status: 'approved',
    submittedAt: '2026-10-17T09:15:00.000Z',
    notes: 'MDCAT pre-medical coaching required with high priority.'
  },
  {
    id: 'adm-103',
    studentName: 'Zainab Qureshi',
    parentName: 'Mrs. Farzana Qureshi',
    parentPhone: '+92 333 1234567',
    parentEmail: 'farzana.q@example.com',
    gradeLevel: 'Middle School (Grade 6)',
    subjects: ['English & Literature', 'Mathematics'],
    teachingMode: 'Online',
    city: 'Karachi',
    address: 'Clifton Block 4',
    preferredTiming: '4:00 PM - 6:00 PM',
    budget: 2200,
    status: 'enrolled',
    submittedAt: '2026-10-15T11:00:00.000Z',
    notes: 'Enrolled with Tutor Sarah Jenkins for online sessions.'
  },
  {
    id: 'adm-104',
    studentName: 'Musa Tariq',
    parentName: 'Tariq Javed',
    parentPhone: '+92 345 9988776',
    parentEmail: 'tariq.javed@example.com',
    gradeLevel: 'Primary (Grade 4)',
    subjects: ['Mathematics', 'English & Literature', 'Urdu'],
    teachingMode: 'Home Tuition',
    city: 'Rawalpindi',
    address: 'Bahria Town Phase 7',
    preferredTiming: '5:00 PM - 6:30 PM',
    budget: 2500,
    status: 'pending',
    submittedAt: '2026-10-19T16:20:00.000Z',
    notes: 'Needs experienced female home tutor for primary foundations.'
  }
];

let cachedAdmissions: AdmissionApplication[] | null = null;

export function getAdmissions(): AdmissionApplication[] {
  if (cachedAdmissions) return cachedAdmissions;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(ADMISSIONS_KEY);
      if (saved) {
        cachedAdmissions = JSON.parse(saved);
        return cachedAdmissions!;
      }
    } catch {}
  }
  cachedAdmissions = [...INITIAL_ADMISSIONS];
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(ADMISSIONS_KEY, JSON.stringify(cachedAdmissions));
    } catch {}
  }
  return cachedAdmissions;
}

export function saveAdmissions(list: AdmissionApplication[]): void {
  cachedAdmissions = list;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(ADMISSIONS_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('home_tutor_admissions_change'));
    } catch {}
  }
}

export function addAdmissionApplication(data: Omit<AdmissionApplication, 'id' | 'submittedAt' | 'status'>): AdmissionApplication {
  const current = getAdmissions();
  const newApp: AdmissionApplication = {
    ...data,
    id: `adm-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
  const updated = [newApp, ...current];
  saveAdmissions(updated);
  return newApp;
}

export function updateAdmissionStatus(id: string, status: AdmissionApplication['status']): boolean {
  const current = getAdmissions();
  const index = current.findIndex(a => a.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], status };
  saveAdmissions([...current]);
  return true;
}

export function deleteAdmissionApplication(id: string): boolean {
  const current = getAdmissions();
  const updated = current.filter(a => a.id !== id);
  saveAdmissions(updated);
  return true;
}
