import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Ticket, 
  Users, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Search, 
  Edit3, 
  Trash2, 
  Plus, 
  ShieldCheck,
  AlertCircle,
  FileText,
  FileCheck,
  Eye,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Check,
  X,
  Lock,
  Tag
} from 'lucide-react';
import { 
  ConcertEvent, 
  TicketOrder, 
  MeetGreetRequest, 
  SupportTicket, 
  TicketTierConfig,
  PaymentMethodConfig 
} from '../types';
import { 
  updateOrderStatus, 
  approveTicketOrderPayment,
  rejectTicketOrderPayment,
  updateEventTierPrices,
  getPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  updateMeetGreetStatus, 
  saveConcertEvent, 
  deleteConcertEvent 
} from '../lib/api';

interface AdminDashboardProps {
  events: ConcertEvent[];
  orders: TicketOrder[];
  meetGreets: MeetGreetRequest[];
  supportTickets: SupportTicket[];
  onDataChanged: () => void;
  onLockAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  orders,
  meetGreets,
  supportTickets,
  onDataChanged,
  onLockAdmin
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'bookings' | 'payment-methods' | 'events' | 'meet-greets' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<ConcertEvent | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [selectedEventForPrices, setSelectedEventForPrices] = useState<ConcertEvent | null>(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  
  // Proof Viewer Modal
  const [viewingProofOrder, setViewingProofOrder] = useState<TicketOrder | null>(null);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('Payment receipt could not be verified or transfer was not received.');

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodConfig | null>(null);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);

  // Load payment methods
  const loadPaymentMethods = async () => {
    const list = await getPaymentMethods();
    setPaymentMethods(list);
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Analytics Aggregation
  const totalRevenue = orders.reduce((sum, o) => {
    return (o.paymentStatus === 'Payment Confirmed' || o.ticketStatus === 'TICKET ISSUED') ? sum + o.pricing.total : sum;
  }, 0);
  const confirmedTicketsCount = orders
    .filter(o => o.ticketStatus === 'TICKET ISSUED' || o.ticketStatus === 'BOOKING CONFIRMED')
    .reduce((sum, o) => sum + o.quantity, 0);
  const pendingPaymentsCount = orders.filter(o => o.paymentStatus === 'Payment Pending' || o.ticketStatus === 'PAYMENT PENDING').length;
  const pendingMgrCount = meetGreets.filter(m => m.status === 'Request Received' || m.status === 'Under Review' || m.status === 'Awaiting Organizer Confirmation').length;

  // Order Approvals
  const handleApprovePayment = async (orderId: string) => {
    setStatusActionLoading(true);
    try {
      await approveTicketOrderPayment(orderId, 'alexwtchmn@gmail.com', 'Approved by Tour Administrator');
      onDataChanged();
      if (viewingProofOrder?.id === orderId) {
        setViewingProofOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusActionLoading(false);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    setStatusActionLoading(true);
    try {
      await rejectTicketOrderPayment(orderId, rejectReasonText);
      setRejectReasonPrompt(null);
      onDataChanged();
      if (viewingProofOrder?.id === orderId) {
        setViewingProofOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, pStatus: TicketOrder['paymentStatus'], tStatus: TicketOrder['ticketStatus']) => {
    setStatusActionLoading(true);
    try {
      await updateOrderStatus(orderId, pStatus, tStatus);
      onDataChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusActionLoading(false);
    }
  };

  const handleUpdateMgr = async (id: string, status: MeetGreetRequest['status'], note?: string, orgStatus?: string) => {
    setStatusActionLoading(true);
    try {
      await updateMeetGreetStatus(id, status, note, orgStatus);
      onDataChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusActionLoading(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForEdit) return;

    try {
      await saveConcertEvent(selectedEventForEdit);
      setIsCreatingEvent(false);
      setSelectedEventForEdit(null);
      onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTierPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForPrices) return;

    try {
      await updateEventTierPrices(selectedEventForPrices.id, selectedEventForPrices.ticketCategories);
      setSelectedEventForPrices(null);
      onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to archive / delete this concert listing?')) {
      await deleteConcertEvent(eventId);
      onDataChanged();
    }
  };

  // Payment Method handlers
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaymentMethod) return;

    try {
      await savePaymentMethod(editingPaymentMethod);
      setEditingPaymentMethod(null);
      setIsAddingPaymentMethod(false);
      await loadPaymentMethods();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePaymentMethod = async (pm: PaymentMethodConfig) => {
    try {
      await savePaymentMethod({ ...pm, isActive: !pm.isActive });
      await loadPaymentMethods();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      await deletePaymentMethod(id);
      await loadPaymentMethods();
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.attendee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.eventSnapshot.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (orderFilter === 'pending') {
      return o.paymentStatus === 'Payment Pending' || o.ticketStatus === 'PAYMENT PENDING';
    }
    if (orderFilter === 'approved') {
      return o.paymentStatus === 'Payment Confirmed' || o.ticketStatus === 'TICKET ISSUED';
    }
    if (orderFilter === 'declined') {
      return o.paymentStatus === 'Payment Failed' || o.ticketStatus === 'REFUNDED';
    }
    return true;
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-8 bg-[#121214] border border-white/10 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>ORGANIZER & TOUR MANAGEMENT CONTROL ROOM</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5DC]">
            Eric Clapton VIP Experience Administration
          </h2>
          <p className="text-xs text-[#F5F5DC]/70 font-light">
            Manage ticket prices, configure payment methods, verify payment proofs, and approve gate passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <div className="px-3 py-1.5 bg-[#0B0B0D] border border-[#D4AF37]/30 text-[11px] font-mono text-[#D4AF37] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>alexwtchmn@gmail.com</span>
          </div>

          <button
            onClick={() => { onDataChanged(); loadPaymentMethods(); }}
            className="px-4 py-2 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sync Firestore</span>
          </button>

          {onLockAdmin && (
            <button
              onClick={onLockAdmin}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 border border-red-500/30 transition-colors cursor-pointer"
              title="Lock and leave Control Room"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Lock & Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
          { id: 'bookings', label: `Orders & Approvals (${pendingPaymentsCount} Pending)`, icon: Ticket, highlight: pendingPaymentsCount > 0 },
          { id: 'payment-methods', label: `Payment Methods (${paymentMethods.length})`, icon: CreditCard },
          { id: 'events', label: `Concerts & Ticket Prices (${events.length})`, icon: Calendar },
          { id: 'meet-greets', label: `Meet & Greet Requests (${pendingMgrCount} Pending)`, icon: Sparkles },
          { id: 'analytics', label: 'Revenue Analytics', icon: DollarSign }
        ].map((tab) => {
          const isSel = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
                isSel
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : tab.highlight
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#121214] text-[#F5F5DC]/70 hover:text-[#F5F5DC] hover:bg-white/5 border border-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-[#121214] border border-white/10 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5F5DC]/50">Total Gross Revenue</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono tracking-wider">From Approved Orders</div>
            </div>

            <div className="p-6 bg-[#121214] border border-amber-500/30 space-y-2 bg-amber-500/5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">Pending Approvals</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                {pendingPaymentsCount} Orders
              </div>
              <div className="text-[10px] text-amber-300/80 font-mono">Proof Uploaded & Awaiting Audit</div>
            </div>

            <div className="p-6 bg-[#121214] border border-white/10 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5F5DC]/50">Issued Passes</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5DC]">
                {confirmedTicketsCount}
              </div>
              <div className="text-[10px] text-[#F5F5DC]/50 font-mono">Across {events.length} Tour Dates</div>
            </div>

            <div className="p-6 bg-[#121214] border border-white/10 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5F5DC]/50">Active Payment Methods</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">
                {paymentMethods.filter(p => p.isActive).length} <span className="text-xs font-mono font-normal text-[#F5F5DC]/50">/ {paymentMethods.length}</span>
              </div>
              <div className="text-[10px] text-[#F5F5DC]/50 font-mono">Zelle, Wire, Cash App, etc.</div>
            </div>
          </div>

          {/* Quick Action Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pending Approvals Quick List */}
            <div className="p-6 bg-[#121214] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif text-base font-bold text-[#F5F5DC]">Payment Approvals Needed</h3>
                </div>
                <button
                  onClick={() => { setOrderFilter('pending'); setAdminTab('bookings'); }}
                  className="text-xs text-[#D4AF37] hover:text-[#F5F5DC] font-mono tracking-wider cursor-pointer"
                >
                  Manage Approvals ({pendingPaymentsCount}) →
                </button>
              </div>
              <div className="space-y-2">
                {orders.filter(o => o.paymentStatus === 'Payment Pending' || o.ticketStatus === 'PAYMENT PENDING').length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#F5F5DC]/50 font-mono">
                    All payment proofs are verified and up to date.
                  </div>
                ) : (
                  orders.filter(o => o.paymentStatus === 'Payment Pending' || o.ticketStatus === 'PAYMENT PENDING').slice(0, 4).map((ord) => (
                    <div key={ord.id} className="p-3 bg-[#0B0B0D] border border-amber-500/20 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono text-[#D4AF37] font-bold">#{ord.id}</div>
                        <div className="text-[#F5F5DC] font-medium">{ord.attendee.fullName} • {ord.quantity}x {ord.tierName}</div>
                        <div className="text-[11px] text-[#F5F5DC]/50 font-mono">{ord.paymentMethod} • ${ord.pricing.total.toFixed(2)} USD</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ord.paymentProofUrl && (
                          <button
                            onClick={() => setViewingProofOrder(ord)}
                            className="px-2 py-1 bg-[#1A1A1D] hover:bg-white/10 text-[#D4AF37] text-[10px] font-mono border border-white/10 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Proof</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleApprovePayment(ord.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono uppercase font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Concert Tour Overview */}
            <div className="p-6 bg-[#121214] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-serif text-base font-bold text-[#F5F5DC]">Tour Schedule & Lowest Prices</h3>
                <button
                  onClick={() => setAdminTab('events')}
                  className="text-xs text-[#D4AF37] hover:text-[#F5F5DC] font-mono tracking-wider cursor-pointer"
                >
                  Edit Prices ({events.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {events.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="p-3 bg-[#0B0B0D] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-serif font-bold text-[#F5F5DC]">{ev.city}, {ev.country}</div>
                      <div className="text-[11px] text-[#F5F5DC]/50 font-mono">{ev.venue} • {ev.eventDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[#D4AF37] font-bold">Starts ${ev.startingPrice}</div>
                      <button
                        onClick={() => setSelectedEventForPrices(ev)}
                        className="text-[10px] text-[#F5F5DC]/60 hover:text-white underline font-mono cursor-pointer"
                      >
                        Adjust Prices
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. BOOKINGS & PAYMENT APPROVALS TAB */}
      {adminTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#121214] border border-white/10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F5DC]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by booking ID, attendee name, email, or method..."
                className="w-full pl-9 pr-4 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] placeholder-[#F5F5DC]/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {[
                { id: 'all', label: `All (${orders.length})` },
                { id: 'pending', label: `Pending Approval (${pendingPaymentsCount})` },
                { id: 'approved', label: 'Approved' },
                { id: 'declined', label: 'Declined/Refunded' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id as any)}
                  className={`px-3 py-1.5 transition-colors cursor-pointer ${
                    orderFilter === f.id
                      ? 'bg-[#D4AF37] text-black font-bold'
                      : 'bg-[#1A1A1D] text-[#F5F5DC]/70 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-[#121214] overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F5DC]/80">
              <thead className="bg-[#0B0B0D] text-[#D4AF37] font-mono uppercase text-[10px] border-b border-white/10 tracking-widest">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Attendee / Contact</th>
                  <th className="p-3.5">Concert & Venue</th>
                  <th className="p-3.5">Tier & Qty</th>
                  <th className="p-3.5">Payment Method & Total</th>
                  <th className="p-3.5">Proof of Payment</th>
                  <th className="p-3.5">Approval Status</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs text-[#F5F5DC]/40 font-mono">
                      No orders found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const isPending = o.paymentStatus === 'Payment Pending' || o.ticketStatus === 'PAYMENT PENDING';
                    const isApproved = o.paymentStatus === 'Payment Confirmed' || o.ticketStatus === 'TICKET ISSUED';
                    const isFailed = o.paymentStatus === 'Payment Failed' || o.ticketStatus === 'REFUNDED';

                    return (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono text-[#D4AF37] font-bold">
                          #{o.id}
                        </td>
                        <td className="p-3.5">
                          <div className="font-serif font-bold text-[#F5F5DC]">{o.attendee.fullName}</div>
                          <div className="text-[#F5F5DC]/40 text-[11px] font-mono">{o.attendee.email}</div>
                          {o.attendee.phone && <div className="text-[#F5F5DC]/40 text-[10px] font-mono">{o.attendee.phone}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="text-[#F5F5DC] line-clamp-1">{o.eventSnapshot.eventName}</div>
                          <div className="text-[#F5F5DC]/40 text-[11px] font-mono">{o.eventSnapshot.city} • {o.eventSnapshot.eventDate}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-serif text-[#D4AF37]">{o.tierName}</span>
                          <div className="text-[#F5F5DC]/40 text-[11px] font-mono">{o.quantity} Pass(es)</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-[#F5F5DC]">${o.pricing.total.toFixed(2)} USD</div>
                          <div className="text-[11px] text-[#F5F5DC]/50 font-mono">{o.paymentMethod}</div>
                        </td>
                        <td className="p-3.5">
                          {o.paymentProofUrl ? (
                            <button
                              onClick={() => setViewingProofOrder(o)}
                              className="px-2.5 py-1.5 bg-[#1A1A1D] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#F5F5DC]/30 font-mono italic">No file attached</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {isApproved ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : isFailed ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" />
                              Declined
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit animate-pulse">
                              <Clock className="w-3 h-3" />
                              Pending Approval
                            </span>
                          )}
                          {o.paymentApprovedAt && (
                            <div className="text-[9px] text-[#F5F5DC]/40 font-mono mt-0.5">
                              Approved {new Date(o.paymentApprovedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {isPending && (
                            <>
                              <button
                                disabled={statusActionLoading}
                                onClick={() => handleApprovePayment(o.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer"
                                title="Approve payment proof and activate downloadable ticket pass"
                              >
                                Approve & Issue Pass
                              </button>
                              <button
                                disabled={statusActionLoading}
                                onClick={() => setRejectReasonPrompt(o.id)}
                                className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[10px] font-mono uppercase border border-rose-800 transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {isApproved && (
                            <button
                              disabled={statusActionLoading}
                              onClick={() => handleUpdateOrderStatus(o.id, 'Payment Pending', 'PAYMENT PENDING')}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[#F5F5DC]/60 text-[10px] font-mono uppercase border border-white/10 transition-colors cursor-pointer"
                              title="Re-open order to pending verification"
                            >
                              Revoke Pass
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PAYMENT METHODS MANAGEMENT TAB */}
      {adminTab === 'payment-methods' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#F5F5DC]">Payment Methods & Transfer Accounts</h3>
              <p className="text-xs text-[#F5F5DC]/60 font-light">
                Configure account numbers, handles, and payment instructions presented to fans during checkout.
              </p>
            </div>

            <button
              onClick={() => {
                const newMethod: PaymentMethodConfig = {
                  id: `pm-${Date.now()}`,
                  name: 'Zelle / Bank Transfer',
                  category: 'zelle',
                  accountName: 'Eric Clapton Tour VIP Operations LLC',
                  accountNumberOrHandle: 'payments@ericclapton-tour.vip',
                  instructions: 'Please include your Full Name and Booking Reference in the transfer memo.',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                setEditingPaymentMethod(newMethod);
                setIsAddingPaymentMethod(true);
              }}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="p-6 bg-[#121214] border border-white/10 space-y-4 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block">
                        {pm.category}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#F5F5DC]">{pm.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                      pm.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {pm.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0B0B0D] border border-white/5 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Beneficiary:</span>
                      <span className="font-serif font-bold text-[#F5F5DC]">{pm.accountName}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Account / Handle / Address:</span>
                      <span className="font-mono font-bold text-[#D4AF37] break-all">{pm.accountNumberOrHandle}</span>
                    </div>
                    {pm.bankName && (
                      <div>
                        <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Bank:</span>
                        <span className="font-mono text-[#F5F5DC]">{pm.bankName}</span>
                      </div>
                    )}
                    {pm.routingNumber && (
                      <div>
                        <span className="text-[#F5F5DC]/40 text-[10px] font-mono uppercase block">Routing:</span>
                        <span className="font-mono text-[#F5F5DC]">{pm.routingNumber} {pm.swiftBic ? `(SWIFT: ${pm.swiftBic})` : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-[#F5F5DC]/70 font-light text-[11px]">
                    <strong className="text-[#D4AF37] font-mono text-[10px] uppercase block">Instructions:</strong>
                    <p className="line-clamp-2">{pm.instructions}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePaymentMethod(pm)}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border cursor-pointer ${
                      pm.isActive 
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-[#F5F5DC]/70 border-white/10' 
                        : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
                    }`}
                  >
                    {pm.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingPaymentMethod(pm);
                        setIsAddingPaymentMethod(false);
                      }}
                      className="p-1.5 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC] border border-white/10 cursor-pointer"
                      title="Edit Payment Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePaymentMethod(pm.id)}
                      className="p-1.5 bg-[#1A1A1D] hover:bg-rose-950 text-rose-400 border border-white/10 cursor-pointer"
                      title="Delete Payment Method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method Edit / Create Modal */}
          {editingPaymentMethod && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative w-full max-w-lg bg-[#121214] border border-[#D4AF37]/40 p-6 text-[#F5F5DC] space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">
                    {isAddingPaymentMethod ? 'Add Payment Method' : 'Edit Payment Method'}
                  </h3>
                  <button onClick={() => setEditingPaymentMethod(null)} className="text-[#F5F5DC]/50 hover:text-white font-mono cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSavePaymentMethod} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Method Name (e.g. Zelle, Chase Bank Wire, Cash App)</label>
                    <input
                      type="text"
                      required
                      value={editingPaymentMethod.name}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Category</label>
                      <select
                        value={editingPaymentMethod.category}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="zelle">Zelle</option>
                        <option value="bank">Bank Wire Transfer</option>
                        <option value="cashapp">Cash App</option>
                        <option value="paypal">PayPal Concierge</option>
                        <option value="crypto">Cryptocurrency Wallet</option>
                        <option value="other">Other / Digital</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Beneficiary / Account Name</label>
                      <input
                        type="text"
                        required
                        value={editingPaymentMethod.accountName}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, accountName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Account Number / Handle / Wallet Address</label>
                    <input
                      type="text"
                      required
                      value={editingPaymentMethod.accountNumberOrHandle}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, accountNumberOrHandle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs font-mono text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Bank Name (Optional)</label>
                      <input
                        type="text"
                        value={editingPaymentMethod.bankName || ''}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Routing / SWIFT (Optional)</label>
                      <input
                        type="text"
                        value={editingPaymentMethod.routingNumber || ''}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, routingNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs font-mono text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Payment Instructions for Customer</label>
                    <textarea
                      rows={3}
                      required
                      value={editingPaymentMethod.instructions}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, instructions: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="pm-active-check"
                      checked={editingPaymentMethod.isActive}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, isActive: e.target.checked })}
                      className="accent-[#D4AF37]"
                    />
                    <label htmlFor="pm-active-check" className="text-xs font-mono text-[#F5F5DC]">
                      Active for Checkout Display
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingPaymentMethod(null)}
                      className="px-4 py-2 bg-[#1A1A1D] text-xs font-mono uppercase tracking-wider text-[#F5F5DC]/70 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono transition-colors cursor-pointer"
                    >
                      Save Payment Method
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CONCERTS & TICKET PRICES MANAGER */}
      {adminTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#F5F5DC]">Concert Tour & Ticket Pricing Engine</h3>
              <p className="text-xs text-[#F5F5DC]/60 font-light">
                Modify ticket prices per category, adjust starting tier rates, and manage arena inventory.
              </p>
            </div>

            <button
              onClick={() => {
                const newEv: ConcertEvent = {
                  id: `ec-tour-${Date.now()}`,
                  eventName: 'Eric Clapton Live Experience',
                  artist: 'Eric Clapton',
                  tourName: 'World Tour 2026-2027',
                  venue: 'Grand Arena',
                  city: 'Minneapolis',
                  country: 'United States',
                  eventDate: '2026-10-20',
                  doorsOpen: '18:30',
                  concertTime: '20:00',
                  startingPrice: 1800,
                  vipAvailability: true,
                  meetAndGreetAvailability: true,
                  status: 'upcoming',
                  heroImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
                  description: 'Special headline tour performance with electric blues classics and acoustic slowhand repertoire.',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  ticketCategories: [
                    { id: 'cat-ga', name: 'General Admission Tier', price: 1800, description: 'Arena floor admission', benefits: ['Arena Floor Access'], inventory: 150, available: 150 },
                    { id: 'cat-front', name: 'Front Stage Reserved', price: 2800, description: 'Direct stage proximity', benefits: ['Front 10 Rows'], inventory: 80, available: 80 },
                    { id: 'cat-vip', name: 'Guitar Legend VIP Experience', price: 4500, description: 'Lounge pass and soundcheck', benefits: ['Soundcheck Access', 'VIP Lounge'], inventory: 30, available: 30 }
                  ]
                };
                setSelectedEventForEdit(newEv);
                setIsCreatingEvent(true);
              }}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tour Date</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-6 bg-[#121214] border border-white/10 space-y-4 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">{ev.eventDate} • {ev.city}, {ev.country}</span>
                      <h4 className="font-serif text-lg font-bold text-[#F5F5DC] mt-0.5">{ev.eventName}</h4>
                      <div className="text-xs text-[#F5F5DC]/60 font-mono">{ev.venue} • Show {ev.concertTime}</div>
                      {ev.specialGuests && (
                        <div className="text-[11px] font-mono text-[#D4AF37] mt-0.5">Guest: {ev.specialGuests}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-[#F5F5DC]/50">Lowest Price:</div>
                      <div className="font-mono text-lg font-bold text-[#D4AF37]">${ev.startingPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Tier Pricing Overview Table */}
                  <div className="p-3 bg-[#0B0B0D] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[#D4AF37] text-[10px] uppercase tracking-widest">
                      <span>Configured Ticket Tiers & Pricing:</span>
                      <span>{ev.ticketCategories.length} Categories</span>
                    </div>
                    <div className="space-y-1.5">
                      {ev.ticketCategories.map(cat => (
                        <div key={cat.id} className="p-2 bg-[#121214] border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-serif text-[#F5F5DC] font-bold">{cat.name}</span>
                            <div className="text-[10px] text-[#F5F5DC]/50 font-mono">{cat.available} / {cat.inventory} tickets available</div>
                          </div>
                          <div className="font-mono font-bold text-sm text-[#D4AF37]">
                            ${cat.price.toLocaleString()} USD
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedEventForPrices(ev)}
                    className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Change Prices</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedEventForEdit(ev);
                        setIsCreatingEvent(true);
                      }}
                      className="p-1.5 bg-[#1A1A1D] hover:bg-white/10 text-[#F5F5DC] border border-white/10 cursor-pointer"
                      title="Edit Event Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 bg-[#1A1A1D] hover:bg-rose-950 text-rose-400 border border-white/10 cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Price Editor Modal */}
          {selectedEventForPrices && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative w-full max-w-xl bg-[#121214] border border-[#D4AF37]/50 p-6 text-[#F5F5DC] space-y-4 max-h-[88vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">CONTROL ROOM PRICING ENGINE</span>
                    <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">
                      Edit Prices: {selectedEventForPrices.eventName}
                    </h3>
                    <div className="text-xs text-[#F5F5DC]/60 font-mono">
                      {selectedEventForPrices.venue}, {selectedEventForPrices.city} ({selectedEventForPrices.eventDate})
                    </div>
                  </div>
                  <button onClick={() => setSelectedEventForPrices(null)} className="text-[#F5F5DC]/50 hover:text-white font-mono cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSaveTierPrices} className="space-y-4">
                  <div className="space-y-3">
                    {selectedEventForPrices.ticketCategories.map((cat, idx) => (
                      <div key={cat.id} className="p-3.5 bg-[#0B0B0D] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const updated = [...selectedEventForPrices.ticketCategories];
                              updated[idx].name = e.target.value;
                              setSelectedEventForPrices({ ...selectedEventForPrices, ticketCategories: updated });
                            }}
                            className="bg-transparent font-serif font-bold text-sm text-[#F5F5DC] border-b border-transparent focus:border-[#D4AF37] focus:outline-none"
                          />
                          <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{cat.id}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                          <div>
                            <label className="block text-[10px] font-mono text-[#D4AF37] uppercase mb-1">Price ($ USD) *</label>
                            <input
                              type="number"
                              min="1"
                              step="10"
                              required
                              value={cat.price}
                              onChange={(e) => {
                                const updated = [...selectedEventForPrices.ticketCategories];
                                updated[idx].price = parseFloat(e.target.value) || 0;
                                setSelectedEventForPrices({ ...selectedEventForPrices, ticketCategories: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#121214] border border-white/10 text-xs font-mono font-bold text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#F5F5DC]/60 uppercase mb-1">Total Cap</label>
                            <input
                              type="number"
                              min="1"
                              value={cat.inventory}
                              onChange={(e) => {
                                const updated = [...selectedEventForPrices.ticketCategories];
                                updated[idx].inventory = parseInt(e.target.value) || 0;
                                setSelectedEventForPrices({ ...selectedEventForPrices, ticketCategories: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#121214] border border-white/10 text-xs font-mono text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#F5F5DC]/60 uppercase mb-1">Available</label>
                            <input
                              type="number"
                              min="0"
                              value={cat.available}
                              onChange={(e) => {
                                const updated = [...selectedEventForPrices.ticketCategories];
                                updated[idx].available = parseInt(e.target.value) || 0;
                                setSelectedEventForPrices({ ...selectedEventForPrices, ticketCategories: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#121214] border border-white/10 text-xs font-mono text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#0B0B0D] border border-white/5 text-xs text-[#D4AF37] font-mono">
                    Lowest Starting Price will automatically update to: <strong>${Math.min(...selectedEventForPrices.ticketCategories.map(c => c.price)).toLocaleString()} USD</strong>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedEventForPrices(null)}
                      className="px-4 py-2 bg-[#1A1A1D] text-xs font-mono uppercase tracking-wider text-[#F5F5DC]/70 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono transition-colors cursor-pointer"
                    >
                      Save & Apply Prices
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit / Create Event Modal */}
          {isCreatingEvent && selectedEventForEdit && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-[#121214] border border-[#D4AF37]/40 p-6 text-[#F5F5DC] space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">
                    Edit Concert & Arena Parameters
                  </h3>
                  <button onClick={() => setIsCreatingEvent(false)} className="text-[#F5F5DC]/50 hover:text-white font-mono cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSaveEvent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Event Name</label>
                    <input
                      type="text"
                      required
                      value={selectedEventForEdit.eventName}
                      onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, eventName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Venue</label>
                      <input
                        type="text"
                        required
                        value={selectedEventForEdit.venue}
                        onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, venue: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={selectedEventForEdit.city}
                        onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, city: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Event Date</label>
                      <input
                        type="date"
                        required
                        value={selectedEventForEdit.eventDate}
                        onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, eventDate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Doors Open</label>
                      <input
                        type="text"
                        value={selectedEventForEdit.doorsOpen}
                        onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, doorsOpen: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Show Time</label>
                      <input
                        type="text"
                        value={selectedEventForEdit.concertTime}
                        onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, concertTime: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Special Guest(s)</label>
                    <input
                      type="text"
                      value={selectedEventForEdit.specialGuests || ''}
                      onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, specialGuests: e.target.value })}
                      placeholder="e.g. Jimmie Vaughan"
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#F5F5DC]/70 mb-1">Hero Image URL</label>
                    <input
                      type="url"
                      value={selectedEventForEdit.heroImage}
                      onChange={(e) => setSelectedEventForEdit({ ...selectedEventForEdit, heroImage: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingEvent(false)}
                      className="px-4 py-2 bg-[#1A1A1D] text-xs font-mono uppercase tracking-wider text-[#F5F5DC]/70 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs uppercase tracking-widest font-mono transition-colors cursor-pointer"
                    >
                      Save Concert Details
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MEET & GREET ADMINISTRATION TAB */}
      {adminTab === 'meet-greets' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#F5F5DC] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#D4AF37]">Security Protocol:</strong> Meet & Greet applications must be authorized by the touring director credentials desk before wristbands are issued.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {meetGreets.map((mg) => (
              <div key={mg.id} className="p-6 bg-[#121214] border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#D4AF37]">{mg.id}</span>
                    <span className="text-xs text-[#F5F5DC]/40 font-mono ml-2">Registered {new Date(mg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-mono uppercase ${
                    mg.status === 'Confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : mg.status === 'Not Available' || mg.status === 'Cancelled'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                  }`}>
                    {mg.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Applicant:</span>
                    <strong className="text-[#F5F5DC] font-serif text-sm">{mg.fullName}</strong>
                    <div className="text-[#F5F5DC]/60 font-mono">{mg.email} • {mg.phone}</div>
                    <div className="text-[#F5F5DC]/60 font-mono">{mg.country} ({mg.numberOfGuests} Guests)</div>
                  </div>

                  <div>
                    <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Concert Event:</span>
                    <div className="text-[#F5F5DC] font-medium">{mg.eventName}</div>
                    <div className="text-[#F5F5DC]/60 font-mono">{mg.venueCity}</div>
                    <div className="text-[#D4AF37] font-mono">Date: {mg.preferredDate}</div>
                  </div>

                  <div>
                    <span className="text-[#F5F5DC]/40 block text-[10px] font-mono uppercase">Requested Tier:</span>
                    <div className="text-[#F5F5DC] font-medium">{mg.experiencePreference}</div>
                  </div>
                </div>

                <div className="p-4 bg-[#0B0B0D] border border-white/5 text-xs">
                  <span className="text-[#D4AF37] block text-[10px] uppercase font-mono mb-1 tracking-wider">Fan Message:</span>
                  <p className="text-[#F5F5DC]/80 italic">"{mg.messageToTeam}"</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="text-[11px] text-[#F5F5DC]/50 font-mono">
                    Status: <span className="text-[#F5F5DC]/80">{mg.adminNotes || 'Under Review.'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateMgr(mg.id, 'Confirmed', 'Formally authorized by tour management credentials desk.')}
                      className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#F5F5DC] text-black font-bold text-xs font-mono uppercase tracking-wider cursor-pointer"
                    >
                      Confirm Request
                    </button>
                    <button
                      onClick={() => handleUpdateMgr(mg.id, 'Not Available', 'Artist schedule at maximum venue capacity.')}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-mono uppercase tracking-wider border border-rose-800 cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REVENUE ANALYTICS TAB */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-[#121214] border border-white/10">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">Gross Booking Volume</span>
              <div className="text-3xl font-serif font-bold text-[#F5F5DC] mt-1">
                ${totalRevenue.toLocaleString()} USD
              </div>
              <div className="text-xs text-[#F5F5DC]/50 font-mono mt-1">From {orders.length} Logged Checkouts</div>
            </div>

            <div className="p-6 bg-[#121214] border border-white/10">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">Average Order Value</span>
              <div className="text-3xl font-serif font-bold text-[#F5F5DC] mt-1">
                ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-[#F5F5DC]/50 font-mono mt-1">Reflects VIP packages adoption</div>
            </div>

            <div className="p-6 bg-[#121214] border border-white/10">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">Payment Methods Active</span>
              <div className="text-3xl font-serif font-bold text-emerald-400 mt-1">
                {paymentMethods.filter(p => p.isActive).length} Gateways
              </div>
              <div className="text-xs text-[#F5F5DC]/50 font-mono mt-1">Direct verification protocol</div>
            </div>
          </div>
        </div>
      )}

      {/* PROOF OF PAYMENT HIGH-RES VIEWER MODAL */}
      {viewingProofOrder && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#121214] border border-[#D4AF37]/60 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">PAYMENT AUDIT VERIFICATION</span>
                <h3 className="font-serif text-lg font-bold text-[#F5F5DC]">
                  Order #{viewingProofOrder.id} — {viewingProofOrder.attendee.fullName}
                </h3>
                <div className="text-xs text-[#F5F5DC]/60 font-mono">
                  Amount: ${viewingProofOrder.pricing.total.toFixed(2)} USD • Method: {viewingProofOrder.paymentMethod}
                </div>
              </div>
              <button
                onClick={() => setViewingProofOrder(null)}
                className="p-1 text-[#F5F5DC]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black border border-white/10 flex items-center justify-center min-h-[300px]">
              {viewingProofOrder.paymentProofUrl ? (
                <img
                  src={viewingProofOrder.paymentProofUrl}
                  alt="Proof of Payment"
                  className="max-h-[55vh] w-auto object-contain"
                />
              ) : (
                <div className="text-xs text-[#F5F5DC]/50 font-mono">No image preview available</div>
              )}
            </div>

            <div className="p-3 bg-[#0B0B0D] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#F5F5DC]/60">File: {viewingProofOrder.paymentProofFileName || 'payment_receipt.jpg'}</span>
              <span className="text-[#D4AF37]">Uploaded: {new Date(viewingProofOrder.paymentProofUploadedAt || viewingProofOrder.createdAt).toLocaleString()}</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingProofOrder(null)}
                className="px-4 py-2 bg-[#1A1A1D] text-xs font-mono uppercase tracking-wider text-[#F5F5DC]/70 hover:text-white cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => handleRejectPayment(viewingProofOrder.id)}
                className="px-4 py-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-xs font-mono uppercase tracking-wider border border-rose-700 cursor-pointer"
              >
                Decline Payment
              </button>
              <button
                type="button"
                disabled={statusActionLoading}
                onClick={() => handleApprovePayment(viewingProofOrder.id)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Payment & Activate Passes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON PROMPT MODAL */}
      {rejectReasonPrompt && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-[#121214] border border-rose-500/40 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-serif text-base font-bold text-rose-300">Decline Payment for #{rejectReasonPrompt}</h3>
              <button onClick={() => setRejectReasonPrompt(null)} className="text-[#F5F5DC]/50 hover:text-white font-mono cursor-pointer">✕</button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#F5F5DC]/70">Reason for customer notification:</label>
              <textarea
                rows={3}
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-white/10 text-xs text-[#F5F5DC] focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectReasonPrompt(null)}
                className="px-4 py-1.5 bg-[#1A1A1D] text-xs font-mono text-[#F5F5DC]/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPayment(rejectReasonPrompt)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
