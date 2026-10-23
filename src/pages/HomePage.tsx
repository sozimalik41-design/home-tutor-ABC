import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Play, 
  Sparkles,
  Users,
  Compass,
  FileCheck,
  Loader2,
  Database,
  Info
} from 'lucide-react';
import { 
  TUTORS_LIST, 
  POPULAR_SUBJECTS, 
  PROMOTIONAL_POSTERS, 
  HOME_TUTOR_VIDEOS, 
  TESTIMONIALS, 
  STATS_DATA, 
  CITIES, 
  CLASSES_LEVELS,
  HERO_IMAGE,
  SOCIAL_LINKS 
} from '../data/mockData';
import { TutorCard } from '../components/common/TutorCard';
import { PosterCard } from '../components/common/PosterCard';
import { VideoCard } from '../components/common/VideoCard';
import { LightboxModal } from '../components/common/LightboxModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { PhaseNotice } from '../components/common/PhaseNotice';
import { Poster, VideoContent, SocialLink, SiteSettings, AcademyAnnouncement, GalleryPhoto } from '../types';
import { getPublishedPosters, deletePoster } from '../services/posterService';
import { getPublishedVideos, deleteVideo } from '../services/videoService';
import { getActiveSocialLinks } from '../services/socialLinkService';
import { getSiteSettings } from '../services/siteSettingsService';
import { getAnnouncements } from '../services/announcementService';
import { getGalleryPhotos } from '../services/galleryService';
import { AcademyLocationMap } from '../components/common/AcademyLocationMap';
import { isAdminAuthenticated } from '../utils/auth';
import { Megaphone, Image as ImageIcon, Settings } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Dynamic CMS Data States
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [announcements, setAnnouncements] = useState<AcademyAnnouncement[]>(getAnnouncements().filter(a => a.isPublished));
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(getGalleryPhotos().slice(0, 3));

  const [posters, setPosters] = useState<Poster[]>([]);
  const [isLoadingPosters, setIsLoadingPosters] = useState(true);
  const [isPostersLiveDb, setIsPostersLiveDb] = useState(false);

  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isVideosLiveDb, setIsVideosLiveDb] = useState(false);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoadingSocials, setIsLoadingSocials] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Modals state
  const [activePoster, setActivePoster] = useState<Poster | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoContent | null>(null);

  // Poster category filter for the 10-poster preview
  const [posterFilter, setPosterFilter] = useState<'All' | 'Recruitment' | 'STEM' | 'Exam Prep' | 'Language'>('All');

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
    let isMounted = true;

    // Load posters
    getPublishedPosters().then((res) => {
      if (isMounted) {
        setPosters(res.posters);
        setIsPostersLiveDb(res.isLiveDb);
        setIsLoadingPosters(false);
      }
    });

    // Load videos
    getPublishedVideos().then((res) => {
      if (isMounted) {
        setVideos(res.videos);
        setIsVideosLiveDb(res.isLiveDb);
        setIsLoadingVideos(false);
      }
    });

    // Load social links
    getActiveSocialLinks().then((res) => {
      if (isMounted) {
        setSocialLinks(res.links);
        setIsLoadingSocials(false);
      }
    });

    const handleAuth = () => {
      setIsAdmin(isAdminAuthenticated());
    };
    const handleSettingsUpdate = () => {
      setSiteSettings(getSiteSettings());
    };
    const handleAnnouncementsUpdate = () => {
      setAnnouncements(getAnnouncements().filter(a => a.isPublished));
    };
    const handleGalleryUpdate = () => {
      setGalleryPhotos(getGalleryPhotos().slice(0, 3));
    };

    window.addEventListener('home_tutor_auth_change', handleAuth);
    window.addEventListener('home_tutor_settings_change', handleSettingsUpdate);
    window.addEventListener('home_tutor_announcements_change', handleAnnouncementsUpdate);
    window.addEventListener('home_tutor_gallery_change', handleGalleryUpdate);

    return () => { 
      isMounted = false;
      window.removeEventListener('home_tutor_auth_change', handleAuth);
      window.removeEventListener('home_tutor_settings_change', handleSettingsUpdate);
      window.removeEventListener('home_tutor_announcements_change', handleAnnouncementsUpdate);
      window.removeEventListener('home_tutor_gallery_change', handleGalleryUpdate);
    };
  }, []);

  const handleDeletePoster = async (poster: Poster) => {
    if (poster.slotNumber === undefined) return;
    const res = await deletePoster(poster.slotNumber);
    if (res.success) {
      setPosters(prev => prev.filter(p => p.slotNumber !== poster.slotNumber));
      if (activePoster?.slotNumber === poster.slotNumber) {
        setActivePoster(null);
      }
      setNotification({
        message: `Poster #${poster.slotNumber} deleted successfully.`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteVideo = async (video: VideoContent) => {
    if (!video.slotNumber) return;
    const res = await deleteVideo(video.slotNumber);
    if (res.success) {
      setVideos(prev => prev.filter(v => v.slotNumber !== video.slotNumber));
      if (activeVideo?.slotNumber === video.slotNumber) {
        setActiveVideo(null);
      }
      setNotification({
        message: `Video #${video.slotNumber} removed successfully.`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSubject && selectedSubject !== 'All Subjects') params.append('subject', selectedSubject);
    if (selectedClass && selectedClass !== 'All Classes') params.append('classLevel', selectedClass);
    if (selectedCity && selectedCity !== 'All Cities') params.append('city', selectedCity);
    navigate(`/tutors?${params.toString()}`);
  };

  const featuredTutors = TUTORS_LIST.slice(0, 4);

  const filteredPosters = posterFilter === 'All' 
    ? posters 
    : posters.filter(p => p.category === posterFilter);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* 0. LIVE TOP ANNOUNCEMENT BAR */}
      {siteSettings.showAnnouncementBar && siteSettings.announcementBarText && (
        <div className="bg-[#3B0764] text-white py-2.5 px-4 text-xs border-b border-[#DDD6FE]/20 flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full flex-wrap">
            <Megaphone className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
            <span className="font-medium text-[#DDD6FE]">{siteSettings.announcementBarText}</span>
            <Link to="/book-appointment" className="font-bold text-white hover:text-[#A78BFA] underline ml-2 whitespace-nowrap">
              Book Free Trial &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#4C1D95] via-[#3B0764] to-[#4C1D95] text-white overflow-hidden py-16 lg:py-24 border-b border-[#3B0764]">
        {/* Subtle grid pattern & lavender glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#6d28d9_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#A78BFA]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading, Value Prop, Buttons & Search Form */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3B0764]/90 border border-[#DDD6FE]/30 text-xs font-semibold text-[#DDD6FE]">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
                <span className="text-white">Verified Home & Online Tutors • Lavender Dream Edition</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
                  Find the Right Home Tutor for Your Success
                </h1>

                <p className="text-base sm:text-lg text-[#DDD6FE]/90 leading-relaxed max-w-2xl">
                  Connect with certified, experienced home educators tailored to your child’s learning style. From Grade 1 fundamentals and Matric/FSc to Cambridge O/A-Levels and competitive medical/engineering entry tests.
                </p>
              </div>

              {/* Action Buttons: Find Tutor and Book Appointment */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/tutors"
                  className="px-6 py-3.5 bg-[#A78BFA] hover:bg-white text-[#3B0764] font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#A78BFA]/20 active:scale-95 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-[#3B0764]" />
                  <span>Find Tutor</span>
                </Link>

                <Link
                  to="/book-appointment"
                  className="px-6 py-3.5 bg-[#3B0764] hover:bg-[#2e0550] text-white border border-[#DDD6FE]/40 font-bold text-sm rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#A78BFA]" />
                  <span>Book Appointment</span>
                </Link>
              </div>

              {/* Search Form: Subject, Class, and City Fields */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 text-[#1F2937] shadow-2xl border border-[#DDD6FE]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4C1D95] mb-3 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#4C1D95]" />
                  <span>Quick Tutor Search by Criteria</span>
                </div>

                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Subject field */}
                  <div>
                    <label htmlFor="hero-subject" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Subject
                    </label>
                    <select
                      id="hero-subject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] focus:border-transparent"
                    >
                      <option value="">All Subjects</option>
                      {POPULAR_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Class field */}
                  <div>
                    <label htmlFor="hero-class" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Class Level
                    </label>
                    <select
                      id="hero-class"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] focus:border-transparent"
                    >
                      <option value="">All Classes</option>
                      {CLASSES_LEVELS.slice(1).map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* City field */}
                  <div>
                    <label htmlFor="hero-city" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      City / Location
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="hero-city"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95] focus:border-transparent"
                      >
                        <option value="">All Cities</option>
                        {CITIES.slice(1).map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors shadow-sm"
                        title="Filter Tutors"
                      >
                        <Search className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Column: Hero Visual Image & Trust Anchors */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#3B0764] shadow-2xl bg-[#3B0764] aspect-16/10 lg:aspect-auto lg:h-[460px]">
                <img
                  src={HERO_IMAGE}
                  alt="Professional home tutoring session with teacher and student"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B0764]/85 via-transparent to-transparent" />

                {/* Floating Trust Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#3B0764]/90 backdrop-blur-md p-4 rounded-2xl border border-[#4C1D95] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#4C1D95] text-[#A78BFA] border border-[#A78BFA]/30">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Academic Integrity Verified</div>
                      <div className="text-[11px] text-[#DDD6FE]">Identity & Degree Credentials Audited</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-[#A78BFA] tabular-nums">4.9 / 5.0</div>
                    <div className="text-[10px] text-[#DDD6FE]">Parent Rating</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="bg-white border-b border-[#DDD6FE] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS_DATA.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#4C1D95] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED TUTORS SECTION */}
      <section className="py-16 sm:py-20 bg-[#F5F3FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4C1D95] mb-1 block">
                Top Rated Educators
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
                Featured Home Tutors
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
                Every tutor undergoes rigorous academic verification, background checks, and student evaluation interviews.
              </p>
            </div>

            <Link
              to="/tutors"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4C1D95] hover:text-[#3B0764] transition-colors"
            >
              <span>View all 450+ verified tutors</span>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </Link>
          </div>

          {/* Featured Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/tutors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl text-xs font-bold text-[#4C1D95] transition-all shadow-xs"
            >
              <span>Explore Complete Tutor Directory</span>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. POPULAR SUBJECTS SECTION */}
      <section className="py-16 bg-white border-y border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
              Comprehensive Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
              Popular Subjects Covered
            </h2>
            <p className="text-sm text-[#6B7280]">
              Specialized 1-on-1 coaching for school coursework, board exams, and competitive entrance tests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {POPULAR_SUBJECTS.map((subject) => (
              <Link
                key={subject.id}
                to={`/tutors?subject=${encodeURIComponent(subject.name)}`}
                className="group p-5 bg-[#F5F3FF] hover:bg-white rounded-2xl border border-[#DDD6FE] hover:border-[#A78BFA] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-medium text-[#6B7280] tabular-nums">
                      {subject.tutorCount} Tutors
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1F2937] group-hover:text-[#4C1D95] transition-colors">
                    {subject.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {subject.popularTopics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="text-[11px] text-[#6B7280] bg-white px-2 py-0.5 rounded border border-[#DDD6FE]">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DDD6FE]/60 flex items-center justify-between text-xs font-semibold text-[#6B7280] group-hover:text-[#4C1D95]">
                  <span>Browse Subject Tutors</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 4. PROMOTIONAL POSTERS SECTION */}
      <section className="py-16 sm:py-20 bg-[#3B0764] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#4C1D95] text-[#A78BFA] text-xs font-bold border border-[#A78BFA]/30">
                  <span>10 Campaign Slots Configured</span>
                </span>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${
                  isPostersLiveDb 
                    ? 'bg-[#4C1D95]/80 text-[#DDD6FE] border-[#A78BFA]/40' 
                    : 'bg-[#4C1D95]/50 text-[#DDD6FE] border-white/20'
                }`}>
                  {isPostersLiveDb ? 'Live Supabase Sync' : 'Demo Fallback Active'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Promotional Posters & Academic Campaigns
              </h2>
              <p className="text-sm text-[#DDD6FE]/90 mt-1 max-w-xl">
                Explore our official academic announcements, tutor recruitment flyers, and intensive exam bootcamp posters.
              </p>
            </div>

            {/* Poster Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#4C1D95] rounded-xl border border-[#DDD6FE]/20">
              {(['All', 'Recruitment', 'STEM', 'Exam Prep', 'Language'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPosterFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    posterFilter === cat
                      ? 'bg-[#A78BFA] text-[#3B0764] font-bold shadow-xs'
                      : 'text-[#DDD6FE] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading, Empty, or Grid accommodating 10 posters */}
          {isLoadingPosters ? (
            <div className="py-16 text-center text-[#DDD6FE] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#A78BFA]" />
              <span className="text-xs">Loading published campaign posters...</span>
            </div>
          ) : filteredPosters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {filteredPosters.slice(0, 10).map((poster) => (
                <PosterCard 
                  key={poster.id} 
                  poster={poster} 
                  isAdmin={isAdmin}
                  onDelete={handleDeletePoster}
                  onPreview={(p) => setActivePoster(p)} 
                />
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 rounded-2xl bg-[#4C1D95]/50 border border-white/10 text-center space-y-3">
              <p className="text-sm font-semibold text-white">No published posters found in this category.</p>
              <button
                onClick={() => setPosterFilter('All')}
                className="text-xs font-bold text-[#A78BFA] hover:underline"
              >
                Reset category filter
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs text-[#DDD6FE]/70">
              Showing {filteredPosters.length} published promotional posters. Full management in Admin Dashboard.
            </span>
            <Link
              to="/posters"
              className="text-xs font-bold text-[#A78BFA] hover:underline flex items-center gap-1"
            >
              <span>Open Complete Poster Hub</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA]" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. VIDEO SECTION */}
      <section className="py-16 sm:py-20 bg-[#F5F3FF] border-b border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4C1D95] block">
                  Educational Showcase
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                  isVideosLiveDb 
                    ? 'bg-[#F5F3FF] text-[#4C1D95] border-[#DDD6FE]' 
                    : 'bg-white text-[#6B7280] border-[#DDD6FE]'
                }`}>
                  {isVideosLiveDb ? 'Live Supabase Sync' : 'Demo Fallback Active'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                Home Tutor Spotlight Videos
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
                Watch certified tutors demonstrate conceptual explanations, study methodologies, and parent orientation sessions.
              </p>
            </div>

            <Link
              to="/videos"
              className="text-xs font-bold text-[#4C1D95] hover:text-[#3B0764] flex items-center gap-1.5"
            >
              <span>Explore all video modules</span>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </Link>
          </div>

          {/* 3 Video Cards */}
          {isLoadingVideos ? (
            <div className="py-16 text-center text-[#6B7280] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#4C1D95]" />
              <span className="text-xs">Loading educational videos...</span>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteVideo}
                  onPlay={(v) => setActiveVideo(v)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 rounded-2xl bg-white border border-[#DDD6FE] text-center space-y-2">
              <p className="text-sm font-semibold text-[#1F2937]">No published videos currently available.</p>
              <p className="text-xs text-[#6B7280]">Administrators can configure and publish video slots in the Admin Dashboard.</p>
            </div>
          )}

        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
              Seamless Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
              How Home Tutor Works
            </h2>
            <p className="text-sm text-[#6B7280]">
              Four straightforward steps to pair your child with an exceptional educator at your residence or online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center font-bold text-lg">
                01
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">
                Search & Filter
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Filter by subject, grade level, city, and curriculum (O/A-Levels, Matric, FSc, Primary, SAT).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center font-bold text-lg">
                02
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">
                Review Credentials
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Check verified degrees, parent ratings, past results, and transparent hourly rates without hidden agent markups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center font-bold text-lg">
                03
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">
                Book Appointment
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Schedule a convenient date and time for an in-home trial lesson or live 1-on-1 virtual interactive session.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#4C1D95] text-[#A78BFA] flex items-center justify-center font-bold text-lg">
                04
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">
                Achieve Academic Excellence
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Track weekly progress, customized study plans, mock exams, and achieve top grades with dedicated mentorship.
              </p>
            </div>

          </div>

          <div className="p-6 bg-[#4C1D95] rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#3B0764] shadow-md">
            <div>
              <h4 className="text-base font-bold text-white">Ready to begin your child’s learning transformation?</h4>
              <p className="text-xs text-[#DDD6FE] mt-0.5">Zero advance agent fees. Direct connection with verified teachers.</p>
            </div>
            <Link
              to="/book-appointment"
              className="px-6 py-3 bg-[#A78BFA] hover:bg-white text-[#3B0764] font-bold text-xs rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
            >
              Book an Appointment
            </Link>
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-16 sm:py-20 bg-[#F5F3FF] border-t border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DDD6FE]/40 text-[#4C1D95] text-xs font-semibold border border-[#DDD6FE]">
              <span>Sample Verified Feedback (Lavender Dream Showcase)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
              Trusted by Parents & High Achievers
            </h2>
            <p className="text-sm text-[#6B7280]">
              Read how personalized home tutoring helped students elevate their exam scores and academic confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((test) => (
              <div 
                key={test.id} 
                className="bg-white p-6 rounded-2xl border border-[#DDD6FE] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-[#1F2937] leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DDD6FE]/60">
                  <div className="font-bold text-[#1F2937] text-sm">
                    {test.studentName} {test.parentName ? `(${test.parentName})` : ''}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    {test.role} • {test.grade}
                  </div>
                  <div className="text-[11px] text-[#4C1D95] font-semibold mt-1">
                    Tutored in {test.subject} by {test.tutorName}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7.5 ACADEMY NOTICE BOARD & ANNOUNCEMENTS */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DDD6FE]/40 text-[#4C1D95] text-xs font-bold border border-[#DDD6FE] mb-2">
                <Megaphone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Notice Board & Announcements</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                Official Academy Updates & Notices
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
                Stay updated with ongoing admission batches, Cambridge CAIE / Matric schedule alerts, and demo session dates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/admin?tab=announcements"
                className="text-xs font-bold text-[#4C1D95] hover:text-[#3B0764] flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE]"
              >
                <span>{isAdmin ? 'Manage Announcements' : 'Admin Notice Console'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA]" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-6 rounded-3xl bg-[#F5F3FF] border border-[#DDD6FE] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{ann.date}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#4C1D95]">{ann.category}</span>
                    {ann.badge && (
                      <span className="px-2 py-0.5 bg-white text-[#3B0764] rounded-md text-[10px] font-bold border border-[#DDD6FE]">
                        {ann.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">{ann.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">{ann.content}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#DDD6FE]/60 flex items-center justify-between">
                  <Link
                    to="/book-appointment"
                    className="text-xs font-bold text-[#4C1D95] hover:underline flex items-center gap-1"
                  >
                    <span>Inquire / Apply</span>
                    <ArrowRight className="w-3 h-3 text-[#A78BFA]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7.6 PHOTO GALLERY HIGHLIGHTS */}
      <section className="py-16 sm:py-20 bg-[#F5F3FF] border-t border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DDD6FE]/60 text-[#4C1D95] text-xs font-bold border border-[#DDD6FE] mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Campus & Mentorship Photo Gallery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                Authentic Moments of Academic Mentorship
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
                Explore real photos from verified home tutoring sessions, student past paper problem-solving, and parent advisory meetings.
              </p>
            </div>

            <Link
              to="/gallery"
              className="px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs shrink-0"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryPhotos.map((photo) => (
              <Link
                key={photo.id}
                to="/gallery"
                className="group bg-white rounded-3xl border border-[#DDD6FE] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg uppercase">
                    {photo.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">{photo.date}</span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4C1D95] transition-colors line-clamp-1">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#8B5CF6]">
                    <span>Open in Lightbox</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 8. SOCIAL MEDIA SECTION */}
      <section className="py-16 bg-white border-t border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#3B0764] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-[#4C1D95]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-6 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Join Our Academic Community
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Follow Home Tutor on Official Social Media
              </h2>
              <p className="text-sm text-[#DDD6FE]/90 leading-relaxed">
                Connect with our academic community across TikTok, Facebook, YouTube, and Instagram for live question-solving sessions, past-paper walkthroughs, and exam preparation guides.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {(socialLinks.length > 0 ? socialLinks : SOCIAL_LINKS.map(s => ({
                  id: s.name.toLowerCase(),
                  name: s.name,
                  url: s.url,
                  handle: s.handle,
                  followers: s.followers,
                  platform: s.name.toLowerCase() as any,
                  isActive: true
                }))).map((social) => (
                  <a
                    key={social.id || social.name}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-[#4C1D95] border border-[#DDD6FE]/20 hover:border-[#A78BFA] hover:bg-[#4C1D95]/80 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                        {social.name}
                      </div>
                      <div className="text-xs text-[#DDD6FE]/80 mt-0.5">
                        {social.handle || 'Configured via CMS'}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#DDD6FE]/80">
                      <span className="font-mono text-[11px]">{social.followers || 'Verified'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ACADEMY CAMPUS & GOOGLE MAPS LOCATION */}
      <section className="py-16 bg-[#F5F3FF] border-t border-[#DDD6FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
                Physical Campus & Regional Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mt-1">
                The Inspire Business Academy, Sadiqabad
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">
                Visit our physical campus for student enrollment counseling, direct tutor background verification, and customized one-on-one session planning.
              </p>
            </div>
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-all shrink-0 self-start md:self-auto flex items-center gap-2 shadow-xs"
            >
              <span>Contact Campus Desk</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA]" />
            </Link>
          </div>

          <AcademyLocationMap variant="page-section" showDetails={true} />
        </div>
      </section>

      {/* Lightbox Modal for Posters */}
      <LightboxModal
        poster={activePoster}
        isAdmin={isAdmin}
        onDelete={handleDeletePoster}
        onClose={() => setActivePoster(null)}
      />

      {/* Video Player Modal for Videos */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

    </div>
  );
};
