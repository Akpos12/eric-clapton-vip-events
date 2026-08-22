import React from 'react';
import { 
  Crown, 
  Sparkles, 
  Check, 
  GlassWater, 
  Shirt, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Star,
  Users,
  Compass
} from 'lucide-react';
import { VIPExperiencePackage, ConcertEvent } from '../types';

interface VIPCatalogProps {
  vipPackages: VIPExperiencePackage[];
  events: ConcertEvent[];
  onSelectPackage: (pkg: VIPExperiencePackage) => void;
  onRequestMeetGreet: (eventId?: string) => void;
}

export const VIPCatalog: React.FC<VIPCatalogProps> = ({
  vipPackages,
  events,
  onSelectPackage,
  onRequestMeetGreet
}) => {
  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-mono tracking-[0.3em] uppercase">
          <Crown className="w-3.5 h-3.5" />
          <span>Curated Hospitality & Backstage Atmosphere</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5DC] tracking-tight">
          VIP & Exclusive Experiences
        </h2>
        <p className="text-sm sm:text-base text-[#F5F5DC]/70 font-light">
          Immerse yourself in world-class acoustic perfection, gourmet private dining, and commemorative rock history collectibles.
        </p>
      </div>

      {/* VIP Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {vipPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 overflow-hidden transition-all flex flex-col justify-between group"
          >
            {/* Image Header */}
            <div className="relative h-60 overflow-hidden">
              <img
                src={pkg.heroImage}
                alt={pkg.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/40 to-transparent" />
              
              <div className="absolute top-3.5 left-3.5">
                <span className="px-3 py-1 bg-[#0B0B0D] border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase font-mono tracking-wider">
                  {pkg.badge}
                </span>
              </div>

              <div className="absolute bottom-3.5 left-4 right-4">
                <div className="text-[10px] uppercase font-mono text-[#D4AF37] tracking-[0.2em]">
                  EXCLUSIVE TIER
                </div>
                <div className="text-2xl font-serif font-bold text-[#F5F5DC]">
                  ${pkg.startingPrice} <span className="text-xs font-sans font-normal text-[#F5F5DC]/50">/ guest</span>
                </div>
              </div>
            </div>

            {/* Package Content */}
            <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#F5F5DC] group-hover:text-[#D4AF37] transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#F5F5DC]/65 mt-1 leading-relaxed">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Key Inclusions List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#D4AF37] font-bold block">
                    Package Benefits Include:
                  </span>
                  <ul className="space-y-2 text-xs text-[#F5F5DC]/80">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hospitality & Merch details */}
                <div className="p-4 bg-[#1A1A1D] border border-white/5 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 text-[#F5F5DC]/80">
                    <GlassWater className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#F5F5DC]">Hospitality:</strong> {pkg.hospitalityDetails}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[#F5F5DC]/80">
                    <Shirt className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#F5F5DC]">Merchandise:</strong> {pkg.merchandisePerks}
                    </div>
                  </div>
                </div>

                {/* Sample Schedule */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#F5F5DC]/50 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Itinerary Snapshot:
                  </span>
                  <div className="space-y-1 text-[11px] text-[#F5F5DC]/60 pl-4 border-l border-white/10 font-mono">
                    {pkg.itinerary.slice(0, 3).map((it, idx) => (
                      <div key={idx}>{it}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <span>Select & Book Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {pkg.isMeetGreetEligible && (
                  <button
                    onClick={() => onRequestMeetGreet()}
                    className="w-full py-2.5 bg-[#1A1A1D] hover:bg-white/10 text-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Apply for Meet & Greet Upgrade</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory & Meet & Greet Banner Callout */}
      <div className="p-8 bg-[#121214] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 artistic-hatch-pattern pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Dedicated Artist Liaison Desk</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#F5F5DC]">
            Looking for Special Foundation or Meet & Greet Access?
          </h3>
          <p className="text-xs sm:text-sm text-[#F5F5DC]/70 leading-relaxed font-light">
            All artist meet-and-greet requests are handled independently through our liaison coordinator. Availability is strictly subject to tour management confirmation.
          </p>
        </div>

        <button
          onClick={() => onRequestMeetGreet()}
          className="relative z-10 px-7 py-3.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Submit Fan Request</span>
        </button>
      </div>

    </section>
  );
};
