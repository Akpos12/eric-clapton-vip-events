import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  Crown, 
  Sparkles, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Music2,
  ChevronRight
} from 'lucide-react';
import { ConcertEvent, TicketCategoryType } from '../types';
import { formatEventDate } from '../lib/dateUtils';

interface ConcertCatalogProps {
  events: ConcertEvent[];
  onBookTickets: (event: ConcertEvent, tierId?: string) => void;
  onRequestMeetGreet: (eventId: string) => void;
}

export const ConcertCatalog: React.FC<ConcertCatalogProps> = ({
  events,
  onBookTickets,
  onRequestMeetGreet
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [mgrOnly, setMgrOnly] = useState(false);

  // Extract unique countries
  const countries = ['All', ...Array.from(new Set(events.map(e => e.country)))];

  // Filtering logic
  const filteredEvents = events.filter((ev) => {
    const matchesSearch = 
      ev.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = selectedCountry === 'All' || ev.country === selectedCountry;
    const matchesVip = !vipOnly || ev.vipAvailability;
    const matchesMgr = !mgrOnly || ev.meetAndGreetAvailability;
    
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      matchesCategory = ev.ticketCategories.some(cat => cat.name === selectedCategory);
    }

    return matchesSearch && matchesCountry && matchesVip && matchesMgr;
  });

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-mono tracking-[0.3em] uppercase">
          <Music2 className="w-3.5 h-3.5" />
          <span>2026-2027 Concert & Residency Schedule</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5DC] tracking-tight">
          Concert & Ticket Catalog
        </h2>
        <p className="text-sm sm:text-base text-[#F5F5DC]/70 font-light">
          Select your destination to access tier-based seating, luxury hospitality lounges, and official fan requests.
        </p>
      </div>

      {/* Interactive Filter Control Deck */}
      <div className="bg-[#121214] border border-white/10 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, venue, or tour..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>

          {/* Country Selector */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
            >
              {countries.map((c) => (
                <option key={c} value={c} className="bg-[#0B0B0D] text-[#F5F5DC]">
                  Country: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Tier Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="All" className="bg-[#0B0B0D]">All Ticket Categories</option>
              <option value="General Admission" className="bg-[#0B0B0D]">General Admission</option>
              <option value="Standard Seating" className="bg-[#0B0B0D]">Standard Seating</option>
              <option value="Premium Seating" className="bg-[#0B0B0D]">Premium Seating</option>
              <option value="VIP" className="bg-[#0B0B0D]">VIP Packages</option>
              <option value="Premium VIP" className="bg-[#0B0B0D]">Premium VIP</option>
              <option value="Hospitality Package" className="bg-[#0B0B0D]">Hospitality Package</option>
            </select>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVipOnly(!vipOnly)}
              className={`flex-1 py-2.5 px-3 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                vipOnly
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#0B0B0D] border-white/10 text-[#F5F5DC]/60 hover:text-[#D4AF37]'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>VIP Available</span>
            </button>
            <button
              onClick={() => setMgrOnly(!mgrOnly)}
              className={`flex-1 py-2.5 px-3 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                mgrOnly
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#0B0B0D] border-white/10 text-[#F5F5DC]/60 hover:text-[#D4AF37]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Meet & Greet</span>
            </button>
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-[#F5F5DC]/50 pt-3 border-t border-white/5 font-mono">
          <span>Showing <strong className="text-[#D4AF37]">{filteredEvents.length}</strong> concerts worldwide</span>
          <span className="text-[11px] text-[#F5F5DC]/40">Real-time inventory sync & gate verification</span>
        </div>
      </div>

      {/* Concerts Grid Cards */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-[#121214] border border-white/10 space-y-3">
          <Ticket className="w-10 h-10 text-[#F5F5DC]/30 mx-auto" />
          <h3 className="text-base font-serif font-bold text-[#F5F5DC]">No concerts matched your filter criteria</h3>
          <p className="text-xs text-[#F5F5DC]/50">Try resetting filters or searching for another city.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('All');
              setSelectedCategory('All');
              setVipOnly(false);
              setMgrOnly(false);
            }}
            className="px-6 py-2.5 bg-[#D4AF37] text-xs font-mono font-bold uppercase tracking-widest text-black hover:bg-[#F5F5DC] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const totalRemaining = ev.ticketCategories.reduce((acc, c) => acc + c.available, 0);
            return (
              <div
                key={ev.id}
                className="bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 overflow-hidden transition-all group flex flex-col justify-between"
              >
                {/* Event Image Banner */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={ev.heroImage}
                    alt={ev.eventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/30 to-transparent" />
                  
                  {/* Floating Date Tag */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[#0B0B0D] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{formatEventDate(ev.eventDate, 'short')}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {ev.id === 'ec-seattle-2026' && (
                      <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase font-mono tracking-wider shadow-lg">
                        Standard & Regular SOLD OUT
                      </span>
                    )}
                    {ev.id === 'ec-seattle-2026' && (
                      <span className="px-2.5 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase font-mono tracking-wider shadow-lg">
                        VIP: 4 Remaining
                      </span>
                    )}
                    {ev.id !== 'ec-seattle-2026' && ev.vipAvailability && (
                      <span className="px-2.5 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase font-mono tracking-wider">
                        VIP Active
                      </span>
                    )}
                  </div>

                  {/* Location Banner Over Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#F5F5DC]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{ev.venue}, {ev.city}</span>
                    </div>
                  </div>
                </div>

                {/* Event Info Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
                      {ev.tourName}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#F5F5DC] group-hover:text-[#D4AF37] transition-colors leading-snug">
                      {ev.eventName}
                    </h3>
                    <p className="text-xs text-[#F5F5DC]/65 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    {ev.specialGuests && (
                      <div className="text-[11px] text-[#F5F5DC]/70 italic bg-[#0B0B0D] p-2.5 border border-white/5">
                        <span className="text-[#D4AF37] not-italic font-medium">Guest Artist: </span>
                        {ev.specialGuests}
                      </div>
                    )}
                  </div>

                  {/* Timing & Starting Price details */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#F5F5DC]/60 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Doors: {ev.doorsOpen} | Show: {ev.concertTime}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-[#F5F5DC]/40 uppercase block font-mono">From</span>
                        <span className="text-base font-bold font-mono text-[#D4AF37]">
                          ${ev.startingPrice}.00
                        </span>
                      </div>
                    </div>

                    {/* Ticket Tiers Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {ev.ticketCategories.map((tier) => {
                        const isSoldOut = tier.available <= 0 || tier.badge?.toLowerCase().includes('sold out');
                        return (
                          <span
                            key={tier.id}
                            className={`px-2 py-0.5 text-[10px] border font-mono flex items-center gap-1 ${
                              isSoldOut
                                ? 'bg-red-950/20 text-red-400 border-red-900/30'
                                : 'bg-[#1A1A1D] text-[#F5F5DC]/90 border-white/10'
                            }`}
                          >
                            <span>{tier.name}: ${tier.price.toLocaleString()}</span>
                            {isSoldOut ? (
                              <span className="text-[9px] text-red-400 font-bold ml-0.5 uppercase">SOLD OUT</span>
                            ) : tier.available <= 5 ? (
                              <span className="text-[9px] text-[#D4AF37] font-bold ml-0.5 uppercase">{tier.available} Left</span>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onBookTickets(ev)}
                        className="py-2.5 px-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book Passes</span>
                      </button>

                      {ev.meetAndGreetAvailability ? (
                        <button
                          onClick={() => onRequestMeetGreet(ev.id)}
                          className="py-2.5 px-3 bg-[#1A1A1D] hover:bg-white/10 text-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Meet & Greet</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onBookTickets(ev)}
                          className="py-2.5 px-3 bg-[#1A1A1D] text-[#F5F5DC]/60 text-xs font-medium border border-white/10 uppercase tracking-wider"
                        >
                          <span>View Details</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#F5F5DC]/40 font-mono pt-1">
                      <span>Inventory: {totalRemaining} passes remaining</span>
                      <span className="text-[#D4AF37]">Guaranteed Pass</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
