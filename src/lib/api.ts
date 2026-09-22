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
const LS_EVENTS_KEY = 'ec_vip_events_store_v20';
const LS_ORDERS_KEY = 'ec_vip_orders_store_v9';
const LS_MGR_KEY = 'ec_vip_mgr_store_v9';
const LS_SUPPORT_KEY = 'ec_vip_support_store_v9';
const LS_VIP_KEY = 'ec_vip_packages_store_v9';
const LS_REWARDS_KEY = 'ec_vip_rewards_store_v9';
const LS_PAYMENT_METHODS_KEY = 'ec_vip_payment_methods_store_v10';

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
let _initialSeedExecuted = false;

const OBSOLETE_OR_PASSED_EVENT_IDS = [
  'ec-kansascity-2026',
  'ec-stpaul-2026',
  'ec-detroit-2026',
  'ec-cincinnati-2026',
  'ec-chicago-2026',
  'ec-milwaukee-2026',
  'ec-london-rah-2026',
  'ec-msg-nyc-2026',
  'ec-budokan-tokyo-2026',
  'ec-olympia-paris-2026',
  'ec-redrocks-colorado-2027'
];

export async function seedInitialDataIfNeeded(force = false) {
  if (_initialSeedExecuted && !force) {
    return;
  }
  _initialSeedExecuted = true;

  // Clean up legacy saved fan email if it was the demo fallback
  try {
    const savedEmail = localStorage.getItem('ec_vip_fan_email');
    if (savedEmail && savedEmail.toLowerCase() === 'alexwtchmn@gmail.com') {
      localStorage.removeItem('ec_vip_fan_email');
    }
  } catch {
    // ignore
  }

  // Always ensure LocalStorage cache is populated immediately for zero latency with upcoming events
  localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
  
  const rawOrders = localStorage.getItem(LS_ORDERS_KEY);
  if (!rawOrders) {
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
    
    // Obsolete and passed event IDs cleanup from Firestore
    for (const oldId of OBSOLETE_OR_PASSED_EVENT_IDS) {
      try {
        await deleteDoc(doc(db, 'events', oldId));
      } catch {
        // ignore
      }
    }

    // Delete obsolete support tickets if they existed
    try {
      await deleteDoc(doc(db, 'support_tickets', 'SPT-1001'));
      await deleteDoc(doc(db, 'support_tickets', 'SPT-9012'));
    } catch {
      // ignore
    }

    // Always ensure all current tour events are present in Firestore
    for (const ev of INITIAL_EVENTS) {
      await setDoc(doc(db, 'events', ev.id), ev);
    }

    // Purge all payment methods from Firestore as requested
    try {
      const pmCol = collection(db, 'payment_methods');
      const pmSnap = await withTimeout(getDocs(pmCol), 2500);
      for (const d of pmSnap.docs) {
        await deleteDoc(doc(db, 'payment_methods', d.id));
      }
    } catch {
      // ignore
    }

    // Seed sample orders ONLY if Firestore ticket_orders collection is completely empty
    const ordersCol = collection(db, 'ticket_orders');
    const ordersSnap = await withTimeout(getDocs(ordersCol), 2000);
    if (ordersSnap.empty) {
      for (const ord of SAMPLE_ORDERS) {
        await setDoc(doc(db, 'ticket_orders', ord.id), ord);
      }
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
  const isEventCurrent = (event: ConcertEvent) => {
    if (!event || !event.eventDate) return false;
    if (OBSOLETE_OR_PASSED_EVENT_IDS.includes(event.id)) return false;
    // Current date threshold: September 17, 2026 (or today's date)
    const todayStr = new Date().toISOString().split('T')[0];
    const thresholdDate = todayStr < '2026-09-17' ? '2026-09-17' : todayStr;
    return event.eventDate >= thresholdDate;
  };

  try {
    const snap = await withTimeout(getDocs(collection(db, 'events')), 2000);
    if (!snap.empty) {
      let docs = snap.docs.map(d => d.data() as ConcertEvent);
      // Filter out obsolete and passed events
      docs = docs.filter(isEventCurrent);
      
      // Ensure all standard initial upcoming events exist and have latest inventory status
      for (const initEv of INITIAL_EVENTS) {
        const existingIdx = docs.findIndex(d => d.id === initEv.id);
        if (existingIdx === -1) {
          docs.push(initEv);
          try {
            setDoc(doc(db, 'events', initEv.id), initEv);
          } catch {
            // ignore
          }
        } else {
          // Always keep ticket categories, starting price, and dates synchronized with latest configuration
          docs[existingIdx] = {
            ...docs[existingIdx],
            eventName: initEv.eventName,
            eventDate: initEv.eventDate,
            doorsOpen: initEv.doorsOpen,
            concertTime: initEv.concertTime,
            startingPrice: initEv.startingPrice,
            ticketCategories: initEv.ticketCategories,
            description: initEv.description
          };
          try {
            setDoc(doc(db, 'events', initEv.id), docs[existingIdx]);
          } catch {
            // ignore
          }
        }
      }

      if (docs.length > 0) {
        localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(docs));
        return docs.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
      }
    }
  } catch {
    // Instant fallback to LocalStorage
  }

  const raw = localStorage.getItem(LS_EVENTS_KEY);
  let list: ConcertEvent[] = raw ? JSON.parse(raw) : INITIAL_EVENTS;
  list = list.filter(isEventCurrent);
  
  // Ensure all active upcoming initial events are present with latest inventory
  for (const initEv of INITIAL_EVENTS) {
    const existingIdx = list.findIndex(d => d.id === initEv.id);
    if (existingIdx === -1) {
      list.push(initEv);
    } else {
      list[existingIdx] = {
        ...list[existingIdx],
        eventName: initEv.eventName,
        eventDate: initEv.eventDate,
        doorsOpen: initEv.doorsOpen,
        concertTime: initEv.concertTime,
        startingPrice: initEv.startingPrice,
        ticketCategories: initEv.ticketCategories,
        description: initEv.description
      };
    }
  }
  localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(list));
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
// ORDERS & TICKETS SERVICE WITH SEPT 15 INVENTORY VALIDATION
// -------------------------------------------------------------

/**
 * Checks whether an order is for the 15th (St. Paul) and was issued under
 * the previous ticket inventory/version.
 * 
 * Rules:
 * - Applies ONLY to the Eric Clapton event on the 15th (ec-stpaul-2026, 2026-09-15).
 * - Tickets for ANY OTHER event date MUST NOT be invalidated.
 * - Current version 15th tickets have inventoryVersion === 'v2' and tierId === 'stp-tier-vip'.
 * - All previously issued 15th tickets (inventoryVersion !== 'v2', or legacy tiers, or created prior to cutover) are legacy tickets.
 * - Does not single out individual customers; evaluates the objective event date and inventory version.
 */
export function isLegacy15thTicket(order: TicketOrder): boolean {
  if (!order) return false;

  const is15th = 
    order.eventId === 'ec-stpaul-2026' || 
    order.eventSnapshot?.eventDate === '2026-09-15' ||
    (order.eventSnapshot?.city?.toLowerCase().includes('st. paul') && order.eventSnapshot?.eventDate?.includes('09-15'));

  // Do not invalidate tickets for any other event date
  if (!is15th) {
    return false;
  }

  // If already stamped as current inventory version 'v2' for the 15th
  if (order.inventoryVersion === 'v2' && order.tierId === 'stp-tier-vip') {
    return false;
  }

  // All previously issued tickets for the 15th are legacy tickets
  return true;
}

export interface TicketScanValidationResult {
  isValid: boolean;
  isLegacy15th: boolean;
  ticketStatus: TicketOrder['ticketStatus'];
  displayMessage: string;
  canCheckIn: boolean;
  order: TicketOrder;
}

/**
 * Validates a scanned or looked-up ticket.
 * - All previously issued 15th tickets are marked INVALID.
 * - Disallows checking in or accepting at the venue.
 * - Displays exact message: “TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.”
 * - Retains historical ticket records for administrative/audit purposes and marks their status as INVALID / LEGACY.
 * - Tickets for other event dates remain valid and unaffected.
 */
export function validateTicketForScan(order: TicketOrder): TicketScanValidationResult {
  if (isLegacy15thTicket(order)) {
    const legacyOrder: TicketOrder = {
      ...order,
      ticketStatus: 'INVALID / LEGACY',
      isLegacy: true,
      inventoryVersion: 'v1',
      legacyInvalidatedAt: order.legacyInvalidatedAt || new Date().toISOString(),
      legacyInvalidationReason: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
      entryInstructions: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.'
    };

    return {
      isValid: false,
      isLegacy15th: true,
      ticketStatus: 'INVALID / LEGACY',
      displayMessage: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
      canCheckIn: false,
      order: legacyOrder
    };
  }

  // Standard evaluation for other concert dates and valid new 15th passes
  // Handle explicitly revoked tickets
  if (order.ticketStatus === 'REVOKED' || order.ticketStatus === 'INVALID') {
    return {
      isValid: false,
      isLegacy15th: false,
      ticketStatus: 'REVOKED',
      displayMessage: 'TICKET REVOKED — This concert pass has been revoked by tour administration. Venue admission cannot be granted.',
      canCheckIn: false,
      order
    };
  }

  const isApproved = order.paymentStatus === 'Payment Confirmed' || order.ticketStatus === 'TICKET ISSUED';
  const isDeclinedOrCancelled = 
    order.ticketStatus === 'REFUNDED' || 
    order.ticketStatus === 'EVENT CANCELLED' || 
    order.ticketStatus === 'PAYMENT FAILED' ||
    order.paymentStatus === 'Payment Failed';

  if (isDeclinedOrCancelled) {
    return {
      isValid: false,
      isLegacy15th: false,
      ticketStatus: order.ticketStatus,
      displayMessage: `Ticket payment declined or cancelled. Venue admission cannot be granted.`,
      canCheckIn: false,
      order
    };
  }

  return {
    isValid: isApproved,
    isLegacy15th: false,
    ticketStatus: order.ticketStatus,
    displayMessage: isApproved
      ? 'Pass verified and active for venue entry.'
      : 'Booking registered. Payment verification in progress by tour administration.',
    canCheckIn: isApproved && !order.checkedIn,
    order
  };
}

/**
 * Normalizes an order record: if it's for the 15th and issued under previous inventory,
 * retains the complete historical record while ensuring ticketStatus is marked INVALID / LEGACY.
 * Other dates remain completely unchanged.
 */
export function normalizeOrderForAudit(order: TicketOrder): TicketOrder {
  if (isLegacy15thTicket(order)) {
    return {
      ...order,
      ticketStatus: 'INVALID / LEGACY',
      isLegacy: true,
      inventoryVersion: 'v1',
      legacyInvalidationReason: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
      entryInstructions: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.'
    };
  }
  return order;
}

export async function createTicketOrder(order: TicketOrder): Promise<TicketOrder> {
  // If creating an order for the 15th, stamp it with the current inventory version 'v2'
  const is15th = 
    order.eventId === 'ec-stpaul-2026' || 
    order.eventSnapshot?.eventDate === '2026-09-15';

  const finalOrder: TicketOrder = {
    ...order,
    inventoryVersion: is15th ? 'v2' : (order.inventoryVersion || 'v1'),
    isLegacy: is15th ? false : !!order.isLegacy
  };

  try {
    await withTimeout(setDoc(doc(db, 'ticket_orders', finalOrder.id), finalOrder), 2000);
  } catch {
    // fallback
  }

  // Store locally
  const raw = localStorage.getItem(LS_ORDERS_KEY);
  const orders: TicketOrder[] = raw ? JSON.parse(raw) : SAMPLE_ORDERS;
  orders.unshift(finalOrder);
  localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));

  // Deduct inventory
  try {
    const event = await getConcertById(finalOrder.eventId);
    if (event) {
      const updatedCategories = event.ticketCategories.map(cat => {
        if (cat.id === finalOrder.tierId) {
          return { ...cat, available: Math.max(0, cat.available - finalOrder.quantity) };
        }
        return cat;
      });
      await saveConcertEvent({ ...event, ticketCategories: updatedCategories, updatedAt: new Date().toISOString() });
    }
  } catch {
    // fallback
  }

  return finalOrder;
}

export async function getTicketOrders(): Promise<TicketOrder[]> {
  let loadedOrders: TicketOrder[] = [];
  try {
    const snap = await withTimeout(getDocs(collection(db, 'ticket_orders')), 2000);
    if (!snap.empty) {
      loadedOrders = snap.docs.map(d => d.data() as TicketOrder);
    }
  } catch {
    // fallback
  }

  if (loadedOrders.length === 0) {
    const raw = localStorage.getItem(LS_ORDERS_KEY);
    loadedOrders = raw ? JSON.parse(raw) : SAMPLE_ORDERS;
  }

  // Apply audit normalization:
  // Retains all historical records, but marks previously issued 15th tickets as INVALID / LEGACY.
  // Other event dates are not invalidated!
  return loadedOrders.map(normalizeOrderForAudit);
}

export async function getOrderById(bookingRef: string): Promise<TicketOrder | null> {
  const cleanRef = bookingRef.trim().toUpperCase().replace(/^#/, '');
  try {
    const snap = await withTimeout(getDoc(doc(db, 'ticket_orders', cleanRef)), 1500);
    if (snap.exists()) {
      return normalizeOrderForAudit(snap.data() as TicketOrder);
    }
  } catch {
    // fallback
  }
  const orders = await getTicketOrders();
  const found = orders.find(o => o.id.toUpperCase() === cleanRef || o.id.toUpperCase() === `#${cleanRef}`);
  return found ? normalizeOrderForAudit(found) : null;
}

export async function searchTickets(queryStr: string): Promise<TicketOrder[]> {
  const clean = queryStr.trim().toLowerCase();
  if (!clean) return [];
  const orders = await getTicketOrders();
  const matched = orders
    .filter(o => 
      o.id.toLowerCase().includes(clean) ||
      o.attendee.email.toLowerCase().includes(clean) ||
      o.attendee.fullName.toLowerCase().includes(clean) ||
      (o.qrPayload && o.qrPayload.toLowerCase().includes(clean))
    )
    .map(normalizeOrderForAudit);

  // Intelligently rank results:
  // 1. Current valid active passes come ahead of legacy/invalid passes
  // 2. Newer bookings (createdAt desc) come before older bookings
  return matched.sort((a, b) => {
    const aLegacy = isLegacy15thTicket(a);
    const bLegacy = isLegacy15thTicket(b);
    if (!aLegacy && bLegacy) return -1;
    if (aLegacy && !bLegacy) return 1;

    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export async function checkInGatePass(
  orderId: string, 
  staffName = 'Venue Gate Security'
): Promise<{ success: boolean; message: string; order?: TicketOrder }> {
  const order = await getOrderById(orderId);
  if (!order) {
    return { success: false, message: `Pass reference #${orderId} not found in tour database.` };
  }

  const validation = validateTicketForScan(order);

  // Check whether it is an invalid/legacy ticket for the 15th
  if (validation.isLegacy15th) {
    return {
      success: false,
      message: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
      order: validation.order
    };
  }

  if (!validation.isValid) {
    return {
      success: false,
      message: validation.displayMessage || 'Ticket is not valid for venue entry.',
      order: validation.order
    };
  }

  if (order.checkedIn) {
    return {
      success: false,
      message: `Pass #${order.id} was already checked in at ${order.checkedInAt ? new Date(order.checkedInAt).toLocaleTimeString() : 'earlier'} by ${order.checkedInBy || 'Gate Staff'}.`,
      order
    };
  }

  // Check in pass
  const checkedInOrder: TicketOrder = {
    ...order,
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    checkedInBy: staffName,
    updatedAt: new Date().toISOString()
  };

  try {
    await withTimeout(updateDoc(doc(db, 'ticket_orders', order.id), {
      checkedIn: true,
      checkedInAt: checkedInOrder.checkedInAt,
      checkedInBy: staffName,
      updatedAt: checkedInOrder.updatedAt
    }), 1500);
  } catch {
    // fallback
  }

  const raw = localStorage.getItem(LS_ORDERS_KEY);
  if (raw) {
    const list: TicketOrder[] = JSON.parse(raw);
    const idx = list.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      list[idx] = checkedInOrder;
      localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(list));
    }
  }

  return {
    success: true,
    message: `Pass #${order.id} verified and checked in for ${order.attendee.fullName} (${order.tierName}). Gate admission granted.`,
    order: checkedInOrder
  };
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

  // 1. Immediately update LocalStorage cache for immediate UI reactivity
  try {
    const raw = localStorage.getItem(LS_ORDERS_KEY);
    if (raw) {
      const orders: TicketOrder[] = JSON.parse(raw);
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx >= 0) {
        orders[idx] = { ...orders[idx], ...updateData } as TicketOrder;
        localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
      }
    }
  } catch (err) {
    console.error('Failed updating local orders storage:', err);
  }

  // 2. Persist to Firestore with setDoc merge: true
  try {
    await withTimeout(setDoc(doc(db, 'ticket_orders', orderId), updateData, { merge: true }), 2500);
  } catch (err) {
    console.warn('Firestore setDoc warning (fallback to local):', err);
  }
}

export async function approveTicketOrderPayment(orderId: string, adminEmail: string, notes?: string): Promise<TicketOrder | null> {
  await updateOrderStatus(orderId, 'Payment Confirmed', 'TICKET ISSUED', notes || 'Payment verified by administrator', adminEmail);
  return getOrderById(orderId);
}

export async function rejectTicketOrderPayment(orderId: string, reason: string): Promise<TicketOrder | null> {
  await updateOrderStatus(
    orderId, 
    'Payment Failed', 
    'PAYMENT FAILED', 
    reason ? `Payment declined: ${reason}` : 'Payment declined by tour administrator'
  );
  return getOrderById(orderId);
}

export async function revokeTicketPass(orderId: string, reason?: string): Promise<TicketOrder | null> {
  await updateOrderStatus(
    orderId, 
    'Refunded', 
    'REVOKED', 
    reason || 'Pass revoked by tour administrator'
  );
  return getOrderById(orderId);
}

export async function reinstateTicketPass(orderId: string, adminEmail = 'admin@ericclapton.com'): Promise<TicketOrder | null> {
  await updateOrderStatus(
    orderId, 
    'Payment Confirmed', 
    'TICKET ISSUED', 
    'Pass reinstated and activated by tour administrator', 
    adminEmail
  );
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
    return snap.docs.map(d => d.data() as PaymentMethodConfig);
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
    if (!snap.empty) {
      return snap.docs
        .map(d => d.data() as SupportTicket)
        .filter(t => t.id !== 'SPT-1001' && t.id !== 'SPT-9012' && t.customerEmail?.toLowerCase() !== 'alexwtchmn@gmail.com');
    }
  } catch {
    // fallback
  }
  const raw = localStorage.getItem(LS_SUPPORT_KEY);
  const list: SupportTicket[] = raw ? JSON.parse(raw) : SAMPLE_SUPPORT_TICKETS;
  return list.filter(t => t.id !== 'SPT-1001' && t.id !== 'SPT-9012' && t.customerEmail?.toLowerCase() !== 'alexwtchmn@gmail.com');
}

export async function getSupportTicketsByEmail(email: string): Promise<SupportTicket[]> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return [];
  const allTickets = await getSupportTickets();
  return allTickets.filter(t => t.customerEmail?.toLowerCase() === cleanEmail);
}

export async function getOrdersByEmail(email: string): Promise<TicketOrder[]> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return [];
  const allOrders = await getTicketOrders();
  return allOrders.filter(o => o.attendee?.email?.toLowerCase() === cleanEmail);
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

export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicket['status'],
  priority?: SupportTicket['priority'],
  assignedAdmin?: string
): Promise<void> {
  const list = await getSupportTickets();
  const idx = list.findIndex(t => t.id === ticketId);
  if (idx >= 0) {
    list[idx].status = status;
    if (priority) list[idx].priority = priority;
    if (assignedAdmin) list[idx].assignedAdmin = assignedAdmin;
    list[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(LS_SUPPORT_KEY, JSON.stringify(list));
    try {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: list[idx].updatedAt
      };
      if (priority) updates.priority = priority;
      if (assignedAdmin) updates.assignedAdmin = assignedAdmin;
      await withTimeout(updateDoc(doc(db, 'support_tickets', ticketId), updates), 2000);
    } catch {
      // fallback
    }
  }
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
    // If user replies and ticket was Resolved, move to In Progress
    if (sender === 'user' && list[idx].status === 'Resolved') {
      list[idx].status = 'In Progress';
    }
    localStorage.setItem(LS_SUPPORT_KEY, JSON.stringify(list));
    try {
      await withTimeout(updateDoc(doc(db, 'support_tickets', ticketId), {
        messages: list[idx].messages,
        status: list[idx].status,
        updatedAt: list[idx].updatedAt
      }), 2000);
    } catch {
      // fallback
    }
    return list[idx];
  }
  return null;
}
