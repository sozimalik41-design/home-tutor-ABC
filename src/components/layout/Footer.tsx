import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { SOCIAL_LINKS } from '../../data/mockData';
import { getActiveSocialLinks } from '../../services/socialLinkService';
import { SocialLink } from '../../types';

export const Footer: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    SOCIAL_LINKS.map(s => ({
      id: s.name.toLowerCase(),
      platform: s.name.toLowerCase() as any,
      name: s.name,
      url: s.url,
      handle: s.handle,
      followers: s.followers,
      isActive: true
    }))
  );

  useEffect(() => {
    let isMounted = true;
    getActiveSocialLinks().then((res) => {
      if (isMounted && res.links && res.links.length > 0) {
        setSocialLinks(res.links);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <footer className="bg-[#3B0764] text-[#DDD6FE] pt-16 pb-12 border-t border-[#4C1D95]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1 & 2: Brand Lockup & Mission */}
          <div className="lg:col-span-2 space-y-5">
            <BrandLogo variant="light" size="lg" />
            
            <p className="text-sm text-[#DDD6FE]/90 leading-relaxed max-w-sm">
              Home Tutor is the leading verified home tutoring platform. We connect parents and students with passionate, background-checked educators for one-on-one personalized learning at home and online.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#4C1D95] border border-[#DDD6FE]/30 rounded-lg text-xs font-medium text-white">
                <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
                <span>100% Background Verified</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#4C1D95] border border-[#DDD6FE]/30 rounded-lg text-xs font-medium text-white">
                <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" />
                <span>Zero Advance Agent Fee</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#DDD6FE] hover:text-white transition-colors">
                  About Our Standard
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/book-appointment" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/posters" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Admission Posters
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Home Tutor Videos
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-[#DDD6FE] hover:text-white transition-colors">
                  Site Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Subjects */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Popular Subjects
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/tutors?subject=Mathematics" className="text-[#DDD6FE] hover:text-white transition-colors flex items-center justify-between">
                  <span>Mathematics</span>
                  <span className="text-xs text-[#A78BFA] tabular-nums">140+ tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=Physics" className="text-[#DDD6FE] hover:text-white transition-colors flex items-center justify-between">
                  <span>Physics & Mechanics</span>
                  <span className="text-xs text-[#A78BFA] tabular-nums">98 tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=Chemistry" className="text-[#DDD6FE] hover:text-white transition-colors flex items-center justify-between">
                  <span>Chemistry</span>
                  <span className="text-xs text-[#A78BFA] tabular-nums">86 tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=Biology" className="text-[#DDD6FE] hover:text-white transition-colors flex items-center justify-between">
                  <span>Biology (MDCAT)</span>
                  <span className="text-xs text-[#A78BFA] tabular-nums">79 tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=English" className="text-[#DDD6FE] hover:text-white transition-colors flex items-center justify-between">
                  <span>English & IELTS</span>
                  <span className="text-xs text-[#A78BFA] tabular-nums">115 tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=Computer+Science" className="text-[#DDD6FE] hover:text-white transition-colors flex items-center justify-between">
                  <span>Computer Science</span>
                  <span className="text-xs text-[#A78BFA] tabular-nums">64 tutors</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Help Desk */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Tutoring Help Desk
            </h4>
            <ul className="space-y-3 text-sm text-[#DDD6FE]">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
                <div>
                  <a href="tel:+923001234567" className="hover:text-white transition-colors font-mono font-medium">
                    +92 (300) 123-4567
                  </a>
                  <div className="text-xs text-[#DDD6FE]/70">Mon-Sat, 9 AM - 9 PM</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:support@hometutoracademy.com" className="hover:text-white transition-colors break-all">
                    support@hometutoracademy.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
                <span>The Inspire Business Academy, Sadiqabad • Lahore & Islamabad Centers</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
                <span>Direct Home Visits & Live Online</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Social Media Channels Row */}
        <div className="py-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Follow Home Tutor on Official Socials</span>
                <span className="text-[#A78BFA] text-xs font-mono">• 200k+ Community</span>
              </h5>
              <p className="text-xs text-[#DDD6FE]/80 mt-1">
                Watch daily tutoring breakdowns, study tips, and student triumph stories.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.id || social.name}
                  href={social.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#4C1D95] border border-[#DDD6FE]/30 hover:border-[#A78BFA] hover:bg-[#4C1D95]/80 text-xs font-semibold text-white hover:text-[#A78BFA] transition-all group"
                  aria-label={`Visit Home Tutor on ${social.name}`}
                >
                  <span className="group-hover:text-[#A78BFA] transition-colors">{social.name}</span>
                  {social.followers && (
                    <span className="text-[11px] text-[#DDD6FE]/70 font-mono">({social.followers})</span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA] group-hover:translate-x-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#DDD6FE]/70">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Home Tutor Academy. All rights reserved.</span>
            <span>·</span>
            <span className="text-[#A78BFA]">Lavender Dream Theme</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Safety Verification Standard</Link>
            <Link to="/dashboard/admin" className="text-white hover:text-[#A78BFA] transition-colors flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 font-bold" title="Admin Management Console">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF48]" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
