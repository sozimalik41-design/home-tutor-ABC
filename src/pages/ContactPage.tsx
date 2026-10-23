import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { PhaseNotice } from '../components/common/PhaseNotice';
import { AcademyLocationMap } from '../components/common/AcademyLocationMap';
import { addInboxMessage } from '../services/inboxService';
import { getSiteSettings } from '../services/siteSettingsService';

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState(getSiteSettings());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Parent: Tutor Search');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    addInboxMessage({
      senderName: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+92 300 0000000',
      subject: `${inquiryType}: ${name.trim()}`,
      message: message.trim(),
      inquiryType: inquiryType.includes('Parent') ? 'Tutor Request' : 'General Query'
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  const faqs = [
    {
      q: 'How does Home Tutor verify educators before sending them to my home?',
      a: 'We conduct a stringent 5-point verification check: national identity check, original degree verification with universities, past teaching track record assessment, mock student interview, and criminal background checks.'
    },
    {
      q: 'Are there any registration or advance commission fees for parents?',
      a: 'No. Parents do not pay any upfront registration or agent commission fees. You only pay for the sessions scheduled with your tutor at transparent rates.'
    },
    {
      q: 'Can we switch tutors if the teaching chemistry is not a match?',
      a: 'Yes. We offer a 100% satisfaction guarantee. If after your introductory session you feel a different teaching approach would better suit your child, our academic coordinator will immediately reassign another verified educator.'
    },
    {
      q: 'Do you offer online tutoring in addition to in-person home visits?',
      a: 'Yes. All tutors can conduct either in-home visits in supported metropolitan areas or interactive virtual sessions with digital whiteboards and session recordings.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F3FF] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-2">
            <Link to="/" className="hover:text-[#4C1D95] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#4C1D95]">Contact Us</span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Contact Home Tutor Academic Support
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">
            Have questions about finding a tutor, booking an appointment, or visiting our physical campus? We're here to help.
          </p>
        </div>

        {/* Notice */}
        <PhaseNotice
          title="Contact & Help Desk Interface (Lavender Dream Edition)"
          description="Form inputs include client-side validation and responsive state feedback with accessible high-contrast design."
        />

        {/* Contact Form and Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#DDD6FE] shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-[#4C1D95]" />
              <h2 className="text-xl font-bold text-[#1F2937]">Send an Inquiry</h2>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-white text-[#4C1D95] border border-[#DDD6FE] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937]">Inquiry Received!</h3>
                <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <strong>{name}</strong>. Our academic coordinator will contact you via phone or email within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="px-5 py-2.5 bg-[#4C1D95] text-white rounded-xl text-xs font-bold hover:bg-[#3B0764] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-form-name" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-form-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Asad Malik"
                      className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-form-email" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-form-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. asad@example.com"
                      className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-form-phone" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Phone Number / WhatsApp
                    </label>
                    <input
                      id="contact-form-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-form-type" className="block text-xs font-semibold text-[#1F2937] mb-1">
                      Nature of Inquiry
                    </label>
                    <select
                      id="contact-form-type"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-3.5 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                    >
                      <option value="Parent: Tutor Search">Parent: Need a Home Tutor</option>
                      <option value="Tutor: Join Platform">Educator: Apply to Teach</option>
                      <option value="Appointment Question">Appointment / Reschedule Question</option>
                      <option value="Institutional Partnership">School / Institutional Partnership</option>
                      <option value="General Question">General Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-form-message" className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Your Message / Student Requirements <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-form-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify the student grade, subject difficulties, home location, and desired schedule..."
                    className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-3 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <ShieldCheck className="w-4 h-4 text-[#4C1D95]" />
                    <span>Your data is strictly confidential</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Direct Contacts & Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Box */}
            <div className="bg-[#3B0764] text-white rounded-3xl p-6 sm:p-8 border border-[#4C1D95] space-y-6">
              <h3 className="text-lg font-bold text-white">Direct Communication Channels</h3>

              <div className="space-y-4 text-xs text-[#DDD6FE]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#4C1D95] rounded-xl text-[#A78BFA] border border-[#A78BFA]/30">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Direct Hotline & WhatsApp</div>
                    <a href={`tel:${settings.contactPhone.replace(/[^0-9+]/g, '')}`} className="text-[#A78BFA] font-mono text-sm block mt-0.5">
                      {settings.contactPhone}
                    </a>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#00FF48] hover:underline block mt-0.5"
                    >
                      WhatsApp: {settings.whatsappNumber} (Instant Coordination)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#4C1D95] rounded-xl text-[#A78BFA] border border-[#A78BFA]/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Academic Coordination Desk</div>
                    <a href={`mailto:${settings.contactEmail}`} className="text-[#DDD6FE] hover:text-white block mt-0.5 break-all">
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#4C1D95] rounded-xl text-[#A78BFA] border border-[#A78BFA]/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Help Desk Hours</div>
                    <span className="text-[#DDD6FE]/80 block mt-0.5">
                      {settings.officeHours}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Link
                  to="/book-appointment"
                  className="w-full py-2.5 px-4 bg-[#4C1D95] hover:bg-[#4C1D95]/80 text-[#A78BFA] border border-[#A78BFA]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Prefer to Book Appointment Directly?</span>
                </Link>
              </div>
            </div>

            {/* Office Locations */}
            <div className="bg-white rounded-3xl p-6 border border-[#DDD6FE] space-y-4">
              <h4 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4C1D95]" />
                <span>Regional Coordinator Centers & Campuses</span>
              </h4>
              <div className="space-y-3 text-xs text-[#6B7280]">
                <div className="p-3 bg-[#F5F3FF] rounded-xl border border-[#DDD6FE]">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#1F2937] block font-bold">The Inspire Business Academy:</strong>
                    <span className="text-[10px] font-bold text-[#4C1D95] bg-[#DDD6FE]/40 px-2 py-0.5 rounded-full border border-[#DDD6FE]">Main Campus</span>
                  </div>
                  <span className="text-[#4C1D95] font-medium">Sadiqabad, Punjab, Pakistan (See Map Below)</span>
                </div>
                <div className="p-3 bg-[#F5F3FF]/50 rounded-xl border border-[#DDD6FE]">
                  <strong className="text-[#1F2937] block">Lahore Headquarters:</strong>
                  <span>Suite 402, Main Boulevard, Gulberg III, Lahore, Punjab</span>
                </div>
                <div className="p-3 bg-[#F5F3FF]/50 rounded-xl border border-[#DDD6FE]">
                  <strong className="text-[#1F2937] block">Islamabad Office:</strong>
                  <span>Executive Heights, F-7 Markaz, Blue Area, Islamabad</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Academy Campus & Google Maps Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
                Campus Location & Physical Center
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Find us on Google Maps or visit The Inspire Business Academy directly for academic counseling and tutor verification.
              </p>
            </div>
          </div>
          <AcademyLocationMap variant="page-section" showDetails={true} />
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DDD6FE] space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#1F2937]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#6B7280] mt-1">Common inquiries about our tutoring and appointment policies.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-[#DDD6FE] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-[#1F2937] hover:bg-[#F5F3FF] flex items-center justify-between gap-4 transition-colors"
                >
                  <span>{faq.q}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-[#4C1D95] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#4C1D95] shrink-0" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-[#6B7280] leading-relaxed border-t border-[#DDD6FE] bg-[#F5F3FF]/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
