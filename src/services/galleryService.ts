import { GalleryPhoto } from '../types';

const GALLERY_KEY = 'home_tutor_gallery_v1';

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-1',
    title: '1-on-1 Interactive STEM Mentoring Session',
    caption: 'Dr. Ahmed Raza guiding a Grade 10 student through past paper trigonometry problem maps at the student’s study desk.',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    category: 'Tutoring',
    date: '2026-10-15'
  },
  {
    id: 'gal-2',
    title: 'Home Tutor Academic Advisory & Resource Center',
    caption: 'Our physical consultation desk in Gulberg III, Lahore, where parents review tutor transcripts and lesson plans.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    category: 'Campus',
    date: '2026-10-10'
  },
  {
    id: 'gal-3',
    title: 'Cambridge CAIE High Achievers Celebration',
    caption: 'Annual recognition of students achieving A* grades in O and A-Levels across Lahore and Islamabad.',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
    category: 'Awards',
    date: '2026-09-28'
  },
  {
    id: 'gal-4',
    title: 'Certified Tutor Pedagogy & Safety Workshop',
    caption: 'Quarterly training session for registered educators on active learning techniques and professional home conduct standards.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    category: 'Workshops',
    date: '2026-09-14'
  },
  {
    id: 'gal-5',
    title: 'Primary Reading & Early Numeracy Home Tutoring',
    caption: 'Patient, personalized phonics instruction for elementary learners building foundational study habits.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    category: 'Tutoring',
    date: '2026-09-02'
  },
  {
    id: 'gal-6',
    title: 'Digital Whiteboard & Hybrid Classroom Setup',
    caption: 'High-definition online tutoring equipment ensuring seamless stylus calculations for overseas and distant students.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    category: 'Campus',
    date: '2026-08-20'
  }
];

let cachedGallery: GalleryPhoto[] | null = null;

export function getGalleryPhotos(): GalleryPhoto[] {
  if (cachedGallery) return cachedGallery;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(GALLERY_KEY);
      if (saved) {
        cachedGallery = JSON.parse(saved);
        return cachedGallery!;
      }
    } catch {}
  }
  cachedGallery = [...INITIAL_GALLERY_PHOTOS];
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(cachedGallery));
    } catch {}
  }
  return cachedGallery;
}

export function saveGalleryPhotos(photos: GalleryPhoto[]): void {
  cachedGallery = photos;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(photos));
      window.dispatchEvent(new CustomEvent('home_tutor_gallery_change'));
    } catch {}
  }
}

export function addGalleryPhoto(photo: Omit<GalleryPhoto, 'id' | 'date'>): GalleryPhoto {
  const current = getGalleryPhotos();
  const newPhoto: GalleryPhoto = {
    ...photo,
    id: `gal-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [newPhoto, ...current];
  saveGalleryPhotos(updated);
  return newPhoto;
}

export function deleteGalleryPhoto(id: string): boolean {
  const current = getGalleryPhotos();
  const updated = current.filter(p => p.id !== id);
  saveGalleryPhotos(updated);
  return true;
}
