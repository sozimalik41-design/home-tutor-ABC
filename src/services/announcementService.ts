import { AcademyAnnouncement } from '../types';

const ANNOUNCEMENTS_KEY = 'home_tutor_announcements_v1';

export const INITIAL_ANNOUNCEMENTS: AcademyAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Admissions Open for Winter 2026 Batch',
    content: 'Registration is now open for Cambridge CAIE O/A-Levels and Matric/FSc board revision courses with top 5% verified educators. Early-bird discount applies on the first 50 registrations.',
    category: 'Admissions',
    priority: 'urgent',
    isPublished: true,
    date: '2026-10-18',
    badge: 'New Batch Open'
  },
  {
    id: 'ann-2',
    title: 'Free 1-on-1 Diagnostic Demo Class Available',
    content: 'Parents can schedule a complimentary 45-minute home or online diagnostic assessment session to evaluate their child’s conceptual gaps in Mathematics and Science.',
    category: 'Notice',
    priority: 'normal',
    isPublished: true,
    date: '2026-10-15',
    badge: 'Complimentary Demo'
  },
  {
    id: 'ann-3',
    title: 'MDCAT & ECAT Intensive 90-Day Sprint Starting Nov 1',
    content: 'Crash coaching sessions led by MBBS doctors and engineering alumni with daily formula drills, past paper breakdown, and simulated computer-based test practice.',
    category: 'Exam Prep',
    priority: 'high',
    isPublished: true,
    date: '2026-10-12',
    badge: 'Entry Test Prep'
  }
];

let cachedAnnouncements: AcademyAnnouncement[] | null = null;

export function getAnnouncements(): AcademyAnnouncement[] {
  if (cachedAnnouncements) return cachedAnnouncements;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (saved) {
        cachedAnnouncements = JSON.parse(saved);
        return cachedAnnouncements!;
      }
    } catch {}
  }
  cachedAnnouncements = [...INITIAL_ANNOUNCEMENTS];
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(cachedAnnouncements));
    } catch {}
  }
  return cachedAnnouncements;
}

export function saveAnnouncements(list: AcademyAnnouncement[]): void {
  cachedAnnouncements = list;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('home_tutor_announcements_change'));
    } catch {}
  }
}

export function addAnnouncement(data: Omit<AcademyAnnouncement, 'id'>): AcademyAnnouncement {
  const current = getAnnouncements();
  const newAnn: AcademyAnnouncement = {
    ...data,
    id: `ann-${Date.now()}`
  };
  const updated = [newAnn, ...current];
  saveAnnouncements(updated);
  return newAnn;
}

export function updateAnnouncement(id: string, data: Partial<AcademyAnnouncement>): boolean {
  const current = getAnnouncements();
  const index = current.findIndex(a => a.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...data };
  saveAnnouncements([...current]);
  return true;
}

export function deleteAnnouncement(id: string): boolean {
  const current = getAnnouncements();
  const updated = current.filter(a => a.id !== id);
  saveAnnouncements(updated);
  return true;
}
