import React, { useState } from 'react';
import { 
  Ticket, 
  Crown, 
  Sparkles, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Music, 
  Play, 
  Star,
  Users,
  Award,
  ChevronDown,
  Search,
  Bell
} from 'lucide-react';
import { ConcertEvent, VIPExperiencePackage } from '../types';
import { parseEventDate, formatEventDate } from '../lib/dateUtils';

interface HeroAndHomepageProps {
  events: ConcertEvent[];
  vipPackages: VIPExperiencePackage[];
  onBookTickets: (event?: ConcertEvent) => void;
  onExploreVIP: () => void;
  onRequestMeetGreet: () => void;
  onViewConcert: (event: ConcertEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const HeroAndHomepage: React.FC<HeroAndHomepageProps> = ({
  events,
  vipPackages,
  onBookTickets,
  onExploreVIP,
  onRequestMeetGreet,
  onViewConcert,
  onNavigateTab
}) => {
  const featuredEvent = events.find(e => e.id === 'ec-seattle-2026') || events.find(e => e.featured) || events[0];
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
      title: 'Climate Pledge Arena Live Concert',
      subtitle: 'Seattle, Washington'
    },
    {
      url: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=800&auto=format&fit=crop',
      title: 'Crossroads Guitar Festival at Moody Center',
      subtitle: 'Austin, Texas'
    },
    {
      url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop',
      title: 'Exclusive VIP Hospitality & Backstage Lounge',
      subtitle: 'Official Artist VIP Experience'
    }
  ];

  const announcements = [
    {
      date: 'Sept 18, 2026',
      title: 'Eric Clapton Live at Climate Pledge Arena in Seattle with Special Guest Jimmie Vaughan',
      summary: 'Climate Pledge Arena tour date scheduled for Friday, Sept 18, 2026 at 7:30 PM. Floor, VIP lounges, and standard passes now open.'
    },
    {
      date: 'Sept 26-27, 2026',
      title: 'Crossroads Guitar Festival 2026 at Moody Center in Austin, Texas',
      summary: 'Two-day festival tickets, VIP Patron lounges, and legendary charity guest artist rosters confirmed.'
    },
    {
      date: 'Sept 2026',
      title: 'North American 2026 Live Tour Passes and VIP Meet & Greet Status',
      summary: 'Official digital passes with instant QR encryption, Apple Wallet support, and VIP check-in access.'
    }
  ];

  const faqs = [
    {
      q: 'How do I receive and present my concert tickets?',
      a: 'All tickets are issued digitally with encrypted QR gate passes. You can access them instantly under “Check My Ticket”, add them to your phone, or download high-resolution printable PDF passes.'
    },
    {
      q: 'What is included in the Slowhand Gold and Diamond VIP packages?',
      a: 'VIP experiences include prime front seating, dedicated fast-track red carpet entry, gourmet pre-show hospitality dining, and exclusive commemorative tour merchandise such as embroidered tour jackets and archival art.'
    },
    {
      q: 'Is a Meet & Greet request guaranteed upon submission?',
      a: 'No. Submitting a Meet & Greet request does not guarantee access. Availability is strictly subject to promoter review, security clearance, and explicit confirmation by the authorized artist touring management.'
    },
    {
      q: 'Can tickets be rescheduled or refunded if tour dates shift?',
      a: 'Yes. In the event of a rescheduled or postponed concert, your pass is fully honored for the new date, or eligible for a 100% refund via our secure payment gateway.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. ARTISTIC FLAIR HERO & CONCERT HIGHLIGHT SPLIT */}
      <section className="relative border-b border-white/10 bg-[#0B0B0D]">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
          
          {/* Left Column: Dramatic Editorial Presentation */}
          <div className="lg:col-span-7 relative flex flex-col justify-end p-8 sm:p-12 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Background stage imagery with artistic texture */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop"
                alt="Eric Clapton Stage Backdrop"
                className="w-full h-full object-cover object-center filter brightness-40 scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/75 to-black/50" />
              <div className="absolute inset-0 opacity-40 mix-blend-overlay artistic-dark-hatch" />
              <div className="absolute inset-0 stage-radial-glow opacity-70" />
            </div>

            {/* Left Column Foreground Content */}
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-medium">
                  The 2026-2027 World Tour
                </span>
                <span className="px-2 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-mono font-bold uppercase tracking-wider">
                  Headline: Seattle, WA (Sept 18)
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif leading-[0.92] font-black text-[#F5F5DC]">
                Experience the <br />
                Blues Legend <br />
                <span className="italic text-[#F5F5DC]/90 font-normal underline decoration-[#D4AF37] decoration-1 underline-offset-8">
                  Live.
                </span>
              </h1>

              {/* Special Headline Spotlight Pill */}
              <div className="p-3.5 bg-black/60 border border-[#D4AF37]/40 max-w-lg space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#D4AF37]">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" /> Climate Pledge Arena • Seattle, WA
                  </span>
                  <span className="font-bold">Friday, Sept 18, 2026 • 7:30 PM</span>
                </div>
                <div className="text-xs text-[#F5F5DC]/80 flex items-center justify-between">
                  <span>Special Guest: <strong className="text-[#F5F5DC]">Jimmie Vaughan</strong></span>
                  <span className="text-[#D4AF37] font-mono font-bold">VIP Passes from $2,000</span>
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-[#F5F5DC]/70 font-light">
                Discover upcoming performances, premium concert tickets, and exclusive fan experiences across North America and beyond.
              </p>

              {/* Action Call-to-Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onBookTickets(featuredEvent)}
                  className="bg-[#D4AF37] text-black px-7 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#F5F5DC] transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Seattle Passes</span>
                </button>

                <button
                  onClick={onExploreVIP}
                  className="bg-[#F5F5DC] text-black px-7 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Explore VIP Packages</span>
                </button>

                <button
                  onClick={onRequestMeetGreet}
                  className="border border-[#F5F5DC]/30 text-[#F5F5DC] px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Meet & Greet Request</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 text-xs text-[#F5F5DC]/50 font-mono">
                <div>
                  <span className="text-[#D4AF37] block font-bold">100% SECURE</span>
                  <span>Escrow Checkout</span>
                </div>
                <div>
                  <span className="text-[#D4AF37] block font-bold">VIP LOUNGE</span>
                  <span>Hospitality Dining</span>
                </div>
                <div>
                  <span className="text-[#D4AF37] block font-bold">PASS QR</span>
                  <span>Instant Digital Pass</span>
                </div>
                <div>
                  <span className="text-[#D4AF37] block font-bold">PROMOTER AUTH</span>
                  <span>Artist Liaison</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Concert Spotlight & Quick Tools */}
          <div className="lg:col-span-5 bg-[#121214] flex flex-col justify-between p-6 sm:p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#D4AF37] pb-2">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#F5F5DC]">
                  Upcoming Concerts
                </h3>
                <button
                  onClick={() => onNavigateTab('concerts')}
                  className="text-[10px] text-[#F5F5DC]/50 uppercase tracking-wider hover:text-[#D4AF37] underline cursor-pointer"
                >
                  View All ({events.length})
                </button>
              </div>

              {/* Concert items list */}
              <div className="space-y-3">
                {events.slice(0, 4).map((ev) => {
                  const dateInfo = parseEventDate(ev.eventDate);
                  const monthName = dateInfo.monthShort;
                  const dayNum = dateInfo.dayStr;
                  const isSeattle = ev.id === 'ec-seattle-2026';

                  return (
                    <div
                      key={ev.id}
                      onClick={() => onBookTickets(ev)}
                      className={`group bg-[#1A1A1D] border p-3.5 flex items-center gap-4 cursor-pointer transition-all ${
                        isSeattle 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md shadow-[#D4AF37]/5' 
                          : 'border-white/5 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-[#0B0B0D] border flex flex-col items-center justify-center shrink-0 ${
                        isSeattle ? 'border-[#D4AF37]' : 'border-[#D4AF37]/20 group-hover:border-[#D4AF37]/60'
                      }`}>
                        <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold">{monthName}</span>
                        <span className="text-base font-serif font-bold text-[#F5F5DC] leading-none">{dayNum}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold tracking-tight text-[#F5F5DC] group-hover:text-[#D4AF37] transition-colors truncate">
                            {ev.venue}
                          </h4>
                          {isSeattle && (
                            <span className="px-1.5 py-0.2 bg-[#D4AF37] text-black text-[8px] font-bold uppercase tracking-wider">
                              Headline
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#F5F5DC]/50 uppercase tracking-wider truncate">
                          {ev.city}, {ev.country} {ev.specialGuests ? `• w/ ${ev.specialGuests.split('&')[0]}` : ''}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-[#F5F5DC]/40 uppercase mb-0.5">From</p>
                        <p className="text-xs font-mono text-[#D4AF37] font-bold">${ev.startingPrice}.00</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Ticket Lookup Box */}
              <div className="pt-5 border-t border-white/5 space-y-2">
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#F5F5DC]">
                  Check Booking Status
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="e.g. EC-2026-89421 or MGR-"
                    className="bg-[#0B0B0D] border border-white/10 text-xs px-4 py-3 flex-1 font-mono text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    onClick={() => {
                      const checkBtn = document.querySelector('[title="Check Ticket"]') as HTMLElement;
                      if (checkBtn) checkBtn.click();
                    }}
                    className="bg-[#222] hover:bg-black text-[#D4AF37] px-4 transition-colors border border-white/10 flex items-center justify-center"
                    title="Lookup Ticket Pass"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-[#F5F5DC]/40 italic">
                  Check your digital ticket or Meet & Greet request status using your reference ID.
                </p>
              </div>
            </div>

            {/* Join Fan Rewards Banner */}
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-4 flex items-start gap-4">
              <div className="bg-[#D4AF37] p-2 text-black shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="text-[11px] font-bold uppercase text-[#F5F5DC] mb-0.5 tracking-wider">
                  Join Fan Rewards
                </h5>
                <p className="text-[10px] text-[#F5F5DC]/60 leading-relaxed">
                  Enter for a chance to win exclusive signed memorabilia and VIP access upgrades.
                </p>
                <button
                  onClick={() => onNavigateTab('rewards')}
                  className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider mt-1 hover:underline inline-block"
                >
                  View Active Giveaways →
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. UPCOMING CONCERTS FULL SCHEDULE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
              Live Concert Schedule
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F5DC] mt-1">
              Tour Dates & Residencies
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('concerts')}
            className="text-xs text-[#D4AF37] hover:text-white uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>View All Concerts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const isSeattle = ev.id === 'ec-seattle-2026';
            const dateDisplay = formatEventDate(ev.eventDate, 'short');
            return (
              <div
                key={ev.id}
                className={`bg-[#121214] border overflow-hidden transition-all flex flex-col justify-between group ${
                  isSeattle
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10'
                    : 'border-white/10 hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={ev.heroImage}
                    alt={ev.eventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#0B0B0D] text-[#D4AF37] text-xs font-mono font-bold border border-[#D4AF37]/30 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{dateDisplay}</span>
                    </div>
                    {isSeattle && (
                      <span className="px-2 py-1 bg-[#D4AF37] text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                        Headline Tour Date
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">
                      {ev.venue} • {ev.city}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#F5F5DC] group-hover:text-[#D4AF37] transition-colors mt-1">
                      {ev.eventName}
                    </h3>
                    {ev.specialGuests && (
                      <p className="text-xs text-[#F5F5DC]/60 mt-1">
                        Special Guest: <span className="text-[#F5F5DC] font-medium">{ev.specialGuests}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#F5F5DC]/40 uppercase tracking-wider block">From</span>
                      <span className="font-mono text-base font-bold text-[#D4AF37]">${ev.startingPrice}.00</span>
                    </div>

                    <button
                      onClick={() => onBookTickets(ev)}
                      className="px-5 py-2 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Book Passes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. VIP EXPERIENCES HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="p-8 sm:p-12 bg-[#121214] border border-white/10 space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 artistic-hatch-pattern pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-[0.3em]">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span>Premier Concert Hospitality</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F5DC]">
                The Slowhand VIP Tier Series
              </h2>
              <p className="text-xs sm:text-sm text-[#F5F5DC]/70 leading-relaxed font-light">
                Step beyond conventional arena seating. Access private red carpet entrances, curated sommelier tastings, acoustic history lounges, and commemorative collector boxsets.
              </p>
            </div>

            <button
              onClick={onExploreVIP}
              className="px-7 py-3.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-colors shrink-0"
            >
              Explore VIP Packages
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {vipPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 bg-[#1A1A1D] border border-white/5 hover:border-[#D4AF37]/40 transition-all space-y-3"
              >
                <span className="px-2.5 py-0.5 text-[9px] font-mono uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  {pkg.badge}
                </span>
                <h4 className="font-serif text-lg font-bold text-[#F5F5DC]">{pkg.name}</h4>
                <p className="text-xs text-[#F5F5DC]/60 line-clamp-2 leading-relaxed">{pkg.tagline}</p>
                <div className="text-[#D4AF37] font-mono font-bold text-lg pt-1">
                  ${pkg.startingPrice} <span className="text-xs font-normal text-[#F5F5DC]/40">/ pass</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. FAN EXPERIENCE GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
            Acoustic & Electric Legacy
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5DC] mt-1">
            Historic Venues & Atmosphere
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImages.map((img, i) => (
            <div key={i} className="relative h-64 overflow-hidden group border border-white/10">
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-[#F5F5DC]">
                <div className="font-serif text-sm font-bold leading-tight">{img.title}</div>
                <div className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-wider mt-1">{img.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LATEST ANNOUNCEMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
            Tour Bulletin
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5DC] mt-1">
            Latest Announcements
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((ann, i) => (
            <div key={i} className="p-6 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/30 transition-all space-y-2.5">
              <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">{ann.date}</div>
              <h3 className="font-serif text-base font-bold text-[#F5F5DC]">{ann.title}</h3>
              <p className="text-xs text-[#F5F5DC]/65 leading-relaxed">{ann.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
            Clarity & Trust
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5DC]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 bg-[#121214] border border-white/10 space-y-2">
              <h4 className="font-bold text-sm text-[#F5F5DC] flex items-center gap-2.5">
                <span className="text-[#D4AF37] font-mono text-xs">Q.</span>
                {faq.q}
              </h4>
              <p className="text-xs text-[#F5F5DC]/70 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
