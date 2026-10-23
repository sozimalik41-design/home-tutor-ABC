import React from 'react';
import { MapPin, Navigation, Phone, Clock, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AcademyLocationMapProps {
  variant?: 'page-section' | 'card' | 'embedded';
  showDetails?: boolean;
  className?: string;
}

export const AcademyLocationMap: React.FC<AcademyLocationMapProps> = ({
  variant = 'page-section',
  showDetails = true,
  className = ''
}) => {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56205.46956293146!2d70.05806681953125!3d28.303114582245257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39374100207d4e0b%3A0x6c2e2ef25234bcf2!2sTHE%20INSPIRE%20BUSINESS%20ACADEMY%20SADIQABAD!5e0!3m2!1sen!2s!4v1792059656318!5m2!1sen!2s";
  const directMapsUrl = "https://maps.google.com/?q=THE+INSPIRE+BUSINESS+ACADEMY+SADIQABAD";

  if (variant === 'embedded') {
    return (
      <div className={`w-full overflow-hidden rounded-2xl border border-[#DDD6FE] shadow-xs ${className}`}>
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '320px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="The Inspire Business Academy Sadiqabad Location"
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-3xl border border-[#DDD6FE] shadow-sm overflow-hidden">
        {/* Header Ribbon / Banner */}
        <div className="bg-gradient-to-r from-[#4C1D95] via-[#3B0764] to-[#4C1D95] text-white p-6 sm:p-8 border-b border-[#3B0764]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B0764] border border-[#DDD6FE]/30 text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
                <span className="text-[#A78BFA] font-bold">Physical Campus & Regional Center</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#A78BFA] shrink-0" />
                <span>The Inspire Business Academy, Sadiqabad</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#DDD6FE]/90 max-w-2xl">
                Official learning center and physical hub for in-person academic counseling, verified tutor interviews, student evaluations, and one-on-one session coordination.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={directMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#A78BFA] hover:bg-white text-[#3B0764] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#A78BFA]/20 flex items-center gap-1.5 active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>

              <a
                href="tel:+923001234567"
                className="px-4 py-2.5 bg-[#3B0764] hover:bg-[#2e0550] text-white border border-[#DDD6FE]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Call Campus Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Map & Information Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left/Main Column: Google Maps Iframe */}
          <div className={`${showDetails ? 'lg:col-span-8' : 'lg:col-span-12'} bg-[#F5F3FF] min-h-[380px] sm:min-h-[440px] relative`}>
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="The Inspire Business Academy Sadiqabad Map View"
              className="w-full h-full min-h-[380px] sm:min-h-[440px]"
            />
          </div>

          {/* Right Column: Campus Details & Facilities */}
          {showDetails && (
            <div className="lg:col-span-4 p-6 sm:p-7 bg-[#F5F3FF] border-t lg:border-t-0 lg:border-l border-[#DDD6FE] flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4C1D95] mb-2">
                    Campus Facilities & Verification Desk
                  </h4>
                  <ul className="space-y-2.5 text-xs text-[#1F2937]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4C1D95] shrink-0 mt-0.5" />
                      <span>Direct student registration & subject assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4C1D95] shrink-0 mt-0.5" />
                      <span>Original degree verification & police record checks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4C1D95] shrink-0 mt-0.5" />
                      <span>Comfortable parent meeting and counseling rooms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4C1D95] shrink-0 mt-0.5" />
                      <span>High-speed digital rooms for hybrid & online tutoring</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#DDD6FE] space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1F2937]">
                    <Clock className="w-4 h-4 text-[#4C1D95] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#1F2937] block">In-Person Visiting Hours</span>
                      <span className="text-[#6B7280]">Monday – Saturday: 9:00 AM – 8:00 PM</span>
                      <span className="text-[#6B7280] block">Sunday: By Special Appointment</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-[#1F2937]">
                    <ShieldCheck className="w-4 h-4 text-[#4C1D95] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#1F2937] block">Regional Administration</span>
                      <span className="text-[#6B7280]">District Rahim Yar Khan & Sadiqabad Hub</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons inside card */}
              <div className="pt-4 border-t border-[#DDD6FE] flex flex-col gap-2">
                <Link
                  to="/book-appointment"
                  className="w-full py-2.5 px-4 bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-bold rounded-xl transition-all shadow-xs text-center"
                >
                  Book Campus Consultation
                </Link>
                <a
                  href="https://wa.me/923001234567?text=Hello%2C%20I%20would%20like%20to%20visit%20The%20Inspire%20Business%20Academy%20in%20Sadiqabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 bg-white hover:bg-[#F5F3FF] border border-[#DDD6FE] text-[#1F2937] text-xs font-semibold rounded-xl transition-all text-center"
                >
                  WhatsApp Campus Inquiries
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
