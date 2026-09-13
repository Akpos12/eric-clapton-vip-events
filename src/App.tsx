import React, { useState, useEffect } from 'react';
import { 
  getConcertEvents, 
  getTicketOrders, 
  getMeetGreetRequests, 
  getVIPPackages, 
  getGiveaways, 
  getSupportTickets,
  seedInitialDataIfNeeded 
} from './lib/api';
import { 
  ConcertEvent, 
  TicketOrder, 
  MeetGreetRequest, 
  VIPExperiencePackage, 
  FanRewardGiveaway, 
  SupportTicket 
} from './types';
import { Navbar } from './components/Navbar';
import { HeroAndHomepage } from './components/HeroAndHomepage';
import { ConcertCatalog } from './components/ConcertCatalog';
import { VIPCatalog } from './components/VIPCatalog';
import { FanRewards } from './components/FanRewards';
import { FanConcierge } from './components/FanConcierge';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckTicketModal } from './components/CheckTicketModal';
import { BookingCheckoutModal } from './components/BookingCheckoutModal';
import { MeetGreetModal } from './components/MeetGreetModal';
import { AdminGateModal } from './components/AdminGateModal';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Check if valid admin token is preserved
    const token = localStorage.getItem('ec_vip_admin_auth_token') || sessionStorage.getItem('ec_vip_admin_auth_token');
    return Boolean(token && token.startsWith('AUTH_VALIDATED_'));
  });
  const [isAdminGateOpen, setIsAdminGateOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Core Datasets
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [meetGreets, setMeetGreets] = useState<MeetGreetRequest[]>([]);
  const [vipPackages, setVipPackages] = useState<VIPExperiencePackage[]>([]);
  const [giveaways, setGiveaways] = useState<FanRewardGiveaway[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // Modals
  const [isCheckTicketOpen, setIsCheckTicketOpen] = useState(false);
  const [initialTicketQuery, setInitialTicketQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedEventForCheckout, setSelectedEventForCheckout] = useState<ConcertEvent | null>(null);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<string | undefined>(undefined);
  const [isMeetGreetOpen, setIsMeetGreetOpen] = useState(false);
  const [selectedEventForMeetGreet, setSelectedEventForMeetGreet] = useState<string | undefined>(undefined);
  const [conciergePrefilledEmail, setConciergePrefilledEmail] = useState<string>('');

  const handleOpenConciergeWithEmail = (email: string) => {
    setConciergePrefilledEmail(email);
    localStorage.setItem('ec_vip_fan_email', email);
    setActiveTab('concierge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global secret shortcut and URL hash / query param listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (isAdmin) {
          setActiveTab('admin');
        } else {
          setIsAdminGateOpen(true);
        }
      }
    };

    const checkUrlForPass = () => {
      // Check query params (e.g. ?ticket=EC-2026-89421 or ?pass=EC-2026-89421)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ticketParam = urlParams.get('ticket') || urlParams.get('pass') || urlParams.get('id');
        if (ticketParam) {
          setInitialTicketQuery(ticketParam.trim());
          setIsCheckTicketOpen(true);
        }
      } catch {
        // ignore url parse errors
      }

      // Check hash params (e.g. #ticket=EC-2026-89421 or #admin)
      if (window.location.hash === '#admin' || window.location.hash === '#control-room') {
        if (isAdmin) {
          setActiveTab('admin');
        } else {
          setIsAdminGateOpen(true);
        }
      } else if (window.location.hash.startsWith('#ticket=') || window.location.hash.startsWith('#pass=')) {
        const hashTicket = window.location.hash.split('=')[1];
        if (hashTicket) {
          setInitialTicketQuery(hashTicket.trim());
          setIsCheckTicketOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkUrlForPass);
    checkUrlForPass();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkUrlForPass);
    };
  }, [isAdmin]);

  // Initial Data Fetch
  const refreshAllData = async () => {
    try {
      await seedInitialDataIfNeeded();
      const [evs, ords, mgrs, vips, gws, stkts] = await Promise.all([
        getConcertEvents(),
        getTicketOrders(),
        getMeetGreetRequests(),
        getVIPPackages(),
        getGiveaways(),
        getSupportTickets()
      ]);
      setEvents(evs);
      setOrders(ords);
      setMeetGreets(mgrs);
      setVipPackages(vips);
      setGiveaways(gws);
      setSupportTickets(stkts);
    } catch (err) {
      console.error('Error fetching platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Action Handlers
  const handleOpenBooking = (event?: ConcertEvent, tierId?: string) => {
    const targetEvent = event || events[0];
    setSelectedEventForCheckout(targetEvent);
    setSelectedTierForCheckout(tierId);
    setIsCheckoutOpen(true);
  };

  const handleOpenMeetGreet = (eventId?: string) => {
    setSelectedEventForMeetGreet(eventId);
    setIsMeetGreetOpen(true);
  };

  const handleSelectVipPackage = (pkg: VIPExperiencePackage) => {
    const targetEvent = events[0];
    setSelectedEventForCheckout(targetEvent);
    const vipTier = targetEvent?.ticketCategories.find(t => t.name.includes('VIP'))?.id;
    setSelectedTierForCheckout(vipTier);
    setIsCheckoutOpen(true);
  };

  const handleUnlockAdmin = () => {
    setIsAdmin(true);
    setActiveTab('admin');
  };

  const handleLockAdmin = () => {
    localStorage.removeItem('ec_vip_admin_auth_token');
    sessionStorage.removeItem('ec_vip_admin_auth_token');
    setIsAdmin(false);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0D] text-[#F3F3F5] selection:bg-[#D4AF37] selection:text-black">
      
      {/* Platform Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCheckTicket={() => setIsCheckTicketOpen(true)}
        isAdmin={isAdmin}
        onLockAdmin={handleLockAdmin}
        onSecretTrigger={() => {
          if (isAdmin) {
            setActiveTab('admin');
          } else {
            setIsAdminGateOpen(true);
          }
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {loading ? (
          <div className="py-28 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-amber-400/80 uppercase tracking-wider">
              Loading Eric Clapton VIP Experience Platform...
            </p>
          </div>
        ) : (
          <>
            {/* HOMEPAGE */}
            {activeTab === 'home' && (
              <HeroAndHomepage
                events={events}
                vipPackages={vipPackages}
                onBookTickets={handleOpenBooking}
                onExploreVIP={() => setActiveTab('vip')}
                onRequestMeetGreet={() => handleOpenMeetGreet()}
                onViewConcert={(ev) => handleOpenBooking(ev)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* CONCERTS & TICKETS CATALOG */}
            {activeTab === 'concerts' && (
              <ConcertCatalog
                events={events}
                onBookTickets={handleOpenBooking}
                onRequestMeetGreet={handleOpenMeetGreet}
              />
            )}

            {/* VIP EXPERIENCES */}
            {activeTab === 'vip' && (
              <VIPCatalog
                vipPackages={vipPackages}
                events={events}
                onSelectPackage={handleSelectVipPackage}
                onRequestMeetGreet={handleOpenMeetGreet}
              />
            )}

            {/* MEET & GREET FLOW */}
            {activeTab === 'meet-greet' && (
              <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
                <div className="text-center space-y-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
                    Artist Liaison Desk
                  </span>
                  <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-white">
                    Exclusive Meet & Greet Request Portal
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                    Submit a personalized fan or foundation request for consideration across 2026-2027 tour stops.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#14141B] border border-amber-500/30 text-center space-y-4 shadow-xl">
                  <p className="text-xs text-zinc-300 italic">
                    “Meet-and-greet availability is subject to confirmation and is not guaranteed unless explicitly confirmed by the authorized event organizer.”
                  </p>
                  <button
                    onClick={() => handleOpenMeetGreet()}
                    className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Launch Request Application Form
                  </button>
                </div>
              </div>
            )}

            {/* FAN REWARDS & GIVEAWAYS */}
            {activeTab === 'rewards' && (
              <FanRewards
                giveaways={giveaways}
                onRefreshGiveaways={refreshAllData}
              />
            )}

            {/* FAN CONCIERGE & SUPPORT */}
            {activeTab === 'concierge' && (
              <FanConcierge
                tickets={supportTickets}
                orders={orders}
                initialEmail={conciergePrefilledEmail}
                onOpenCheckTicket={() => setIsCheckTicketOpen(true)}
                onRequestMeetGreet={() => handleOpenMeetGreet()}
                onRefreshTickets={refreshAllData}
              />
            )}

            {/* ADMIN / ORGANIZER DASHBOARD (EXCLUSIVE) */}
            {activeTab === 'admin' && isAdmin && (
              <AdminDashboard
                events={events}
                orders={orders}
                meetGreets={meetGreets}
                supportTickets={supportTickets}
                onDataChanged={refreshAllData}
                onLockAdmin={handleLockAdmin}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AdminGateModal
        isOpen={isAdminGateOpen}
        onClose={() => setIsAdminGateOpen(false)}
        onSuccess={handleUnlockAdmin}
      />

      <CheckTicketModal
        isOpen={isCheckTicketOpen}
        initialQuery={initialTicketQuery}
        onClose={() => {
          setIsCheckTicketOpen(false);
          setInitialTicketQuery('');
        }}
        onSelectEvent={(eventId) => {
          const ev = events.find(e => e.id === eventId);
          if (ev) handleOpenBooking(ev);
        }}
        onPurchaseNewTicketFor15th={() => {
          const ev = events.find(e => e.id === 'ec-stpaul-2026' || e.date === '2026-09-15');
          if (ev) handleOpenBooking(ev, 'stp-tier-vip');
        }}
        onOpenConciergeWithEmail={handleOpenConciergeWithEmail}
      />

      <BookingCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={selectedEventForCheckout}
        initialTierId={selectedTierForCheckout}
        onOrderCompleted={() => refreshAllData()}
        onOpenConciergeWithEmail={handleOpenConciergeWithEmail}
      />

      <MeetGreetModal
        isOpen={isMeetGreetOpen}
        onClose={() => setIsMeetGreetOpen(false)}
        events={events}
        selectedEventId={selectedEventForMeetGreet}
        onRequestSubmitted={() => refreshAllData()}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenCheckTicket={() => setIsCheckTicketOpen(true)}
        onOpenMeetGreet={() => handleOpenMeetGreet()}
        onSecretTrigger={() => {
          if (isAdmin) {
            setActiveTab('admin');
          } else {
            setIsAdminGateOpen(true);
          }
        }}
      />

    </div>
  );
}

