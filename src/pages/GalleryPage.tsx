import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  Filter, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Calendar,
  Share2
} from 'lucide-react';
import { GalleryPhoto } from '../types';
import { getGalleryPhotos } from '../services/galleryService';
import { isAdminAuthenticated } from '../utils/auth';

export const GalleryPage: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setPhotos(getGalleryPhotos());
    setIsAdmin(isAdminAuthenticated());

    const handleUpdate = () => {
      setPhotos(getGalleryPhotos());
      setIsAdmin(isAdminAuthenticated());
    };

    window.addEventListener('home_tutor_gallery_change', handleUpdate);
    window.addEventListener('home_tutor_auth_change', handleUpdate);
    return () => {
      window.removeEventListener('home_tutor_gallery_change', handleUpdate);
      window.removeEventListener('home_tutor_auth_change', handleUpdate);
    };
  }, []);

  const categories = ['all', 'Tutoring', 'Campus', 'Awards', 'Workshops'];

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#2E1065] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#DDD6FE]">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Academy Life & Mentorship Moments</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Life at <span className="text-[#A78BFA]">Home Tutor</span>: Real Sessions, Verified Results
            </h1>
            
            <p className="text-sm sm:text-base text-[#DDD6FE]/90 leading-relaxed">
              Explore authentic glimpses of personalized 1-on-1 home tutoring sessions, student achievements in CAIE & Matric/FSc board exams, teacher pedagogy workshops, and advisory centers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/book-appointment"
                className="px-5 py-2.5 bg-[#A78BFA] hover:bg-white text-[#3B0764] rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Book Free Trial Class
              </Link>

              <Link
                to="/dashboard/admin?tab=gallery"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
                <span>{isAdmin ? 'Manage Gallery' : 'Admin Photo Console'}</span>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden lg:flex items-center justify-center">
            <ImageIcon className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#3B0764] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Photos' : cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-medium ml-auto">
            Showing <strong>{filteredPhotos.length}</strong> photos
          </span>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <Eye className="w-4 h-4" />
                    <span>Click to view full photo</span>
                  </div>
                </div>

                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {photo.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono block mb-1">{photo.date}</span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4C1D95] transition-colors line-clamp-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#8B5CF6] font-bold">
                  <span>View Details</span>
                  <Eye className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95">
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>

              <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-[#A78BFA] text-[#3B0764] text-[10px] font-bold uppercase tracking-wider">
                      {activePhoto.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activePhoto.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{activePhoto.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">{activePhoto.caption}</p>
                </div>

                <Link
                  to="/book-appointment"
                  onClick={() => setActivePhoto(null)}
                  className="px-5 py-2.5 bg-[#A78BFA] hover:bg-white text-[#3B0764] rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
                >
                  Book Tutoring Session
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
