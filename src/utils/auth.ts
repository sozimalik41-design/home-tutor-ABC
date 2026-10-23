// Admin and User Authentication state helpers
const ADMIN_AUTH_KEY = 'home_tutor_admin_auth_v1';
const CUSTOM_PASSCODE_KEY = 'home_tutor_admin_custom_passcode';
const DEFAULT_PASSCODES = ['admin123', 'demo1234', 'owner2026', 'admin'];

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
    // Dispatch custom event so Navbar, Footer, and pages update reactively
    window.dispatchEvent(new Event('home_tutor_auth_change'));
  } catch (e) {
    console.warn('Failed to update admin auth in localStorage:', e);
  }
}

export function getCustomAdminPasscode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CUSTOM_PASSCODE_KEY);
  } catch {
    return null;
  }
}

export function setCustomAdminPasscode(newPasscode: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (newPasscode && newPasscode.trim()) {
      localStorage.setItem(CUSTOM_PASSCODE_KEY, newPasscode.trim());
    } else {
      localStorage.removeItem(CUSTOM_PASSCODE_KEY);
    }
  } catch (e) {
    console.warn('Failed to save custom admin passcode:', e);
  }
}

export function verifyAdminPasscode(passcode: string): boolean {
  if (!passcode) return false;
  const clean = passcode.trim();
  const custom = getCustomAdminPasscode();
  if (custom && clean === custom) return true;
  return DEFAULT_PASSCODES.includes(clean.toLowerCase());
}
