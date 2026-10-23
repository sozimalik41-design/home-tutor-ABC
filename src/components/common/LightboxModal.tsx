import React, { useState } from 'react';
import { Poster } from '../../types';
import { X, Download, Share2, Info, Check, Trash2, AlertTriangle } from 'lucide-react';

interface LightboxModalProps {
  poster: Poster | null;
  onClose: () => void;
  onDelete?: (poster: Poster) => void;
  isAdmin?: boolean;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ poster, onClose, onDelete, isAdmin }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!poster) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      const link = document.createElement('a');
      link.href = poster.imageUrl;
      link.download = `${poster.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#3B0764]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#DDD6FE] flex flex-col md:flex-row my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Poster Image */}
        <div className="md:w-1/2 bg-[#3B0764] flex items-center justify-center p-6 sm:p-8 relative min-h-[380px]">
          <img 
            src={poster.imageUrl} 
            alt={poster.title} 
            className="max-h-[520px] w-auto object-contain rounded-xl shadow-2xl border border-[#4C1D95]"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-[#4C1D95]/90 text-[#A78BFA] text-xs font-bold rounded-lg border border-[#A78BFA]/40 shadow-sm">
              {poster.badgeText}
            </span>
          </div>
        </div>

        {/* Right: Details & Actions */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
                {poster.category} Promotion
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F5F3FF] text-[#6B7280] hover:text-[#4C1D95] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-extrabold text-[#1F2937] leading-snug">
              {poster.title}
            </h3>

            <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">
              {poster.description}
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4C1D95]">
                <Info className="w-4 h-4 text-[#A78BFA]" />
                <span>Lavender Dream Theme & Storage</span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Poster banners are synchronized with Supabase storage and displayed with crisp lavender accent tags and accessible high-contrast typography.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#DDD6FE] space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full sm:w-auto flex-1 py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#A78BFA]" />
                <span>{downloading ? 'Downloading...' : 'Download Poster Asset'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto py-3 px-4 bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 text-[#4C1D95] border border-[#DDD6FE] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#4C1D95]" /> : <Share2 className="w-4 h-4 text-[#4C1D95]" />}
                <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
              </button>
            </div>

            {(isAdmin || onDelete) && (
              <div className="pt-2">
                {confirmDelete ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs text-rose-800 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Are you sure you want to delete this poster?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete?.(poster);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete This Poster</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
