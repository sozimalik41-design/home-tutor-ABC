import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Bell, 
  Megaphone, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { getSiteSettings, saveSiteSettings, resetSiteSettings } from '../../services/siteSettingsService';
import { getCustomAdminPasscode, setCustomAdminPasscode } from '../../utils/auth';

interface SiteSettingsSectionProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export const SiteSettingsSection: React.FC<SiteSettingsSectionProps> = ({ onNotify }) => {
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [isSaving, setIsSaving] = useState(false);

  // Security passcode change state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  const handleFieldChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = saveSiteSettings(settings);
    setIsSaving(false);

    if (res.success) {
      onNotify('success', 'Settings saved and updated live.');
    } else {
      onNotify('error', 'Failed to save settings.');
    }
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      onNotify('error', 'Please enter a new passcode.');
      return;
    }
    if (newPasscode.length < 4) {
      onNotify('error', 'Passcode must be at least 4 characters long.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      onNotify('error', 'New passcode and confirm passcode do not match.');
      return;
    }

    setCustomAdminPasscode(newPasscode.trim());
    setPasscodeSuccess(true);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    onNotify('success', 'Admin passcode updated successfully.');
    setTimeout(() => setPasscodeSuccess(false), 4000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all site settings to default values?')) {
      const reset = resetSiteSettings();
      setSettings(reset);
      onNotify('success', 'All settings restored to defaults.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4C1D95] mb-1">
            <Settings className="w-4 h-4 text-[#A78BFA]" />
            <span>Site Configuration & Governance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937]">
            Platform & Site Settings
          </h2>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Manage your academy name, contact numbers, WhatsApp, admission fees, security passcode, and announcement banner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-[#F5F3FF] hover:bg-[#DDD6FE]/60 text-[#4C1D95] border border-[#DDD6FE] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* Section 1: Academy & Contact Information */}
        <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DDD6FE]/60 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4C1D95]" />
              <h3 className="text-base font-bold text-[#1F2937]">
                Academy Profile & Contact Details
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#6B7280]">
              Displayed in Header, Footer & Contact Page
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Academy Name */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                Academy / Platform Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={settings.academyName}
                  onChange={(e) => handleFieldChange('academyName', e.target.value)}
                  className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] font-medium"
                  placeholder="Home Tutor Academy"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="Verified 1-on-1 In-Home & Online Tutoring Network"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#4C1D95]" />
                <span>Contact Phone Number</span>
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="+92 300 8472910"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                <span className="text-[#00C938] font-bold">WhatsApp</span>
                <span>Direct WhatsApp Number</span>
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="+92 300 8472910"
              />
            </div>

            {/* Support Email */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#4C1D95]" />
                <span>Official Support Email</span>
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="info@hometutor.pk"
              />
            </div>

            {/* Office Hours */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4C1D95]" />
                <span>Office / Consultation Hours</span>
              </label>
              <input
                type="text"
                value={settings.officeHours}
                onChange={(e) => handleFieldChange('officeHours', e.target.value)}
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="Mon - Sat: 9:00 AM - 9:00 PM"
              />
            </div>

            {/* Campus Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#4C1D95]" />
                <span>Physical Campus Address</span>
              </label>
              <input
                type="text"
                value={settings.campusAddress}
                onChange={(e) => handleFieldChange('campusAddress', e.target.value)}
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                placeholder="Main Boulevard, Gulberg III, Lahore, Pakistan"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Admissions & Academic Policy */}
        <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DDD6FE]/60 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4C1D95]" />
              <h3 className="text-base font-bold text-[#1F2937]">
                Admissions & Registration Policies
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#6B7280]">
              Controls booking forms and enrollment flags
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Admissions Open Toggle */}
            <div className="p-4 rounded-2xl bg-[#F5F3FF]/60 border border-[#DDD6FE] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#1F2937] block">Admissions Status</span>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Are admissions currently open for new student enrollments?
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  settings.admissionsOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {settings.admissionsOpen ? 'Admissions Open' : 'Admissions Closed'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.admissionsOpen}
                    onChange={(e) => handleFieldChange('admissionsOpen', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4C1D95]"></div>
                </label>
              </div>
            </div>

            {/* Default Registration Fee */}
            <div className="p-4 rounded-2xl bg-[#F5F3FF]/60 border border-[#DDD6FE] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#1F2937] block">Registration Fee</span>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Standard booking and registration processing fee
                </p>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4C1D95]">PKR / $</span>
                  <input
                    type="number"
                    value={settings.registrationFee}
                    onChange={(e) => handleFieldChange('registrationFee', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-white border border-[#DDD6FE] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>
              </div>
            </div>

            {/* Auto Notification Emails */}
            <div className="p-4 rounded-2xl bg-[#F5F3FF]/60 border border-[#DDD6FE] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#1F2937] block">Instant Notifications</span>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Instant confirmation alerts when a new booking is submitted
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#4C1D95] font-semibold">
                  {settings.autoNotificationEmail ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoNotificationEmail}
                    onChange={(e) => handleFieldChange('autoNotificationEmail', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4C1D95]"></div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Announcement Bar Banner */}
        <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DDD6FE]/60 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#4C1D95]" />
              <h3 className="text-base font-bold text-[#1F2937]">
                Top Announcement Bar
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#4C1D95]">
              <input
                type="checkbox"
                checked={settings.showAnnouncementBar}
                onChange={(e) => handleFieldChange('showAnnouncementBar', e.target.checked)}
                className="rounded text-[#4C1D95] focus:ring-[#A78BFA]"
              />
              <span>Show Banner at Top of Website</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              Announcement Message
            </label>
            <input
              type="text"
              value={settings.announcementBarText}
              onChange={(e) => handleFieldChange('announcementBarText', e.target.value)}
              className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              placeholder="🎉 Admissions Open for 2026 Batch..."
            />
          </div>
        </div>

        {/* Save All Settings Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-[#A78BFA]" />
            <span>{isSaving ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>

      </form>

      {/* Section 4: Admin Security & Passcode Management */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#DDD6FE]/60 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#4C1D95]" />
            <h3 className="text-base font-bold text-[#1F2937]">
              Admin Security & Passcode
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#6B7280]">
            Change the owner passcode used to unlock this console
          </span>
        </div>

        {passcodeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Passcode successfully updated! Please use this new passcode for future logins.</span>
          </div>
        )}

        <form onSubmit={handleUpdatePasscode} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              New Admin Passcode
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new passcode"
                className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
              Confirm New Passcode
            </label>
            <input
              type={showPasscode ? 'text' : 'password'}
              required
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Confirm new passcode"
              className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#00FF48]" />
              <span>Update Passcode</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-[#6B7280]">
          Note: The new passcode takes effect immediately. Default passcodes like <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">admin123</code> or your newly chosen passcode will work for login.
        </p>
      </div>

    </div>
  );
};
