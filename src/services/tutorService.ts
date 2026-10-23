import { Tutor } from '../types';
import { TUTORS_LIST } from '../data/mockData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

const TUTORS_STORAGE_KEY = 'home_tutor_tutors_v3';

let memoryTutors: Tutor[] | null = null;

// Helper to get local or cached tutors
function getStoredTutors(): Tutor[] {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(TUTORS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached tutors:', e);
    }
  }
  return memoryTutors || TUTORS_LIST;
}

function saveStoredTutors(tutors: Tutor[]): void {
  memoryTutors = tutors;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(TUTORS_STORAGE_KEY, JSON.stringify(tutors));
    } catch (e) {
      console.warn('Failed to save cached tutors:', e);
    }
  }
}

export interface TutorFilterOptions {
  search?: string;
  gender?: 'All' | 'Male' | 'Female' | 'Prefer not to say';
  subject?: string;
  classLevel?: string;
  city?: string;
  mode?: 'All' | 'In-Person' | 'Online' | 'Hybrid';
  status?: string;
  sortBy?: 'rating' | 'experience' | 'price-asc' | 'price-desc' | 'name';
  limit?: number;
  offset?: number;
}

export const tutorService = {
  /**
   * Fetch tutors with filtering, search, and gender filter
   */
  async getTutors(options: TutorFilterOptions = {}): Promise<{ tutors: Tutor[]; total: number; source: 'supabase' | 'local' }> {
    const supabase = getSupabaseClient();

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('tutors').select('*', { count: 'exact' });

        if (options.gender && options.gender !== 'All') {
          query = query.eq('gender', options.gender);
        }
        if (options.status && options.status !== 'All') {
          query = query.eq('status', options.status);
        }
        if (options.city && options.city !== 'All Cities') {
          query = query.eq('city', options.city);
        }
        if (options.search?.trim()) {
          query = query.ilike('name', `%${options.search.trim()}%`);
        }

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          const mappedTutors: Tutor[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            gender: row.gender || 'Prefer not to say',
            avatar: row.avatar || '',
            title: row.title || 'Professional Educator',
            qualification: row.qualification,
            university: row.university || '',
            experienceYears: row.experience_years || 0,
            rating: Number(row.rating || 5.0),
            reviewCount: row.review_count || 0,
            hourlyRate: Number(row.hourly_rate || 25),
            salaryAmount: Number(row.salary_amount || 0),
            salaryFrequency: row.salary_frequency || 'monthly',
            studentTuitionFee: Number(row.student_tuition_fee || 0),
            currency: row.currency || '$',
            subjects: row.subjects || [],
            classes: row.classes || [],
            cities: [row.city || 'Lahore'],
            teachingArea: row.teaching_area || '',
            mode: row.mode || ['In-Person', 'Online'],
            bio: row.bio || '',
            teachingApproach: row.teaching_approach || '',
            featured: Boolean(row.featured),
            verified: Boolean(row.verified),
            status: row.status || 'verified',
            availability: row.availability || [],
            badges: row.badges || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return { tutors: mappedTutors, total: count || mappedTutors.length, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase tutor query error, falling back to local dataset:', err);
      }
    }

    // Local / cached dataset fallback
    let list = getStoredTutors();

    // 1. Gender filter
    if (options.gender && options.gender !== 'All') {
      list = list.filter(t => t.gender === options.gender);
    }

    // 2. Status filter
    if (options.status && options.status !== 'All') {
      list = list.filter(t => t.status === options.status);
    }

    // 3. Search query
    if (options.search?.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.qualification.toLowerCase().includes(q) ||
        t.subjects.some(s => s.toLowerCase().includes(q)) ||
        (t.teachingArea && t.teachingArea.toLowerCase().includes(q))
      );
    }

    // 4. Subject filter
    if (options.subject && options.subject !== 'All Subjects') {
      list = list.filter(t => 
        t.subjects.some(s => 
          s.toLowerCase().includes(options.subject!.toLowerCase()) ||
          options.subject!.toLowerCase().includes(s.toLowerCase())
        )
      );
    }

    // 5. Class level filter
    if (options.classLevel && options.classLevel !== 'All Classes') {
      list = list.filter(t => 
        t.classes.some(c => c.toLowerCase().includes(options.classLevel!.toLowerCase()))
      );
    }

    // 6. City filter
    if (options.city && options.city !== 'All Cities') {
      list = list.filter(t => 
        t.cities.includes(options.city!) || t.cities.includes('Online Only')
      );
    }

    // 7. Mode filter
    if (options.mode && options.mode !== 'All') {
      const targetMode = options.mode as 'In-Person' | 'Online' | 'Hybrid';
      list = list.filter(t => t.mode.includes(targetMode) || t.mode.includes('Hybrid'));
    }

    // 8. Sorting
    if (options.sortBy) {
      list = [...list].sort((a, b) => {
        if (options.sortBy === 'rating') return b.rating - a.rating;
        if (options.sortBy === 'experience') return b.experienceYears - a.experienceYears;
        if (options.sortBy === 'price-asc') return a.hourlyRate - b.hourlyRate;
        if (options.sortBy === 'price-desc') return b.hourlyRate - a.hourlyRate;
        if (options.sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
    }

    return { tutors: list, total: list.length, source: 'local' };
  },

  /**
   * Get single tutor by ID
   */
  async getTutorById(id: string): Promise<Tutor | null> {
    const { tutors } = await this.getTutors();
    return tutors.find(t => t.id === id) || null;
  },

  /**
   * Create or update a tutor record
   */
  async saveTutor(tutorData: Partial<Tutor>): Promise<{ success: boolean; tutor: Tutor; error?: string }> {
    if (!tutorData.name?.trim()) {
      return { success: false, tutor: tutorData as Tutor, error: 'Tutor full name is required.' };
    }
    if (!tutorData.qualification?.trim()) {
      return { success: false, tutor: tutorData as Tutor, error: 'Qualification is required.' };
    }

    const supabase = getSupabaseClient();
    const id = tutorData.id || `tutor-${Date.now()}`;

    const completeTutor: Tutor = {
      id,
      name: tutorData.name.trim(),
      gender: tutorData.gender || 'Prefer not to say',
      avatar: tutorData.avatar || '',
      title: tutorData.title || 'Professional Educator',
      qualification: tutorData.qualification.trim(),
      university: tutorData.university || '',
      experienceYears: Number(tutorData.experienceYears || 0),
      rating: Number(tutorData.rating || 5.0),
      reviewCount: Number(tutorData.reviewCount || 0),
      hourlyRate: Number(tutorData.hourlyRate || 25),
      salaryAmount: Number(tutorData.salaryAmount || 0),
      salaryFrequency: tutorData.salaryFrequency || 'monthly',
      studentTuitionFee: Number(tutorData.studentTuitionFee || 0),
      currency: tutorData.currency || '$',
      subjects: tutorData.subjects && tutorData.subjects.length > 0 ? tutorData.subjects : ['General Studies'],
      classes: tutorData.classes && tutorData.classes.length > 0 ? tutorData.classes : ['All Classes'],
      cities: tutorData.cities && tutorData.cities.length > 0 ? tutorData.cities : ['Lahore'],
      teachingArea: tutorData.teachingArea || '',
      mode: tutorData.mode || ['In-Person', 'Online'],
      bio: tutorData.bio || '',
      teachingApproach: tutorData.teachingApproach || '',
      featured: Boolean(tutorData.featured),
      verified: Boolean(tutorData.verified ?? true),
      status: tutorData.status || 'verified',
      availability: tutorData.availability || ['Monday 4:00 PM - 7:00 PM'],
      badges: tutorData.badges || ['Verified Tutor'],
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('tutors').upsert({
          id: completeTutor.id,
          name: completeTutor.name,
          gender: completeTutor.gender,
          avatar: completeTutor.avatar,
          title: completeTutor.title,
          qualification: completeTutor.qualification,
          university: completeTutor.university,
          experience_years: completeTutor.experienceYears,
          hourly_rate: completeTutor.hourlyRate,
          salary_amount: completeTutor.salaryAmount,
          salary_frequency: completeTutor.salaryFrequency,
          student_tuition_fee: completeTutor.studentTuitionFee,
          subjects: completeTutor.subjects,
          classes: completeTutor.classes,
          city: completeTutor.cities[0] || 'Lahore',
          teaching_area: completeTutor.teachingArea,
          mode: completeTutor.mode,
          bio: completeTutor.bio,
          teaching_approach: completeTutor.teachingApproach,
          status: completeTutor.status,
          availability: completeTutor.availability,
          updated_at: completeTutor.updatedAt
        });

        if (error) {
          console.warn('Supabase upsert error, falling back to local save:', error.message);
        }
      } catch (err) {
        console.warn('Supabase upsert exception:', err);
      }
    }

    // Update local storage cache
    const current = getStoredTutors();
    const existingIndex = current.findIndex(t => t.id === completeTutor.id);
    let updated: Tutor[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = completeTutor;
    } else {
      updated = [completeTutor, ...current];
    }
    saveStoredTutors(updated);

    return { success: true, tutor: completeTutor };
  },

  /**
   * Delete a tutor record
   */
  async deleteTutor(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('tutors').delete().eq('id', id);
        if (error) {
          console.warn('Supabase tutor delete error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase delete exception:', e);
      }
    }

    const current = getStoredTutors();
    const filtered = current.filter(t => t.id !== id);
    saveStoredTutors(filtered);

    return { success: true };
  }
};
