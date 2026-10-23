import React, { useState } from 'react';
import { VideoContent } from '../../types';
import { Play, Clock, Video, Trash2 } from 'lucide-react';

interface VideoCardProps {
  video: VideoContent;
  onPlay: (video: VideoContent) => void;
  onDelete?: (video: VideoContent) => void;
  isAdmin?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, onDelete, isAdmin }) => {
  const [imageError, setImageError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#DDD6FE] overflow-hidden shadow-xs hover:border-[#A78BFA] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      
      {/* Video Thumbnail Container */}
      <div 
        className="relative aspect-16/9 bg-[#3B0764] overflow-hidden cursor-pointer"
        onClick={() => onPlay(video)}
      >
        {imageError || !video.thumbnailUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4C1D95] to-[#3B0764] text-white">
            <Video className="w-12 h-12 text-[#A78BFA]" />
          </div>
        ) : (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Dark contrast scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3B0764]/90 via-[#3B0764]/30 to-transparent" />

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#4C1D95]/90 border-2 border-[#A78BFA] text-[#A78BFA] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#A78BFA] group-hover:text-[#3B0764] transition-all duration-200">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#3B0764]/90 backdrop-blur-md text-white rounded-md text-xs font-mono font-medium border border-[#DDD6FE]/20">
          <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>{video.duration}</span>
        </div>

        {/* Views badge */}
        <div className="absolute bottom-3 left-3 text-xs text-[#DDD6FE] font-medium">
          {video.views}
        </div>
      </div>

      {/* Video Details */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {video.tags.map((tag, idx) => (
              <span key={idx} className="text-[11px] font-semibold text-[#4C1D95] bg-[#F5F3FF] px-2 py-0.5 rounded border border-[#DDD6FE]">
                {tag}
              </span>
            ))}
          </div>

          <h4 
            onClick={() => onPlay(video)}
            className="text-base font-bold text-[#1F2937] group-hover:text-[#4C1D95] transition-colors line-clamp-2 leading-snug cursor-pointer"
          >
            {video.title}
          </h4>

          <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#DDD6FE]/60 flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="text-xs font-bold text-[#1F2937]">{video.tutorName}</div>
            <div className="text-[11px] text-[#6B7280]">{video.tutorRole}</div>
          </div>

          <div className="flex items-center gap-2">
            {(isAdmin || onDelete) && (
              <div>
                {showConfirmDelete ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-rose-700 font-bold">Delete?</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(video);
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
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => onPlay(video)}
              className="text-xs font-bold text-white bg-[#4C1D95] hover:bg-[#3B0764] px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
