import { getSupabaseClient } from '../lib/supabase';
import { VideoContent, VideoRow } from '../types';
import { HOME_TUTOR_VIDEOS } from '../data/mockData';
import { parseYouTubeUrl } from '../utils/validators';

const LOCAL_VIDEOS_KEY = 'home_tutor_cms_videos_v2';

function rowToVideo(row: VideoRow): VideoContent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tutorName: row.tutor_name,
    tutorRole: row.tutor_role,
    duration: row.duration,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    views: row.views,
    tags: row.tags,
    slotNumber: row.slot_number,
    videoType: row.video_type,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

let memoryVideos: VideoContent[] | null = null;

function getInitialLocalVideos(): VideoContent[] {
  if (memoryVideos) return memoryVideos;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_VIDEOS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as VideoContent[];
        // Check if cached videos are obsolete or contain older mock URLs
        const hasOldUrl = parsed.some(v => v.videoUrl?.includes('dQw4w9WgXcQ'));
        if (!hasOldUrl && parsed.length > 0) {
          memoryVideos = parsed;
          return memoryVideos;
        }
      } catch {
        // Fall through to initial seed
      }
    }
  }

  // Seed from HOME_TUTOR_VIDEOS (3 slots) with verified educational lessons
  const initial = HOME_TUTOR_VIDEOS.slice(0, 3).map((v, idx) => ({
    ...v,
    slotNumber: idx + 1,
    videoType: 'youtube' as const,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(initial));
      localStorage.removeItem('home_tutor_cms_videos_v1');
    } catch {}
  }
  memoryVideos = initial;
  return initial;
}

function saveLocalVideos(videos: VideoContent[]) {
  memoryVideos = videos;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(videos));
    } catch {}
  }
}

/**
 * Fetches published videos for public views (HomePage, VideosPage).
 */
export async function getPublishedVideos(): Promise<{
  videos: VideoContent[];
  isLiveDb: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('slot_number', { ascending: true });

      if (error) {
        console.warn('Supabase videos query error, using local fallback:', error.message);
        const fallback = getInitialLocalVideos().filter(v => v.isPublished);
        return { videos: fallback, isLiveDb: false, error: error.message };
      }

      if (data && data.length > 0) {
        return {
          videos: (data as VideoRow[]).map(rowToVideo),
          isLiveDb: true
        };
      }
    } catch (err: any) {
      console.warn('Supabase videos exception:', err?.message);
    }
  }

  const fallback = getInitialLocalVideos().filter(v => v.isPublished);
  return {
    videos: fallback,
    isLiveDb: false
  };
}

/**
 * Fetches all 3 video slots for Admin Dashboard.
 */
export async function getAdminVideoSlots(): Promise<{
  slots: (VideoContent | null)[];
  isLiveDb: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  const slots: (VideoContent | null)[] = Array(3).fill(null);

  if (client) {
    try {
      const { data, error } = await client
        .from('videos')
        .select('*')
        .order('slot_number', { ascending: true });

      if (!error && data) {
        (data as VideoRow[]).forEach(row => {
          if (row.slot_number >= 1 && row.slot_number <= 3) {
            slots[row.slot_number - 1] = rowToVideo(row);
          }
        });
        return { slots, isLiveDb: true };
      } else if (error) {
        console.warn('Supabase admin videos error:', error.message);
      }
    } catch (err: any) {
      console.warn('Admin videos exception:', err?.message);
    }
  }

  const localList = getInitialLocalVideos();
  localList.forEach(v => {
    if (v.slotNumber && v.slotNumber >= 1 && v.slotNumber <= 3) {
      slots[v.slotNumber - 1] = v;
    }
  });

  return { slots, isLiveDb: false };
}

/**
 * Saves (creates or updates) a video in a specific slot (1 to 3).
 */
export async function saveVideo(
  slotNumber: number,
  videoData: Omit<VideoContent, 'id' | 'slotNumber'> & { id?: string }
): Promise<{ success: boolean; video?: VideoContent; error?: string }> {
  if (slotNumber < 1 || slotNumber > 3) {
    return { success: false, error: 'Slot number must be between 1 and 3' };
  }

  // Format YouTube URLs if YouTube type
  let formattedVideoUrl = videoData.videoUrl || '';
  if (videoData.videoType === 'youtube' && formattedVideoUrl) {
    const parsed = parseYouTubeUrl(formattedVideoUrl);
    if (parsed.isValid && parsed.embedUrl) {
      formattedVideoUrl = parsed.embedUrl;
    }
  }

  const client = getSupabaseClient();

  if (client) {
    try {
      const payload = {
        slot_number: slotNumber,
        title: videoData.title,
        description: videoData.description,
        tutor_name: videoData.tutorName,
        tutor_role: videoData.tutorRole,
        duration: videoData.duration || '04:00',
        thumbnail_url: videoData.thumbnailUrl,
        video_url: formattedVideoUrl,
        video_type: videoData.videoType || 'youtube',
        views: videoData.views || '1.0k views',
        tags: videoData.tags && videoData.tags.length > 0 ? videoData.tags : ['Academic', 'Tutorial'],
        is_published: videoData.isPublished !== undefined ? videoData.isPublished : true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('videos')
        .upsert(payload, { onConflict: 'slot_number' })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, video: rowToVideo(data as VideoRow) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  }

  // Local storage save
  const current = getInitialLocalVideos();
  const existingIndex = current.findIndex(v => v.slotNumber === slotNumber);

  const updatedVideo: VideoContent = {
    id: videoData.id || `video-local-${slotNumber}-${Date.now()}`,
    slotNumber,
    title: videoData.title,
    description: videoData.description,
    tutorName: videoData.tutorName,
    tutorRole: videoData.tutorRole,
    duration: videoData.duration || '04:00',
    thumbnailUrl: videoData.thumbnailUrl,
    videoUrl: formattedVideoUrl,
    views: videoData.views || '1.0k views',
    tags: videoData.tags || ['Academic', 'Tutorial'],
    videoType: videoData.videoType || 'youtube',
    isPublished: videoData.isPublished !== undefined ? videoData.isPublished : true,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    current[existingIndex] = updatedVideo;
  } else {
    current.push(updatedVideo);
  }

  saveLocalVideos(current);
  return { success: true, video: updatedVideo };
}

/**
 * Deletes a video from a slot (makes slot empty).
 */
export async function deleteVideo(slotNumber: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('videos')
        .delete()
        .eq('slot_number', slotNumber);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  const current = getInitialLocalVideos().filter(v => v.slotNumber !== slotNumber);
  saveLocalVideos(current);
  return { success: true };
}

/**
 * Toggles video publication status.
 */
export async function toggleVideoPublish(
  slotNumber: number,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('videos')
        .update({ is_published: isPublished, updated_at: new Date().toISOString() })
        .eq('slot_number', slotNumber);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  const current = getInitialLocalVideos();
  const target = current.find(v => v.slotNumber === slotNumber);
  if (target) {
    target.isPublished = isPublished;
    target.updatedAt = new Date().toISOString();
    saveLocalVideos(current);
  }
  return { success: true };
}

/**
 * Uploads a video file or thumbnail to Supabase Storage 'videos' bucket.
 */
export async function uploadVideoMedia(
  file: File,
  slotNumber: number,
  type: 'video' | 'thumbnail'
): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const fileExt = file.name.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
      const fileName = `slot_${slotNumber}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { data, error } = await client.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: publicUrlData } = client.storage
        .from('videos')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Storage upload error' };
    }
  }

  // Local reader fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        success: true,
        url: reader.result as string
      });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read media file locally' });
    };
    reader.readAsDataURL(file);
  });
}
