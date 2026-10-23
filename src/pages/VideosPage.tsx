import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Video, 
  Upload, 
  Calendar, 
  Clock, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Loader2,
  Settings,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { VideoCard } from '../components/common/VideoCard';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { VideoContent } from '../types';
import { getPublishedVideos, deleteVideo } from '../services/videoService';
import { isAdminAuthenticated } from '../utils/auth';

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
    let isMounted = true;
    getPublishedVideos().then((res) => {
      if (isMounted) {
        setVideos(res.videos);
        setIsLiveDb(res.isLiveDb);
        setIsLoading(false);
      }
    });

    const handleAuthChange = () => {
      setIsAdmin(isAdminAuthenticated());
    };
    window.addEventListener('home_tutor_auth_change', handleAuthChange);
    return () => { 
      isMounted = false;
      window.removeEventListener('home_tutor_auth_change', handleAuthChange);
    };
  }, []);

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
    } else {
      setNotification({
        message: res.error || 'Failed to delete video',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-2">
              <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#1F2937]">Educational Videos</span>
            </div>

            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
                Home Tutor Video Learning Hub
              </h1>
              <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${
                isLiveDb 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-white text-[#4C1D95] border-[#DDD6FE]'
              }`}>
                {isLiveDb ? 'Live Supabase Sync' : 'Verified Masterclasses'}
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">
              Engineered for Home Tutor masterclasses and parent orientation videos with interactive playback.
            </p>
          </div>

          {/* Admin CMS Button ONLY VISIBLE TO LOGGED IN ADMIN */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/admin"
                className="px-4 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#A78BFA]" />
                <span>Add / Manage Videos</span>
              </Link>
            </div>
          )}
        </div>

        {/* Admin Quick Help banner if logged in */}
        {isAdmin && (
          <div className="bg-[#4C1D95]/10 border border-[#4C1D95]/20 p-4 rounded-2xl flex items-center justify-between text-xs text-[#4C1D95]">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#4C1D95]" />
              <span>Admin Mode Active: Click the "Delete" button on any video card to remove or clear the slot immediately.</span>
            </div>
            <Link to="/dashboard/admin" className="font-bold underline text-[#4C1D95] hover:text-[#3B0764] cursor-pointer">
              Open Admin Dashboard
            </Link>
          </div>
        )}

        {/* Video Grid, Loading, or Empty state */}
        {isLoading ? (
          <div className="py-24 text-center text-[#6B7280] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#4C1D95]" />
            <span className="text-xs font-medium">Fetching published masterclasses...</span>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div className="bg-white rounded-3xl p-12 text-center border border-[#DDD6FE] space-y-4 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#1F2937]">No Published Videos</h3>
            <p className="text-xs text-[#6B7280]">
              There are currently no published educational videos. Configure and publish slots in the Admin Dashboard.
            </p>
          </div>
        )}

        {/* Key Educational Highlights Grid */}
        <div className="bg-white rounded-3xl p-8 border border-[#DDD6FE] space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4C1D95] text-[#A78BFA]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Why Video Demonstrations Matter</h3>
              <p className="text-xs text-[#6B7280]">How our video previews assist parents and students in choosing the right mentor.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
              <div className="font-bold text-xs text-[#1F2937]">Teaching Demystification</div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Parents observe first-hand how tutors explain difficult topics prior to scheduling in-home appointments.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
              <div className="font-bold text-xs text-[#1F2937]">Methodology Review</div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Evaluate teacher pace, clarity of speech, diagrammatic clarity, and student engagement methods.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
              <div className="font-bold text-xs text-[#1F2937]">Safety & Ethics Standards</div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Understand the home tutoring code of conduct, parental presence guidelines, and academic integrity policies.
              </p>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />

      </div>
    </div>
  );
};
