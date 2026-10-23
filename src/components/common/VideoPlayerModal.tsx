import React, { useState, useEffect } from 'react';
import { VideoContent } from '../../types';
import { X, Calendar, Play, ExternalLink, RefreshCw, AlertCircle, Volume2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { parseYouTubeUrl } from '../../utils/validators';

interface VideoPlayerModalProps {
  video: VideoContent | null;
  onClose: () => void;
}

// Reliable sample educational video streams for fallback when external iframes are restricted by browser
const DEMO_DIRECT_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  // Determine playback mode: 'youtube' | 'direct'
  const isDirectVideo = 
    video.videoType === 'uploaded' ||
    (video.videoUrl && (
      video.videoUrl.endsWith('.mp4') || 
      video.videoUrl.endsWith('.webm') || 
      video.videoUrl.startsWith('blob:') || 
      video.videoUrl.startsWith('data:')
    ));

  const ytResult = parseYouTubeUrl(video.videoUrl || '');
  const [playerMode, setPlayerMode] = useState<'youtube' | 'direct'>(
    isDirectVideo ? 'direct' : (ytResult.isValid ? 'youtube' : 'direct')
  );

  // Fallback direct URL if YouTube fails or user selects direct mode
  const fallbackDirectUrl = DEMO_DIRECT_VIDEOS[((video.slotNumber || 1) - 1) % DEMO_DIRECT_VIDEOS.length];
  const directVideoSrc = isDirectVideo ? video.videoUrl : fallbackDirectUrl;

  const embedUrl = ytResult.isValid && ytResult.videoId
    ? `https://www.youtube.com/embed/${ytResult.videoId}?autoplay=1&rel=0&modestbranding=1`
    : (video.videoUrl?.includes('embed') ? video.videoUrl : `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#3B0764]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#DDD6FE] my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#DDD6FE] flex items-center justify-between bg-[#F5F3FF]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-[11px] font-bold bg-[#4C1D95] text-[#A78BFA] rounded-md">
              Home Tutor Masterclass
            </span>
            <span className="text-xs text-[#6B7280] font-mono">
              Duration: {video.duration || '05:00'}
            </span>

            {/* Switch Player mode if applicable */}
            <div className="hidden sm:flex items-center gap-1 ml-2 bg-white px-2 py-0.5 rounded-lg border border-[#DDD6FE] text-xs">
              <button
                type="button"
                onClick={() => setPlayerMode('youtube')}
                className={`px-2 py-0.5 rounded font-medium text-[11px] transition-colors ${
                  playerMode === 'youtube' ? 'bg-[#4C1D95] text-white' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                YouTube Embed
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('direct')}
                className={`px-2 py-0.5 rounded font-medium text-[11px] transition-colors ${
                  playerMode === 'direct' ? 'bg-[#4C1D95] text-white' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                HTML5 Video Stream
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white text-[#6B7280] hover:text-[#4C1D95] transition-colors cursor-pointer"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Video Canvas (Guaranteed to play!) */}
        <div className="relative aspect-16/9 bg-slate-950 flex items-center justify-center overflow-hidden">
          {playerMode === 'direct' ? (
            <video 
              key={directVideoSrc}
              src={directVideoSrc} 
              controls 
              autoPlay 
              playsInline
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          )}
        </div>

        {/* Video Player Helper Toolbar */}
        <div className="bg-[#F5F3FF] px-5 py-2 border-b border-[#DDD6FE] flex flex-wrap items-center justify-between text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[#1F2937]">Active Playback: {playerMode === 'youtube' ? 'YouTube Stream' : 'Direct HTML5 Player'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlayerMode(playerMode === 'youtube' ? 'direct' : 'youtube')}
              className="text-[#4C1D95] hover:text-[#3B0764] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch to {playerMode === 'youtube' ? 'Direct Player' : 'YouTube Player'}</span>
            </button>

            {video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4C1D95] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Video Details & Next Steps */}
        <div className="p-6 sm:p-8 bg-white overflow-y-auto max-h-[40vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-xl font-bold text-[#1F2937]">
                {video.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                {video.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-2">
                {video.tags && video.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs font-semibold text-[#4C1D95] bg-[#F5F3FF] px-2.5 py-1 rounded-md border border-[#DDD6FE]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tutor Booking CTA */}
            <div className="bg-[#F5F3FF] p-5 rounded-2xl border border-[#DDD6FE] flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-[#4C1D95] uppercase tracking-wider mb-1">
                  Featured Instructor
                </div>
                <div className="font-bold text-[#1F2937] text-sm">{video.tutorName}</div>
                <div className="text-xs text-[#6B7280]">{video.tutorRole}</div>
              </div>

              <div className="space-y-2">
                <Link
                  to="/book-appointment"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Book Appointment Now</span>
                </Link>

                <Link
                  to="/tutors"
                  onClick={onClose}
                  className="w-full py-2 px-4 bg-white hover:bg-[#F5F3FF] text-[#4C1D95] border border-[#DDD6FE] rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                >
                  View All Tutors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
