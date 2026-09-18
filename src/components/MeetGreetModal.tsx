import React, { useState, useId } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  HelpCircle,
  Lock
} from 'lucide-react';
import { ConcertEvent, MeetGreetRequest } from '../types';
import { createMeetGreetRequest } from '../lib/api';
import { formatEventDate } from '../lib/dateUtils';

interface MeetGreetModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ConcertEvent[];
  selectedEventId?: string;
  onRequestSubmitted?: (req: MeetGreetRequest) => void;
}

export const MeetGreetModal: React.FC<MeetGreetModalProps> = ({
  isOpen,
  onClose,
  events,
  selectedEventId,
  onRequestSubmitted
}) => {
  const [targetEventId, setTargetEventId] = useState<string>(
    selectedEventId || events[0]?.id || ''
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [preferredDate, setPreferredDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(2);
  const [experiencePreference, setExperiencePreference] = useState(
    'Pre-Show Acoustic Soundstage Greeting & Photo'
  );
  const [accessibility, setAccessibility] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<MeetGreetRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const mgrEventSelectId = useId();
  const mgrNameId = useId();
  const mgrEmailId = useId();
  const mgrPhoneId = useId();
  const mgrCountryId = useId();
  const mgrDateId = useId();
  const mgrGuestsId = useId();
  const mgrTierId = useId();

  if (!isOpen) return null;

  const currentEvent = events.find(e => e.id === targetEventId) || events[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and contact email.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please provide a short message or background statement for the tour artist liaison team.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      const reqId = `MGR-2026-${randNum}`;

      const newReq: MeetGreetRequest = {
        id: reqId,
        fullName,
        email,
        phone,
        country,
        eventId: currentEvent?.id || 'ec-general',
        eventName: currentEvent ? currentEvent.eventName : 'Eric Clapton Live Experience',
        venueCity: currentEvent ? `${currentEvent.venue}, ${currentEvent.city}` : 'Tour Stop',
        preferredDate: preferredDate || currentEvent?.eventDate || '2026-10-18',
        numberOfGuests,
        experiencePreference,
        accessibilityRequirements: accessibility,
        messageToTeam: message,
        status: 'Request Received',
        adminNotes: 'Application registered. Queued for tour director and promoter clearance.',
        organizerConfirmationStatus: 'Under Initial Fan Screening',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createMeetGreetRequest(newReq);
      setSubmittedRequest(newReq);
      if (onRequestSubmitted) onRequestSubmitted(newReq);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#121214] border border-[#D4AF37]/40 shadow-2xl overflow-hidden text-[#F5F5DC]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1D] border border-[#D4AF37]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
                EXCLUSIVE ARTIST LIAISON DESK
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F5F5DC]">
                Request a Meet & Greet Opportunity
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC]/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* Mandatory Authenticity / Disclaimer Banner */}
          <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#F5F5DC] space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#D4AF37] font-serif">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Official Policy & Confirmation Notice</span>
            </div>
            <p className="text-xs leading-relaxed text-[#F5F5DC]/90 font-light italic">
              “Meet-and-greet availability is subject to confirmation and is not guaranteed unless explicitly confirmed by the authorized event organizer.”
            </p>
            <p className="text-[10px] text-[#F5F5DC]/50 pt-0.5 font-mono">
              Submitting this request does not constitute a confirmed meeting with Eric Clapton or guaranteed backstage entry.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!submittedRequest ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Event Selector */}
              <div>
                <label htmlFor={mgrEventSelectId} className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37] mb-1">
                  Target Concert / Tour Stop *
                </label>
                <select
                  id={mgrEventSelectId}
                  value={targetEventId}
                  onChange={(e) => {
                    setTargetEventId(e.target.value);
                    const ev = events.find(x => x.id === e.target.value);
                    if (ev) setPreferredDate(ev.eventDate);
                  }}
                  className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id} className="bg-[#0B0B0D]">
                      {ev.eventName} ({ev.city} — {formatEventDate(ev.eventDate, 'short')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Applicant Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={mgrNameId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={mgrNameId}
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Robert Harrison"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={mgrEmailId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={mgrEmailId}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fan@example.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={mgrPhoneId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={mgrPhoneId}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={mgrCountryId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={mgrCountryId}
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={mgrDateId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={mgrDateId}
                      type="date"
                      value={preferredDate || (currentEvent ? currentEvent.eventDate : '')}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={mgrGuestsId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Number of Guests (Max 4)
                  </label>
                  <select
                    id={mgrGuestsId}
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value={1} className="bg-[#0B0B0D]">1 Guest (Solo)</option>
                    <option value={2} className="bg-[#0B0B0D]">2 Guests (Pair)</option>
                    <option value={3} className="bg-[#0B0B0D]">3 Guests</option>
                    <option value={4} className="bg-[#0B0B0D]">4 Guests (VIP Delegation)</option>
                  </select>
                </div>
              </div>

              {/* Experience Preference */}
              <div>
                <label htmlFor={mgrTierId} className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37] mb-1">
                  Preferred Experience Tier
                </label>
                <select
                  id={mgrTierId}
                  value={experiencePreference}
                  onChange={(e) => setExperiencePreference(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Pre-Show Acoustic Soundstage Greeting & Photo" className="bg-[#0B0B0D]">
                    Pre-Show Acoustic Soundstage Greeting & Photo
                  </option>
                  <option value="Post-Concert Backstage Artist Suite Introduction" className="bg-[#0B0B0D]">
                    Post-Concert Backstage Artist Suite Introduction
                  </option>
                  <option value="Charity / Foundation Guitar Presentation Moment" className="bg-[#0B0B0D]">
                    Charity / Foundation Guitar Presentation Moment
                  </option>
                  <option value="Collector Memorabilia Signing Authorization" className="bg-[#0B0B0D]">
                    Collector Memorabilia Signing Authorization
                  </option>
                </select>
              </div>

              {/* Accessibility */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                  Special Accessibility Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value)}
                  placeholder="e.g. Wheelchair access, sign interpreter..."
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Message to Event Team */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                  Message / Background Statement to Event Team *
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your connection to Eric Clapton’s music, any special significance of this concert, or specific foundation/collector affiliation..."
                  className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37] font-light"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center gap-2 font-mono"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Meet & Greet Request'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* SUBMISSION CONFIRMATION */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#F5F5DC]">
                  Meet & Greet Request Received
                </h3>
                <p className="text-xs text-[#F5F5DC]/60 mt-1 font-light">
                  Your formal application has been forwarded to the artist management and tour liaison department.
                </p>
              </div>

              <div className="p-6 bg-[#0B0B0D] border border-[#D4AF37]/40 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs font-mono text-[#F5F5DC]/50 uppercase">Request Reference ID:</span>
                  <span className="font-mono text-sm font-bold text-[#D4AF37]">
                    {submittedRequest.id}
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-[#F5F5DC]/80 font-mono">
                  <div><span className="text-[#F5F5DC]/40">Concert:</span> {submittedRequest.eventName}</div>
                  <div><span className="text-[#F5F5DC]/40">Target Date:</span> {submittedRequest.preferredDate}</div>
                  <div><span className="text-[#F5F5DC]/40">Guests:</span> {submittedRequest.numberOfGuests}</div>
                  <div><span className="text-[#F5F5DC]/40">Status:</span> <span className="text-[#D4AF37] font-semibold font-mono uppercase">{submittedRequest.status}</span></div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC]/60 text-left max-w-lg mx-auto font-light">
                <div className="font-serif font-bold text-[#F5F5DC] mb-1">What happens next?</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>You can track this request at any time using the <strong>Check My Ticket</strong> search with reference <code className="text-[#D4AF37] font-mono">{submittedRequest.id}</code>.</li>
                  <li>Our artist liaison team will review itinerary constraints with local venue security 14–21 days prior to showtime.</li>
                  <li>Status changes will be notified via email to <span className="text-[#F5F5DC] font-mono">{submittedRequest.email}</span>.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono transition-colors"
              >
                Close Window
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
