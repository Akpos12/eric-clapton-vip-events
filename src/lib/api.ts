import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import {
  ConcertEvent,
  TicketTierConfig,
  TicketOrder,
  MeetGreetRequest,
  VIPExperiencePackage,
  FanRewardGiveaway,
  SupportTicket,
  PaymentMethodConfig
} from '../types';
import {
  INITIAL_EVENTS,
  INITIAL_VIP_PACKAGES,
  INITIAL_GIVEAWAYS,
  INITIAL_PAYMENT_METHODS,
  SAMPLE_ORDERS,
  SAMPLE_MEET_GREETS,
  SAMPLE_SUPPORT_TICKETS
} from '../data/mockData';

// Local storage fallback keys for instant responsiveness if offline or initial setup
const LS_EVENTS_KEY = 'ec_vip_events_store_v5';
const LS_ORDERS_KEY = 'ec_vip_orders_store_v5';
const LS_MGR_KEY = 'ec_vip_mgr_store_v5';
const LS_SUPPORT_KEY = 'ec_vip_support_store_v5';
const LS_VIP_KEY = 'ec_vip_packages_store_v5';
const LS_REWARDS_KEY = 'ec_vip_rewards_store_v5';
const LS_PAYMENT_METHODS_KEY = 'ec_vip_payment_methods_store_v5';

// Timeout helper to prevent Firestore network stalls
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

// Seed initial database state if empty or obsolete
export async function seedInitialDataIfNeeded() {
  // Always ensure LocalStorage cache is populated immediately for zero latency
  if (!localStorage.getItem(LS_EVENTS_KEY)) {
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
  } else {
    // Update cached events with new schedule
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
  }
  if (!localStorage.getItem(LS_ORDERS_KEY)) {
    localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(SAMPLE_ORDERS));
  }
  if (!localStorage.getItem(LS_MGR_KEY)) {
    localStorage.setItem(LS_MGR_KEY, JSON.stringify(SAMPLE_MEET_GREETS));
  }
  if (!localStorage.getItem(LS_SUPPORT_KEY)) {
    localStorage.setItem(LS_SUPPORT_KEY, JSON.stringify(SAMPLE_SUPPORT_TICKETS));
  }
  if (!localStorage.getItem(LS_VIP_KEY)) {
    localStorage.setItem(LS_VIP_KEY, JSON.stringify(INITIAL_VIP_PACKAGES));
  }
  if (!localStorage.getItem(LS_REWARDS_KEY)) {
    localStorage.setItem(LS_REWARDS_KEY, JSON.stringify(INITIAL_GIVEAWAYS));
  }
  if (!localStorage.getItem(LS_PAYMENT_METHODS_KEY)) {
    localStorage.setItem(LS_PAYMENT_METHODS_KEY, JSON.stringify(INITIAL_PAYMENT_METHODS));
  }

  // Attempt background sync to Firestore
  try {
    const eventsCol = collection(db, 'events');
    const snap = await withTimeout(getDocs(eventsCol), 2500);
    
    // Obsolete event IDs cleanup if they exist from prior seed
    const obsoleteEventIds = [
      'ec-london-rah-2026',
      'ec-msg-nyc-2026',
      'ec-budokan-tokyo-2026',
      'ec-olympia-paris-2026',
      'ec-redrocks-colorado-2027'
    ];
    for (const oldId of obsoleteEventIds) {
      try {
        await deleteDoc(doc(db, 'events', oldId));
      } catch {
        // ignore
      }
    }

    // Always ensure all current tour events are present in Firestore
    for (const ev of INITIAL_EVENTS) {
      await setDoc(doc(db, 'events', ev.id), ev, { merge: true });
    }

    // Seed payment methods in Firestore
    for (const pm of INITIAL_PAYMENT_METHODS) {
      await setDoc(doc(db, 'payment_methods', pm.id), pm, { merge: true });
    }

    if (snap.empty) {
      // Seed VIP packages
      for (const vip of INITIAL_VIP_PACKAGES) {
        await setDoc(doc(db, 'vip_packages', vip.id), vip);
      }
      // Seed Giveaways
      for (const rw of INITIAL_GIVEAWAYS) {
        await setDoc(doc(db, 'giveaways', rw.id), rw);
      }
      // Seed sample orders
      for (const ord of SAMPLE_ORDERS) {
        await setDoc(doc(db, 'ticket_orders', ord.id), ord);
      }
      // Seed meet greets
      for (const mgr of SAMPLE_MEET_GREETS) {
        await setDoc(doc(db, 'meet_greet_requests', mgr.id), mgr);
      }
      // Seed support tickets
      for (const st of SAMPLE_SUPPORT_TICKETS) {
        await setDoc(doc(db, 'support_tickets', st.id), st);
      }
    }
  } catch {
    // Graceful offline fallback mode: local storage is already fully seeded and responsive
  }
}

// -------------------------------------------------------------
// EVENTS SERVICE
// -------------------------------------------------------------
export async function getConcertEvents(): Promise<ConcertEvent[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'events')), 2000);
    if (!snap.empty) {
      const docs = snap.docs.map(d => d.data() as ConcertEvent);
      // Filter out obsolete events if any remained
      const valid = docs.filter(d => !['ec-london-rah-2026', 'ec-msg-nyc-2026', 'ec-budokan-tokyo-2026', 'ec-olympia-paris-2026', 'ec-redrocks-colorado-2027'].includes(d.id));
      if (valid.length > 0) {
        return valid.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
      }
    }
  } catch {
    // Instant fallback to LocalStorage
  }
  const raw = localStorage.getItem(LS_EVENTS_KEY);
  const list: ConcertEvent[] = raw ? JSON.parse(raw) : INITIAL_EVENTS;
  return list.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
}

export async function getConcertById(eventId: string): Promise<ConcertEvent | null> {
  try {
    const docRef = doc(db, 'events', eventId);
    const snap = await withTimeout(getDoc(docRef), 1500);
    if (snap.exists()) return snap.data() as ConcertEvent;
  } catch {
    // fallback
  }
  const all = await getConcertEvents();
  return all.find(e => e.id === eventId) || null;
}

export async function saveConcertEvent(event: ConcertEvent): Promise<void> {
  try {
    await withTimeout(setDoc(doc(db, 'events', event.id), event), 2000);
  } catch {
    // fallback
  }
  const all = await getConcertEvents();
  const index = all.findIndex(e => e.id === event.id);
  if (index >= 0) all[index] = event;
  else all.push(event);
  localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(all));
}

export async function deleteConcertEvent(eventId: string): Promise<void> {
  try {
    await withTimeout(deleteDoc(doc(db, 'events', eventId)), 2000);
  } catch {
    // fallback
  }
  const all = await getConcertEvents();
  const updated = all.filter(e => e.id !== eventId);
  localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(updated));
}

// -------------------------------------------------------------
// ORDERS & TICKETS SERVICE
// -------------------------------------------------------------
export async function createTicketOrder(order: TicketOrder): Promise<TicketOrder> {
  try {
    await withTimeout(setDoc(doc(db, 'ticket_orders', order.id), order), 2000);
  } catch {
    // fallback
  }
  // Store locally
  const raw = localStorage.getItem(LS_ORDERS_KEY);
  const orders: TicketOrder[] = raw ? JSON.parse(raw) : SAMPLE_ORDERS;
  orders.unshift(order);
  localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));

  // Deduct inventory
  try {
    const event = await getConcertById(order.eventId);
    if (event) {
      const updatedCategories = event.ticketCategories.map(cat => {
        if (cat.id === order.tierId) {
          return { ...cat, available: Math.max(0, cat.available - order.quantity) };
        }
        return cat;
      });
      await saveConcertEvent({ ...event, ticketCategories: updatedCategories, updatedAt: new Date().toISOString() });
    }
  } catch {
    // fallback
  }

  return order;
}

export async function getTicketOrders(): Promise<TicketOrder[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'ticket_orders')), 2000);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as TicketOrder);
    }
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_ORDERS_KEY);
  return raw ? JSON.parse(raw) : SAMPLE_ORDERS;
}

export async function getOrderById(bookingRef: string): Promise<TicketOrder | null> {
  const cleanRef = bookingRef.trim().toUpperCase().replace(/^#/, '');
  try {
    const snap = await withTimeout(getDoc(doc(db, 'ticket_orders', cleanRef)), 1500);
    if (snap.exists()) return snap.data() as TicketOrder;
  } catch {
    // fallback
  }
  const orders = await getTicketOrders();
  return orders.find(o => o.id.toUpperCase() === cleanRef || o.id.toUpperCase() === `#${cleanRef}`) || null;
}

export async function searchTickets(queryStr: string): Promise<TicketOrder[]> {
  const clean = queryStr.trim().toLowerCase();
  if (!clean) return [];
  const orders = await getTicketOrders();
  return orders.filter(o => 
    o.id.toLowerCase().includes(clean) ||
    o.attendee.email.toLowerCase().includes(clean) ||
    o.attendee.fullName.toLowerCase().includes(clean) ||
    (o.qrPayload && o.qrPayload.toLowerCase().includes(clean))
  );
}

export async function updateOrderStatus(
  orderId: string, 
  paymentStatus?: TicketOrder['paymentStatus'], 
  ticketStatus?: TicketOrder['ticketStatus'],
  adminNotes?: string,
  paymentApprovedBy?: string
): Promise<void> {
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (paymentStatus) updateData.paymentStatus = paymentStatus;
  if (ticketStatus) updateData.ticketStatus = ticketStatus;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (paymentApprovedBy) {
    updateData.paymentApprovedBy = paymentApprovedBy;
    updateData.paymentApprovedAt = new Date().toISOString();
  }

  try {
    await withTimeout(updateDoc(doc(db, 'ticket_orders', orderId), updateData), 2000);
  } catch {
    // fallback
  }
  const orders = await getTicketOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...updateData };
    localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
  }
}

export async function approveTicketOrderPayment(orderId: string, adminEmail: string, notes?: string): Promise<TicketOrder | null> {
  await updateOrderStatus(orderId, 'Payment Confirmed', 'TICKET ISSUED', notes, adminEmail);
  return getOrderById(orderId);
}

export async function rejectTicketOrderPayment(orderId: string, reason: string): Promise<TicketOrder | null> {
  await updateOrderStatus(orderId, 'Payment Failed', 'PAYMENT PENDING', `Payment rejected: ${reason}`);
  return getOrderById(orderId);
}

export async function updateEventTierPrices(eventId: string, tiers: TicketTierConfig[]): Promise<ConcertEvent | null> {
  const event = await getConcertById(eventId);
  if (!event) return null;

  // Calculate lowest tier price as startingPrice
  const minPrice = tiers.reduce((min, t) => (t.price < min ? t.price : min), tiers[0]?.price || event.startingPrice);
  const updatedEvent: ConcertEvent = {
    ...event,
    ticketCategories: tiers,
    startingPrice: minPrice,
    updatedAt: new Date().toISOString()
  };

  await saveConcertEvent(updatedEvent);
  return updatedEvent;
}

// -------------------------------------------------------------
// PAYMENT METHODS SERVICE
// -------------------------------------------------------------
export async function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'payment_methods')), 2000);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as PaymentMethodConfig);
    }
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_PAYMENT_METHODS_KEY);
  return raw ? JSON.parse(raw) : INITIAL_PAYMENT_METHODS;
}

export async function savePaymentMethod(pm: PaymentMethodConfig): Promise<PaymentMethodConfig> {
  const methodWithTimestamp: PaymentMethodConfig = {
    ...pm,
    updatedAt: new Date().toISOString()
  };
  try {
    await withTimeout(setDoc(doc(db, 'payment_methods', pm.id), methodWithTimestamp), 2000);
  } catch {
    // fallback
  }
  const methods = await getPaymentMethods();
  const idx = methods.findIndex(m => m.id === pm.id);
  if (idx >= 0) {
    methods[idx] = methodWithTimestamp;
  } else {
    methods.push(methodWithTimestamp);
  }
  localStorage.setItem(LS_PAYMENT_METHODS_KEY, JSON.stringify(methods));
  return methodWithTimestamp;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  try {
    await withTimeout(deleteDoc(doc(db, 'payment_methods', id)), 2000);
  } catch {
    // fallback
  }
  const methods = await getPaymentMethods();
  const filtered = methods.filter(m => m.id !== id);
  localStorage.setItem(LS_PAYMENT_METHODS_KEY, JSON.stringify(filtered));
}

// -------------------------------------------------------------
// MEET & GREET REQUESTS SERVICE
// -------------------------------------------------------------
export async function createMeetGreetRequest(req: MeetGreetRequest): Promise<MeetGreetRequest> {
  try {
    await withTimeout(setDoc(doc(db, 'meet_greet_requests', req.id), req), 2000);
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_MGR_KEY);
  const list: MeetGreetRequest[] = raw ? JSON.parse(raw) : SAMPLE_MEET_GREETS;
  list.unshift(req);
  localStorage.setItem(LS_MGR_KEY, JSON.stringify(list));
  return req;
}

export async function getMeetGreetRequests(): Promise<MeetGreetRequest[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'meet_greet_requests')), 2000);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as MeetGreetRequest);
    }
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_MGR_KEY);
  return raw ? JSON.parse(raw) : SAMPLE_MEET_GREETS;
}

export async function getMeetGreetById(id: string): Promise<MeetGreetRequest | null> {
  const cleanId = id.trim().toUpperCase();
  try {
    const snap = await withTimeout(getDoc(doc(db, 'meet_greet_requests', cleanId)), 1500);
    if (snap.exists()) return snap.data() as MeetGreetRequest;
  } catch {
    // fallback
  }
  const list = await getMeetGreetRequests();
  return list.find(r => r.id.toUpperCase() === cleanId) || null;
}

export async function updateMeetGreetStatus(
  id: string,
  status: MeetGreetRequest['status'],
  adminNotes?: string,
  organizerStatus?: string
): Promise<void> {
  try {
    const updates: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (organizerStatus !== undefined) updates.organizerConfirmationStatus = organizerStatus;
    await withTimeout(updateDoc(doc(db, 'meet_greet_requests', id), updates), 2000);
  } catch {
    // fallback
  }
  const list = await getMeetGreetRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx >= 0) {
    list[idx].status = status;
    if (adminNotes !== undefined) list[idx].adminNotes = adminNotes;
    if (organizerStatus !== undefined) list[idx].organizerConfirmationStatus = organizerStatus;
    list[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(LS_MGR_KEY, JSON.stringify(list));
  }
}

// -------------------------------------------------------------
// VIP PACKAGES & REWARDS
// -------------------------------------------------------------
export async function getVIPPackages(): Promise<VIPExperiencePackage[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'vip_packages')), 2000);
    if (!snap.empty) return snap.docs.map(d => d.data() as VIPExperiencePackage);
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_VIP_KEY);
  return raw ? JSON.parse(raw) : INITIAL_VIP_PACKAGES;
}

export async function getGiveaways(): Promise<FanRewardGiveaway[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'giveaways')), 2000);
    if (!snap.empty) return snap.docs.map(d => d.data() as FanRewardGiveaway);
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_REWARDS_KEY);
  return raw ? JSON.parse(raw) : INITIAL_GIVEAWAYS;
}

export async function enterGiveaway(giveawayId: string, _userDetails: { name: string; email: string; city: string }): Promise<boolean> {
  const giveaways = await getGiveaways();
  const idx = giveaways.findIndex(g => g.id === giveawayId);
  if (idx >= 0) {
    giveaways[idx].totalEntries += 1;
    localStorage.setItem(LS_REWARDS_KEY, JSON.stringify(giveaways));
    try {
      await withTimeout(updateDoc(doc(db, 'giveaways', giveawayId), {
        totalEntries: giveaways[idx].totalEntries
      }), 2000);
    } catch {
      // fallback
    }
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// SUPPORT TICKETS SERVICE
// -------------------------------------------------------------
export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'support_tickets')), 2000);
    if (!snap.empty) return snap.docs.map(d => d.data() as SupportTicket);
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_SUPPORT_KEY);
  return raw ? JSON.parse(raw) : SAMPLE_SUPPORT_TICKETS;
}

export async function createSupportTicket(ticket: SupportTicket): Promise<SupportTicket> {
  try {
    await withTimeout(setDoc(doc(db, 'support_tickets', ticket.id), ticket), 2000);
  } catch {
    // fallback
  }
  const list = await getSupportTickets();
  list.unshift(ticket);
  localStorage.setItem(LS_SUPPORT_KEY, JSON.stringify(list));
  return ticket;
}

export async function addSupportMessage(ticketId: string, sender: 'user' | 'agent', senderName: string, text: string): Promise<SupportTicket | null> {
  const list = await getSupportTickets();
  const idx = list.findIndex(t => t.id === ticketId);
  if (idx >= 0) {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };
    list[idx].messages.push(newMsg);
    list[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(LS_SUPPORT_KEY, JSON.stringify(list));
    try {
      await withTimeout(updateDoc(doc(db, 'support_tickets', ticketId), {
        messages: list[idx].messages,
        updatedAt: list[idx].updatedAt
      }), 2000);
    } catch {
      // fallback
    }
    return list[idx];
  }
  return null;
}
