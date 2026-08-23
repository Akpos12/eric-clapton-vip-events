import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Trophy, 
  ShieldCheck, 
  Users, 
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FanRewardGiveaway } from '../types';
import { enterGiveaway } from '../lib/api';

interface FanRewardsProps {
  giveaways: FanRewardGiveaway[];
  onRefreshGiveaways?: () => void;
}

export const FanRewards: React.FC<FanRewardsProps> = ({
  giveaways,
  onRefreshGiveaways
}) => {
  const [selectedGiveaway, setSelectedGiveaway] = useState<FanRewardGiveaway | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasEntered, setHasEntered] = useState<Record<string, boolean>>({});
  const [entrySuccess, setEntrySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenEntry = (giveaway: FanRewardGiveaway) => {
    setSelectedGiveaway(giveaway);
    setEntrySuccess(false);
    setErrorMsg('');
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGiveaway) return;

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await enterGiveaway(selectedGiveaway.id, { name: fullName, email, city });
      setHasEntered(prev => ({ ...prev, [selectedGiveaway.id]: true }));
      setEntrySuccess(true);
      
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#D4AF37', '#F9E79F', '#FFFFFF']
        });
      } catch (cErr) {
        console.warn(cErr);
      }

      if (onRefreshGiveaways) onRefreshGiveaways();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to register entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-mono tracking-[0.3em] uppercase">
          <Gift className="w-3.5 h-3.5" />
          <span>Exclusive Fan Community Giveaways</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5DC] tracking-tight">
          Eric Clapton Fan Rewards
        </h2>
        <p className="text-sm sm:text-base text-[#F5F5DC]/70 font-light">
          Enter official community draws for rare vinyl boxsets, tribute instruments, and all-inclusive concert travel passes.
        </p>
      </div>

      {/* Giveaways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {giveaways.map((gw) => {
          const isAlreadyEntered = hasEntered[gw.id];
          return (
            <div
              key={gw.id}
              className="bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 overflow-hidden transition-all flex flex-col justify-between group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={gw.image}
                  alt={gw.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-85"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/30 to-transparent" />
                
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 bg-[#0B0B0D] border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold font-mono uppercase tracking-wider">
                    {gw.category}
                  </span>
                </div>

                <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-[#F5F5DC]">
                  <div className="flex items-center gap-1.5 font-mono text-[#D4AF37] bg-[#0B0B0D]/90 border border-white/10 px-2.5 py-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Closes: Oct 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[#F5F5DC]/80 bg-[#0B0B0D]/90 border border-white/10 px-2.5 py-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{gw.totalEntries.toLocaleString()} Entries</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#F5F5DC] group-hover:text-[#D4AF37] transition-colors">
                    {gw.title}
                  </h3>
                  <p className="text-xs text-[#F5F5DC]/65 leading-relaxed">
                    {gw.description}
                  </p>
                </div>

                {/* Key Rules snippet */}
                <div className="p-3 bg-[#1A1A1D] border border-white/5 space-y-1.5 text-xs text-[#F5F5DC]/80">
                  <div className="font-mono text-[10px] uppercase text-[#D4AF37]">Entry Terms:</div>
                  <ul className="list-disc pl-4 text-[11px] text-[#F5F5DC]/60 space-y-0.5 font-mono">
                    {gw.terms.slice(0, 2).map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-[#F5F5DC]/40 italic">
                  {gw.disclaimer}
                </p>

                {/* Action CTA */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleOpenEntry(gw)}
                    className={`w-full py-3 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                      isAlreadyEntered
                        ? 'bg-[#1A1A1D] text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#D4AF37] hover:bg-[#F5F5DC] text-black'
                    }`}
                  >
                    {isAlreadyEntered ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Entry Confirmed (Active Draw)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Enter Free Fan Giveaway</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Entry Modal */}
      {selectedGiveaway && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 text-[#F5F5DC] p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">
                  Fan Giveaway Registration
                </h3>
              </div>
              <button
                onClick={() => setSelectedGiveaway(null)}
                className="p-1.5 text-[#F5F5DC]/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {!entrySuccess ? (
              <form onSubmit={handleEntrySubmit} className="space-y-4">
                <div className="p-3 bg-[#1A1A1D] border border-white/5 text-xs space-y-1">
                  <div className="font-semibold text-[#F5F5DC]">{selectedGiveaway.title}</div>
                  <div className="text-[#F5F5DC]/50 text-[11px]">Free entry for registered fan community members.</div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. David Sterling"
                    className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fan@example.com"
                    className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. London or New York"
                    className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGiveaway(null)}
                    className="px-4 py-2 bg-[#1A1A1D] border border-white/10 text-xs text-[#F5F5DC]/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Submit Entry'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#F5F5DC]">
                    Entry Confirmed!
                  </h4>
                  <p className="text-xs text-[#F5F5DC]/70 mt-1">
                    You have been entered into the draw for <span className="text-[#F5F5DC] font-medium">{selectedGiveaway.title}</span>. Winner will be notified at {email}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGiveaway(null)}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#F5F5DC]"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
