import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Poster, PosterRow } from '../types';
import { PROMOTIONAL_POSTERS } from '../data/mockData';

// Local storage key for fallback when Supabase env vars are not yet configured
const LOCAL_POSTERS_KEY = 'home_tutor_cms_posters_v2';

// Convert database row to frontend Poster model
function rowToPoster(row: PosterRow): Poster {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as any,
    badgeText: row.badge_text,
    imageUrl: row.image_url,
    destinationUrl: row.destination_url || undefined,
    altText: row.alt_text || undefined,
    slotNumber: row.slot_number,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

let memoryPosters: Poster[] | null = null;

// Convert mock data to full 10 initial slots for fallback
function getInitialLocalPosters(): Poster[] {
  if (memoryPosters) return memoryPosters;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_POSTERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Poster[];
        // Verify that posters have distinct images (not all duplicate from prior version)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const uniqueImages = new Set(parsed.map(p => p.imageUrl));
          if (uniqueImages.size > 2) {
            memoryPosters = parsed;
            return memoryPosters;
          }
        }
      } catch {
        // Fall through to initial seed
      }
    }
  }

  // Seed from PROMOTIONAL_POSTERS with slotNumber 1 to 10 with distinct images
  const initial = PROMOTIONAL_POSTERS.slice(0, 10).map((p, idx) => ({
    ...p,
    slotNumber: idx + 1,
    isPublished: true,
    altText: p.title,
    destinationUrl: '/book-appointment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_POSTERS_KEY, JSON.stringify(initial));
      localStorage.removeItem('home_tutor_cms_posters_v1');
    } catch {}
  }
  memoryPosters = initial;
  return initial;
}

function saveLocalPosters(posters: Poster[]) {
  memoryPosters = posters;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_POSTERS_KEY, JSON.stringify(posters));
    } catch {}
  }
}

/**
 * Fetches published posters for public pages (HomePage, PostersPage).
 */
export async function getPublishedPosters(): Promise<{
  posters: Poster[];
  isLiveDb: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('posters')
        .select('*')
        .eq('is_published', true)
        .order('slot_number', { ascending: true });

      if (error) {
        console.warn('Supabase posters query error, using local fallback:', error.message);
        const fallback = getInitialLocalPosters().filter(p => p.isPublished);
        return { posters: fallback, isLiveDb: false, error: error.message };
      }

      if (data && data.length > 0) {
        return {
          posters: (data as PosterRow[]).map(rowToPoster),
          isLiveDb: true
        };
      }
    } catch (err: any) {
      console.warn('Supabase fetch exception, using local fallback:', err?.message);
    }
  }

  // Fallback to local stored or initial posters
  const fallback = getInitialLocalPosters().filter(p => p.isPublished);
  return {
    posters: fallback,
    isLiveDb: false
  };
}

/**
 * Fetches all 10 slots for Admin Dashboard management.
 * Returns an array of exactly 10 slots (either a Poster or null for empty slots).
 */
export async function getAdminPosterSlots(): Promise<{
  slots: (Poster | null)[];
  isLiveDb: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  const slots: (Poster | null)[] = Array(10).fill(null);

  if (client) {
    try {
      const { data, error } = await client
        .from('posters')
        .select('*')
        .order('slot_number', { ascending: true });

      if (!error && data) {
        (data as PosterRow[]).forEach(row => {
          if (row.slot_number >= 1 && row.slot_number <= 10) {
            slots[row.slot_number - 1] = rowToPoster(row);
          }
        });
        return { slots, isLiveDb: true };
      } else if (error) {
        console.warn('Supabase admin posters query error:', error.message);
      }
    } catch (err: any) {
      console.warn('Admin posters exception:', err?.message);
    }
  }

  // Local fallback
  const localList = getInitialLocalPosters();
  localList.forEach(p => {
    if (p.slotNumber && p.slotNumber >= 1 && p.slotNumber <= 10) {
      slots[p.slotNumber - 1] = p;
    }
  });

  return { slots, isLiveDb: false };
}

/**
 * Saves (creates or updates) a poster in a specific slot (1 to 10).
 */
export async function savePoster(
  slotNumber: number,
  posterData: Omit<Poster, 'id' | 'slotNumber'> & { id?: string }
): Promise<{ success: boolean; poster?: Poster; error?: string }> {
  if (slotNumber < 1 || slotNumber > 10) {
    return { success: false, error: 'Slot number must be between 1 and 10' };
  }

  const client = getSupabaseClient();

  if (client) {
    try {
      const payload = {
        slot_number: slotNumber,
        title: posterData.title,
        description: posterData.description,
        category: posterData.category,
        badge_text: posterData.badgeText,
        image_url: posterData.imageUrl,
        destination_url: posterData.destinationUrl || null,
        alt_text: posterData.altText || null,
        is_published: posterData.isPublished !== undefined ? posterData.isPublished : true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('posters')
        .upsert(payload, { onConflict: 'slot_number' })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, poster: rowToPoster(data as PosterRow) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  }

  // Local storage save
  const current = getInitialLocalPosters();
  const existingIndex = current.findIndex(p => p.slotNumber === slotNumber);
  
  const updatedPoster: Poster = {
    id: posterData.id || `poster-local-${slotNumber}-${Date.now()}`,
    slotNumber,
    title: posterData.title,
    description: posterData.description,
    category: posterData.category,
    badgeText: posterData.badgeText,
    imageUrl: posterData.imageUrl,
    destinationUrl: posterData.destinationUrl,
    altText: posterData.altText,
    isPublished: posterData.isPublished !== undefined ? posterData.isPublished : true,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    current[existingIndex] = updatedPoster;
  } else {
    current.push(updatedPoster);
  }

  saveLocalPosters(current);
  return { success: true, poster: updatedPoster };
}

/**
 * Deletes a poster from a slot (makes the slot empty).
 */
export async function deletePoster(slotNumber: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('posters')
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

  // Local storage deletion
  const current = getInitialLocalPosters().filter(p => p.slotNumber !== slotNumber);
  saveLocalPosters(current);
  return { success: true };
}

/**
 * Toggles the publication state of a poster slot.
 */
export async function togglePosterPublish(
  slotNumber: number,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('posters')
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

  // Local storage toggle
  const current = getInitialLocalPosters();
  const target = current.find(p => p.slotNumber === slotNumber);
  if (target) {
    target.isPublished = isPublished;
    target.updatedAt = new Date().toISOString();
    saveLocalPosters(current);
  }
  return { success: true };
}

/**
 * Uploads a poster image to Supabase Storage 'posters' bucket.
 * Returns public URL upon completion.
 */
export async function uploadPosterImage(
  file: File,
  slotNumber: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `slot_${slotNumber}_${Date.now()}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { data, error } = await client.storage
        .from('posters')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: publicUrlData } = client.storage
        .from('posters')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Storage upload error' };
    }
  }

  // When Supabase is not configured, create a local object URL or data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        success: true,
        url: reader.result as string
      });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file locally' });
    };
    reader.readAsDataURL(file);
  });
}
