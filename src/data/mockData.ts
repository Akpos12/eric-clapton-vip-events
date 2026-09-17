import { ConcertEvent, VIPExperiencePackage, FanRewardGiveaway, TicketOrder, MeetGreetRequest, SupportTicket, PaymentMethodConfig } from '../types';

export const INITIAL_EVENTS: ConcertEvent[] = [
  {
    id: 'ec-seattle-2026',
    eventName: 'Eric Clapton Live at Climate Pledge Arena',
    artist: 'Eric Clapton',
    tourName: 'North American Tour 2026',
    venue: 'Climate Pledge Arena',
    city: 'Seattle, Washington',
    country: 'United States',
    eventDate: '2026-09-18',
    doorsOpen: '18:00',
    concertTime: '19:30',
    startingPrice: 1500,
    vipAvailability: true,
    meetAndGreetAvailability: true,
    status: 'upcoming',
    heroImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop',
    description: 'Eric Clapton commands Climate Pledge Arena in Seattle on Friday, September 18, 2026 at 7:30 PM, performing classic blues anthems, iconic electric masterworks, and intimate acoustic sets with special guest Jimmie Vaughan.',
    specialGuests: 'Jimmie Vaughan',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ticketCategories: [
      {
        id: 'sea-tier-vip',
        name: 'VIP',
        price: 3000,
        description: 'The Ultimate Ultra-VIP Backstage Experience: 1-on-1 meeting with Eric Clapton, Front Row Center Seating, soundcheck access, and luxury hospitality.',
        benefits: [
          'Private 1-on-1 Personal Meeting & Conversation with Eric Clapton Backstage',
          'Professional Backstage Photograph with Eric Clapton',
          'Front Row / Premium Ultra-VIP Pit Reserved Center Seating',
          'Exclusive Pre-Show Backstage Soundcheck & Rehearsal Access',
          'Personalized Hand-Signed Eric Clapton Tour Fender Stratocaster Pickguard & Autographed Lithograph',
          'Ultra-VIP Luxury Hospitality Lounge with Gourmet Dining & Open Bar',
          'Fast-Track Red Carpet Arena Entrance with Dedicated VIP Host Escort',
          'Commemorative 24K Gold-Foil VIP Tour Pass, Tour Jacket & Custom VIP Merchandise Pack',
          'Dedicated On-Site VIP Concierge & Reserved Priority Parking Pass'
        ],
        inventory: 40,
        available: 12,
        badge: '1-on-1 Meet & Greet',
        sectionInfo: 'Ultra VIP Front Row Center & Backstage'
      },
      {
        id: 'sea-tier-std',
        name: 'Standard',
        price: 2000,
        description: 'Prime Lower Bowl reserved arena seating with VIP fast-track entry and commemorative tour pack.',
        benefits: [
          'Reserved Prime Lower Bowl Arena Seating (Rows 1-10)',
          'VIP Dedicated Arena Fast-Track Entrance',
          'Commemorative 2026 Tour Laminate & Lanyard',
          'Official Eric Clapton Collector Tour Program Book',
          'Complimentary Welcome Drink Voucher'
        ],
        inventory: 150,
        available: 48,
        badge: 'Prime Seating',
        sectionInfo: 'Lower Bowl Sections 101-108'
      },
      {
        id: 'sea-tier-reg',
        name: 'Regular',
        price: 1500,
        description: 'Standard reserved seating with full arena acoustics and complete concert experience.',
        benefits: [
          'Reserved Arena Bowl Seating',
          'Standard Arena Gate Entry',
          'Official Digital Tour Guide & Collector E-Ticket',
          'Full Access to Official Tour Merchandise Concourse'
        ],
        inventory: 250,
        available: 95,
        badge: 'Available',
        sectionInfo: 'Main Concourse Reserved Seating'
      }
    ]
  },
  {
    id: 'ec-kansascity-2026',
    eventName: 'Eric Clapton Concert',
    artist: 'Eric Clapton',
    tourName: 'North American Tour 2026',
    venue: 'T-Mobile Center',
    city: 'Kansas City, Missouri',
    country: 'United States',
    eventDate: '2026-09-19',
    doorsOpen: '18:30',
    concertTime: '20:00',
    startingPrice: 1800,
    vipAvailability: true,
    meetAndGreetAvailability: true,
    status: 'upcoming',
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    description: 'In the heart of Midwest jazz and blues country, Eric Clapton commands the T-Mobile Center in Kansas City with blistering electric blues and heartfelt acoustics.',
    specialGuests: 'Gary Clark Jr.',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ticketCategories: [
      {
        id: 'kc-tier-ga',
        name: 'General Admission',
        price: 1800,
        description: 'Floor standing with full central sightlines.',
        benefits: ['Arena Floor Standing Entry', 'Commemorative KC Tour Pin'],
        inventory: 200,
        available: 92,
        sectionInfo: 'Floor GA'
      },
      {
        id: 'kc-tier-std',
        name: 'Standard Seating',
        price: 2650,
        description: 'Lower Bowl center reserved seating.',
        benefits: ['Lower Bowl 100-Level Reserved Seats', 'Digital Concert Program'],
        inventory: 220,
        available: 110,
        sectionInfo: 'Sections 105-117'
      },
      {
        id: 'kc-tier-vip',
        name: 'VIP',
        price: 5850,
        description: 'Front Floor Rows with Founders Club VIP pre-show dining.',
        benefits: ['Floor Rows 1-3 Center', 'Founders Club Dining & Bar', 'Embroidered Tour Jacket', 'Collector Acrylic Ticket'],
        inventory: 40,
        available: 14,
        badge: 'VIP Tier',
        sectionInfo: 'Floor Center Rows 1-3'
      },
      {
        id: 'kc-tier-prem-vip',
        name: 'Premium VIP',
        price: 9400,
        description: 'The highest tier Kansas City arena luxury experience with private lounge.',
        benefits: ['Stage-Side Ultra VIP Banquette', 'Private Concierge Escort', 'Backstage VIP Suite Access', 'Vintage Vinyl Boxset', 'Top-Shelf Bar & Gastronomy'],
        inventory: 15,
        available: 4,
        badge: 'Ultra Exclusive',
        sectionInfo: 'Stage Front Diamond Box'
      }
    ]
  },
  {
    id: 'ec-austin-crossroads-day1-2026',
    eventName: 'Crossroads Guitar Festival',
    artist: 'Eric Clapton & Guests',
    tourName: 'Crossroads Guitar Festival 2026',
    venue: 'Moody Center',
    city: 'Austin, Texas',
    country: 'United States',
    eventDate: '2026-09-26',
    doorsOpen: '16:00',
    concertTime: '17:30',
    startingPrice: 1800,
    vipAvailability: true,
    meetAndGreetAvailability: true,
    status: 'upcoming',
    heroImage: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1200&auto=format&fit=crop',
    description: 'Day 1 of the world-renowned Crossroads Guitar Festival at the Moody Center in Austin, Texas. A marathon gathering of the world’s greatest blues and rock guitarists benefiting the Crossroads Centre Antigua.',
    specialGuests: 'Eric Clapton, Gary Clark Jr., Derek Trucks, Susan Tedeschi, Joe Bonamassa, John Mayer & Friends',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ticketCategories: [
      {
        id: 'atx-d1-tier-ga',
        name: 'General Admission',
        price: 1800,
        description: 'Full day festival floor standing with festival village access.',
        benefits: ['Floor General Admission', 'Crossroads 2026 Official Festival Wristband', 'Village Stage Access'],
        inventory: 350,
        available: 120,
        sectionInfo: 'Moody Center Festival Floor'
      },
      {
        id: 'atx-d1-tier-std',
        name: 'Standard Seating',
        price: 2950,
        description: 'Lower Bowl Reserved seating with full panoramic soundstage views.',
        benefits: ['Lower Bowl Reserved Seating', 'Official 100-Page Festival Program Guide'],
        inventory: 300,
        available: 115,
        sectionInfo: 'Sections 106-118'
      },
      {
        id: 'atx-d1-tier-prem',
        name: 'Premium Seating',
        price: 4200,
        description: 'Dell Technologies Club premium seating with fast-track lounge entry.',
        benefits: ['Dell Club Reserved Seat', 'Air-Conditioned Club Lounge Access', 'Collector Acrylic Festival Pass'],
        inventory: 100,
        available: 38,
        badge: 'Popular',
        sectionInfo: 'Dell Club Level Center'
      },
      {
        id: 'atx-d1-tier-vip',
        name: 'VIP',
        price: 6800,
        description: 'Crossroads Patron VIP with German-American Bank Club dining and artist lounge access.',
        benefits: ['Floor Rows 1-3 Prime Seating', 'All-Day Chef Dining & Sommelier Wine Bar', 'Exclusive Crossroads Embroidered Jacket', 'Signed Replica Crossroads Pickguard', 'Commemorative VIP Laminate'],
        inventory: 50,
        available: 14,
        badge: 'Crossroads VIP',
        sectionInfo: 'Floor Center Rows 1-3'
      },
      {
        id: 'atx-d1-tier-prem-vip',
        name: 'Premium VIP',
        price: 11500,
        description: 'Ultra Diamond Crossroads Patron with stage-side banquettes and private guitar museum reception.',
        benefits: ['Stage-Side Diamond Banquette', 'Private VIP Host Escort', 'Access to Vintage Guitar Exhibition & VIP Lounge', 'Framed Crossroads 2026 Fine-Art Print (Numbered)', 'All-Inclusive Top-Shelf Hospitality'],
        inventory: 20,
        available: 5,
        badge: 'Ultra Exclusive',
        sectionInfo: 'Stage Front Diamond Box'
      }
    ]
  },
  {
    id: 'ec-austin-crossroads-day2-2026',
    eventName: 'Crossroads Guitar Festival',
    artist: 'Eric Clapton & Guests',
    tourName: 'Crossroads Guitar Festival 2026',
    venue: 'Moody Center',
    city: 'Austin, Texas',
    country: 'United States',
    eventDate: '2026-09-27',
    doorsOpen: '16:00',
    concertTime: '17:30',
    startingPrice: 1800,
    vipAvailability: true,
    meetAndGreetAvailability: true,
    status: 'upcoming',
    heroImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop',
    description: 'Day 2 Grand Finale of the Crossroads Guitar Festival at the Moody Center in Austin, Texas. The climactic all-star guitar summit and legendary multi-artist jam hosted by Eric Clapton.',
    specialGuests: 'Eric Clapton, Buddy Guy, Jimmie Vaughan, Billy Gibbons, Marcus King, Christone "Kingfish" Ingram & Surprise Guests',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ticketCategories: [
      {
        id: 'atx-d2-tier-ga',
        name: 'General Admission',
        price: 1800,
        description: 'Grand finale floor standing with full festival village access.',
        benefits: ['Floor General Admission', 'Crossroads Finale Wristband', 'Guitar Exhibition Access'],
        inventory: 350,
        available: 98,
        sectionInfo: 'Moody Center Festival Floor'
      },
      {
        id: 'atx-d2-tier-std',
        name: 'Standard Seating',
        price: 2950,
        description: 'Lower Bowl Reserved seating for the epic festival finale.',
        benefits: ['Lower Bowl Reserved Seating', 'Official 100-Page Festival Program Guide'],
        inventory: 300,
        available: 85,
        sectionInfo: 'Sections 106-118'
      },
      {
        id: 'atx-d2-tier-prem',
        name: 'Premium Seating',
        price: 4200,
        description: 'Dell Technologies Club premium seating with fast-track lounge entry.',
        benefits: ['Dell Club Reserved Seat', 'Air-Conditioned Club Lounge Access', 'Collector Acrylic Finale Pass'],
        inventory: 100,
        available: 24,
        badge: 'Popular',
        sectionInfo: 'Dell Club Level Center'
      },
      {
        id: 'atx-d2-tier-vip',
        name: 'VIP',
        price: 6800,
        description: 'Crossroads Patron VIP with German-American Bank Club dining and artist lounge access.',
        benefits: ['Floor Rows 1-3 Prime Seating', 'All-Day Chef Dining & Sommelier Wine Bar', 'Exclusive Crossroads Embroidered Jacket', 'Signed Replica Crossroads Pickguard', 'Commemorative VIP Laminate'],
        inventory: 50,
        available: 11,
        badge: 'Crossroads VIP',
        sectionInfo: 'Floor Center Rows 1-3'
      },
      {
        id: 'atx-d2-tier-prem-vip',
        name: 'Premium VIP',
        price: 11500,
        description: 'Ultra Diamond Crossroads Patron with stage-side banquettes and private guitar museum reception.',
        benefits: ['Stage-Side Diamond Banquette', 'Private VIP Host Escort', 'Access to Vintage Guitar Exhibition & VIP Lounge', 'Framed Crossroads 2026 Fine-Art Print (Numbered)', 'All-Inclusive Top-Shelf Hospitality'],
        inventory: 20,
        available: 4,
        badge: 'Ultra Exclusive',
        sectionInfo: 'Stage Front Diamond Box'
      }
    ]
  }
];

export const INITIAL_VIP_PACKAGES: VIPExperiencePackage[] = [
  {
    id: 'pkg-slowhand-gold',
    name: 'The “Slowhand” Gold Hospitality Pass',
    tagline: 'The definitive concert luxury experience with front orchestra seating and gourmet hospitality.',
    startingPrice: 5800,
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    badge: 'Most Popular',
    includes: [
      'Reserved Premium Orchestra or Lower Bowl Seat (Rows 1–3)',
      'Dedicated Red Carpet VIP Fast-Track Entrance',
      'Exclusive Pre-Show Cocktail & Canapé Hospitality Lounge',
      'Limited-Edition Embroidered Eric Clapton 2026 Tour Jacket',
      'Commemorative Embossed VIP Credential & Custom Lanyard',
      'Priority Access to Official Tour Merchandise Stands',
      'Dedicated On-Site VIP Concierge & Host Staff'
    ],
    itinerary: [
      '17:30 - VIP Red Carpet Reception Check-in',
      '18:00 - Pre-show Acoustic Blues Listening Lounge & Sommelier Tasting',
      '19:15 - VIP Concierge Escort to Prime Auditorium Seats',
      '20:00 - Eric Clapton Live in Concert',
      '22:30 - Post-Concert Merchandise Collection & Priority Departure'
    ],
    hospitalityDetails: 'Enjoy curated wines, micro-brews, signature Clapton cocktails, artisanal charcuterie boards, and gourmet canapés in the private VIP sanctuary.',
    merchandisePerks: 'Receive an exclusive merchandise gift box including heavy-weight tour jacket, gold-foil commemorative ticket, and guitar pick collector tin.',
    isMeetGreetEligible: true
  },
  {
    id: 'pkg-crossroads-diamond',
    name: 'The “Crossroads” Ultra Diamond Suite',
    tagline: 'Unprecedented access with stage-side banquette, collector vinyl, and private escort.',
    startingPrice: 12500,
    heroImage: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1000&auto=format&fit=crop',
    badge: 'Ultra Exclusive (Max 12 Guests/Night)',
    includes: [
      'Stage-Side Banquette or Royal Box Private Seating',
      'Private Luxury Chauffeur Coordination (Optional)',
      'All-Inclusive Top-Shelf Open Bar & Chef-Prepared Hot Buffet',
      'Custom Numbered Framed 2026 Archival Fine-Art Print',
      'Signed Replica Crossroads Guitar Pickguard in Museum Acrylic',
      'Access to Artists & VIP Backstage Hospitality Wing',
      'Priority Consideration for Official Meet & Greet Verification'
    ],
    itinerary: [
      '17:00 - Private VIP Curbside Escort',
      '17:30 - Champagne Toast in Private Diamond Lounge',
      '18:30 - Pre-Concert Multi-Course Gourmet Dinner',
      '19:45 - Front-Row Stage-Side Escort',
      '20:00 - Eric Clapton Live in Concert from Unrivalled Proximity',
      '22:45 - After-Hours Lounge Digestifs & Souvenir Packaging'
    ],
    hospitalityDetails: 'Private chef stations preparing prime filet mignon skewers, line-caught sashimi, truffle risotto, and sommelier-selected Grand Cru wines.',
    merchandisePerks: 'Museum-grade framed tour artwork, custom Fender collaboration strap replica, and complete remastered blues vinyl boxset.',
    isMeetGreetEligible: true
  },
  {
    id: 'pkg-layla-lounge',
    name: 'The “Layla” Acoustic & Vinyl Lounge Experience',
    tagline: 'A warm, relaxed atmosphere featuring rare Clapton vinyl listening stations and premium stalls seating.',
    startingPrice: 2850,
    heroImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop',
    badge: 'Collector Choice',
    includes: [
      'Lower Tier / Stalls Center Premium Seating',
      'Access to The Vinyl Lounge with Audiophile Turntable Stations',
      'Complimentary Welcome Craft Cocktails (2 Drink Tokens)',
      'Official Hardbound 2026 Tour History Book',
      'Exclusive Tour Tote Bag & Screenprinted Art Poster'
    ],
    itinerary: [
      '18:00 - Vinyl Lounge Opens (Explore rare analog pressings)',
      '19:00 - Acoustic Blues Live Warm-up Performance by Resident Artists',
      '19:45 - Take Reserved Seats',
      '20:00 - Eric Clapton Performance'
    ],
    hospitalityDetails: 'Artisan craft beer selections, vintage bourbon flights, and acoustic cafe bites.',
    merchandisePerks: 'Hardcover 140-page photography book chronicling Clapton’s iconic career and tour.',
    isMeetGreetEligible: false
  }
];

export const INITIAL_GIVEAWAYS: FanRewardGiveaway[] = [
  {
    id: 'rw-blackie-replica',
    title: 'Custom Stratocaster Tribute Package & VIP Seattle Passes',
    category: 'Signed Memorabilia',
    description: 'Enter for the chance to win a custom Fender tribute Stratocaster along with two Ultra-VIP passes to the live tour concert at Climate Pledge Arena in Seattle.',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=1000&auto=format&fit=crop',
    closingDate: '2026-09-18T18:00:00Z',
    winnersCount: 1,
    totalEntries: 4812,
    isActive: true,
    terms: [
      'Open to verified registered fan community members aged 18+.',
      'No purchase necessary to enter. One entry per verified email address.',
      'Winner will be selected randomly and contacted via email.',
      'Concert travel and lodging provided up to $1,500 reimbursement value.',
      'Subject to terms and verification by independent promotional auditors.'
    ],
    disclaimer: 'This giveaway is organized independently by the fan platform. Guitars and memorabilia are tribute collector items unless explicitly certified with third-party COA.'
  },
  {
    id: 'rw-crossroads-austin-pass',
    title: 'Crossroads Guitar Festival 2026 All-Access VIP Patron Trip',
    category: 'Concert VIP Pass',
    description: 'Win an all-inclusive trip for two to the Moody Center in Austin, Texas for the 2-day Crossroads Guitar Festival with VIP Lounge Hospitality.',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop',
    closingDate: '2026-09-20T23:59:59Z',
    winnersCount: 2,
    totalEntries: 6420,
    isActive: true,
    terms: [
      'Entries close September 20, 2026.',
      'Valid for Austin Moody Center Crossroads Guitar Festival dates (Sept 26-27, 2026).',
      'Must respond within 48 hours of notification.'
    ],
    disclaimer: 'Official fan club promotion. All trademarked artist names used for descriptive purposes.'
  }
];

export const SAMPLE_ORDERS: TicketOrder[] = [
  {
    id: 'EC-2026-95018',
    customerId: 'user-demo-3',
    eventId: 'ec-stpaul-2026',
    eventSnapshot: {
      eventName: 'Eric Clapton Live at Grand Casino Arena',
      venue: 'Grand Casino Arena',
      city: 'St. Paul, Minnesota',
      country: 'United States',
      eventDate: '2026-09-15',
      doorsOpen: '18:00',
      concertTime: '19:30',
      heroImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop'
    },
    tierId: 'stp-tier-vip',
    tierName: 'VIP Pass',
    quantity: 2,
    seatInfo: 'VIP Premier Section 102 - Row A, Seats 5 & 6',
    attendee: {
      fullName: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 (651) 555-0144',
      country: 'United States',
      guestCount: 2,
      accessibilityRequirements: 'None',
      specialRequests: 'Repurchased valid VIP pass for September 15 St. Paul concert.'
    },
    pricing: {
      subtotal: 4000,
      serviceFee: 200,
      facilityFee: 100,
      taxes: 0,
      total: 4300,
      currency: 'USD'
    },
    paymentMethod: 'Bank Wire Transfer',
    paymentMethodDetails: 'Wire Ref: WT-95018-MN',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    paymentProofFileName: 'bank_wire_repurchase_95018.jpg',
    paymentProofUploadedAt: '2026-09-13T01:00:00Z',
    paymentApprovedAt: '2026-09-13T01:05:00Z',
    paymentStatus: 'Payment Confirmed',
    ticketStatus: 'TICKET ISSUED',
    transactionId: 'tx_stpaul_v2_95018',
    qrPayload: 'EC-TKT-2026-95018-STPAUL-VIP-S102-R-A-S5S6',
    entryInstructions: 'Present this digital pass or high-res PDF at Grand Casino Arena VIP Gate 1. Bring photo ID matching attendee name.',
    inventoryVersion: 'v2',
    isLegacy: false,
    createdAt: '2026-09-13T01:00:00Z',
    updatedAt: '2026-09-13T01:05:00Z'
  },
  {
    id: 'EC-2026-89421',
    customerId: 'user-demo-1',
    eventId: 'ec-detroit-2026',
    eventSnapshot: {
      eventName: 'Eric Clapton Concert',
      venue: 'Little Caesars Arena',
      city: 'Detroit, Michigan',
      country: 'United States',
      eventDate: '2026-09-06',
      doorsOpen: '18:30',
      concertTime: '20:00',
      heroImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
    },
    tierId: 'det-tier-vip',
    tierName: 'VIP Pass',
    quantity: 1,
    seatInfo: 'Front Orchestra - Row 2, Seats 14 & 15',
    attendee: {
      fullName: 'David Sterling',
      email: 'david.sterling@example.com',
      phone: '+1 (313) 555-0144',
      country: 'United States',
      guestCount: 1,
      accessibilityRequirements: 'None',
      specialRequests: 'Celebrating 30th wedding anniversary, requested champagne table.'
    },
    pricing: {
      subtotal: 1800,
      serviceFee: 100,
      facilityFee: 50,
      taxes: 0,
      total: 1950,
      currency: 'USD'
    },
    paymentMethod: 'Bank Wire Transfer',
    paymentMethodDetails: 'Wire Reference: WT-90281-EC',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    paymentProofFileName: 'bank_wire_receipt_89421.jpg',
    paymentProofUploadedAt: '2026-08-20T14:22:00Z',
    paymentStatus: 'Payment Pending',
    ticketStatus: 'PAYMENT PENDING',
    transactionId: 'tx_wire_89421_VERIFY',
    qrPayload: 'EC-TKT-2026-89421-DETROIT-LCA-ORCH-R2-S14S15',
    entryInstructions: 'Present this digital pass or high-res PDF at Chevrolet VIP Entry Gate after payment approval. Bring photo ID matching attendee name.',
    createdAt: '2026-08-20T14:22:00Z',
    updatedAt: '2026-08-20T14:24:00Z'
  },
  {
    id: 'EC-2026-31084',
    customerId: 'user-demo-2',
    eventId: 'ec-austin-crossroads-day1-2026',
    eventSnapshot: {
      eventName: 'Crossroads Guitar Festival',
      venue: 'Moody Center',
      city: 'Austin, Texas',
      country: 'United States',
      eventDate: '2026-09-26',
      doorsOpen: '16:00',
      concertTime: '17:30',
      heroImage: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=800&auto=format&fit=crop'
    },
    tierId: 'atx-d1-tier-prem-vip',
    tierName: 'Premium VIP',
    quantity: 1,
    seatInfo: 'Diamond Stage Pit - Banquette A1',
    attendee: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (512) 555-0199',
      country: 'United States',
      guestCount: 1,
      specialRequests: 'Guitarist fan, kindly request soundcheck pass if feasible.'
    },
    pricing: {
      subtotal: 1750,
      serviceFee: 100,
      facilityFee: 50,
      taxes: 0,
      total: 1900,
      currency: 'USD'
    },
    paymentMethod: 'Zelle',
    paymentMethodDetails: 'Zelle Confirmation #ZEL-88319',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=800&auto=format&fit=crop',
    paymentProofFileName: 'zelle_transfer_31084.jpg',
    paymentProofUploadedAt: '2026-08-21T10:11:00Z',
    paymentStatus: 'Payment Pending',
    ticketStatus: 'PAYMENT PENDING',
    transactionId: 'tx_zelle_31084_VERIFY',
    qrPayload: 'EC-TKT-2026-31084-ATX-MOODY-PIT-A1',
    entryInstructions: 'VIP Entrance at Dell Technologies Plaza VIP Gate B once pass is issued by tour administrator.',
    createdAt: '2026-08-21T10:11:00Z',
    updatedAt: '2026-08-21T10:12:00Z'
  },
  {
    id: 'EC-2026-15082',
    customerId: 'user-demo-3',
    eventId: 'ec-stpaul-2026',
    eventSnapshot: {
      eventName: 'Eric Clapton Live at Grand Casino Arena',
      venue: 'Grand Casino Arena',
      city: 'St. Paul, Minnesota',
      country: 'United States',
      eventDate: '2026-09-15',
      doorsOpen: '18:00',
      concertTime: '19:30',
      heroImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop'
    },
    tierId: 'stp-tier-ga',
    tierName: 'General Admission',
    quantity: 2,
    seatInfo: 'General Admission Floor (Legacy Tier)',
    attendee: {
      fullName: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 (651) 555-0144',
      country: 'United States',
      guestCount: 2,
      accessibilityRequirements: 'None',
      specialRequests: 'Historical record from previous inventory issuance.'
    },
    pricing: {
      subtotal: 3600,
      serviceFee: 200,
      facilityFee: 100,
      taxes: 0,
      total: 3900,
      currency: 'USD'
    },
    paymentMethod: 'Bank Wire Transfer',
    paymentMethodDetails: 'Wire Ref: WT-15082-MN',
    paymentStatus: 'Payment Confirmed',
    ticketStatus: 'INVALID / LEGACY',
    transactionId: 'tx_legacy_15082_AUDIT',
    qrPayload: 'EC-TKT-2026-15082-STPAUL-LEGACY-INVALID',
    entryInstructions: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
    adminNotes: 'Historical record retained for administrative and audit purposes. Pass invalidated under revised September 15 ticket inventory protocol.',
    inventoryVersion: 'v1',
    isLegacy: true,
    legacyInvalidatedAt: '2026-09-12T00:00:00Z',
    legacyInvalidationReason: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
    createdAt: '2026-08-10T11:20:00Z',
    updatedAt: '2026-09-12T00:00:00Z'
  },
  {
    id: 'EC-2026-15490',
    customerId: 'user-demo-4',
    eventId: 'ec-stpaul-2026',
    eventSnapshot: {
      eventName: 'Eric Clapton Live at Grand Casino Arena',
      venue: 'Grand Casino Arena',
      city: 'St. Paul, Minnesota',
      country: 'United States',
      eventDate: '2026-09-15',
      doorsOpen: '18:00',
      concertTime: '19:30',
      heroImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop'
    },
    tierId: 'stp-tier-hosp',
    tierName: 'Hospitality Package',
    quantity: 1,
    seatInfo: 'Club Suite Tier (Legacy Tier)',
    attendee: {
      fullName: 'Sarah Jenkins',
      email: 'sjenkins.claptonfan@example.com',
      phone: '+1 (651) 555-0298',
      country: 'United States',
      guestCount: 1,
      accessibilityRequirements: 'None',
      specialRequests: 'Legacy reservation.'
    },
    pricing: {
      subtotal: 2950,
      serviceFee: 150,
      facilityFee: 50,
      taxes: 0,
      total: 3150,
      currency: 'USD'
    },
    paymentMethod: 'Credit Card (Processed)',
    paymentMethodDetails: 'Card Ending in 4102',
    paymentStatus: 'Payment Confirmed',
    ticketStatus: 'INVALID / LEGACY',
    transactionId: 'tx_legacy_15490_AUDIT',
    qrPayload: 'EC-TKT-2026-15490-STPAUL-LEGACY-INVALID',
    entryInstructions: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
    adminNotes: 'Historical record retained for administrative and audit purposes. Pass invalidated under revised September 15 ticket inventory protocol.',
    inventoryVersion: 'v1',
    isLegacy: true,
    legacyInvalidatedAt: '2026-09-12T00:00:00Z',
    legacyInvalidationReason: 'TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
    createdAt: '2026-08-14T14:15:00Z',
    updatedAt: '2026-09-12T00:00:00Z'
  }
];

export const SAMPLE_MEET_GREETS: MeetGreetRequest[] = [
  {
    id: 'MGR-2026-44109',
    customerId: 'user-demo-1',
    fullName: 'Robert Harrison',
    email: 'robert.harrison@example.com',
    phone: '+1 (206) 555-9812',
    country: 'United States',
    eventId: 'ec-seattle-2026',
    eventName: 'Eric Clapton Live at Climate Pledge Arena',
    venueCity: 'Climate Pledge Arena, Seattle, Washington',
    preferredDate: '2026-09-18',
    numberOfGuests: 2,
    experiencePreference: 'Pre-Show Acoustic Soundstage Greeting & Photo',
    accessibilityRequirements: 'Wheelchair access required for one guest',
    messageToTeam: 'Lifelong blues enthusiast and charity guitar collector. Would be honored to share 2 minutes to present a bespoke handmade blues pick on behalf of youth music foundation.',
    status: 'Under Review',
    adminNotes: 'Requested documentation reviewed. Forwarded to promoter artist-liaison desk for Seattle arena security briefing.',
    organizerConfirmationStatus: 'Pending Promoter Schedule Confirmation',
    createdAt: '2026-09-10T09:30:00Z',
    updatedAt: '2026-09-12T11:00:00Z'
  },
  {
    id: 'MGR-2026-19042',
    customerId: 'user-demo-3',
    fullName: 'Marcus Vance',
    email: 'mvance.strat@example.com',
    phone: '+1 (816) 555-8821',
    country: 'United States',
    eventId: 'ec-kansascity-2026',
    eventName: 'Eric Clapton Concert',
    venueCity: 'T-Mobile Center, Kansas City, Missouri',
    preferredDate: '2026-09-19',
    numberOfGuests: 1,
    experiencePreference: 'Post-Concert Backstage Artist Suite Introduction',
    messageToTeam: 'Blues educator who has taught Clapton phrasing for 25 years in Kansas City music academy.',
    status: 'Awaiting Organizer Confirmation',
    adminNotes: 'Profile verified. Sent to North American touring management roster.',
    organizerConfirmationStatus: 'Under Promoter Review (T-Mobile Center Protocol)',
    createdAt: '2026-09-11T16:15:00Z',
    updatedAt: '2026-09-14T14:40:00Z'
  }
];

export const SAMPLE_SUPPORT_TICKETS: SupportTicket[] = [];

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [];

