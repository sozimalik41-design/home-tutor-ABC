import React, { useState } from 'react';
import { Poster } from '../../types';
import { Eye, Image as ImageIcon, Trash2, Edit, AlertCircle } from 'lucide-react';

interface PosterCardProps {
  poster: Poster;
  onPreview: (poster: Poster) => void;
  onDelete?: (poster: Poster) => void;
  isAdmin?: boolean;
}

export const PosterCard: React.FC<PosterCardProps> = ({ poster, onPreview, onDelete, isAdmin }) => {
  const [imageError, setImageError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-[#DDD6FE] overflow-hidden shadow-xs hover:border-[#A78BFA] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Poster Image Container */}
      <div className="relative aspect-3/4 bg-[#3B0764] overflow-hidden cursor-pointer" onClick={() => onPreview(poster)}>
        {imageError || !poster.imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#4C1D95] via-[#3B0764] to-[#2e0550] text-white">
            <ImageIcon className="w-10 h-10 text-[#A78BFA] mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">{poster.category}</span>
            <h4 className="text-sm font-semibold mt-1">{poster.title}</h4>
          </div>
        ) : (
          <img
            src={poster.imageUrl}
            alt={poster.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Category Overlay Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-bold bg-[#3B0764]/90 backdrop-blur-md text-[#A78BFA] rounded-md border border-[#A78BFA]/40 shadow-sm">
            {poster.badgeText}
          </span>
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-[#3B0764]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(poster);
            }}
            className="px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#3B0764] transition-colors shadow-lg active:scale-95 border border-[#A78BFA]"
          >
            <Eye className="w-4 h-4 text-[#A78BFA]" />
            <span>View Full Poster</span>
          </button>
        </div>
      </div>

      {/* Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="text-[11px] font-bold text-[#4C1D95] uppercase tracking-wider mb-1">
            {poster.category}
          </div>
          <h4 className="text-sm font-bold text-[#1F2937] group-hover:text-[#4C1D95] transition-colors line-clamp-2 leading-snug">
            {poster.title}
          </h4>
          <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">
            {poster.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#DDD6FE]/60 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onPreview(poster)}
            className="text-xs font-semibold text-[#4C1D95] hover:text-[#3B0764] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Full Preview</span>
          </button>

          {(isAdmin || onDelete) && (
            <div>
              {showConfirmDelete ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-rose-700 font-bold">Delete?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(poster);
                      setShowConfirmDelete(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(false);
                    }}
                    className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(true);
                  }}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Delete Poster Image"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}

          {!isAdmin && !onDelete && (
            <span className="text-[11px] font-medium text-[#6B7280]">
              Lavender Dream
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
