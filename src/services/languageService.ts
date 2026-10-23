export type Language = 'en' | 'ur';

const LANGUAGE_KEY = 'home_tutor_app_language_v1';

let currentLanguage: Language = 'en';

export function getLanguage(): Language {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === 'en') {
        currentLanguage = 'en';
        return 'en';
      }
      // Reset any legacy Urdu default to English per user request
      localStorage.setItem(LANGUAGE_KEY, 'en');
      currentLanguage = 'en';
      return 'en';
    } catch {}
  }
  return 'en';
}

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
      window.dispatchEvent(new CustomEvent('home_tutor_language_change', { detail: lang }));
    } catch {}
  }
}
