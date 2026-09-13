import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Ticket, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink,
  Shield,
  Lock,
  FileCheck,
  Eye,
  Building2,
  MessageSquare,
  Copy,
  Check,
  XCircle,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { TicketOrder, MeetGreetRequest } from '../types';
import { getOrderById, getMeetGreetById, searchTickets, isLegacy15thTicket, validateTicketForScan } from '../lib/api';
import { downloadTicketPDF, downloadTicketPNG, generateTicketQRCode } from '../lib/ticketGenerator';

interface CheckTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
  onPurchaseNewTicketFor15th?: () => void;
  onOpenConciergeWithEmail?: (email: string, bookingRef?: string) => void;
  initialQuery?: string;
}

export const CheckTicketModal: React.FC<CheckTicketModalProps> = ({
  isOpen,
  onClose,
  onSelectEvent,
  onPurchaseNewTicketFor15th,
  onOpenConciergeWithEmail,
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [ticketOrder, setTicketOrder] = useState<TicketOrder | null>(null);
  const [matchedOrders, setMatchedOrders] = useState<TicketOrder[]>([]);
  const [meetGreet, setMeetGreet] = useState<MeetGreetRequest | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [viewProofModal, setViewProofModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectOrder = async (order: TicketOrder) => {
    const val = validateTicketForScan(order);
    setTicketOrder(val.order);
    const qr = await generateTicketQRCode(val.order);
    setQrCodeUrl(qr);
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const performSearch = async (queryText: string) => {
    const query = queryText.trim();
    if (!query) {
      setErrorMsg('Please enter a booking reference (#EC-...), Meet & Greet ID (MGR-...), or attendee email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setDownloadSuccessMsg('');
    setTicketOrder(null);
    setMatchedOrders([]);
    setMeetGreet(null);
    setQrCodeUrl('');

    try {
      if (query.toUpperCase().startsWith('MGR')) {
        const mgr = await getMeetGreetById(query);
        if (mgr) {
          setMeetGreet(mgr);
        } else {
          setErrorMsg(`No Meet & Greet request found with Reference "${query}". Please check the spelling or format.`);
        }
      } else {
        // Try direct order lookup
        let order = await getOrderById(query);
        let foundOrders: TicketOrder[] = [];
        if (order) {
          foundOrders = [order];
        } else {
          // Try email / keyword / attendee name search
          foundOrders = await searchTickets(query);
          if (foundOrders.length > 0) {
            order = foundOrders[0];
          }
        }

        setMatchedOrders(foundOrders);

        if (order) {
          await selectOrder(order);
        } else {
          // Fallback check if it might be an MGR
          const mgr = await getMeetGreetById(query);
          if (mgr) {
            setMeetGreet(mgr);
          } else {
            setErrorMsg(`No digital pass found for "${query}". Try searching with your booking ID (e.g., #EC-2026-89421) or email.`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred during pass validation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await performSearch(searchQuery);
  };

  const handlePurchaseNewTicket = () => {
    onClose();
    if (onPurchaseNewTicketFor15th) {
      onPurchaseNewTicketFor15th();
    } else if (onSelectEvent) {
      onSelectEvent('ec-stpaul-2026');
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketOrder) return;

    setIsExportingPdf(true);
    setErrorMsg('');
    setDownloadSuccessMsg('');
    try {
      await downloadTicketPDF('digital-pass-card-render', ticketOrder);
      setDownloadSuccessMsg(`Official Ticket PDF for #${ticketOrder.id} downloaded successfully!`);
      setTimeout(() => setDownloadSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Download ticket error:', err);
      setErrorMsg('Ticket generation encountered a delay. Retrying directly with native document generator...');
      try {
        await downloadTicketPDF('', ticketOrder);
        setDownloadSuccessMsg(`Official Ticket PDF for #${ticketOrder.id} generated & saved!`);
        setTimeout(() => setDownloadSuccessMsg(''), 6000);
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        setErrorMsg('Unable to download PDF. Please contact concierge support.');
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!ticketOrder) return;
    setIsExportingPng(true);
    setErrorMsg('');
    setDownloadSuccessMsg('');
    try {
      await downloadTicketPNG('digital-pass-card-render', ticketOrder);
      setDownloadSuccessMsg(`Pass image saved for #${ticketOrder.id}!`);
      setTimeout(() => setDownloadSuccessMsg(''), 6000);
    } catch (err) {
      console.error('PNG download error:', err);
      setErrorMsg('Unable to save pass image. Please try downloading as PDF.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const isLegacy15th = ticketOrder ? isLegacy15thTicket(ticketOrder) : false;
  const isOrderApproved = ticketOrder ? (ticketOrder.paymentStatus === 'Payment Confirmed' || ticketOrder.ticketStatus === 'TICKET ISSUED') : false;

  const getStatusBadge = (order: TicketOrder) => {
    if (isLegacy15thTicket(order) || order.ticketStatus === 'INVALID / LEGACY' || order.isLegacy) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500 font-mono tracking-wider">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          INVALID / LEGACY
        </span>
      );
    }
    if (order.paymentStatus === 'Payment Confirmed' || order.ticketStatus === 'TICKET ISSUED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" />
          TICKET ISSUED & CONFIRMED
        </span>
      );
    }
    if (order.paymentStatus === 'Payment Failed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
          <AlertCircle className="w-3.5 h-3.5" />
          PAYMENT DECLINED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
        <Clock className="w-3.5 h-3.5" />
        BOOKING CONFIRMED (AUDIT PENDING)
      </span>
    );
  };

  const getMgrStatusBadge = (status: MeetGreetRequest['status']) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIRMED
          </span>
        );
      case 'Awaiting Organizer Confirmation':
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-zinc-700/50 text-zinc-300 border border-zinc-600 font-mono">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const handleCopyLink = () => {
    if (!ticketOrder) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/?ticket=${encodeURIComponent(ticketOrder.id)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#121214] border border-[#D4AF37]/40 shadow-2xl overflow-hidden text-[#F5F5DC]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1D] border border-[#D4AF37]/30 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#F5F5DC]">
                Digital Pass & Ticket Lookup
              </h2>
              <p className="text-xs text-[#F5F5DC]/60 font-light">
                Retrieve your live concert credentials, QR gates pass, or Meet & Greet request status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC]/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Search input form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
              Enter Booking Ref, Ticket ID, MGR Code, or Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. #EC-2026-89421 or MGR-2026-44109 or fan@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm font-mono text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5 font-mono cursor-pointer"
              >
                {loading ? 'Searching...' : 'Locate Pass'}
              </button>
            </div>

            {/* Quick Demo Fillers */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#F5F5DC]/60">
              <span className="text-[#F5F5DC]/40 font-mono">Quick lookup references:</span>
              <button
                type="button"
                onClick={() => { setSearchQuery('EC-2026-95018'); performSearch('EC-2026-95018'); }}
                className="px-2 py-0.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 font-mono border border-emerald-700/50 cursor-pointer"
                title="Direct lookup of new valid 15th VIP pass"
              >
                #EC-2026-95018 (New Valid 15th Pass)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('EC-2026-15082'); performSearch('EC-2026-15082'); }}
                className="px-2 py-0.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-mono border border-rose-700/50 cursor-pointer"
                title="Test validation for previously issued 15th pass"
              >
                #EC-2026-15082 (15th Legacy Pass)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('marcus.vance@example.com'); performSearch('marcus.vance@example.com'); }}
                className="px-2 py-0.5 bg-[#1A1A1D] hover:bg-white/10 text-[#D4AF37] font-mono border border-white/10 cursor-pointer"
                title="Search by email holding both formal and new ticket"
              >
                marcus.vance@example.com (2 Passes)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('EC-2026-89421'); performSearch('EC-2026-89421'); }}
                className="px-2 py-0.5 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC]/80 font-mono border border-white/10 cursor-pointer"
              >
                #EC-2026-89421 (Detroit Pass)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('MGR-2026-44109'); performSearch('MGR-2026-44109'); }}
                className="px-2 py-0.5 bg-[#1A1A1D] hover:bg-white/10 text-[#D4AF37] font-mono border border-white/10 cursor-pointer"
              >
                MGR-2026-44109 (Meet & Greet)
              </button>
            </div>
          </form>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Download Success Banner */}
          {downloadSuccessMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>{downloadSuccessMsg}</div>
            </div>
          )}

          {/* 1. Ticket Order Found Display */}
          {ticketOrder && (
            <div className="space-y-4">
              
              {/* Multi-pass Switcher if attendee has multiple bookings under same email/name */}
              {matchedOrders.length > 1 && (
                <div className="p-4 bg-[#0B0B0D] border border-[#D4AF37]/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                        {matchedOrders.length} Passes Registered to this Attendee / Email
                      </span>
                    </div>
                    <span className="text-[11px] text-[#F5F5DC]/60 font-mono">
                      Select a pass below to switch view & download:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedOrders.map((ord) => {
                      const isSel = ticketOrder?.id === ord.id;
                      const isLeg = isLegacy15thTicket(ord);
                      return (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => selectOrder(ord)}
                          className={`p-3 text-left transition-all border cursor-pointer relative ${
                            isSel
                              ? isLeg
                                ? 'bg-rose-950/70 border-rose-500 ring-1 ring-rose-500'
                                : 'bg-[#1A1A1D] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                              : isLeg
                              ? 'bg-[#121214] border-rose-900/40 opacity-70 hover:opacity-100 hover:border-rose-700'
                              : 'bg-[#121214] border-white/10 opacity-80 hover:opacity-100 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-mono text-xs font-bold ${isLeg ? 'text-rose-400' : 'text-[#D4AF37]'}`}>
                              #{ord.id}
                            </span>
                            {isLeg ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                                Legacy (15th) — Void
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Valid Active Pass
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-[#F5F5DC] font-medium truncate">
                            {ord.eventSnapshot.eventName}
                          </div>
                          <div className="text-[10px] text-[#F5F5DC]/60 font-mono flex items-center justify-between mt-1">
                            <span>{ord.tierName} • {ord.quantity} Pass</span>
                            <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                          {isSel && (
                            <div className={`mt-2 text-[10px] font-mono flex items-center gap-1 ${isLeg ? 'text-rose-400 font-bold' : 'text-[#D4AF37] font-bold'}`}>
                              <span>▶ Selected for Download</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditional Alert / Status Callout */}
              {isLegacy15th ? (
                /* MANDATED INVALIDATION BANNER FOR 15th LEGACY TICKETS */
                <div className="p-5 bg-rose-950/95 border-2 border-rose-500 space-y-3 shadow-2xl">
                  <div className="flex items-start gap-3.5">
                    <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <div className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        VENUE CHECK-IN DENIED • LEGACY TICKET
                      </div>
                      <h3 className="font-mono text-sm sm:text-base font-bold text-white tracking-wide leading-snug">
                        TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.
                      </h3>
                      <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                        This pass was issued under the previous ticket inventory for the Eric Clapton concert on September 15, 2026 in St. Paul, MN. In accordance with updated tour admission regulations, this ticket cannot be checked in or accepted for arena entry. Historical transaction records remain retained for administrative and audit purposes.
                      </p>
                    </div>
                  </div>

                  {/* Purchase New Ticket Callout */}
                  <div className="pt-3 border-t border-rose-800/80 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePurchaseNewTicket}
                      className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-serif font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl cursor-pointer transition-transform active:scale-95"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Purchase New Ticket</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="text-[11px] font-mono text-rose-300 flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">VIP: $2,000 (2 Left)</span>
                      <span>•</span>
                      <span className="text-rose-400 font-medium line-through">Standard: $1,000 (SOLD OUT)</span>
                    </div>
                  </div>
                </div>
              ) : !isOrderApproved ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Booking Logged — Tour Audit In Progress</span>
                  </div>
                  <p className="text-xs text-[#F5F5DC]/80 font-light leading-relaxed">
                    Your official booking reference has been registered. You can download and save your official concert pass PDF and digital pass image below. The gate admission system is actively linked to your booking reference.
                  </p>
                  {ticketOrder.adminNotes && (
                    <div className="p-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC]/70 font-mono">
                      <strong>Admin Status Note:</strong> {ticketOrder.adminNotes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Payment Approved & Verified! Official gate passes are active and ready for immediate gate check-in.</span>
                </div>
              )}

              {/* Pass Visual Card */}
              <div
                id="digital-pass-card-render"
                className={`bg-[#0B0B0D] p-6 shadow-2xl relative overflow-hidden ${
                  isLegacy15th ? 'border-2 border-rose-500/80' : 'border border-[#D4AF37]'
                }`}
              >
                {/* Legacy Invalid Watermark Banner inside Pass */}
                {isLegacy15th && (
                  <div className="mb-4 p-3 bg-rose-950/90 border border-rose-600 flex items-center gap-2 text-rose-200 text-xs font-mono font-bold uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>DO NOT ACCEPT AT GATE — INVALID LEGACY INVENTORY PASS</span>
                  </div>
                )}

                {/* Top Badge and Booking Reference */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#D4AF37] font-bold tracking-wider">
                      REFERENCE: #{ticketOrder.id}
                    </span>
                    {ticketOrder.inventoryVersion && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1A1A1D] text-[#F5F5DC]/60 border border-white/10">
                        {ticketOrder.inventoryVersion.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(ticketOrder)}</div>
                </div>

                {/* Concert Headings */}
                <div className="py-4 space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#D4AF37]">
                    ERIC CLAPTON VIP EXPERIENCE PASS
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F5DC] leading-tight">
                    {ticketOrder.eventSnapshot.eventName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#F5F5DC]/70 pt-2 font-mono">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{ticketOrder.eventSnapshot.venue}, {ticketOrder.eventSnapshot.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Date: {ticketOrder.eventSnapshot.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Doors: {ticketOrder.eventSnapshot.doorsOpen} | Show: {ticketOrder.eventSnapshot.concertTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span className="font-semibold text-[#D4AF37]">{ticketOrder.tierName} ({ticketOrder.quantity}x Passes)</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Details & QR or Locked Matrix */}
                <div className="my-4 p-4 bg-[#121214] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-2 text-xs">
                    <div>
                      <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Primary Attendee:</span>
                      <span className="text-[#F5F5DC] font-serif font-bold text-sm">{ticketOrder.attendee.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Section / Allocation:</span>
                      <span className="text-[#D4AF37] font-mono font-medium">{ticketOrder.seatInfo}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Payment Method Used:</span>
                      <span className="text-[#F5F5DC]/80 font-mono text-[11px]">{ticketOrder.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Total Paid:</span>
                      <span className="text-[#D4AF37] font-mono font-bold">${ticketOrder.pricing?.total?.toLocaleString() || '0'} USD</span>
                    </div>
                  </div>

                  {/* QR code box */}
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    {qrCodeUrl ? (
                      <div className="relative bg-white p-2 text-center shadow-lg">
                        <img
                          src={qrCodeUrl}
                          alt="Eric Clapton Concert Ticket QR"
                          className={`w-28 h-28 object-contain mx-auto ${isLegacy15th ? 'opacity-20 grayscale' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                        {isLegacy15th && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-rose-950/90 text-center">
                            <XCircle className="w-6 h-6 text-rose-400 mb-1" />
                            <span className="text-[10px] font-mono text-white font-bold uppercase tracking-wider leading-tight">
                              TICKET INVALID
                            </span>
                            <span className="text-[8px] font-mono text-rose-300 uppercase mt-0.5">
                              NOT VALID FOR 15TH
                            </span>
                          </div>
                        )}
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block mt-1 ${
                          isLegacy15th ? 'text-rose-600' : 'text-black'
                        }`}>
                          {isLegacy15th ? 'GATE ACCESS DENIED' : 'ERIC CLAPTON GATE PASS'}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-600 block mt-0.5 max-w-[130px] leading-tight">
                          {isLegacy15th 
                            ? 'Do not accept at venue entrance' 
                            : isOrderApproved 
                            ? 'Live gate scanner pass' 
                            : 'Verified reservation barcode'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full bg-[#1A1A1D] border border-amber-500/30 p-4 space-y-2">
                        <QrCode className="w-8 h-8 text-[#D4AF37] mx-auto animate-pulse" />
                        <span className="text-[10px] font-mono text-[#D4AF37] font-bold uppercase tracking-wider block">
                          Generating Pass
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Proof Preview for Attendee */}
                {ticketOrder.paymentProofUrl && (
                  <div className="p-3 bg-[#121214] border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[#F5F5DC]/80 truncate max-w-[200px] sm:max-w-xs">
                        Proof: {ticketOrder.paymentProofFileName || 'Payment Receipt Attached'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewProofModal(true)}
                      className="text-[#D4AF37] hover:text-white flex items-center gap-1 underline cursor-pointer text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                )}

                {/* Verification Notice */}
                <div className="pt-3 text-[10px] text-[#F5F5DC]/50 border-t border-white/10 flex items-center justify-between font-mono">
                  <span>Pass Ref: #{ticketOrder.id}</span>
                  <span className="flex items-center gap-1 text-[#D4AF37]">
                    <Shield className="w-3 h-3" /> Eric Clapton Tour Security
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {isLegacy15th ? (
                    <>
                      <button
                        type="button"
                        onClick={handlePurchaseNewTicket}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-serif font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Purchase New Ticket for 15th</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        disabled={isExportingPdf}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1D] hover:bg-white/10 text-rose-300 border border-rose-800/60 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        title="Download audit copy for your records (marked INVALID)"
                      >
                        <Download className="w-4 h-4 text-rose-400" />
                        <span>{isExportingPdf ? 'Generating...' : 'Audit Copy (PDF - Marked Invalid)'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        disabled={isExportingPdf}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isExportingPdf ? 'Generating PDF Ticket...' : 'Download Printable PDF Ticket'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPNG}
                        disabled={isExportingPng}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC] border border-white/10 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        title="Save pass as digital image to your device photos"
                      >
                        <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                        <span>{isExportingPng ? 'Saving Image...' : 'Save PNG Pass'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#121214] hover:bg-[#1A1A1D] text-[#F5F5DC] border border-white/10 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                        title="Copy direct verification link for this concert pass"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Pass Link'}</span>
                      </button>
                    </>
                  )}

                  {onOpenConciergeWithEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenConciergeWithEmail(ticketOrder.attendee.email, ticketOrder.id);
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#121214] hover:bg-[#1A1A1D] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                      <span>Message Customer Care</span>
                    </button>
                  )}
                </div>

                {onSelectEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectEvent(ticketOrder.eventId);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#F5F5DC] font-mono uppercase tracking-wider cursor-pointer"
                  >
                    <span>View Concert Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Meet & Greet Request Found Display */}
          {meetGreet && (
            <div className="bg-[#0B0B0D] border border-[#D4AF37]/50 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="font-mono text-xs text-[#D4AF37] font-bold">
                  MEET & GREET APPLICATION: #{meetGreet.id}
                </div>
                <div>{getMgrStatusBadge(meetGreet.status)}</div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5F5DC]/40">
                  REQUEST DETAILS
                </div>
                <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">
                  {meetGreet.eventName}
                </h3>
                <div className="text-xs text-[#F5F5DC]/70 font-mono">
                  Date: {meetGreet.eventDate} | Venue: {meetGreet.venue}
                </div>
              </div>

              <div className="p-4 bg-[#121214] border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#F5F5DC]/50">Applicant:</span>
                  <span className="font-bold text-[#F5F5DC]">{meetGreet.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5DC]/50">Guests:</span>
                  <span className="text-[#D4AF37]">{meetGreet.guestCount} Persons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5DC]/50">Lounge Tier:</span>
                  <span className="text-[#F5F5DC]">{meetGreet.tierPreference}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Proof Image View Modal */}
      {viewProofModal && ticketOrder?.paymentProofUrl && (
        <div className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#121214] border border-white/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#D4AF37] font-bold">
                Submitted Proof of Payment: {ticketOrder.paymentProofFileName || 'Receipt'}
              </span>
              <button
                type="button"
                onClick={() => setViewProofModal(false)}
                className="p-1 text-[#F5F5DC]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black">
              <img
                src={ticketOrder.paymentProofUrl}
                alt="Payment Proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
