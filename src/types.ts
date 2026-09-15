export type TicketCategoryType = 
  | 'General Admission'
  | 'Standard Seating'
  | 'Premium Seating'
  | 'VIP'
  | 'Premium VIP'
  | 'Hospitality Package'
  | 'Meet & Greet Request'
  | string;

export interface TicketTierConfig {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  inventory: number;
  available: number;
  sectionInfo?: string;
  badge?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string; // e.g. "Zelle Transfer", "Bank Wire Transfer", "Cash App", "PayPal Concierge", "Apple Pay / Card Transfer", "Crypto (USDT / BTC)"
  category: 'zelle' | 'bank' | 'cashapp' | 'paypal' | 'apple_pay' | 'crypto' | 'custom' | 'other';
  accountName: string;
  accountNumberOrHandle: string;
  bankName?: string;
  routingNumber?: string;
  swiftBic?: string;
  qrCodeImage?: string;
  instructions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcertEvent {
  id: string;
  eventName: string;
  artist: string;
  tourName: string;
  venue: string;
  city: string;
  country: string;
  eventDate: string; // YYYY-MM-DD
  doorsOpen: string; // e.g. "18:00"
  concertTime: string; // e.g. "20:00"
  ticketCategories: TicketTierConfig[];
  startingPrice: number;
  vipAvailability: boolean;
  meetAndGreetAvailability: boolean;
  status: 'upcoming' | 'sold_out' | 'postponed' | 'archived';
  heroImage: string;
  description: string;
  specialGuests?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 
  | 'Payment Pending'
  | 'Payment Processing'
  | 'Payment Confirmed'
  | 'Payment Failed'
  | 'Refunded';

export type TicketStatus = 
  | 'PAYMENT PENDING'
  | 'BOOKING CONFIRMED'
  | 'TICKET ISSUED'
  | 'EVENT CANCELLED'
  | 'REFUNDED'
  | 'INVALID / LEGACY'
  | 'INVALID'
  | 'REVOKED'
  | 'PAYMENT FAILED';

export interface TicketAttendee {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  guestCount: number;
  accessibilityRequirements?: string;
  specialRequests?: string;
}

export interface PricingBreakdown {
  subtotal: number;
  serviceFee: number;
  facilityFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface TicketOrder {
  id: string; // e.g., EC-2026-89421
  customerId?: string;
  eventId: string;
  eventSnapshot: {
    eventName: string;
    venue: string;
    city: string;
    country: string;
    eventDate: string;
    doorsOpen: string;
    concertTime: string;
    heroImage: string;
  };
  tierId: string;
  tierName: TicketCategoryType;
  quantity: number;
  seatInfo: string;
  attendee: TicketAttendee;
  pricing: PricingBreakdown;
  paymentMethod: string; // payment method id or name
  paymentMethodDetails?: string;
  paymentProofUrl?: string; // Base64 data URL or uploaded receipt image
  paymentProofFileName?: string;
  paymentProofUploadedAt?: string;
  paymentApprovedAt?: string;
  paymentApprovedBy?: string;
  paymentStatus: PaymentStatus;
  ticketStatus: TicketStatus;
  transactionId: string;
  qrPayload: string; // text embedded in QR for verification
  entryInstructions: string;
  adminNotes?: string;
  inventoryVersion?: string; // 'v1' (legacy inventory) or 'v2' (current Sept 15 inventory)
  isLegacy?: boolean;
  legacyInvalidatedAt?: string;
  legacyInvalidationReason?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type MeetGreetStatus = 
  | 'Request Received'
  | 'Under Review'
  | 'Awaiting Organizer Confirmation'
  | 'Confirmed'
  | 'Not Available'
  | 'Cancelled';

export interface MeetGreetRequest {
  id: string; // e.g. MGR-2026-44109
  customerId?: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  eventId: string;
  eventName: string;
  venueCity: string;
  preferredDate: string;
  numberOfGuests: number;
  experiencePreference: string;
  accessibilityRequirements?: string;
  messageToTeam: string;
  status: MeetGreetStatus;
  adminNotes?: string;
  organizerConfirmationStatus?: string;
  assignedStaff?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VIPExperiencePackage {
  id: string;
  name: string;
  tagline: string;
  startingPrice: number;
  heroImage: string;
  badge: string;
  includes: string[];
  itinerary: string[];
  hospitalityDetails: string;
  merchandisePerks: string;
  isMeetGreetEligible: boolean;
}

export interface FanRewardGiveaway {
  id: string;
  title: string;
  category: 'Signed Memorabilia' | 'Concert VIP Pass' | 'Limited Vinyl Boxset' | 'Backstage Tour Experience';
  description: string;
  image: string;
  closingDate: string;
  winnersCount: number;
  totalEntries: number;
  terms: string[];
  disclaimer: string;
  isActive: boolean;
  recentWinners?: { name: string; city: string; prize: string; date: string }[];
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingRef?: string;
  category: 'Ticket Lookup' | 'VIP Inquiries' | 'Meet & Greet' | 'Reschedule / Refund' | 'Venue & Accessibility' | 'General Support';
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Normal' | 'High' | 'VIP Escalation';
  assignedAdmin?: string;
  messages: {
    id: string;
    sender: 'user' | 'agent' | 'system';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  country?: string;
  role: 'fan' | 'vip_member' | 'admin';
  createdAt: string;
}
