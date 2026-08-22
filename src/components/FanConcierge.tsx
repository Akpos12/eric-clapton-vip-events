import React, { useState, useId } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { SupportTicket } from '../types';
import { createSupportTicket, addSupportMessage } from '../lib/api';

interface FanConciergeProps {
  tickets: SupportTicket[];
  onOpenCheckTicket: () => void;
  onRequestMeetGreet: () => void;
  onRefreshTickets: () => void;
}

export const FanConcierge: React.FC<FanConciergeProps> = ({
  tickets,
  onOpenCheckTicket,
  onRequestMeetGreet,
  onRefreshTickets
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  // New ticket state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('VIP Inquiries');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const conciergeNameId = useId();
  const conciergeEmailId = useId();
  const conciergeBookingRefId = useId();
  const conciergeCategoryId = useId();
  const conciergeSubjectId = useId();

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

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

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !subject.trim() || !initialMessage.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      const ticketId = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket: SupportTicket = {
        id: ticketId,
        customerName,
        customerEmail,
        bookingRef,
        category,
        subject,
        status: 'Open',
        priority: category === 'VIP Inquiries' ? 'VIP Escalation' : 'Normal',
        messages: [
          {
            id: `msg-0`,
            sender: 'user',
            senderName: customerName,
            text: initialMessage,
            timestamp: new Date().toISOString()
          },
          {
            id: `msg-1`,
            sender: 'agent',
            senderName: 'VIP Concierge Dispatch',
            text: `Hello ${customerName}, your request #${ticketId} has been queued with the tour logistics desk. A specialist will update this channel shortly.`,
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createSupportTicket(newTicket);
      setShowNewTicketForm(false);
      setSelectedTicketId(ticketId);
      setSubject('');
      setInitialMessage('');
      onRefreshTickets();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create ticket.');
    }
  };

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-mono tracking-[0.3em] uppercase">
          <Headphones className="w-3.5 h-3.5" />
          <span>24/7 Dedicated Fan Concierge & Support</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5DC] tracking-tight">
          Fan Concierge & Live Inquiries
        </h2>
        <p className="text-sm sm:text-base text-[#F5F5DC]/70 font-light">
          Get real-time assistance with concert passes, VIP catering preferences, accessibility, and Meet & Greet liaison status.
        </p>
      </div>

      {/* Quick Assistance Actions Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenCheckTicket}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group"
        >
          <Ticket className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Check My Ticket</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Lookup #EC passes & QR gates</div>
        </button>

        <button
          onClick={onRequestMeetGreet}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group"
        >
          <Sparkles className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Meet & Greet Inquiry</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Check artist liaison review</div>
        </button>

        <button
          onClick={() => setShowNewTicketForm(true)}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group"
        >
          <MessageSquare className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Open Support Ticket</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Dedicated agent dispatch</div>
        </button>

        <button
          onClick={() => {
            const faqEl = document.getElementById('faq-section');
            if (faqEl) faqEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-5 bg-[#121214] border border-white/10 hover:border-[#D4AF37]/50 text-left transition-colors group"
        >
          <HelpCircle className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
          <div className="font-semibold text-xs text-[#F5F5DC] mt-2 font-serif">Browse FAQ & Policies</div>
          <div className="text-[10px] text-[#F5F5DC]/40 font-mono">Venue rules, refunds, timing</div>
        </button>
      </div>

      {/* Support Workspace */}
      <div className="bg-[#121214] border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        
        {/* Left Sidebar: Tickets List */}
        <div className="border-b lg:border-b-0 lg:border-r border-white/10 p-5 space-y-3 bg-[#0B0B0D]/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">
              Recent Conversations ({tickets.length})
            </span>
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="px-2.5 py-1 bg-[#D4AF37] text-black text-[10px] font-mono uppercase tracking-wider font-bold hover:bg-[#F5F5DC]"
            >
              + New Inquiry
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {tickets.map((t) => {
              const isSel = (activeTicket && activeTicket.id === t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicketId(t.id);
                    setShowNewTicketForm(false);
                  }}
                  className={`p-3.5 border cursor-pointer transition-colors ${
                    isSel
                      ? 'bg-[#1A1A1D] border-[#D4AF37]'
                      : 'bg-[#0B0B0D] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#D4AF37] font-medium">#{t.id}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                      t.status === 'Resolved' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-[#F5F5DC] mt-1 line-clamp-1">{t.subject}</h4>
                  <div className="text-[10px] text-[#F5F5DC]/50 mt-0.5 font-mono">{t.customerName} • {t.category}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Area: Ticket Conversation or New Form */}
        <div className="lg:col-span-2 p-6 flex flex-col justify-between min-h-[450px]">
          
          {showNewTicketForm ? (
            /* NEW TICKET FORM */
            <form onSubmit={handleCreateNewTicket} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">Create New Concierge Request</h3>
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="text-xs text-[#F5F5DC]/50 hover:text-white"
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
                  <label htmlFor={conciergeEmailId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Email Address *</label>
                  <input
                    id={conciergeEmailId}
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alexwtchmn@gmail.com"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={conciergeBookingRefId} className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Booking Ref (Optional)</label>
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
                    <option value="VIP Inquiries" className="bg-[#0B0B0D]">VIP Inquiries & Catering</option>
                    <option value="Ticket Lookup" className="bg-[#0B0B0D]">Ticket & Gate Pass Lookup</option>
                    <option value="Meet & Greet" className="bg-[#0B0B0D]">Meet & Greet Liaison</option>
                    <option value="Reschedule / Refund" className="bg-[#0B0B0D]">Reschedule / Refund Policy</option>
                    <option value="Venue & Accessibility" className="bg-[#0B0B0D]">Venue & Accessibility</option>
                    <option value="General Support" className="bg-[#0B0B0D]">General Tour Inquiries</option>
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
                  placeholder="e.g. VIP Dinner Dietary Requirement"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Message *</label>
                <textarea
                  rows={3}
                  required
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Describe your inquiry in detail..."
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Dispatch Inquiry
                </button>
              </div>
            </form>
          ) : activeTicket ? (
            /* ACTIVE TICKET THREAD */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Thread Header */}
              <div className="pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#D4AF37] font-bold">#{activeTicket.id}</span>
                    <span className="text-xs text-[#F5F5DC]/50 font-mono">({activeTicket.category})</span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#F5F5DC]">
                    {activeTicket.subject}
                  </h3>
                  {activeTicket.bookingRef && (
                    <span className="text-[11px] font-mono text-[#F5F5DC]/40">
                      Linked Pass: #{activeTicket.bookingRef}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono bg-[#1A1A1D] text-[#D4AF37] border border-white/10">
                    Priority: {activeTicket.priority}
                  </span>
                </div>
              </div>

              {/* Messages History */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 flex-1">
                {activeTicket.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-[#F5F5DC]/40 font-mono mb-1">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`p-3.5 max-w-lg text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#D4AF37] text-black font-medium'
                            : 'bg-[#1A1A1D] border border-white/10 text-[#F5F5DC]/90'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the concierge..."
                  className="flex-1 px-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>

            </div>
          ) : (
            <div className="text-center py-12 text-[#F5F5DC]/40 text-xs">
              No active support ticket selected.
            </div>
          )}

        </div>

      </div>

    </section>
  );
};
