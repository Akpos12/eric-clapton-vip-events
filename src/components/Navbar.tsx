import React, { useState } from 'react';
import { 
  Music, 
  Ticket, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Menu, 
  X, 
  Crown, 
  Gift, 
  Headphones, 
  Lock,
  Calendar,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCheckTicket: () => void;
  isAdmin: boolean;
  onLockAdmin: () => void;
  onSecretTrigger?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCheckTicket,
  isAdmin,
  onLockAdmin,
  onSecretTrigger
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleDiscreteClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 5) {
      setClickCount(0);
      if (onSecretTrigger) onSecretTrigger();
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'concerts', label: 'Concerts & Tickets', icon: Calendar },
    { id: 'vip', label: 'VIP Experiences', icon: Crown },
    { id: 'meet-greet', label: 'Meet & Greet', icon: Sparkles },
    { id: 'rewards', label: 'Fan Rewards', icon: Gift },
    { id: 'concierge', label: 'Customer Care & Chat', icon: Headphones },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0D]/95 backdrop-blur-md border-b border-white/10">
      {/* Top Advisory Bar */}
      <div className="w-full bg-[#121214] border-b border-white/5 px-4 sm:px-10 py-1.5 text-center text-xs text-[#F5F5DC]/60 flex items-center justify-between">
        <div 
          onClick={handleDiscreteClick}
          className="cursor-default select-none hidden sm:flex items-center gap-2 text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>The 2026-2027 World Tour • VIP & Concert Access</span>
        </div>

        <div className="mx-auto sm:mx-0 flex items-center gap-4">
          <span className="text-[10px] text-[#F5F5DC]/40 uppercase tracking-widest">
            Eric Clapton Official VIP Tour Services
          </span>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-[#D4AF37] hover:bg-white/5 border border-[#D4AF37]/40'
                }`}
                title="View Site Control Room"
              >
                <Layers className="w-2.5 h-2.5" />
                <span>Control Room (Active)</span>
              </button>
              <button
                onClick={onLockAdmin}
                className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/20 transition-colors flex items-center gap-1"
                title="Lock & Exit Control Room"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Lock</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          className="flex items-baseline gap-2.5 group text-left"
        >
          <span className="text-2xl font-serif tracking-tighter text-[#D4AF37] font-bold group-hover:text-white transition-colors">
            ERIC CLAPTON
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-light text-[#F5F5DC] hidden sm:inline">
            VIP EXPERIENCE
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-widest font-medium">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`cursor-pointer transition-all pb-1 ${
                  isActive
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold'
                    : 'text-[#F5F5DC]/80 hover:text-[#D4AF37] border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`transition-all pb-1 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold'
                  : 'text-[#D4AF37]/80 hover:text-[#D4AF37] border-b-2 border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Control Room</span>
            </button>
          )}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenCheckTicket}
            className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-[#F5F5DC]/80 hover:text-[#D4AF37] text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Check Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab('concerts')}
            className="bg-[#D4AF37] text-black px-6 py-2 text-[11px] font-bold uppercase tracking-tighter hover:bg-[#F5F5DC] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenCheckTicket}
            className="p-2 bg-[#121214] border border-white/10 text-[#D4AF37]"
            title="Check Ticket"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 bg-[#121214] border border-white/10 text-[#F5F5DC]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121214] border-b border-white/10 px-6 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between py-2.5 text-xs uppercase tracking-widest text-left transition-colors border-b border-white/5 ${
                activeTab === link.id
                  ? 'text-[#D4AF37] font-bold'
                  : 'text-[#F5F5DC]/70 hover:text-[#D4AF37]'
              }`}
            >
              <span>{link.label}</span>
              {link.icon && <link.icon className="w-4 h-4 text-[#D4AF37]/60" />}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between py-2.5 text-xs uppercase tracking-widest text-left font-bold text-[#D4AF37] border-b border-white/5"
            >
              <span>Site Control Room</span>
              <Layers className="w-4 h-4" />
            </button>
          )}

          <div className="pt-4 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onOpenCheckTicket();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0B0B0D] border border-white/10 text-[#F5F5DC] text-xs font-mono uppercase tracking-wider"
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Check My Ticket (#EC- / MGR-)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('concerts');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Concert Tickets</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

