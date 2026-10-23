import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  FileText, 
  Video, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  AlertTriangle, 
  Search,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Globe,
  Database,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  X,
  Share2,
  Lock,
  Unlock,
  AlertCircle,
  GraduationCap,
  DollarSign,
  Play,
  LogOut,
  Key,
  Settings,
  Inbox,
  Megaphone,
  Image as ImageIcon
} from 'lucide-react';
import { Poster, VideoContent, SocialLink, Tutor, Student } from '../types';
import { 
  getAdminPosterSlots, 
  savePoster, 
  deletePoster, 
  togglePosterPublish, 
  uploadPosterImage 
} from '../services/posterService';
import { 
  getAdminVideoSlots, 
  saveVideo, 
  deleteVideo, 
  toggleVideoPublish, 
  uploadVideoMedia 
} from '../services/videoService';
import { 
  getAllSocialLinksForAdmin, 
  saveSocialLink 
} from '../services/socialLinkService';
import { tutorService } from '../services/tutorService';
import { studentService } from '../services/studentService';
import { scheduleService } from '../services/scheduleService';
import { financialService } from '../services/financialService';
import { getInboxMessages } from '../services/inboxService';
import { getAdmissions } from '../services/admissionService';
import { TutorManagementSection } from '../components/admin/TutorManagementSection';
import { StudentManagementSection } from '../components/admin/StudentManagementSection';
import { ScheduleManagementSection } from '../components/admin/ScheduleManagementSection';
import { FinancialManagementSection } from '../components/admin/FinancialManagementSection';
import { SiteSettingsSection } from '../components/admin/SiteSettingsSection';
import { AdmissionsManagementSection } from '../components/admin/AdmissionsManagementSection';
import { InboxManagementSection } from '../components/admin/InboxManagementSection';
import { AnnouncementsManagementSection } from '../components/admin/AnnouncementsManagementSection';
import { GalleryManagementSection } from '../components/admin/GalleryManagementSection';
import { isSupabaseConfigured, getSupabaseConfig } from '../lib/supabase';
import { validateImageFile, validateVideoFile, parseYouTubeUrl, isValidUrl } from '../utils/validators';
import { isAdminAuthenticated, setAdminAuthenticated, verifyAdminPasscode } from '../utils/auth';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { BrandLogo } from '../components/common/BrandLogo';
import { getLanguage, setLanguage, Language } from '../services/languageService';

export type AdminTab = 
  | 'settings'
  | 'admissions'
  | 'inbox'
  | 'tutors'
  | 'students'
  | 'finances'
  | 'announcements'
  | 'posters'
  | 'gallery'
  | 'videos'
  | 'schedules'
  | 'social_links'
  | 'verifications'
  | 'database';

export const AdminDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as AdminTab) || 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [language, setLanguageState] = useState<Language>(getLanguage());
  const isUrdu = language === 'ur';

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ur' : 'en';
    setLanguage(nextLang);
    setLanguageState(nextLang);
  };
  
  // Real owner/admin authentication status
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [previewVideo, setPreviewVideo] = useState<VideoContent | null>(null);

  // Phase 3 Metrics State
  const [platformMetrics, setPlatformMetrics] = useState({
    activeTutorsCount: 0,
    enrolledStudentsCount: 0,
    classesScheduledCount: 0,
    tuitionFeesCollected: 0,
    salariesPendingPayout: 0,
    unreadInboxCount: 0,
    pendingAdmissionsCount: 0
  });

  // Data states
  const [posterSlots, setPosterSlots] = useState<(Poster | null)[]>(Array(10).fill(null));
  const [videoSlots, setVideoSlots] = useState<(VideoContent | null)[]>(Array(3).fill(null));
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [editingPosterSlot, setEditingPosterSlot] = useState<number | null>(null);
  const [posterFormData, setPosterFormData] = useState<{
    title: string;
    description: string;
    category: Poster['category'];
    badgeText: string;
    destinationUrl: string;
    altText: string;
    imageUrl: string;
    isPublished: boolean;
  }>({
    title: '',
    description: '',
    category: 'STEM',
    badgeText: 'Academic Campaign',
    destinationUrl: '/book-appointment',
    altText: '',
    imageUrl: '',
    isPublished: true
  });
  const [posterImageFile, setPosterImageFile] = useState<File | null>(null);
  const [posterImagePreview, setPosterImagePreview] = useState<string>('');
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [posterDeleteConfirmSlot, setPosterDeleteConfirmSlot] = useState<number | null>(null);

  // Video modal state
  const [editingVideoSlot, setEditingVideoSlot] = useState<number | null>(null);
  const [videoFormData, setVideoFormData] = useState<{
    title: string;
    description: string;
    tutorName: string;
    tutorRole: string;
    duration: string;
    thumbnailUrl: string;
    videoUrl: string;
    videoType: 'youtube' | 'uploaded';
    views: string;
    tags: string;
    isPublished: boolean;
  }>({
    title: '',
    description: '',
    tutorName: '',
    tutorRole: '',
    duration: '04:00',
    thumbnailUrl: '',
    videoUrl: '',
    videoType: 'youtube',
    views: '1.2k views',
    tags: 'Academic, O-Levels',
    isPublished: true
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoDeleteConfirmSlot, setVideoDeleteConfirmSlot] = useState<number | null>(null);

  // Social Links state
  const [socialEditStates, setSocialEditStates] = useState<Record<string, { url: string; handle: string; followers: string; isActive: boolean }>>({});
  const [savingSocialPlatform, setSavingSocialPlatform] = useState<string | null>(null);

  // Verification state (preserved from Phase 1)
  const [verifications, setVerifications] = useState([
    {
      id: 'app-101',
      name: 'Dr. Tariq Jamil',
      subject: 'Organic Chemistry & Biochemistry',
      university: 'Oxford University / Quaid-i-Azam University',
      degree: 'Ph.D. in Chemistry',
      city: 'Islamabad',
      date: '2026-10-12',
      status: 'pending'
    },
    {
      id: 'app-102',
      name: 'Hina Qureshi',
      subject: 'Cambridge CAIE O-Level Mathematics',
      university: 'LUMS Alumna',
      degree: 'B.S. in Mathematics & Economics',
      city: 'Lahore',
      date: '2026-10-11',
      status: 'pending'
    },
    {
      id: 'app-103',
      name: 'Mohammad Usman',
      subject: 'Computer Science & Python for Kids',
      university: 'FAST-NUCES',
      degree: 'B.S. Computer Science',
      city: 'Karachi',
      date: '2026-10-10',
      status: 'approved'
    }
  ]);

  const supabaseConfig = getSupabaseConfig();
  const [copiedSql, setCopiedSql] = useState(false);

  // Load all initial data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [posterRes, videoRes, socialRes, tutorsRes, studentsRes, sessionsRes, financeRes] = await Promise.all([
        getAdminPosterSlots(),
        getAdminVideoSlots(),
        getAllSocialLinksForAdmin(),
        tutorService.getTutors(),
        studentService.getStudents(),
        scheduleService.getSessions(),
        financialService.calculateMetrics()
      ]);

      const inboxMsgs = getInboxMessages();
      const admissionsList = getAdmissions();

      setPosterSlots(posterRes.slots);
      setVideoSlots(videoRes.slots);
      setSocialLinks(socialRes.links);

      setPlatformMetrics({
        activeTutorsCount: tutorsRes.tutors.filter((t: Tutor) => t.status === 'verified' || t.status === 'active').length,
        enrolledStudentsCount: studentsRes.students.filter((s: Student) => s.status === 'active').length,
        classesScheduledCount: sessionsRes.sessions.length,
        tuitionFeesCollected: financeRes.totalFeesCollected,
        salariesPendingPayout: financeRes.totalSalariesPending,
        unreadInboxCount: inboxMsgs.filter(m => m.status === 'unread').length,
        pendingAdmissionsCount: admissionsList.filter(a => a.status === 'pending').length
      });

      // Populate social form mapping
      const editMap: Record<string, any> = {};
      socialRes.links.forEach((l: SocialLink) => {
        editMap[l.platform] = {
          url: l.url,
          handle: l.handle,
          followers: l.followers,
          isActive: l.isActive
        };
      });
      setSocialEditStates(editMap);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
    loadDashboardData();

    const handleAuthChange = () => {
      setIsAdmin(isAdminAuthenticated());
    };

    const handleDataChange = () => {
      loadDashboardData();
    };

    const handleLangChange = (e: any) => {
      setLanguageState(e.detail || getLanguage());
    };

    window.addEventListener('home_tutor_auth_change', handleAuthChange);
    window.addEventListener('home_tutor_inbox_change', handleDataChange);
    window.addEventListener('home_tutor_admissions_change', handleDataChange);
    window.addEventListener('home_tutor_announcements_change', handleDataChange);
    window.addEventListener('home_tutor_gallery_change', handleDataChange);
    window.addEventListener('home_tutor_language_change', handleLangChange);

    return () => {
      window.removeEventListener('home_tutor_auth_change', handleAuthChange);
      window.removeEventListener('home_tutor_inbox_change', handleDataChange);
      window.removeEventListener('home_tutor_admissions_change', handleDataChange);
      window.removeEventListener('home_tutor_announcements_change', handleDataChange);
      window.removeEventListener('home_tutor_gallery_change', handleDataChange);
      window.removeEventListener('home_tutor_language_change', handleLangChange);
    };
  }, []);

  // Sync tab with URL param if it changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AdminTab | null;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (newTab: AdminTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(passcodeInput)) {
      setAdminAuthenticated(true);
      setIsAdmin(true);
      setPasscodeError('');
      showNotification('success', 'Admin session unlocked successfully! Welcome Owner.');
    } else {
      setPasscodeError('Invalid passcode. Use "admin123" or click Quick Owner Demo Access.');
    }
  };

  const handleInstantDemoUnlock = () => {
    setAdminAuthenticated(true);
    setIsAdmin(true);
    setPasscodeError('');
    showNotification('success', 'Admin session unlocked via Owner Demo access.');
  };

  const handleAdminSignOut = () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
    setPasscodeInput('');
    showNotification('success', 'Signed out from Admin console.');
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // ==========================================
  // POSTER HANDLERS
  // ==========================================
  const handleOpenPosterModal = (slotNumber: number) => {
    const existing = posterSlots[slotNumber - 1];
    setEditingPosterSlot(slotNumber);
    setPosterImageFile(null);
    setPosterImagePreview(existing?.imageUrl || '');

    if (existing) {
      setPosterFormData({
        title: existing.title,
        description: existing.description,
        category: existing.category,
        badgeText: existing.badgeText,
        destinationUrl: existing.destinationUrl || '/book-appointment',
        altText: existing.altText || existing.title,
        imageUrl: existing.imageUrl,
        isPublished: existing.isPublished ?? true
      });
    } else {
      setPosterFormData({
        title: `Campaign Poster Slot #${slotNumber}`,
        description: 'New promotional campaign for Home Tutor students and parents.',
        category: 'STEM',
        badgeText: 'New Campaign',
        destinationUrl: '/book-appointment',
        altText: `Promotional banner ${slotNumber}`,
        imageUrl: '',
        isPublished: true
      });
    }
  };

  const handlePosterImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showNotification('error', validation.error || 'Invalid image file');
      return;
    }

    setPosterImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPosterImagePreview(previewUrl);
  };

  const handleSavePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosterSlot) return;

    if (!posterFormData.title.trim()) {
      showNotification('error', 'Please enter a poster title');
      return;
    }

    let finalImageUrl = posterFormData.imageUrl;

    // Upload image if a new file was chosen
    if (posterImageFile) {
      setIsUploadingPoster(true);
      const uploadRes = await uploadPosterImage(posterImageFile, editingPosterSlot);
      setIsUploadingPoster(false);

      if (!uploadRes.success || !uploadRes.url) {
        showNotification('error', uploadRes.error || 'Failed to upload poster image');
        return;
      }
      finalImageUrl = uploadRes.url;
    }

    if (!finalImageUrl) {
      showNotification('error', 'Please select or upload a poster image');
      return;
    }

    setIsLoading(true);
    const saveRes = await savePoster(editingPosterSlot, {
      ...posterFormData,
      imageUrl: finalImageUrl
    });
    setIsLoading(false);

    if (saveRes.success) {
      showNotification('success', `Poster slot #${editingPosterSlot} saved and updated!`);
      setEditingPosterSlot(null);
      loadDashboardData();
    } else {
      showNotification('error', saveRes.error || 'Failed to save poster');
    }
  };

  const handleDeletePoster = async (slotNumber: number) => {
    setIsLoading(true);
    const res = await deletePoster(slotNumber);
    setIsLoading(false);

    if (res.success) {
      showNotification('success', `Poster slot #${slotNumber} has been cleared.`);
      setPosterDeleteConfirmSlot(null);
      loadDashboardData();
    } else {
      showNotification('error', res.error || 'Failed to delete poster');
    }
  };

  const handleTogglePosterPublish = async (slotNumber: number, currentState: boolean) => {
    const newState = !currentState;
    const res = await togglePosterPublish(slotNumber, newState);
    if (res.success) {
      showNotification('success', `Poster slot #${slotNumber} is now ${newState ? 'Published' : 'Draft / Unpublished'}`);
      loadDashboardData();
    } else {
      showNotification('error', res.error || 'Failed to update publication status');
    }
  };

  // ==========================================
  // VIDEO HANDLERS
  // ==========================================
  const handleOpenVideoModal = (slotNumber: number) => {
    const existing = videoSlots[slotNumber - 1];
    setEditingVideoSlot(slotNumber);
    setVideoFile(null);

    if (existing) {
      setVideoFormData({
        title: existing.title,
        description: existing.description,
        tutorName: existing.tutorName,
        tutorRole: existing.tutorRole,
        duration: existing.duration,
        thumbnailUrl: existing.thumbnailUrl,
        videoUrl: existing.videoUrl || '',
        videoType: existing.videoType || 'youtube',
        views: existing.views || '1.0k views',
        tags: existing.tags?.join(', ') || 'Academic, Tutorial',
        isPublished: existing.isPublished ?? true
      });
    } else {
      setVideoFormData({
        title: `Home Tutor Masterclass Slot #${slotNumber}`,
        description: 'Detailed concept breakdown and interactive lesson walkthrough.',
        tutorName: 'Certified Educator',
        tutorRole: 'Senior Subject Specialist',
        duration: '05:00',
        thumbnailUrl: '',
        videoUrl: 'https://www.youtube.com/watch?v=kITJ6qH7jS0',
        videoType: 'youtube',
        views: '1.5k views',
        tags: 'Masterclass, Exam Prep',
        isPublished: true
      });
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      showNotification('error', validation.error || 'Invalid video file');
      return;
    }

    setVideoFile(file);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoSlot) return;

    if (!videoFormData.title.trim()) {
      showNotification('error', 'Please enter a video title');
      return;
    }

    let finalVideoUrl = videoFormData.videoUrl;

    // Validate YouTube URL if youtube type
    if (videoFormData.videoType === 'youtube') {
      const parsed = parseYouTubeUrl(finalVideoUrl);
      if (!parsed.isValid) {
        showNotification('error', parsed.error || 'Invalid YouTube URL');
        return;
      }
      finalVideoUrl = parsed.embedUrl || finalVideoUrl;
    } else if (videoFile) {
      // Upload video file
      setIsUploadingVideo(true);
      const uploadRes = await uploadVideoMedia(videoFile, editingVideoSlot, 'video');
      setIsUploadingVideo(false);

      if (!uploadRes.success || !uploadRes.url) {
        showNotification('error', uploadRes.error || 'Failed to upload video file');
        return;
      }
      finalVideoUrl = uploadRes.url;
    }

    if (!finalVideoUrl) {
      showNotification('error', 'Please provide a YouTube URL or upload a video file');
      return;
    }

    const tagList = videoFormData.tags.split(',').map(t => t.trim()).filter(Boolean);

    setIsLoading(true);
    const saveRes = await saveVideo(editingVideoSlot, {
      title: videoFormData.title,
      description: videoFormData.description,
      tutorName: videoFormData.tutorName,
      tutorRole: videoFormData.tutorRole,
      duration: videoFormData.duration,
      thumbnailUrl: videoFormData.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      videoUrl: finalVideoUrl,
      videoType: videoFormData.videoType,
      views: videoFormData.views,
      tags: tagList,
      isPublished: videoFormData.isPublished
    });
    setIsLoading(false);

    if (saveRes.success) {
      showNotification('success', `Video slot #${editingVideoSlot} saved successfully!`);
      setEditingVideoSlot(null);
      loadDashboardData();
    } else {
      showNotification('error', saveRes.error || 'Failed to save video');
    }
  };

  const handleDeleteVideo = async (slotNumber: number) => {
    setIsLoading(true);
    const res = await deleteVideo(slotNumber);
    setIsLoading(false);

    if (res.success) {
      showNotification('success', `Video slot #${slotNumber} has been cleared.`);
      setVideoDeleteConfirmSlot(null);
      loadDashboardData();
    } else {
      showNotification('error', res.error || 'Failed to delete video');
    }
  };

  const handleToggleVideoPublish = async (slotNumber: number, currentState: boolean) => {
    const newState = !currentState;
    const res = await toggleVideoPublish(slotNumber, newState);
    if (res.success) {
      showNotification('success', `Video slot #${slotNumber} is now ${newState ? 'Published' : 'Draft / Unpublished'}`);
      loadDashboardData();
    } else {
      showNotification('error', res.error || 'Failed to update publication status');
    }
  };

  // ==========================================
  // SOCIAL LINKS HANDLERS
  // ==========================================
  const handleSaveSocialPlatform = async (platform: 'tiktok' | 'facebook' | 'youtube' | 'instagram') => {
    const edit = socialEditStates[platform];
    if (!edit) return;

    if (!isValidUrl(edit.url)) {
      showNotification('error', `Please enter a valid HTTP or HTTPS URL for ${platform}`);
      return;
    }

    setSavingSocialPlatform(platform);
    const res = await saveSocialLink(platform, edit.url, edit.handle, edit.followers, edit.isActive);
    setSavingSocialPlatform(null);

    if (res.success) {
      showNotification('success', `${platform.toUpperCase()} link saved successfully! Updates are live in footer.`);
      loadDashboardData();
    } else {
      showNotification('error', res.error || `Failed to save ${platform} link`);
    }
  };

  const handleVerificationAction = (id: string, action: 'approved' | 'rejected') => {
    setVerifications(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
    showNotification('success', `Tutor application ${id} marked as ${action}.`);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard?.writeText(`-- See full migration in supabase/schema.sql in codebase root`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showNotification('success', 'SQL migration guide reference copied!');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#DDD6FE] space-y-6 sm:px-10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#1F2937]">
                Owner & Admin Access Required
              </h2>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                This portal is reserved for administrators and platform owners. Please enter your passcode to access the console.
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {passcodeError}
              </div>
            )}

            <form onSubmit={handleUnlockAdmin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                  Enter Admin Passcode
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="e.g. admin123"
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-[#A78BFA]" />
                <span>Unlock Admin Console</span>
              </button>
            </form>

            <div className="pt-3 border-t border-[#DDD6FE]/60 space-y-2">
              <button
                type="button"
                onClick={handleInstantDemoUnlock}
                className="w-full py-2 px-3 bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 text-[#4C1D95] rounded-xl text-xs font-semibold border border-[#DDD6FE] transition-colors cursor-pointer"
              >
                Quick Owner Demo Unlock
              </button>

              <Link
                to="/"
                className="block text-center text-xs text-[#6B7280] hover:text-[#4C1D95] transition-colors pt-1"
              >
                ← Return to Public Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Breadcrumb & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-1">
              <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#1F2937]">Admin Operations Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-3">
              <span>Home Tutor Content Management System</span>
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Live Content Governance • 10 Posters • 3 Videos • Social Links • Tutor Verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="p-2.5 bg-white hover:bg-[#F5F3FF] text-[#1F2937] rounded-xl border border-[#DDD6FE] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#4C1D95] ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Admin Authenticated Role Indicator */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#4C1D95] text-white rounded-xl text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
              <span>Owner Console: Active</span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleAdminSignOut}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Action / Notification Banner */}
        {actionMessage && (
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#00C938] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Supabase Connection Status Card */}
        <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          supabaseConfig.isConfigured 
            ? 'bg-emerald-950 text-white border-emerald-800' 
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              supabaseConfig.isConfigured ? 'bg-emerald-800 text-[#00FF48]' : 'bg-slate-800 text-amber-400'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold">
                <span>Supabase: {supabaseConfig.url || 'https://spuaqghmkdtcblggvzqm.supabase.co'}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                  supabaseConfig.isConfigured ? 'bg-[#00FF48]/20 text-[#00FF48]' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  {supabaseConfig.isConfigured ? 'LIVE POSTGRES CONNECTED' : 'LOCAL PERSISTENCE (AWAITING KEY)'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {supabaseConfig.isConfigured 
                  ? `Active connection to ${supabaseConfig.url} (${supabaseConfig.keyFormat === 'publishable' ? 'Publishable Key' : 'Anon JWT'}). RLS policies and database triggers enforced.`
                  : `Configured for ${supabaseConfig.url || 'https://spuaqghmkdtcblggvzqm.supabase.co'}. Add your Supabase Publishable Key (sb_publishable_...) to .env to activate live Postgres queries. All actions persist in client storage.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('database')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0"
          >
            View SQL & Setup Guide
          </button>
        </div>

        {/* High-level platform stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div 
            onClick={() => switchTab('settings')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
              <span>Site Status</span>
              <Settings className="w-3.5 h-3.5 text-[#8B5CF6]" />
            </div>
            <div className="text-base font-extrabold text-[#4C1D95] mt-1">
              Settings Live
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">Active Profile</span>
          </div>

          <div 
            onClick={() => switchTab('admissions')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'admissions' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
              <span>Admissions</span>
              {platformMetrics.pendingAdmissionsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <div className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">
              {platformMetrics.pendingAdmissionsCount} Pending
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">New student forms</span>
          </div>

          <div 
            onClick={() => switchTab('inbox')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'inbox' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
              <span>Messages</span>
              {platformMetrics.unreadInboxCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <div className="text-xl font-extrabold text-amber-600 mt-1 tabular-nums">
              {platformMetrics.unreadInboxCount} Unread
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">Parent inquiries</span>
          </div>

          <div 
            onClick={() => switchTab('tutors')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'tutors' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Teachers</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {platformMetrics.activeTutorsCount > 0 ? platformMetrics.activeTutorsCount : 452}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium block">Verified educators</span>
          </div>

          <div 
            onClick={() => switchTab('students')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'students' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Students</span>
            <div className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">
              {platformMetrics.enrolledStudentsCount > 0 ? platformMetrics.enrolledStudentsCount : 6}
            </div>
            <span className="text-[10px] text-blue-700 font-medium block">Enrolled learners</span>
          </div>

          <div 
            onClick={() => switchTab('finances')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'finances' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tuition Fees</span>
            <div className="text-lg font-extrabold text-emerald-600 mt-1 tabular-nums">
              ${platformMetrics.tuitionFeesCollected > 0 ? platformMetrics.tuitionFeesCollected.toLocaleString() : '5,750'}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">Collected fees</span>
          </div>

          <div 
            onClick={() => switchTab('finances')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'finances' ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Pending Payouts</span>
            <div className="text-lg font-extrabold text-amber-600 mt-1 tabular-nums">
              ${platformMetrics.salariesPendingPayout > 0 ? platformMetrics.salariesPendingPayout.toLocaleString() : '1,900'}
            </div>
            <span className="text-[10px] text-amber-700 font-medium block">Tutor salaries</span>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          
          {/* Site Settings */}
          <button
            onClick={() => switchTab('settings')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Settings className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <span>Site Settings</span>
          </button>

          {/* Admissions */}
          <button
            onClick={() => switchTab('admissions')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'admissions'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Admissions</span>
            {platformMetrics.pendingAdmissionsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] rounded-full shrink-0">
                {platformMetrics.pendingAdmissionsCount}
              </span>
            )}
          </button>

          {/* Messages Inbox */}
          <button
            onClick={() => switchTab('inbox')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'inbox'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Inbox className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Messages Inbox</span>
            {platformMetrics.unreadInboxCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full shrink-0">
                {platformMetrics.unreadInboxCount}
              </span>
            )}
          </button>

          {/* Tutors */}
          <button
            onClick={() => switchTab('tutors')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'tutors'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Users className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Teachers & Tutors</span>
          </button>

          {/* Students */}
          <button
            onClick={() => switchTab('students')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Student Records</span>
          </button>

          {/* Finances & Fees */}
          <button
            onClick={() => switchTab('finances')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'finances'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fees & Salaries</span>
          </button>

          {/* Announcements */}
          <button
            onClick={() => switchTab('announcements')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'announcements'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Announcements</span>
          </button>

          {/* Posters */}
          <button
            onClick={() => switchTab('posters')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'posters'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Admission Posters</span>
          </button>

          {/* Photo Gallery */}
          <button
            onClick={() => switchTab('gallery')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Photo Gallery</span>
          </button>

          {/* Videos */}
          <button
            onClick={() => switchTab('videos')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'videos'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Video className="w-4 h-4 text-red-600 shrink-0" />
            <span>Tutor Videos</span>
          </button>

          {/* Schedules */}
          <button
            onClick={() => switchTab('schedules')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedules'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Class Schedules</span>
          </button>

          {/* Social */}
          <button
            onClick={() => switchTab('social_links')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'social_links'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Social Links</span>
          </button>

          {/* Verifications */}
          <button
            onClick={() => switchTab('verifications')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'verifications'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Verifications</span>
          </button>

          {/* Database Setup */}
          <button
            onClick={() => switchTab('database')}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'database'
                ? 'border-[#4C1D95] text-[#4C1D95] bg-[#F5F3FF]/80 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Database & SQL</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* ADMIN SECTIONS: SETTINGS, ADMISSIONS, INBOX, CMS, ACADEMIC */}
        {/* ========================================================= */}
        {activeTab === 'settings' && <SiteSettingsSection onNotify={showNotification} />}
        {activeTab === 'admissions' && <AdmissionsManagementSection onNotify={showNotification} />}
        {activeTab === 'inbox' && <InboxManagementSection onNotify={showNotification} />}
        {activeTab === 'tutors' && <TutorManagementSection />}
        {activeTab === 'students' && <StudentManagementSection />}
        {activeTab === 'finances' && <FinancialManagementSection />}
        {activeTab === 'announcements' && <AnnouncementsManagementSection onNotify={showNotification} />}
        {activeTab === 'gallery' && <GalleryManagementSection onNotify={showNotification} />}
        {activeTab === 'schedules' && <ScheduleManagementSection />}

        {/* ========================================================= */}
        {/* TAB: MANAGE 10 PROMOTIONAL POSTERS                        */}
        {/* ========================================================= */}
        {activeTab === 'posters' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    10 Promotional Poster Slots Management
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload, edit, publish/unpublish, and reorder academic recruitment and bootcamp flyers.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const emptySlotIdx = posterSlots.findIndex(p => p === null);
                      handleOpenPosterModal(emptySlotIdx >= 0 ? emptySlotIdx + 1 : 1);
                    }}
                    className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#A78BFA]" />
                    <span>Add New Poster</span>
                  </button>

                  <Link
                    to="/posters"
                    target="_blank"
                    className="px-3.5 py-2 bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 text-[#4C1D95] border border-[#DDD6FE] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Public Posters Page</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </Link>
                </div>
              </div>

              {/* 10 Poster Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {posterSlots.map((poster, index) => {
                  const slotNum = index + 1;
                  return (
                    <div 
                      key={slotNum} 
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                        poster 
                          ? poster.isPublished 
                            ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' 
                            : 'bg-amber-50/50 border-amber-200 shadow-xs'
                          : 'bg-slate-50 border-dashed border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Slot Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            Slot #{slotNum}
                          </span>
                          
                          {poster ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              poster.isPublished 
                                ? 'bg-[#00FF48]/20 text-emerald-800 border border-[#00FF48]/40' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {poster.isPublished ? 'Published' : 'Draft'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                              Empty Slot
                            </span>
                          )}
                        </div>

                        {/* Poster Thumbnail / Empty Placeholder */}
                        {poster ? (
                          <div className="aspect-3/4 rounded-xl overflow-hidden bg-slate-900 relative group mb-3">
                            <img
                              src={poster.imageUrl}
                              alt={poster.altText || poster.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-950/80 text-[#00FF48] rounded">
                                {poster.category}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-3/4 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-4 text-center mb-3 text-slate-400">
                            <Upload className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-xs font-semibold text-slate-600">Empty Slot #{slotNum}</span>
                            <span className="text-[10px] text-slate-400 mt-1">Available for new poster campaign</span>
                          </div>
                        )}

                        {/* Title and details */}
                        {poster ? (
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{poster.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{poster.description}</p>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">No content configured</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        {poster ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenPosterModal(slotNum)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                              title="Edit Poster Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTogglePosterPublish(slotNum, poster.isPublished ?? true)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                poster.isPublished 
                                  ? 'hover:bg-amber-100 text-amber-700' 
                                  : 'hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={poster.isPublished ? 'Unpublish Poster' : 'Publish Poster'}
                            >
                              {poster.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setPosterDeleteConfirmSlot(slotNum)}
                              className="px-2 py-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                              title="Delete / Reset Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenPosterModal(slotNum)}
                            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#00FF48]" />
                            <span>Add Poster</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MANAGE 3 HOME TUTOR VIDEOS                         */}
        {/* ========================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    3 Educational Video Slots Management
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Maintain flagship Home Tutor video lessons. Supports both verified YouTube URLs and uploaded MP4 videos.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const emptySlotIdx = videoSlots.findIndex(v => v === null);
                      handleOpenVideoModal(emptySlotIdx >= 0 ? emptySlotIdx + 1 : 1);
                    }}
                    className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#A78BFA]" />
                    <span>Add New Video</span>
                  </button>

                  <Link
                    to="/videos"
                    target="_blank"
                    className="px-3.5 py-2 bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 text-[#4C1D95] border border-[#DDD6FE] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Public Videos Page</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </Link>
                </div>
              </div>

              {/* 3 Video Slots Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videoSlots.map((video, index) => {
                  const slotNum = index + 1;
                  return (
                    <div 
                      key={slotNum}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                        video
                          ? video.isPublished 
                            ? 'bg-white border-slate-200 shadow-xs' 
                            : 'bg-amber-50/50 border-amber-200 shadow-xs'
                          : 'bg-slate-50 border-dashed border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Slot Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                            Video Slot #{slotNum}
                          </span>
                          
                          {video ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {video.videoType === 'uploaded' ? 'MP4 Upload' : 'YouTube'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                video.isPublished 
                                  ? 'bg-[#00FF48]/20 text-emerald-800' 
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {video.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                              Empty Slot
                            </span>
                          )}
                        </div>

                        {/* Thumbnail / Placeholder */}
                        {video ? (
                          <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-900 relative mb-3">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 text-white rounded text-[10px] font-mono">
                              {video.duration}
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-16/9 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-4 text-center mb-3 text-slate-400">
                            <Video className="w-8 h-8 text-slate-300 mb-1" />
                            <span className="text-xs font-semibold text-slate-600">Slot #{slotNum} Empty</span>
                            <span className="text-[10px] text-slate-400">Add YouTube URL or MP4 upload</span>
                          </div>
                        )}

                        {/* Video Info */}
                        {video ? (
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{video.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{video.description}</p>
                            <div className="text-[11px] text-slate-600 pt-1 font-medium">
                              Instructor: {video.tutorName}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">No video published</div>
                        )}
                      </div>

                      {/* Video Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {video ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewVideo(video)}
                              className="p-2 hover:bg-[#F5F3FF] text-[#4C1D95] rounded-lg transition-colors cursor-pointer"
                              title="Play & Test Video"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenVideoModal(slotNum)}
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Edit Video"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVideoPublish(slotNum, video.isPublished ?? true)}
                              className={`p-2 rounded-lg transition-colors ${
                                video.isPublished ? 'hover:bg-amber-100 text-amber-700' : 'hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={video.isPublished ? 'Unpublish Video' : 'Publish Video'}
                            >
                              {video.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setVideoDeleteConfirmSlot(slotNum)}
                              className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="Delete Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenVideoModal(slotNum)}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#00FF48]" />
                            <span>Configure Video Slot</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SOCIAL MEDIA LINK MANAGEMENT                       */}
        {/* ========================================================= */}
        {activeTab === 'social_links' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Official Social Media Channels Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage the verified URLs, display handles, and community metrics shown across the homepage and website footer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['tiktok', 'facebook', 'youtube', 'instagram'] as const).map((platform) => {
                  const state = socialEditStates[platform] || { url: '', handle: '', followers: '', isActive: true };
                  const isSaving = savingSocialPlatform === platform;

                  return (
                    <div key={platform} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#00FF48] flex items-center justify-center font-bold uppercase text-xs">
                            {platform.charAt(0)}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{platform}</h4>
                            <span className="text-[11px] text-slate-500">Public Channel</span>
                          </div>
                        </div>

                        {state.url && (
                          <a
                            href={state.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>Test Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Destination URL <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="url"
                            value={state.url}
                            onChange={(e) => setSocialEditStates(prev => ({
                              ...prev,
                              [platform]: { ...state, url: e.target.value }
                            }))}
                            placeholder={`https://${platform}.com/...`}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Display Handle
                            </label>
                            <input
                              type="text"
                              value={state.handle}
                              onChange={(e) => setSocialEditStates(prev => ({
                                ...prev,
                                [platform]: { ...state, handle: e.target.value }
                              }))}
                              placeholder="@handle"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Follower Badge
                            </label>
                            <input
                              type="text"
                              value={state.followers}
                              onChange={(e) => setSocialEditStates(prev => ({
                                ...prev,
                                [platform]: { ...state, followers: e.target.value }
                              }))}
                              placeholder="50k followers"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={state.isActive}
                            onChange={(e) => setSocialEditStates(prev => ({
                              ...prev,
                              [platform]: { ...state, isActive: e.target.checked }
                            }))}
                            className="rounded text-slate-900 focus:ring-[#00FF48]"
                          />
                          <span>Show in Footer & Social Section</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleSaveSocialPlatform(platform)}
                          disabled={isSaving}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF48]" />}
                          <span>{isSaving ? 'Saving...' : 'Save Link'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TUTOR VERIFICATION QUEUE (Phase 1 Preserved)        */}
        {/* ========================================================= */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending Tutor Verification Applications</h3>
                <p className="text-xs text-slate-500">Review degree transcripts and criminal check clearances.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Applicant Name</th>
                    <th className="px-6 py-3.5">Degree & University</th>
                    <th className="px-6 py-3.5">Subject Specialty</th>
                    <th className="px-6 py-3.5">City</th>
                    <th className="px-6 py-3.5">Applied Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-semibold">{item.degree}</div>
                        <div className="text-slate-400 text-[11px]">{item.university}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.subject}
                      </td>
                      <td className="px-6 py-4">
                        {item.city}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          item.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerificationAction(item.id, 'approved')}
                              className="px-3 py-1.5 bg-[#00FF48] hover:bg-[#00e640] text-slate-950 font-bold rounded-lg text-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerificationAction(item.id, 'rejected')}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 font-semibold rounded-lg text-xs transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SUPABASE DATABASE SETUP & SQL INSTRUCTIONS         */}
        {/* ========================================================= */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Supabase Database & Storage Architecture
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step-by-step instructions for executing the PostgreSQL migration and configuring Row Level Security.
                </p>
              </div>

              <button
                type="button"
                onClick={copySqlToClipboard}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {copiedSql ? <Check className="w-4 h-4 text-[#00FF48]" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copiedSql ? 'Copied Reference' : 'Copy Migration Reference'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">1. Tables & Schemas</span>
                <p className="text-slate-600 leading-relaxed">
                  Phase 2: <code className="text-emerald-700 font-mono">posters</code>, <code className="text-emerald-700 font-mono">videos</code>, <code className="text-emerald-700 font-mono">social_links</code>, <code className="text-emerald-700 font-mono">profiles</code>.<br />
                  Phase 3: <code className="text-emerald-700 font-mono">tutors</code>, <code className="text-emerald-700 font-mono">students</code>, <code className="text-emerald-700 font-mono">class_sessions</code>, <code className="text-emerald-700 font-mono">tutor_salaries</code>, <code className="text-emerald-700 font-mono">student_fees</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">2. Row Level Security (RLS)</span>
                <p className="text-slate-600 leading-relaxed">
                  Public can only view verified tutors and published media. Student records, parent contact details, and platform financial margins are strictly restricted. Tutors only view their assigned students and compensation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">3. Conflict Prevention Trigger</span>
                <p className="text-slate-600 leading-relaxed">
                  PostgreSQL function <code className="text-blue-700 font-mono">check_class_session_conflicts()</code> blocks overlapping class bookings for both tutor and student at the database level.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl text-slate-300 font-mono text-xs overflow-x-auto space-y-2">
              <div className="text-[#00FF48] font-bold">-- Quick Setup in Supabase Dashboard:</div>
              <div>1. Open your Supabase Project &gt; SQL Editor</div>
              <div>2. Run Phase 2 script: <span className="text-white">/supabase/schema.sql</span> (CMS & Profiles)</div>
              <div>3. Run Phase 3 script: <span className="text-white">/supabase/phase3_schema.sql</span> (Tutors, Students, Sessions, Salaries, Fees)</div>
              <div>4. Set environment variables <span className="text-[#00FF48]">VITE_SUPABASE_URL</span> and <span className="text-[#00FF48]">VITE_SUPABASE_ANON_KEY</span></div>
              <div className="text-slate-400 text-[11px] pt-1">Note: Until env keys are added, all actions automatically persist in verified local client cache.</div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* POSTER EDIT / CREATE MODAL                                */}
        {/* ========================================================= */}
        {editingPosterSlot && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditingPosterSlot(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl my-auto animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-900 text-[#00FF48] rounded-md">
                    Slot #{editingPosterSlot}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {posterSlots[editingPosterSlot - 1] ? 'Edit Promotional Poster' : 'Upload New Campaign Poster'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingPosterSlot(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePoster} className="space-y-4">
                
                {/* Poster Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Poster Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={posterFormData.title}
                    onChange={(e) => setPosterFormData({ ...posterFormData, title: e.target.value })}
                    placeholder="e.g. Cambridge O & A-Level Bootcamp 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campaign Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={posterFormData.description}
                    onChange={(e) => setPosterFormData({ ...posterFormData, description: e.target.value })}
                    placeholder="Detailed explanation of the campaign offer, grades, and benefits..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Category
                    </label>
                    <select
                      value={posterFormData.category}
                      onChange={(e) => setPosterFormData({ ...posterFormData, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    >
                      <option value="Recruitment">Recruitment</option>
                      <option value="STEM">STEM</option>
                      <option value="Exam Prep">Exam Prep</option>
                      <option value="Language">Language</option>
                      <option value="Primary">Primary</option>
                    </select>
                  </div>

                  {/* Badge Text */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Badge Text Label
                    </label>
                    <input
                      type="text"
                      value={posterFormData.badgeText}
                      onChange={(e) => setPosterFormData({ ...posterFormData, badgeText: e.target.value })}
                      placeholder="e.g. CAIE High Achievers"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                </div>

                {/* Image Picker with live preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Poster Image (3:4 Ratio, JPG/PNG/WEBP, Max 5MB)
                  </label>

                  {posterImagePreview && (
                    <div className="mb-3 flex items-center gap-3">
                      <div className="relative w-28 aspect-3/4 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-900">
                        <img src={posterImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/90 text-[#00FF48] px-1 py-0.5 rounded font-bold">
                          Preview
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPosterImagePreview('');
                          setPosterImageFile(null);
                          setPosterFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Remove / Delete Image</span>
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePosterImageSelect}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload a high resolution poster asset. Image will be stored in Supabase Storage bucket 'posters'.
                  </p>
                </div>

                {/* Destination & Alt text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Destination URL
                    </label>
                    <input
                      type="text"
                      value={posterFormData.destinationUrl}
                      onChange={(e) => setPosterFormData({ ...posterFormData, destinationUrl: e.target.value })}
                      placeholder="/book-appointment"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Accessibility Alt Text
                    </label>
                    <input
                      type="text"
                      value={posterFormData.altText}
                      onChange={(e) => setPosterFormData({ ...posterFormData, altText: e.target.value })}
                      placeholder="Promotional banner description"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                </div>

                {/* Published toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={posterFormData.isPublished}
                      onChange={(e) => setPosterFormData({ ...posterFormData, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-[#00FF48]"
                    />
                    <span>Publish Immediately to Homepage and Posters Page</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {posterSlots[editingPosterSlot - 1] ? (
                    <button
                      type="button"
                      onClick={() => {
                        const slot = editingPosterSlot;
                        setEditingPosterSlot(null);
                        setPosterDeleteConfirmSlot(slot);
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Poster</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingPosterSlot(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isUploadingPoster || isLoading}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      {(isUploadingPoster || isLoading) && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FF48]" />}
                      <span>{isUploadingPoster ? 'Uploading Asset...' : 'Save & Update Poster Slot'}</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* POSTER DELETION CONFIRMATION DIALOG                       */}
        {/* ========================================================= */}
        {posterDeleteConfirmSlot && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPosterDeleteConfirmSlot(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Poster Slot Reset</h3>
                  <p className="text-xs text-slate-500">Poster Slot #{posterDeleteConfirmSlot}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete the poster in Slot #{posterDeleteConfirmSlot}? The slot will become empty and the poster will no longer be visible on the public website.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPosterDeleteConfirmSlot(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePoster(posterDeleteConfirmSlot)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIDEO EDIT / CREATE MODAL                                 */}
        {/* ========================================================= */}
        {editingVideoSlot && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditingVideoSlot(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl my-auto animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-900 text-[#00FF48] rounded-md">
                    Video Slot #{editingVideoSlot}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {videoSlots[editingVideoSlot - 1] ? 'Edit Educational Video' : 'Add New Video Feature'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingVideoSlot(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Video Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={videoFormData.title}
                    onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                    placeholder="e.g. Masterclass: CAIE Physics Kinematics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lesson Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={videoFormData.description}
                    onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                    placeholder="Key concepts covered in this lesson video..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                {/* Instructor & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instructor Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={videoFormData.tutorName}
                      onChange={(e) => setVideoFormData({ ...videoFormData, tutorName: e.target.value })}
                      placeholder="Dr. Ahmed Raza"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instructor Role / Credential
                    </label>
                    <input
                      type="text"
                      value={videoFormData.tutorRole}
                      onChange={(e) => setVideoFormData({ ...videoFormData, tutorRole: e.target.value })}
                      placeholder="Ph.D. Applied Mathematics"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                </div>

                {/* Video Format Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Video Media Source
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setVideoFormData({ ...videoFormData, videoType: 'youtube' })}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        videoFormData.videoType === 'youtube'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      YouTube Video URL
                    </button>

                    <button
                      type="button"
                      onClick={() => setVideoFormData({ ...videoFormData, videoType: 'uploaded' })}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        videoFormData.videoType === 'uploaded'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      MP4 Upload (Supabase Storage)
                    </button>
                  </div>
                </div>

                {/* Conditional Video Input */}
                {videoFormData.videoType === 'youtube' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      YouTube Video Link <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={videoFormData.videoUrl}
                      onChange={(e) => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Accepts standard YouTube links. System automatically extracts and embeds the video with responsive controls.
                    </p>

                    {/* Quick Lesson Presets */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
                        Home Tutor Quick Presets:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setVideoFormData(prev => ({
                            ...prev,
                            title: 'Mathematics Algebra: 1-on-1 Step-by-Step Problem Solving',
                            description: 'Comprehensive algebra equations walkthrough with visual problem mapping and past paper drills.',
                            videoUrl: 'https://www.youtube.com/watch?v=kITJ6qH7jS0',
                            tutorName: 'Dr. Ahmed Raza',
                            tutorRole: 'PhD Applied Mathematics & Physics',
                            duration: '07:15',
                            tags: 'Maths, Algebra, O-Levels'
                          }))}
                          className="px-2.5 py-1 bg-[#F5F3FF] hover:bg-[#DDD6FE] text-[#4C1D95] text-[11px] font-bold rounded-lg border border-[#DDD6FE] cursor-pointer transition-colors"
                        >
                          Maths Tutoring
                        </button>

                        <button
                          type="button"
                          onClick={() => setVideoFormData(prev => ({
                            ...prev,
                            title: 'Physics & Science: Visualizing Motion & Mechanics',
                            description: 'In-depth conceptual breakdown of 1D kinematics, friction, and vectors for high school & O-Levels.',
                            videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
                            tutorName: 'Dr. Ahmed Raza',
                            tutorRole: 'Senior Physics Specialist',
                            duration: '06:40',
                            tags: 'Physics, CAIE, Science'
                          }))}
                          className="px-2.5 py-1 bg-[#F5F3FF] hover:bg-[#DDD6FE] text-[#4C1D95] text-[11px] font-bold rounded-lg border border-[#DDD6FE] cursor-pointer transition-colors"
                        >
                          Physics Lesson
                        </button>

                        <button
                          type="button"
                          onClick={() => setVideoFormData(prev => ({
                            ...prev,
                            title: 'Board Exam Preparation: Study Habits & Active Recall',
                            description: 'Proven revision methods, diagram memory aids, and MDCAT question analysis for top scores.',
                            videoUrl: 'https://www.youtube.com/watch?v=p60rN9JEapg',
                            tutorName: 'Fatima Zahra',
                            tutorRole: 'Senior Education Consultant',
                            duration: '05:50',
                            tags: 'Study Skills, Exam Prep, Strategy'
                          }))}
                          className="px-2.5 py-1 bg-[#F5F3FF] hover:bg-[#DDD6FE] text-[#4C1D95] text-[11px] font-bold rounded-lg border border-[#DDD6FE] cursor-pointer transition-colors"
                        >
                          Study Skills
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload MP4 / WebM Video File (Max 50MB)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileSelect}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    {videoFile && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)}MB)
                      </p>
                    )}
                  </div>
                )}

                {/* Duration & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duration (MM:SS)
                    </label>
                    <input
                      type="text"
                      value={videoFormData.duration}
                      onChange={(e) => setVideoFormData({ ...videoFormData, duration: e.target.value })}
                      placeholder="04:30"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Topic Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={videoFormData.tags}
                      onChange={(e) => setVideoFormData({ ...videoFormData, tags: e.target.value })}
                      placeholder="Physics, O-Levels, Revision"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                </div>

                {/* Published toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={videoFormData.isPublished}
                      onChange={(e) => setVideoFormData({ ...videoFormData, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-[#00FF48]"
                    />
                    <span>Publish Video to Public Hub</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {videoSlots[editingVideoSlot - 1] ? (
                    <button
                      type="button"
                      onClick={() => {
                        const slot = editingVideoSlot;
                        setEditingVideoSlot(null);
                        setVideoDeleteConfirmSlot(slot);
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Video</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingVideoSlot(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isUploadingVideo || isLoading}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      {(isUploadingVideo || isLoading) && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FF48]" />}
                      <span>{isUploadingVideo ? 'Uploading Video...' : 'Save & Publish Video'}</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIDEO DELETION CONFIRMATION DIALOG                        */}
        {/* ========================================================= */}
        {videoDeleteConfirmSlot && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setVideoDeleteConfirmSlot(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Video Slot Reset</h3>
                  <p className="text-xs text-slate-500">Video Slot #{videoDeleteConfirmSlot}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove the video in Slot #{videoDeleteConfirmSlot}? The slot will become empty on the public website.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVideoDeleteConfirmSlot(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVideo(videoDeleteConfirmSlot)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal for instant testing */}
        <VideoPlayerModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
        />

      </div>
    </div>
  );
};
