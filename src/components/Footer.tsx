import React, { useState } from 'react';
import { 
  Music, 
  Mail, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Lock, 
  Sparkles,
  Ticket
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenCheckTicket: () => void;
  onOpenMeetGreet: () => void;
  onSecretTrigger?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCheckTicket,
  onOpenMeetGreet,
  onSecretTrigger
}) => {
  const [clickCount, setClickCount] = useState(0);

  const handleCopyrightClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      setClickCount(0);
      if (onSecretTrigger) onSecretTrigger();
    }
  };
  return (
    <footer className="w-full bg-[#0B0B0D] border-t border-white/10 text-[#F5F5DC]/60 text-xs">
      {/* Main Multi-Column Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-[#D4AF37] text-lg tracking-tight">
              ERIC CLAPTON
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#F5F5DC]/50 font-mono">
              VIP
            </span>
          </div>
          <p className="text-[11px] text-[#F5F5DC]/60 leading-relaxed">
            Curated concert bookings, slowhand acoustic passes, and exclusive fan community access across world tour residencies.
          </p>
          <div className="pt-2 text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026-2027 Concert Edition</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h5 className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#F5F5DC] font-bold">
            Concerts & Experiences
          </h5>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button onClick={() => onNavigate('concerts')} className="hover:text-[#D4AF37] transition-colors">
                Upcoming Tour Schedule
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('vip')} className="hover:text-[#D4AF37] transition-colors">
                VIP Hospitality Packages
              </button>
            </li>
            <li>
              <button onClick={onOpenMeetGreet} className="hover:text-[#D4AF37] transition-colors">
                Request a Meet & Greet
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('rewards')} className="hover:text-[#D4AF37] transition-colors">
                Fan Memorabilia Giveaways
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Assistance */}
        <div className="space-y-3">
          <h5 className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#F5F5DC] font-bold">
            Fan Concierge & Pass Support
          </h5>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button onClick={onOpenCheckTicket} className="hover:text-[#D4AF37] transition-colors text-[#D4AF37] font-mono">
                Check My Ticket (#EC-...)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('concierge')} className="hover:text-[#D4AF37] transition-colors text-[#D4AF37]">
                Track Inquiries & Live Chat (By Booking Email)
              </button>
            </li>
            <li>
              <a href="#faq-section" className="hover:text-[#D4AF37] transition-colors">
                Frequently Asked Questions
              </a>
            </li>
            <li>
              <span className="text-[#F5F5DC]/40">Security & Tokenized Gate Passes</span>
            </li>
          </ul>
        </div>

        {/* Terms & Transparency */}
        <div className="space-y-3">
          <h5 className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#F5F5DC] font-bold">
            Legal & Venue Protocols
          </h5>
          <ul className="space-y-2 text-[11px] text-[#F5F5DC]/50">
            <li>Terms of Ticket Escrow & Transfer</li>
            <li>Privacy & PCI-DSS Tokenization Policy</li>
            <li>Postponement & Refund Guarantee</li>
            <li>Accessible Seating & Venue Ingress</li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/5 py-6 px-4 sm:px-8 lg:px-10 text-center text-[10px] text-[#F5F5DC]/40 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div 
          onClick={handleCopyrightClick}
          className="cursor-default select-none hover:text-[#F5F5DC]/60 transition-colors"
          title="Eric Clapton VIP Tour Service Platform"
        >
          © {new Date().getFullYear()} Eric Clapton VIP Experience Platform.
        </div>
        <div className="flex items-center gap-4">
          <span>AES-256 Pass Security</span>
          <span>•</span>
          <span>Dynamic QR Gate Validation</span>
        </div>
      </div>

    </footer>
  );
};
