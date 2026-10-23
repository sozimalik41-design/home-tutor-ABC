export interface Tutor {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  avatar: string;
  title: string;
  qualification: string;
  university: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number; // in USD or local currency equivalent
  salaryAmount: number; // Tutor compensation/payment amount
  salaryFrequency: 'monthly' | 'per_class' | 'hourly';
  studentTuitionFee: number; // Student tuition fee as separate field
  currency: string;
  subjects: string[];
  classes: string[];
  cities: string[];
  teachingArea?: string;
  mode: ('In-Person' | 'Online' | 'Hybrid')[];
  bio: string;
  teachingApproach: string;
  featured?: boolean;
  verified: boolean;
  status: 'active' | 'inactive' | 'pending' | 'verified';
  availability: string[];
  badges: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Poster {
  id: string;
  title: string;
  category: 'Recruitment' | 'STEM' | 'Exam Prep' | 'Language' | 'Primary';
  imageUrl: string;
  description: string;
  badgeText: string;
  downloadUrl?: string;
  slotNumber?: number; // 1 to 10
  destinationUrl?: string;
  altText?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  tutorName: string;
  tutorRole: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
  views: string;
  tags: string[];
  slotNumber?: number; // 1 to 3
  videoType?: 'youtube' | 'uploaded';
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLink {
  id: string;
  platform: 'tiktok' | 'facebook' | 'youtube' | 'instagram';
  name: string;
  url: string;
  handle: string;
  followers: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface PosterRow {
  id: string;
  slot_number: number;
  title: string;
  description: string;
  category: string;
  badge_text: string;
  image_url: string;
  destination_url: string | null;
  alt_text: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoRow {
  id: string;
  slot_number: number;
  title: string;
  description: string;
  tutor_name: string;
  tutor_role: string;
  duration: string;
  thumbnail_url: string;
  video_url: string;
  video_type: 'youtube' | 'uploaded';
  views: string;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLinkRow {
  id: string;
  platform: 'tiktok' | 'facebook' | 'youtube' | 'instagram';
  name: string;
  url: string;
  handle: string;
  followers: string;
  is_active: boolean;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  parentName?: string;
  role: string;
  grade: string;
  subject: string;
  comment: string;
  rating: number;
  tutorName: string;
  location: string;
}

export interface SubjectCategory {
  id: string;
  name: string;
  tutorCount: number;
  iconName: string;
  popularTopics: string[];
}

// ==========================================
// PHASE 3: TUTOR, STUDENT, SCHEDULE & FINANCE TYPES
// ==========================================

export interface NextClassInfo {
  studentName: string;
  tutorName: string;
  classGrade: string;
  subject: string;
  nextClassDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  teachingMode: 'Home Tuition' | 'Online' | 'Hybrid';
  sessionId?: string;
  isToday?: boolean;
  isPastDue?: boolean;
}

export interface Student {
  id: string;
  userId?: string;
  fullName: string;
  gradeLevel: string;
  subjects: string[];
  assignedTutorId?: string;
  assignedTutorName?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  city: string;
  address?: string;
  teachingMode: 'Home Tuition' | 'Online' | 'Hybrid';
  enrollmentDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive' | 'completed' | 'paused';
  monthlyFee: number;
  notes?: string;
  nextClass?: NextClassInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSession {
  id: string;
  studentId: string;
  studentName?: string;
  tutorId: string;
  tutorName?: string;
  subject: string;
  classGrade: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  teachingMode: 'Home Tuition' | 'Online' | 'Hybrid';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLinkOrAddress?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TutorSalaryRecord {
  id: string;
  tutorId: string;
  tutorName?: string;
  billingPeriod: string; // e.g. "October 2026"
  amount: number;
  paymentFrequency: 'monthly' | 'per_class' | 'hourly';
  classesCount: number;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string; // YYYY-MM-DD
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFeeRecord {
  id: string;
  studentId: string;
  studentName?: string;
  billingPeriod: string; // e.g. "October 2026"
  amount: number;
  amountPaid: number;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string; // YYYY-MM-DD
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  tutorId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  createdAt?: string;
}

// ==========================================
// SITE SETTINGS, ADMISSIONS, INBOX & GALLERY
// ==========================================

export interface SiteSettings {
  academyName: string;
  tagline: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  campusAddress: string;
  officeHours: string;
  currency: string;
  admissionsOpen: boolean;
  registrationFee: number;
  autoNotificationEmail: boolean;
  announcementBarText: string;
  showAnnouncementBar: boolean;
  adminPasscode?: string;
  updatedAt?: string;
}

export interface AdmissionApplication {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  gradeLevel: string;
  subjects: string[];
  teachingMode: 'Home Tuition' | 'Online' | 'Hybrid';
  city: string;
  address?: string;
  preferredTiming: string;
  budget: number;
  status: 'pending' | 'approved' | 'enrolled' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export interface InboxMessage {
  id: string;
  senderName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: 'Tutor Request' | 'Admission' | 'General Query' | 'Fee Inquiry';
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
  replyNote?: string;
}

export interface AcademyAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Admissions' | 'Exam Prep' | 'Holiday' | 'Fee Alert' | 'Notice';
  priority: 'high' | 'normal' | 'urgent';
  isPublished: boolean;
  date: string;
  badge?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: 'Campus' | 'Tutoring' | 'Awards' | 'Workshops';
  date: string;
}

