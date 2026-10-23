import { SiteSettings } from '../types';

const SITE_SETTINGS_KEY = 'home_tutor_site_settings_v1';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  academyName: 'Home Tutor Academy',
  tagline: 'Verified 1-on-1 In-Home & Online Tutoring Network',
  contactPhone: '+92 300 8472910',
  whatsappNumber: '+92 300 8472910',
  contactEmail: 'info@hometutor.pk',
  campusAddress: 'Main Boulevard, Gulberg III, Lahore, Pakistan',
  officeHours: 'Mon - Sat: 9:00 AM - 9:00 PM, Sun: 11:00 AM - 5:00 PM',
  currency: '$',
  admissionsOpen: true,
  registrationFee: 1500,
  autoNotificationEmail: true,
  announcementBarText: '🎉 Admissions Open for 2026 Cambridge O/A-Levels & MDCAT Sprint. Book Your Free 1-on-1 Trial Class Today!',
  showAnnouncementBar: true,
  updatedAt: new Date().toISOString()
};

let cachedSettings: SiteSettings | null = null;

export function getSiteSettings(): SiteSettings {
  if (cachedSettings) return cachedSettings;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(SITE_SETTINGS_KEY);
      if (saved) {
        cachedSettings = { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) };
        return cachedSettings!;
      }
    } catch (e) {
      console.warn('Failed to parse site settings from storage:', e);
    }
  }
  cachedSettings = { ...DEFAULT_SITE_SETTINGS };
  return cachedSettings;
}

export function saveSiteSettings(newSettings: Partial<SiteSettings>): { success: boolean; settings: SiteSettings } {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString()
  };

  cachedSettings = updated;

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(updated));
      // Notify components across the app to reactively update
      window.dispatchEvent(new CustomEvent('home_tutor_settings_change', { detail: updated }));
    } catch (e) {
      console.warn('Failed to save site settings to localStorage:', e);
    }
  }

  return { success: true, settings: updated };
}

export function resetSiteSettings(): SiteSettings {
  cachedSettings = { ...DEFAULT_SITE_SETTINGS, updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(cachedSettings));
      window.dispatchEvent(new CustomEvent('home_tutor_settings_change', { detail: cachedSettings }));
    } catch {}
  }
  return cachedSettings;
}
