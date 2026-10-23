import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { PhaseNotice } from '../components/common/PhaseNotice';
import { setAdminAuthenticated } from '../utils/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<'student' | 'tutor' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Demo auto-fill helpers for evaluation
  const handleDemoFill = (selectedRole: 'student' | 'tutor' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      setEmail('parent.demo@hometutor.pk');
      setPassword('demo1234');
    } else if (selectedRole === 'tutor') {
      setEmail('tutor.ahmed@hometutor.pk');
      setPassword('demo1234');
    } else {
      setEmail('admin@hometutor.pk');
      setPassword('admin123');
    }
    setErrorMessage('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email address and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      
      if (role === 'admin') {
        setAdminAuthenticated(true);
      } else {
        setAdminAuthenticated(false);
      }

      setTimeout(() => {
        if (role === 'tutor') {
          navigate('/dashboard/tutor');
        } else if (role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/tutors');
        }
      }, 700);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
          Sign In to Home Tutor
        </h1>
        <p className="text-xs text-[#6B7280]">
          Access your appointment schedule, student messages, or verified educator profile.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* Phase Notice */}
        <PhaseNotice compact />

        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#DDD6FE] sm:px-10 mt-3 space-y-6">
          
          {/* Role Segmented Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-2">
              Select Account Portal
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F3FF] rounded-xl border border-[#DDD6FE]">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-[#4C1D95] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Student / Parent
              </button>
              <button
                type="button"
                onClick={() => setRole('tutor')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'tutor'
                    ? 'bg-[#4C1D95] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Home Tutor
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-[#4C1D95] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Admin (Owner)
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Buttons for Reviewers */}
          <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#4C1D95] uppercase tracking-wider text-[10px]">
                Quick Demo Accounts (Evaluation)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="px-2 py-1 bg-white hover:bg-[#F5F3FF] rounded border border-[#DDD6FE] text-[11px] font-medium text-[#1F2937]"
              >
                Parent Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('tutor')}
                className="px-2 py-1 bg-white hover:bg-[#F5F3FF] rounded border border-[#DDD6FE] text-[11px] font-medium text-[#1F2937]"
              >
                Tutor Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="px-2 py-1 bg-white hover:bg-[#F5F3FF] rounded border border-[#DDD6FE] text-[11px] font-medium text-[#4C1D95] font-bold"
              >
                Owner / Admin Demo
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {loginSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Login successful! Redirecting to {role === 'admin' ? 'Admin Portal' : role === 'tutor' ? 'Tutor Dashboard' : 'Portal'}...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[#1F2937] mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-xs font-semibold text-[#1F2937]">
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#DDD6FE] text-[#4C1D95] focus:ring-[#A78BFA]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#6B7280]">
                Keep me signed in on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full py-3 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In as {role === 'student' ? 'Student/Parent' : role === 'tutor' ? 'Tutor' : 'Admin'}</span>
                  <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#DDD6FE]/60 text-center text-xs text-[#6B7280]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#4C1D95] hover:text-[#3B0764] transition-colors">
              Create free account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
