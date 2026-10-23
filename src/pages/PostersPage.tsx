import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Download, 
  Eye, 
  Filter, 
  Upload, 
  Calendar, 
  Plus, 
  Info, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Settings,
  Trash2
} from 'lucide-react';
import { PosterCard } from '../components/common/PosterCard';
import { LightboxModal } from '../components/common/LightboxModal';
import { Poster } from '../types';
import { getPublishedPosters, deletePoster } from '../services/posterService';
import { isAdminAuthenticated } from '../utils/auth';

export const PostersPage: React.FC = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePoster, setActivePoster] = useState<Poster | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const categories = ['All', 'Recruitment', 'STEM', 'Exam Prep', 'Language', 'Primary'];

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
    let isMounted = true;
    getPublishedPosters().then((res) => {
      if (isMounted) {
        setPosters(res.posters);
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
    } else {
      setNotification({
        message: res.error || 'Failed to delete poster',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredPosters = selectedCategory === 'All' 
    ? posters 
    : posters.filter(p => p.category === selectedCategory);

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
              <span className="text-[#1F2937]">Promotional Posters</span>
            </div>

            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
                Promotional Posters & Academic Campaigns
              </h1>
              <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${
                isLiveDb 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-white text-[#4C1D95] border-[#DDD6FE]'
              }`}>
                {isLiveDb ? 'Live Supabase Sync' : 'Academic Campaigns'}
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">
              Engineered to support active promotional campaign slots across hiring, exam bootcamps, and early foundation programs.
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
                <span>Add / Manage Posters</span>
              </Link>
            </div>
          )}
        </div>

        {/* Admin Quick Help banner if logged in */}
        {isAdmin && (
          <div className="bg-[#4C1D95]/10 border border-[#4C1D95]/20 p-4 rounded-2xl flex items-center justify-between text-xs text-[#4C1D95]">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#4C1D95]" />
              <span>Admin Mode Active: Click the "Delete" button on any poster card to remove it immediately.</span>
            </div>
            <Link to="/dashboard/admin" className="font-bold underline text-[#4C1D95] hover:text-[#3B0764] cursor-pointer">
              Open Admin Dashboard
            </Link>
          </div>
        )}

        {/* Filter Categories Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6FE] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#6B7280] mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#4C1D95]" />
              <span>Category:</span>
            </span>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4C1D95] text-white shadow-xs'
                    : 'bg-[#F5F3FF] text-[#1F2937] hover:bg-[#DDD6FE]/60 border border-[#DDD6FE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#6B7280] font-mono">
            Showing <strong className="text-[#1F2937]">{filteredPosters.length}</strong> published posters
          </div>
        </div>

        {/* 10-Poster Grid, Loading, or Empty state */}
        {isLoading ? (
          <div className="py-24 text-center text-[#6B7280] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#4C1D95]" />
            <span className="text-xs font-medium">Fetching published posters from CMS...</span>
          </div>
        ) : filteredPosters.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredPosters.map((poster) => (
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
          <div className="bg-white rounded-3xl p-12 text-center border border-[#DDD6FE] space-y-4 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#1F2937]">No Posters in this Category</h3>
            <p className="text-xs text-[#6B7280]">
              There are currently no published posters matching "{selectedCategory}".
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Show All Categories
            </button>
          </div>
        )}

        {/* Lightbox Modal */}
        <LightboxModal
          poster={activePoster}
          isAdmin={isAdmin}
          onDelete={handleDeletePoster}
          onClose={() => setActivePoster(null)}
        />

      </div>
    </div>
  );
};
