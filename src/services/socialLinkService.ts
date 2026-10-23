import { getSupabaseClient } from '../lib/supabase';
import { SocialLink, SocialLinkRow } from '../types';
import { SOCIAL_LINKS } from '../data/mockData';
import { isValidUrl } from '../utils/validators';

const LOCAL_SOCIAL_KEY = 'home_tutor_cms_social_links_v1';

function rowToSocialLink(row: SocialLinkRow): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    name: row.name,
    url: row.url,
    handle: row.handle,
    followers: row.followers,
    isActive: row.is_active,
    updatedAt: row.updated_at
  };
}

let memorySocialLinks: SocialLink[] | null = null;

function getInitialLocalSocialLinks(): SocialLink[] {
  if (memorySocialLinks) return memorySocialLinks;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_SOCIAL_KEY);
    if (saved) {
      try {
        memorySocialLinks = JSON.parse(saved);
        return memorySocialLinks!;
      } catch {
        // Fall through
      }
    }
  }

  const initial: SocialLink[] = [
    {
      id: 'social-tiktok',
      platform: 'tiktok',
      name: 'TikTok',
      url: 'https://tiktok.com/@hometutor.pk',
      handle: '@hometutor.pk',
      followers: '45k followers',
      isActive: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'social-facebook',
      platform: 'facebook',
      name: 'Facebook',
      url: 'https://facebook.com/HomeTutorOfficial',
      handle: 'HomeTutorOfficial',
      followers: '82k followers',
      isActive: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'social-youtube',
      platform: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/@hometutoracademy',
      handle: 'Home Tutor Academy',
      followers: '28k subscribers',
      isActive: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'social-instagram',
      platform: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/hometutor.academy',
      handle: '@hometutor.academy',
      followers: '53k followers',
      isActive: true,
      updatedAt: new Date().toISOString()
    }
  ];

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_SOCIAL_KEY, JSON.stringify(initial));
    } catch {}
  }
  memorySocialLinks = initial;
  return initial;
}

function saveLocalSocialLinks(links: SocialLink[]) {
  memorySocialLinks = links;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_SOCIAL_KEY, JSON.stringify(links));
    } catch {}
  }
}

/**
 * Fetches active social links for public footer & homepage.
 */
export async function getActiveSocialLinks(): Promise<{
  links: SocialLink[];
  isLiveDb: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('social_links')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.warn('Supabase social links error, using fallback:', error.message);
        const fallback = getInitialLocalSocialLinks().filter(l => l.isActive);
        return { links: fallback, isLiveDb: false, error: error.message };
      }

      if (data && data.length > 0) {
        return {
          links: (data as SocialLinkRow[]).map(rowToSocialLink),
          isLiveDb: true
        };
      }
    } catch (err: any) {
      console.warn('Supabase social links exception:', err?.message);
    }
  }

  const fallback = getInitialLocalSocialLinks().filter(l => l.isActive);
  return { links: fallback, isLiveDb: false };
}

/**
 * Fetches all 4 platforms for Admin configuration.
 */
export async function getAllSocialLinksForAdmin(): Promise<{
  links: SocialLink[];
  isLiveDb: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('social_links')
        .select('*');

      if (!error && data && data.length > 0) {
        return {
          links: (data as SocialLinkRow[]).map(rowToSocialLink),
          isLiveDb: true
        };
      }
    } catch (err: any) {
      console.warn('Admin social links fetch error:', err?.message);
    }
  }

  return { links: getInitialLocalSocialLinks(), isLiveDb: false };
}

/**
 * Saves a social media link for a platform.
 */
export async function saveSocialLink(
  platform: 'tiktok' | 'facebook' | 'youtube' | 'instagram',
  url: string,
  handle: string,
  followers: string,
  isActive: boolean = true
): Promise<{ success: boolean; link?: SocialLink; error?: string }> {
  if (!url || !isValidUrl(url)) {
    return { success: false, error: 'Please enter a valid HTTP or HTTPS URL' };
  }

  const platformNames: Record<string, string> = {
    tiktok: 'TikTok',
    facebook: 'Facebook',
    youtube: 'YouTube',
    instagram: 'Instagram'
  };

  const name = platformNames[platform] || platform;
  const client = getSupabaseClient();

  if (client) {
    try {
      const payload = {
        platform,
        name,
        url: url.trim(),
        handle: handle.trim(),
        followers: followers.trim(),
        is_active: isActive,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('social_links')
        .upsert(payload, { onConflict: 'platform' })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, link: rowToSocialLink(data as SocialLinkRow) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  }

  // Local storage save
  const current = getInitialLocalSocialLinks();
  const existing = current.find(l => l.platform === platform);

  const updated: SocialLink = {
    id: existing?.id || `social-local-${platform}`,
    platform,
    name,
    url: url.trim(),
    handle: handle.trim(),
    followers: followers.trim(),
    isActive,
    updatedAt: new Date().toISOString()
  };

  const updatedList = current.map(l => l.platform === platform ? updated : l);
  saveLocalSocialLinks(updatedList);
  return { success: true, link: updated };
}
