import React, { useState, useEffect, useId } from 'react';
import { 
  Headphones, 
  Search, 
  Send, 
  MessageSquare, 
  Ticket, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SupportTicket, TicketOrder } from '../types';
import { createSupportTicket, addSupportMessage, getOrdersByEmail } from '../lib/api';

interface FanConciergeProps {
  tickets: SupportTicket[];
  orders?: TicketOrder[];
  initialEmail?: string;
  onOpenCheckTicket: () => void;
  onRequestMeetGreet: () => void;
  onRefreshTickets: () => void;
}

export const FanConcierge: React.FC<FanConciergeProps> = ({
  tickets,
  orders = [],
  initialEmail = '',
  onOpenCheckTicket,
  onRequestMeetGreet,
  onRefreshTickets
}) => {
  // Email search/filter state
  const [lookupEmail, setLookupEmail] = useState<string>(() => {
    const saved = localStorage.getItem('ec_vip_fan_email');
    if (saved && saved.toLowerCase() === 'alexwtchmn@gmail.com') {
      localStorage.removeItem('ec_vip_fan_email');
      return initialEmail || '';
    }
    return initialEmail || saved || '';
  });
  const [appliedEmailFilter, setAppliedEmailFilter] = useState<string>(() => {
    const saved = localStorage.getItem('ec_vip_fan_email');
    if (saved && saved.toLowerCase() === 'alexwtchmn@gmail.com') {
      localStorage.removeItem('ec_vip_fan_email');
      return initialEmail || '';
    }
    return initialEmail || saved || '';
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  // New ticket state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(appliedEmailFilter || '');
  const [bookingRef, setBookingRef] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('VIP Inquiries');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Linked orders matching filter
  const [linkedOrders, setLinkedOrders] = useState<TicketOrder[]>([]);

  const conciergeNameId = useId();
  const conciergeEmailId = useId();
  const conciergeBookingRefId = useId();
  const conciergeCategoryId = useId();
  const conciergeSubjectId = useId();
  const emailSearchInputId = useId();

  // Filtered tickets based on email if applied
  const filteredTickets = appliedEmailFilter.trim()
    ? tickets.filter(t => t.customerEmail?.toLowerCase() === appliedEmailFilter.trim().toLowerCase())
    : tickets;

  // Active selected ticket
  const activeTicket = tickets.find(t => t.id === selectedTicketId) || filteredTickets[0] || tickets[0];

  // Sync selectedTicketId on filter change
  useEffect(() => {
    if (filteredTickets.length > 0) {
      if (!filteredTickets.some(t => t.id === selectedTicketId)) {
        setSelectedTicketId(filteredTickets[0].id);
      }
    }
  }, [appliedEmailFilter, filteredTickets, selectedTicketId]);

  // Load matching orders for email
  useEffect(() => {
    const fetchOrdersForEmail = async () => {
      if (appliedEmailFilter.trim()) {
        const matching = await getOrdersByEmail(appliedEmailFilter.trim());
        setLinkedOrders(matching);
      } else {
        setLinkedOrders([]);
      }
    };
    fetchOrdersForEmail();
  }, [appliedEmailFilter, orders]);

  const handleApplyEmailFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = lookupEmail.trim();
    setAppliedEmailFilter(clean);
    if (clean) {
      localStorage.setItem('ec_vip_fan_email', clean);
      setCustomerEmail(clean);
    }
    setShowNewTicketForm(false);
  };

  const handleClearEmailFilter = () => {
    setLookupEmail('');
    setAppliedEmailFilter('');
    localStorage.removeItem('ec_vip_fan_email');
    if (tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setIsSending(true);
    try {
      await addSupportMessage(activeTicket.id, 'user', activeTicket.customerName || 'Fan', replyText.trim());
      setReplyText('');
      onRefreshTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenNewInquiryForOrder = (order: TicketOrder) => {
    setCustomerName(order.attendee?.fullName || '');
    setCustomerEmail(order.attendee?.email || appliedEmailFilter || '');
    setBookingRef(order.id);
    setCategory(order.tierName.includes('VIP') ? 'VIP Inquiries' : 'Ticket Lookup');
    setSubject(`Inquiry regarding Booking #${order.id} (${order.eventSnapshot.eventName})`);
    setInitialMessage('');
    setShowNewTicketForm(true);
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!customerName.trim() || !customerEmail.trim() || !subject.trim() || !initialMessage.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, Subject, and Message).');
      return;
    }

    try {
      const ticketId = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket: SupportTicket = {
        id: ticketId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        bookingRef: bookingRef.trim() || undefined,
        category,
        subject: subject.trim(),
        status: 'Open',
        priority: category === 'VIP Inquiries' ? 'VIP Escalation' : 'Normal',
        messages: [
          {
            id: `msg-${Date.now()}-0`,
            sender: 'user',
            senderName: customerName.trim(),
            text: initialMessage.trim(),
            timestamp: new Date().toISOString()
          },
          {
            id: `msg-${Date.now()}-1`,
            sender: 'agent',
            senderName: 'VIP Concierge Dispatch',
            text: `Hello ${customerName.trim()}, your support request #${ticketId} has been logged directly with our tour operations team. A dedicated concierge specialist will respond here shortly. You can track this conversation at any time by entering ${customerEmail.trim().toLowerCase()}.`,
            timestamp: new Date(Date.now() + 1000).toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createSupportTicket(newTicket);
      
      // Update filter to this email so they see it immediately
      setAppliedEmailFilter(customerEmail.trim().toLowerCase());
      setLookupEmail(customerEmail.trim().toLowerCase());
      localStorage.setItem('ec_vip_fan_email', customerEmail.trim().toLowerCase());

      setShowNewTicketForm(false);
      setSelectedTicketId(ticketId);
      setSubject('');
      setInitialMessage('');
      setSuccessMsg(`Your inquiry #${ticketId} has been submitted. You can continue chatting directly below!`);
      onRefreshTickets();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create customer care ticket. Please try again.');
    }
  };

  return (
    <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-mono tracking-[0.3em] uppercase">
          <Headphones className="w-3.5 h-3.5" />
          <span>24/7 Dedicated Fan Concierge & Customer Care</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5DC] tracking-tight">
          Customer Care & Live Inquiry Tracker
        </h2>
        <p className="text-sm sm:text-base text-[#F5F5DC]/70 font-light">
          Track active support tickets, chat live with tour logistics, and verify VIP seating or payment status by simply entering the email used during ticket booking.
        </p>
      </div>

      {/* QUICK EMAIL LOOKUP & INQUIRY TRACKER BAR */}
      <div className="p-6 bg-[#121214] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#F5F5DC]">
                Track Inquiries & Live Chat by Booking Email
              </h3>
              <p className="text-xs text-[#F5F5DC]/60 font-light">
                Input your ticket booking email to view all your conversation threads, reply in real-time, or start a new inquiry.
              </p>
            </div>
          </div>

          {appliedEmailFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tracking: {appliedEmailFilter}</span>
              </span>
              <button
                type="button"
                onClick={handleClearEmailFilter}
                className="text-xs text-[#F5F5DC]/60 hover:text-white underline font-mono cursor-pointer"
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* Email input form */}
        <form onSubmit={handleApplyEmailFilter} className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/70" />
            <input
              id={emailSearchInputId}
              type="email"
              required
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="e.g. yourname@example.com (email used when booking)"
              className="w-full pl-10 pr-4 py-3 bg-[#0B0B0D] border border-white/15 text-xs sm:text-sm text-[#F5F5DC] placeholder:text-[#F5F5DC]/30 focus:outline-none focus:border-[#D4AF37] font-mono transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15"
          >
            <Search className="w-4 h-4" />
            <span>Track & Open Chat</span>
          </button>
          {appliedEmailFilter && (
            <button
              type="button"
              onClick={() => {
                setCustomerEmail(appliedEmailFilter);
                setCustomerName(linkedOrders[0]?.attendee?.fullName || '');
                setBookingRef(linkedOrders[0]?.id || '');
                setShowNewTicketForm(true);
              }}
              className="px-5 py-3 bg-[#1A1A1D] hover:bg-white/10 text-[#D4AF37] font-bold text-xs uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 border border-[#D4AF37]/40 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>+ New Message</span>
            </button>
          )}
        </form>

        {/* LINKED BOOKINGS RIBBON FOR THIS EMAIL */}
        {appliedEmailFilter && linkedOrders.length > 0 && (
          <div className="p-3.5 bg-[#0B0B0D] border border-white/10 space-y-2 mt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5" />
                <span>Found {linkedOrders.length} Ticket Booking(s) Linked to {appliedEmailFilter}</span>
              </span>
              <span className="text-[#F5F5DC]/40 text-[10px]">Click any pass to message customer care</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {linkedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 bg-[#121214] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#D4AF37]">#{ord.id}</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-mono uppercase ${
                        ord.paymentStatus === 'Payment Confirmed' || ord.ticketStatus === 'TICKET ISSUED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {ord.ticketStatus}
                      </span>
                    </div>
                    <div className="font-serif font-bold text-[#F5F5DC] truncate">{ord.eventSnapshot.eventName}</div>
                    <div className="text-[10px] text-[#F5F5DC]/50 font-mono">
                      {ord.eventSnapshot.city} • {ord.quantity}x {ord.tierName}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenNewInquiryForOrder(ord)}
                    className="px-3 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-mono font-bold text-[10px] uppercase tracking-wider border border-[#D4AF37]/40 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    title="Start inquiry specifically for this booking"
                  >
                    <span>Message Support</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Assistance Actions Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenCheckTicket}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group cursor-pointer"
        >
          <Ticket className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Check My Ticket</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Lookup #EC passes & QR gates</div>
        </button>

        <button
          onClick={onRequestMeetGreet}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Meet & Greet Liaison</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Check artist liaison status</div>
        </button>

        <button
          onClick={() => {
            setCustomerEmail(appliedEmailFilter || '');
            setShowNewTicketForm(true);
          }}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Open New Support Thread</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Dedicated agent dispatch</div>
        </button>

        <button
          onClick={() => {
            const faqEl = document.getElementById('faq-section');
            if (faqEl) faqEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Browse FAQ & Policies</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Venue rules, refunds, timing</div>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white font-mono">✕</button>
        </div>
      )}

      {/* Support Workspace */}
      <div className="bg-[#121214] border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[550px]">
        
        {/* Left Sidebar: Tickets List */}
        <div className="border-b lg:border-b-0 lg:border-r border-white/10 p-5 space-y-3 bg-[#0B0B0D]/60 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>
                  {appliedEmailFilter ? `Inquiries for ${appliedEmailFilter}` : `All Inquiries`} ({filteredTickets.length})
                </span>
              </span>
              <button
                onClick={() => {
                  setCustomerEmail(appliedEmailFilter || '');
                  setShowNewTicketForm(true);
                }}
                className="px-2.5 py-1 bg-[#D4AF37] text-black text-[10px] font-mono uppercase tracking-wider font-bold hover:bg-[#F5F5DC] transition-colors cursor-pointer"
              >
                + New Inquiry
              </button>
            </div>

            {appliedEmailFilter && (
              <div className="p-2.5 bg-[#121214] border border-white/10 flex items-center justify-between text-[11px] font-mono text-[#F5F5DC]/70">
                <span className="truncate">Filter: {appliedEmailFilter}</span>
                <button
                  onClick={handleClearEmailFilter}
                  className="text-[#D4AF37] hover:underline text-[10px] shrink-0 ml-2"
                >
                  Show All ({tickets.length})
                </button>
              </div>
            )}

            {filteredTickets.length === 0 ? (
              <div className="p-6 text-center space-y-3 bg-[#121214]/60 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#F5F5DC]/40">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs text-[#F5F5DC]/70 font-mono">
                  No active inquiry found for <br/><strong className="text-[#D4AF37]">{appliedEmailFilter}</strong>
                </div>
                <p className="text-[11px] text-[#F5F5DC]/50">
                  Would you like to start a new inquiry or live chat with customer care?
                </p>
                <button
                  onClick={() => {
                    setCustomerEmail(appliedEmailFilter);
                    setShowNewTicketForm(true);
                  }}
                  className="w-full py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider font-mono hover:bg-[#F5F5DC] transition-colors cursor-pointer"
                >
                  Start New Inquiry
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {filteredTickets.map((t) => {
                  const isSel = (activeTicket && activeTicket.id === t.id && !showNewTicketForm);
                  const lastMsg = t.messages[t.messages.length - 1];
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setShowNewTicketForm(false);
                      }}
                      className={`p-3.5 border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-[#1A1A1D] border-[#D4AF37] shadow-md shadow-[#D4AF37]/10'
                          : 'bg-[#0B0B0D] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#D4AF37] font-bold">#{t.id}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                          t.status === 'Resolved' 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : t.status === 'In Progress'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-xs text-[#F5F5DC] mt-1 line-clamp-1">{t.subject}</h4>
                      {lastMsg && (
                        <p className="text-[11px] text-[#F5F5DC]/60 mt-1 line-clamp-1 italic">
                          "{lastMsg.text}"
                        </p>
                      )}
                      <div className="text-[10px] text-[#F5F5DC]/40 mt-1.5 font-mono flex items-center justify-between">
                        <span>{t.category}</span>
                        <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 text-[10px] text-[#F5F5DC]/40 font-mono flex items-center justify-between">
            <span>Customer Care Liaison</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online (Live Dispatch)
            </span>
          </div>
        </div>

        {/* Right Main Area: Ticket Conversation or New Form */}
        <div className="lg:col-span-2 p-6 flex flex-col justify-between min-h-[480px]">
          
          {showNewTicketForm ? (
            /* NEW TICKET FORM */
            <form onSubmit={handleCreateNewTicket} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">DISPATCH TICKET</span>
                  <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">Message Customer Care & Concierge</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="text-xs text-[#F5F5DC]/50 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={conciergeNameId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Full Name *</label>
                  <input
                    id={conciergeNameId}
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="David Sterling"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label htmlFor={conciergeEmailId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Booking Email Address *</label>
                  <input
                    id={conciergeEmailId}
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={conciergeBookingRefId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Booking Reference (Optional)</label>
                  <input
                    id={conciergeBookingRefId}
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="e.g. #EC-2026-89421"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>
                <div>
                  <label htmlFor={conciergeCategoryId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Inquiry Category</label>
                  <select
                    id={conciergeCategoryId}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="VIP Inquiries" className="bg-[#0B0B0D]">VIP Hospitality & Seating</option>
                    <option value="Ticket Lookup" className="bg-[#0B0B0D]">Payment Verification & Gate Pass</option>
                    <option value="Meet & Greet" className="bg-[#0B0B0D]">Meet & Greet Liaison</option>
                    <option value="Venue & Accessibility" className="bg-[#0B0B0D]">Venue & Dietary Requirements</option>
                    <option value="Reschedule / Refund" className="bg-[#0B0B0D]">Reschedule / Refund Inquiries</option>
                    <option value="General Support" className="bg-[#0B0B0D]">General Tour Questions</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={conciergeSubjectId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Subject *</label>
                <input
                  id={conciergeSubjectId}
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Confirming wire payment verification for Detroit tour date"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Message for Customer Care Desk *</label>
                <textarea
                  rows={4}
                  required
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Please provide any details about your tickets, special seating needs, dietary preferences, or payment status..."
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-4 py-2 bg-[#1A1A1D] text-xs font-mono uppercase text-[#F5F5DC]/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono transition-colors cursor-pointer shadow-lg shadow-[#D4AF37]/20"
                >
                  Send Message & Start Tracking
                </button>
              </div>
            </form>
          ) : activeTicket ? (
            /* ACTIVE TICKET THREAD */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Thread Header */}
              <div className="pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#D4AF37] font-bold">#{activeTicket.id}</span>
                    <span className="text-xs text-[#F5F5DC]/50 font-mono">({activeTicket.category})</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase ${
                      activeTicket.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    }`}>
                      {activeTicket.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#F5F5DC] mt-0.5">
                    {activeTicket.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#F5F5DC]/50 mt-1">
                    <span>Sender: <strong className="text-[#F5F5DC]">{activeTicket.customerName}</strong> ({activeTicket.customerEmail})</span>
                    {activeTicket.bookingRef && (
                      <span className="text-[#D4AF37] font-bold">
                        Linked Booking: #{activeTicket.bookingRef}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[11px] font-mono bg-[#1A1A1D] text-[#D4AF37] border border-white/10">
                    Priority: {activeTicket.priority}
                  </span>
                  <button
                    onClick={() => onRefreshTickets()}
                    className="p-1.5 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC]/70 hover:text-white border border-white/10"
                    title="Refresh thread"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages History Stream */}
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2 flex-1 my-2">
                {activeTicket.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-[#F5F5DC]/50 font-mono mb-1 flex items-center gap-1.5">
                        {isAgent && <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />}
                        <span className={isAgent ? 'text-[#D4AF37] font-semibold' : ''}>{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div
                        className={`p-4 max-w-xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#D4AF37] text-black font-medium shadow-md shadow-black/40'
                            : 'bg-[#1A1A1D] border border-white/15 text-[#F5F5DC]/95 shadow-md shadow-black/40'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to customer care as ${appliedEmailFilter || activeTicket.customerName || 'Fan'}...`}
                    className="flex-1 px-4 py-3 bg-[#0B0B0D] border border-white/15 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase font-mono disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-[#D4AF37]/15"
                  >
                    {isSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
                <div className="text-[10px] text-[#F5F5DC]/40 font-mono flex items-center justify-between">
                  <span>Messages are received directly by the 2026 Tour Logistics & VIP Hospitality desk.</span>
                  <span>Ticket Reference: #{activeTicket.id}</span>
                </div>
              </form>

            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <MessageSquare className="w-8 h-8 text-[#D4AF37]/40 mx-auto" />
              <p className="text-xs text-[#F5F5DC]/50 font-mono">
                No active support ticket selected. Enter your email above or click "+ New Inquiry" to message customer care.
              </p>
            </div>
          )}

        </div>

      </div>

    </section>
  );
};
