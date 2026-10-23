import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign, 
  Megaphone, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SiteSettings } from '../types';
import { getSiteSettings, saveSiteSettings, resetSiteSettings } from '../services/siteSettingsService';
import { isAdminAuthenticated, verifyAdminPasscode, setAdminAuthenticated } from '../utils/auth';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
    setIsAdmin(isAdminAuthenticated());

    const handleUpdate = () => {
      setSettings(getSiteSettings());
      setIsAdmin(isAdminAuthenticated());
    };

    window.addEventListener('home_tutor_settings_change', handleUpdate);
    window.addEventListener('home_tutor_auth_change', handleUpdate);
    return () => {
      window.removeEventListener('home_tutor_settings_change', handleUpdate);
      window.removeEventListener('home_tutor_auth_change', handleUpdate);
    };
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(passcodeInput)) {
      setAdminAuthenticated(true);
      setIsAdmin(true);
      setPasscodeError('');
      showNotification('success', 'Admin session unlocked. You can now edit all settings.');
    } else {
      setPasscodeError('Invalid passcode. Please enter the correct admin passcode (admin123) or click Quick Owner Demo Access.');
    }
  };

  const handleInstantDemoUnlock = () => {
    setAdminAuthenticated(true);
    setIsAdmin(true);
    setPasscodeError('');
    showNotification('success', 'Owner Access Unlocked.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('error', 'Please unlock admin access first to modify settings.');
      return;
    }

    const res = saveSiteSettings(settings);
    if (res.success) {
      showNotification('success', 'All site settings saved live successfully!');
    } else {
      showNotification('error', 'Failed to save settings.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#3B0764] to-[#4C1D95] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DDD6FE]">
              <Settings className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Website & Academy Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Site Settings & Contact Configuration
            </h1>
            <p className="text-xs sm:text-sm text-[#DDD6FE]/90">
              Academy contact numbers, WhatsApp hotline, fee currency, and live announcements.
            </p>
          </div>

          <Link
            to="/dashboard/admin?tab=settings"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#3B0764] hover:bg-[#DDD6FE] rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-[#4C1D95]" />
            <span>Open in Full Admin Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Admin Unlock Card if not authenticated */}
        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-900">
                  Admin Access Required to Edit
                </h3>
                <p className="text-xs text-amber-700 mt-1">
                  Enter your admin passcode to modify or save settings, or click the "Quick Owner Demo Access" button below.
                </p>
              </div>
            </div>

            <form onSubmit={handleUnlockAdmin} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <input
                type="password"
                placeholder="Enter Passcode (e.g. admin123)"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Unlock
              </button>
              <button
                type="button"
                onClick={handleInstantDemoUnlock}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all"
              >
                Quick Owner Demo Access
              </button>
            </form>
            {passcodeError && (
              <p className="text-xs text-rose-600 font-semibold">{passcodeError}</p>
            )}
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          
          {/* Academy Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#4C1D95] border-b border-slate-100 pb-2">
              1. Academy Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Academy Name</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.academyName}
                  onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#4C1D95] border-b border-slate-100 pb-2">
              2. Contact & Communications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contact Phone</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00C938]" />
                  <span>WhatsApp Number</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Official Email</span>
                </label>
                <input
                  type="email"
                  disabled={!isAdmin}
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Campus / Center Address</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.campusAddress}
                  onChange={(e) => setSettings({ ...settings, campusAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Office & Advisory Timings</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.officeHours}
                  onChange={(e) => setSettings({ ...settings, officeHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Admissions & Tuition Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#4C1D95] border-b border-slate-100 pb-2">
              3. Admissions & Tuition
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admissions Status
                </label>
                <select
                  disabled={!isAdmin}
                  value={settings.admissionsOpen ? 'open' : 'closed'}
                  onChange={(e) => setSettings({ ...settings, admissionsOpen: e.target.value === 'open' })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                >
                  <option value="open">🟢 Admissions Open</option>
                  <option value="closed">🔴 Admissions Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Default Currency Symbol</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="$ or ₨ or PKR"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Registration / Admission Fee
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={settings.registrationFee}
                  onChange={(e) => setSettings({ ...settings, registrationFee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Announcement Top Bar */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#4C1D95] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span>4. Announcement Bar</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showBar"
                  disabled={!isAdmin}
                  checked={settings.showAnnouncementBar}
                  onChange={(e) => setSettings({ ...settings, showAnnouncementBar: e.target.checked })}
                  className="w-4 h-4 text-[#4C1D95] rounded border-slate-300 focus:ring-[#A78BFA] disabled:opacity-60"
                />
                <label htmlFor="showBar" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display announcement banner on top of site
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Banner Message
                </label>
                <textarea
                  rows={2}
                  disabled={!isAdmin}
                  value={settings.announcementBarText}
                  onChange={(e) => setSettings({ ...settings, announcementBarText: e.target.value })}
                  placeholder="e.g. 🎉 Admissions Open for Cambridge O/A-Levels & Matric 2026..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Restore all settings to default values?')) {
                    const r = resetSiteSettings();
                    setSettings(r);
                    showNotification('success', 'Settings restored to defaults.');
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Restore Defaults
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Site Settings</span>
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};
