import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  GraduationCap, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Upload
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { POPULAR_SUBJECTS, CLASSES_LEVELS, CITIES } from '../data/mockData';
import { PhaseNotice } from '../components/common/PhaseNotice';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<'parent' | 'tutor'>('parent');
  
  // Shared fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Lahore');

  // Parent specific
  const [childGrade, setChildGrade] = useState(CLASSES_LEVELS[3]);
  const [targetSubject, setTargetSubject] = useState(POPULAR_SUBJECTS[0].name);

  // Tutor specific
  const [gender, setGender] = useState<'Male' | 'Female' | 'Prefer not to say'>('Female');
  const [highestDegree, setHighestDegree] = useState('M.Sc. / M.Phil');
  const [university, setUniversity] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [hourlyExpectation, setHourlyExpectation] = useState('25');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    setIsSubmitting(true);
    if (accountType === 'tutor') {
      try {
        const { tutorService } = await import('../services/tutorService');
        await tutorService.saveTutor({
          name: fullName,
          gender,
          qualification: highestDegree,
          university,
          experienceYears: Number(experienceYears || 1),
          hourlyRate: Number(hourlyExpectation || 25),
          cities: [city],
          status: 'pending'
        });
      } catch (err) {
        console.warn('Registration service save warning:', err);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setRegisteredSuccess(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <div className="flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Join the Home Tutor Network
        </h1>
        <p className="text-xs text-slate-500">
          Create your parent or educator profile to get started immediately.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        
        {/* Phase Notice */}
        <PhaseNotice
          compact
        />

        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10 mt-3 space-y-6">
          
          {/* Account Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Registration Path
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAccountType('parent')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  accountType === 'parent'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-[#00C938]" />
                <span>Parent / Student Account</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('tutor')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  accountType === 'tutor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Apply as a Home Tutor</span>
              </button>
            </div>
          </div>

          {registeredSuccess ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {accountType === 'parent' ? 'Parent Account Created!' : 'Tutor Application Submitted!'}
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {accountType === 'parent' 
                  ? 'Your student profile is active. You can now browse verified tutors and schedule appointment sessions.'
                  : 'Your application has been drafted into our verification queue. In Phase 2, automated ID document parsing and interview scheduling will take place.'
                }
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to={accountType === 'tutor' ? '/dashboard/tutor' : '/tutors'}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  {accountType === 'tutor' ? 'Preview Tutor Dashboard' : 'Explore Tutors Now'}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Kamran Khan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-city" className="block text-xs font-semibold text-slate-700 mb-1">
                  City Location <span className="text-rose-500">*</span>
                </label>
                <select
                  id="reg-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                >
                  {CITIES.slice(1).map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Parent Fields */}
              {accountType === 'parent' ? (
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <span className="text-xs font-bold text-slate-900 block">
                    Student Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-child-grade" className="block text-xs font-semibold text-slate-700 mb-1">
                        Student Grade Level
                      </label>
                      <select
                        id="reg-child-grade"
                        value={childGrade}
                        onChange={(e) => setChildGrade(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      >
                        {CLASSES_LEVELS.slice(1).map((lvl, idx) => (
                          <option key={idx} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="reg-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Subject of Interest
                      </label>
                      <select
                        id="reg-subject"
                        value={targetSubject}
                        onChange={(e) => setTargetSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      >
                        {POPULAR_SUBJECTS.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* Conditional Tutor Fields */
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <span className="text-xs font-bold text-slate-900 block">
                    Educator Credentials & Experience
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-gender" className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="reg-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="reg-degree" className="block text-xs font-semibold text-slate-700 mb-1">
                        Highest Qualification <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="reg-degree"
                        type="text"
                        value={highestDegree}
                        onChange={(e) => setHighestDegree(e.target.value)}
                        placeholder="e.g. M.Phil in Mathematics"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-university" className="block text-xs font-semibold text-slate-700 mb-1">
                        University / Institution
                      </label>
                      <input
                        id="reg-university"
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="e.g. LUMS / Quaid-i-Azam University"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-exp" className="block text-xs font-semibold text-slate-700 mb-1">
                        Years of Tutoring Experience
                      </label>
                      <input
                        id="reg-exp"
                        type="number"
                        min="1"
                        max="30"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-rate" className="block text-xs font-semibold text-slate-700 mb-1">
                        Hourly Rate Expectation ($ / hr)
                      </label>
                      <input
                        id="reg-rate"
                        type="number"
                        min="10"
                        max="200"
                        value={hourlyExpectation}
                        onChange={(e) => setHourlyExpectation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-700 block">Degree & National ID Upload</span>
                    <span className="text-[11px] text-slate-500">
                      Phase 2 will handle secure file uploads to Supabase Storage with automatic CNIC verification.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#00FF48] hover:bg-[#00e640] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <span>{accountType === 'parent' ? 'Complete Parent Registration' : 'Submit Tutor Application'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-slate-900 hover:text-emerald-700 transition-colors">
              Sign In to your account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
