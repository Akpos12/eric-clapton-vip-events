import React, { useState, useEffect, useId, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Lock, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Copy,
  Check,
  Building2,
  Wallet,
  Smartphone,
  Eye,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConcertEvent, TicketTierConfig, TicketOrder, TicketAttendee, PricingBreakdown, PaymentMethodConfig } from '../types';
import { createTicketOrder, getPaymentMethods } from '../lib/api';
import { generateTicketQRCode } from '../lib/ticketGenerator';

interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ConcertEvent | null;
  initialTierId?: string;
  onOrderCompleted?: (order: TicketOrder) => void;
  onOpenConciergeWithEmail?: (email: string, bookingRef?: string) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  initialTierId,
  onOrderCompleted,
  onOpenConciergeWithEmail
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTierId, setSelectedTierId] = useState<string>(
    initialTierId || (event?.ticketCategories[0]?.id ?? '')
  );
  const [quantity, setQuantity] = useState<number>(2);
  
  // Step 2: Attendee Info
  const [attendee, setAttendee] = useState<TicketAttendee>({
    fullName: '',
    email: '',
    phone: '',
    country: 'United States',
    guestCount: 2,
    accessibilityRequirements: '',
    specialRequests: ''
  });

  // Step 3: Payment Methods & Proof
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Proof of Payment
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<TicketOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const nameInputId = useId();
  const emailInputId = useId();
  const phoneInputId = useId();
  const countryInputId = useId();

  // Load configured payment methods from Firestore/Local storage
  useEffect(() => {
    if (isOpen) {
      getPaymentMethods().then(methods => {
        const active = methods.filter(m => m.isActive);
        setPaymentMethods(active);
        if (active.length > 0 && !selectedMethodId) {
          setSelectedMethodId(active[0].id);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialTierId) {
      setSelectedTierId(initialTierId);
    } else if (event?.ticketCategories?.length) {
      setSelectedTierId(event.ticketCategories[0].id);
    }
  }, [initialTierId, event]);

  if (!isOpen || !event) return null;

  const currentTier: TicketTierConfig = 
    event.ticketCategories.find(t => t.id === selectedTierId) || event.ticketCategories[0];

  // Price calculations
  const unitPrice = currentTier ? currentTier.price : event.startingPrice;
  const subtotal = unitPrice * quantity;
  // User mandate: total addition must not exceed $150 (making $1,800 ticket total $1,950)
  const serviceFee = 100; // Flat VIP Concierge & Hospitality Handling
  const facilityFee = 50; // Venue Security & Gate Access Handling
  const taxes = 0; // Applicable local & state taxes included in ticket pricing
  const total = subtotal + serviceFee + facilityFee + taxes;

  const pricing: PricingBreakdown = {
    subtotal,
    serviceFee,
    facilityFee,
    taxes,
    total,
    currency: 'USD'
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethodId) || paymentMethods[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    
    setProofFileName(file.name);
    setProofFileSize(sizeFormatted);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setProofImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setProofImage(null);
    setProofFileName('');
    setProofFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleNextStep1 = () => {
    if (quantity < 1) {
      setErrorMsg('Please select at least 1 ticket.');
      return;
    }
    if (quantity > currentTier.available) {
      setErrorMsg(`Only ${currentTier.available} tickets available in this category.`);
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendee.fullName.trim() || !attendee.email.trim()) {
      setErrorMsg('Please provide your full name and valid email address.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleProcessPayment = async () => {
    if (!proofImage) {
      setErrorMsg('Please attach your proof of payment (screenshot or photo receipt) from your gallery or camera before submitting.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const randomRefNum = Math.floor(10000 + Math.random() * 90000);
      const bookingId = `EC-2026-${randomRefNum}`;
      const txId = `tx_${selectedPaymentMethod?.category || 'transfer'}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const qrPayload = `EC-PASS-${bookingId}-${event.id}-${currentTier.id}-QTY${quantity}`;

      const newOrder: TicketOrder = {
        id: bookingId,
        eventId: event.id,
        eventSnapshot: {
          eventName: event.eventName,
          venue: event.venue,
          city: event.city,
          country: event.country,
          eventDate: event.eventDate,
          doorsOpen: event.doorsOpen,
          concertTime: event.concertTime,
          heroImage: event.heroImage
        },
        tierId: currentTier.id,
        tierName: currentTier.name,
        quantity,
        seatInfo: currentTier.sectionInfo || `${currentTier.name} Section`,
        attendee: { ...attendee, guestCount: quantity },
        pricing,
        paymentMethod: selectedPaymentMethod?.name || 'Bank Transfer',
        paymentMethodDetails: selectedPaymentMethod?.accountNumberOrHandle || '',
        paymentProofUrl: proofImage,
        paymentProofFileName: proofFileName || 'payment_receipt.jpg',
        paymentProofUploadedAt: new Date().toISOString(),
        paymentStatus: 'Payment Pending',
        ticketStatus: 'PAYMENT PENDING',
        transactionId: txId,
        qrPayload,
        entryInstructions: `Present your approved pass at ${event.venue} VIP / General Gates. Doors open ${event.doorsOpen}.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Persist in Firestore & Local Storage
      await createTicketOrder(newOrder);
      setCompletedOrder(newOrder);
      
      // Trigger subtle celebratory feedback
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F9E79F', '#FFFFFF', '#AA7C11']
        });
      } catch (cErr) {
        console.warn('Confetti effect silent fallback:', cErr);
      }

      setStep(4);
      if (onOrderCompleted) onOrderCompleted(newOrder);
    } catch (err) {
      console.error(err);
      setErrorMsg('Booking submission could not be finalized. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentIcon = (cat?: string) => {
    switch (cat) {
      case 'bank': return Building2;
      case 'zelle': return Smartphone;
      case 'cashapp': return DollarSign;
      case 'paypal': return ShieldCheck;
      case 'crypto': return Wallet;
      default: return CreditCard;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-[#121214] border border-[#D4AF37]/40 shadow-2xl overflow-hidden text-[#F5F5DC]">
        
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0B0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1D] border border-[#D4AF37]/30 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37]">
                OFFICIAL VIP CHECKOUT & CONCIERGE
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F5F5DC] line-clamp-1">
                {event.eventName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC]/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-[#0B0B0D] px-6 py-3.5 border-b border-white/10 flex items-center justify-between text-xs font-mono uppercase tracking-widest">
          {[
            { num: 1, label: 'Tickets' },
            { num: 2, label: 'Attendee' },
            { num: 3, label: 'Payment & Proof' },
            { num: 4, label: 'Confirmation' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.num
                    ? 'bg-[#D4AF37] text-black'
                    : step > s.num
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#1A1A1D] text-[#F5F5DC]/40'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`hidden sm:inline text-[10px] ${step === s.num ? 'text-[#D4AF37] font-bold' : 'text-[#F5F5DC]/40'}`}>
                {s.label}
              </span>
              {s.num < 4 && <div className="hidden sm:block w-8 h-[1px] bg-white/10 mx-2" />}
            </div>
          ))}
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* STEP 1: TIER & QUANTITY SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Event Mini Summary */}
              <div className="p-4 bg-[#0B0B0D] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider">CONCERT DATE & VENUE</div>
                  <div className="font-serif font-bold text-sm text-[#F5F5DC]">{event.venue}, {event.city}</div>
                  <div className="text-[#F5F5DC]/60 font-mono">Date: {event.eventDate} | Doors {event.doorsOpen} | Show {event.concertTime}</div>
                </div>
                {event.specialGuests && (
                  <div className="text-right text-[11px] font-mono text-[#D4AF37]/90 bg-[#121214] px-3 py-1.5 border border-[#D4AF37]/20">
                    Guest: {event.specialGuests}
                  </div>
                )}
              </div>

              {/* Tiers List */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  Select Ticket / VIP Experience Category
                </label>
                <div className="space-y-2.5">
                  {event.ticketCategories.map((t) => {
                    const isSelected = selectedTierId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTierId(t.id)}
                        className={`p-4 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A1A1D] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5'
                            : 'bg-[#0B0B0D] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-base text-[#F5F5DC]">{t.name}</span>
                              {t.badge && (
                                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                                  {t.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#F5F5DC]/70 font-light">{t.description}</p>
                            {t.sectionInfo && (
                              <div className="text-[11px] font-mono text-[#D4AF37]/80 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {t.sectionInfo}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-serif text-lg font-bold text-[#D4AF37]">${t.price.toLocaleString()}</div>
                            <div className="text-[10px] text-[#F5F5DC]/40 font-mono">{t.available} Left</div>
                          </div>
                        </div>

                        {isSelected && t.benefits && t.benefits.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#F5F5DC]/80">
                            {t.benefits.map((b, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="p-4 bg-[#0B0B0D] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#F5F5DC]">Number of Passes</div>
                  <div className="text-[11px] text-[#F5F5DC]/50 font-mono">Max 6 per order under VIP protocol</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 bg-[#1A1A1D] hover:bg-white/10 text-white font-mono text-sm border border-white/10 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-serif text-lg font-bold w-6 text-center text-[#D4AF37]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(6, currentTier.available, quantity + 1))}
                    className="w-8 h-8 bg-[#1A1A1D] hover:bg-white/10 text-white font-mono text-sm border border-white/10 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs font-mono text-[#F5F5DC]/60">
                  Subtotal: <strong className="text-[#D4AF37]">${subtotal.toLocaleString()} USD</strong>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase transition-colors flex items-center gap-2 font-mono cursor-pointer"
                >
                  <span>Continue to Attendee Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ATTENDEE DETAILS */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <div className="text-xs text-[#F5F5DC]/70 font-light pb-2">
                Please enter the primary passholder information as it appears on government-issued photo identification for arena entrance check-in.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={nameInputId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Primary Attendee Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={nameInputId}
                      type="text"
                      required
                      value={attendee.fullName}
                      onChange={(e) => setAttendee({ ...attendee, fullName: e.target.value })}
                      placeholder="e.g. David Sterling"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={emailInputId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Email Address (For Pass & Status) *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={emailInputId}
                      type="email"
                      required
                      value={attendee.email}
                      onChange={(e) => setAttendee({ ...attendee, email: e.target.value })}
                      placeholder="e.g. fan@example.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={phoneInputId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Direct Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={phoneInputId}
                      type="tel"
                      value={attendee.phone}
                      onChange={(e) => setAttendee({ ...attendee, phone: e.target.value })}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={countryInputId} className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                    Country of Residence
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
                    <input
                      id={countryInputId}
                      type="text"
                      value={attendee.country}
                      onChange={(e) => setAttendee({ ...attendee, country: e.target.value })}
                      placeholder="e.g. United States"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0B0D] border border-white/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#F5F5DC]/70 mb-1">
                  Accessibility / Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={attendee.specialRequests}
                  onChange={(e) => setAttendee({ ...attendee, specialRequests: e.target.value })}
                  placeholder="e.g. Anniversary celebration, wheelchair seating, soundstage preferences..."
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-[#1A1A1D] hover:bg-white/10 text-xs text-[#F5F5DC] flex items-center gap-1.5 font-mono uppercase tracking-wider border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Tickets</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase transition-colors flex items-center gap-2 font-mono cursor-pointer"
                >
                  <span>Continue to Payment Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT METHOD DETAILS & PROOF OF PAYMENT UPLOAD */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  1. Select Payment Method
                </label>
                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {paymentMethods.map((pm) => {
                      const isSel = selectedMethodId === pm.id;
                      const IconComp = getPaymentIcon(pm.category);
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setSelectedMethodId(pm.id)}
                          className={`p-3 border text-left transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#1A1A1D] border-[#D4AF37] text-[#F5F5DC]'
                              : 'bg-[#0B0B0D] border-white/10 text-[#F5F5DC]/60 hover:text-white'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${isSel ? 'text-[#D4AF37]' : 'text-[#F5F5DC]/40'}`} />
                          <div className="font-serif font-bold text-xs mt-1.5 line-clamp-1">{pm.name}</div>
                          <div className="text-[10px] text-[#F5F5DC]/40 font-mono capitalize">{pm.category}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-[#121214] border border-white/10 text-[#F5F5DC]/60 text-xs font-mono">
                    No payment methods are currently active on the gateway.
                  </div>
                )}
              </div>

              {/* Chosen Payment Method Transfer Instructions Box */}
              {selectedPaymentMethod && (
                <div className="p-5 bg-[#0B0B0D] border border-[#D4AF37]/50 space-y-4 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-serif font-bold text-sm text-[#F5F5DC]">
                        {selectedPaymentMethod.name} Instructions
                      </span>
                    </div>
                    <div className="font-mono text-xs text-[#D4AF37] font-bold">
                      TOTAL DUE: ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#121214] border border-white/5 space-y-1">
                      <span className="text-[#F5F5DC]/50 text-[10px] font-mono uppercase block">Beneficiary / Account Name:</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif font-bold text-sm text-[#F5F5DC]">{selectedPaymentMethod.accountName}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedPaymentMethod.accountName, 'accName')}
                          className="p-1 text-[#D4AF37] hover:text-white"
                          title="Copy Name"
                        >
                          {copiedKey === 'accName' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-[#121214] border border-white/5 space-y-1">
                      <span className="text-[#F5F5DC]/50 text-[10px] font-mono uppercase block">
                        Account Number / Handle / Address:
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-sm text-[#D4AF37] break-all">{selectedPaymentMethod.accountNumberOrHandle}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedPaymentMethod.accountNumberOrHandle, 'accNum')}
                          className="p-1 text-[#D4AF37] hover:text-white"
                          title="Copy Account/Handle"
                        >
                          {copiedKey === 'accNum' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {selectedPaymentMethod.bankName && (
                      <div className="p-3 bg-[#121214] border border-white/5 space-y-1">
                        <span className="text-[#F5F5DC]/50 text-[10px] font-mono uppercase block">Bank Name:</span>
                        <span className="font-mono text-xs text-[#F5F5DC]">{selectedPaymentMethod.bankName}</span>
                      </div>
                    )}

                    {selectedPaymentMethod.routingNumber && (
                      <div className="p-3 bg-[#121214] border border-white/5 space-y-1">
                        <span className="text-[#F5F5DC]/50 text-[10px] font-mono uppercase block">Routing Number / Swift:</span>
                        <span className="font-mono text-xs text-[#D4AF37]">{selectedPaymentMethod.routingNumber} {selectedPaymentMethod.swiftBic ? `(${selectedPaymentMethod.swiftBic})` : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-[#121214] border border-white/5 text-xs text-[#F5F5DC]/80 font-light space-y-1">
                    <span className="text-[#D4AF37] font-mono text-[10px] uppercase font-bold block">Payment Instructions:</span>
                    <p>{selectedPaymentMethod.instructions}</p>
                  </div>
                </div>
              )}

              {/* ATTACH PROOF OF PAYMENT SECTION (MANDATORY) */}
              <div className="space-y-3 p-5 bg-[#0B0B0D] border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    <span>2. Attach Proof of Payment (Gallery or Camera) *</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono uppercase bg-amber-500/10 px-2 py-0.5 border border-amber-500/30">
                    Required for Approval
                  </span>
                </div>
                <p className="text-xs text-[#F5F5DC]/60 font-light">
                  Upload a photo, screenshot, or transfer confirmation receipt. The tour administrator in the Control Room will verify this receipt before issuing and unlocking your scannable gate passes.
                </p>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Preview or Upload Box */}
                {!proofImage ? (
                  <div className="border-2 border-dashed border-white/20 hover:border-[#D4AF37]/60 p-6 text-center space-y-4 bg-[#121214] transition-colors">
                    <UploadCloud className="w-10 h-10 text-[#D4AF37]/60 mx-auto" />
                    <div className="space-y-1">
                      <div className="text-sm font-serif font-bold text-[#F5F5DC]">
                        Upload Payment Receipt / Transfer Screenshot
                      </div>
                      <div className="text-xs text-[#F5F5DC]/50 font-mono">
                        Supports PNG, JPG, JPEG, WEBP photos up to 10MB
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#1A1A1D] hover:bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-wider text-[#F5F5DC] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                        <span>Choose From Gallery / Files</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-4 py-2 bg-[#1A1A1D] hover:bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-wider text-[#F5F5DC] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 text-[#D4AF37]" />
                        <span>Take Photo With Camera</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#121214] border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="font-bold">Proof of Payment Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="text-xs text-rose-400 hover:text-rose-300 font-mono underline cursor-pointer"
                      >
                        Remove / Replace
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-black border border-white/10 overflow-hidden shrink-0">
                        <img
                          src={proofImage}
                          alt="Proof of Payment Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 text-xs font-mono text-[#F5F5DC]/70">
                        <div className="text-[#F5F5DC] font-bold break-all">{proofFileName || 'payment_receipt.jpg'}</div>
                        <div>Size: {proofFileSize || 'Ready'}</div>
                        <div className="text-emerald-400 text-[11px] font-sans flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Securely attached for administrator review
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Confirmation */}
              <div className="p-4 bg-[#0B0B0D] border border-white/10 text-xs space-y-2">
                <div className="flex justify-between font-serif font-bold text-[#F5F5DC]">
                  <span>{event.eventName}</span>
                  <span className="font-mono text-[#D4AF37]">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>
                <div className="text-[#F5F5DC]/50 font-mono text-[11px]">
                  {quantity}x {currentTier.name} (${unitPrice.toLocaleString()} ea) | {event.eventDate} | {attendee.fullName}
                </div>
                <div className="pt-2 border-t border-white/5 space-y-1 font-mono text-[11px] text-[#F5F5DC]/70">
                  <div className="flex justify-between">
                    <span>Ticket Passes Subtotal:</span>
                    <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VIP Concierge & Venue Handling:</span>
                    <span className="text-[#D4AF37]">+$150.00 (Capped)</span>
                  </div>
                  <div className="flex justify-between text-emerald-400/90">
                    <span>Local & Arena Taxes:</span>
                    <span>Included ($0.00)</span>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-[#1A1A1D] hover:bg-white/10 text-xs text-[#F5F5DC] flex items-center gap-1.5 font-mono uppercase tracking-wider border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing || !proofImage}
                  onClick={handleProcessPayment}
                  className="px-8 py-3 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center gap-2 font-mono cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Submitting Verification...' : `Submit Order & Proof ($${total.toLocaleString()})`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUBMITTED & AWAITING ADMIN APPROVAL */}
          {step === 4 && completedOrder && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F5F5DC]">
                  Payment Proof Submitted — Under Verification
                </h3>
                <p className="text-xs text-[#F5F5DC]/70 max-w-lg mx-auto font-light">
                  Your VIP order has been logged. The tour administration is reviewing your attached payment confirmation. You will be able to download and print your official barcode passes as soon as payment is approved.
                </p>
              </div>

              {/* Pending Pass Notification Card */}
              <div
                id="checkout-pending-pass"
                className="bg-[#0B0B0D] border border-amber-500/50 p-6 shadow-2xl space-y-4 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <span className="font-mono text-xs text-[#D4AF37] font-bold">
                    BOOKING REFERENCE: #{completedOrder.id}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    PAYMENT PENDING APPROVAL
                  </span>
                </div>

                <div className="py-2 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#D4AF37]">
                    ERIC CLAPTON VIP EXPERIENCE
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#F5F5DC]">
                    {completedOrder.eventSnapshot.eventName}
                  </h4>
                  <div className="text-xs text-[#F5F5DC]/70 flex flex-wrap gap-4 pt-1 font-mono">
                    <span>{completedOrder.eventSnapshot.venue}, {completedOrder.eventSnapshot.city}</span>
                    <span>Date: {completedOrder.eventSnapshot.eventDate}</span>
                    <span>Show: {completedOrder.eventSnapshot.concertTime}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#121214] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 text-xs space-y-2">
                    <div>
                      <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Attendee Name:</span>
                      <span className="text-[#F5F5DC] font-serif font-bold text-sm">{completedOrder.attendee.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Ticket Package:</span>
                      <span className="text-[#D4AF37] font-serif font-semibold">{completedOrder.quantity}x {completedOrder.tierName} (${completedOrder.pricing.total.toLocaleString()} USD)</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Payment Method:</span>
                      <span className="text-[#F5F5DC] font-mono">{completedOrder.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-[#1A1A1D] border border-white/10 text-center space-y-2">
                    <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                    <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      Pass Barcode Locked
                    </span>
                    <span className="text-[9px] text-[#F5F5DC]/50 font-mono">
                      Unlocks upon admin approval
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono">
                  💡 Tip: You can check pass status anytime in the top navigation under <strong>Check Passes</strong> using your reference <strong>#{completedOrder.id}</strong>.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC] font-bold text-xs uppercase tracking-widest font-mono border border-white/10 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Close Window
                </button>

                {onOpenConciergeWithEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenConciergeWithEmail(completedOrder.attendee.email, completedOrder.id);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto shadow-lg shadow-[#D4AF37]/20"
                  >
                    <MessageSquare className="w-4 h-4 text-black" />
                    <span>Chat / Message Customer Care</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
