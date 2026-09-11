/**
 * Phase 1 test identities and seed data.
 *
 * Everything here is fake and lives only in the browser. Phase 2 replaces this
 * with real rows in Postgres; nothing outside `storage.ts` imports it.
 *
 * The seed is arranged so every rule in the domain doc is visible on first
 * load without having to click around:
 *   - contractor1 and contractor2 serve different zips, so area filtering bites
 *   - contractor1 is on the free tier mid-way through its 3 lifetime quotes
 *   - contractor2 has Contractor Pro, with its free quotes already spent, so
 *     you can see the subscription override an exhausted lifetime counter
 *   - job-4 is already accepted, so the frozen state and the unlocked address
 *     are both on screen immediately
 */

import type { Contractor, Job, Quote, Subscription, User } from './types';

/** Offline-safe placeholder photo: a tinted SVG data URL, no network needed. */
function photo(label: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="400" height="300" fill="hsl(${hue} 45% 88%)"/>
    <rect x="0" y="240" width="400" height="60" fill="hsl(${hue} 40% 78%)"/>
    <text x="200" y="160" font-family="system-ui,sans-serif" font-size="22"
          fill="hsl(${hue} 55% 32%)" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
}

export const user1: User = {
  id: 'user1',
  role: 'user',
  name: 'Dana Whitfield',
  email: 'dana@example.com',
  phone: '(415) 555-0118',
};

export const user2: User = {
  id: 'user2',
  role: 'user',
  name: 'Marcus Ellery',
  email: 'marcus@example.com',
  phone: '(650) 555-0143',
};

export const contractor1: Contractor = {
  id: 'contractor1',
  role: 'contractor',
  name: 'Ray Okonkwo',
  company: 'Okonkwo Plumbing & Electric',
  email: 'ray@okonkwo-pe.example.com',
  phone: '(415) 555-0192',
  approved: true,
  serviceZips: ['94110', '94103'],
  jobTypes: ['plumbing', 'electrical'],
  // One of three lifetime free quotes spent — see quote-1 below.
  freeQuotesUsed: 1,
};

export const contractor2: Contractor = {
  id: 'contractor2',
  role: 'contractor',
  name: 'Priya Raman',
  company: 'Raman Yard & Power',
  email: 'priya@ramanyard.example.com',
  phone: '(650) 555-0177',
  approved: true,
  serviceZips: ['94301', '94040'],
  jobTypes: ['landscaping', 'electrical'],
  // Free quotes long since spent on jobs outside this seed. Pro lifts the cap,
  // and the count stays spent regardless of what happens to the subscription.
  freeQuotesUsed: 3,
};

export const ACCOUNTS = [user1, user2, contractor1, contractor2];

export const SUBSCRIPTIONS: Subscription[] = [
  {
    contractorId: 'contractor2',
    plan: 'contractor_pro',
    priceCents: 2000,
    status: 'active',
    currentPeriodEnd: '2026-10-08T00:00:00.000Z',
  },
];

export const JOBS: Job[] = [
  {
    id: 'job-1',
    ownerId: 'user1',
    type: 'plumbing',
    title: 'Kitchen sink leaking under the basin',
    description:
      'Steady drip from the trap under the kitchen sink, and the cabinet floor ' +
      'is starting to swell. Looking for a repair, not a full replacement.',
    street: '1841 Harrison St, Apt 3',
    city: 'San Francisco',
    zip: '94110',
    timeframe: 'within_week',
    photos: [photo('Under-sink leak', 205)],
    status: 'open',
    createdAt: '2026-09-04T16:20:00.000Z',
    updatedAt: '2026-09-04T16:20:00.000Z',
  },
  {
    id: 'job-2',
    ownerId: 'user1',
    type: 'landscaping',
    title: 'Back patio overgrown — needs clearing',
    description:
      'Still figuring out scope. Roughly 300 sq ft of overgrown beds and one ' +
      'small tree that probably needs to come out.',
    street: '1841 Harrison St, Apt 3',
    city: 'San Francisco',
    zip: '94110',
    timeframe: 'flexible',
    photos: [],
    // Draft: invisible to every contractor, including ones who match the area.
    status: 'draft',
    createdAt: '2026-09-08T09:05:00.000Z',
    updatedAt: '2026-09-08T09:05:00.000Z',
  },
  {
    id: 'job-3',
    ownerId: 'user2',
    type: 'landscaping',
    title: 'Front lawn re-sod and sprinkler check',
    description:
      'About 600 sq ft of dead lawn to replace, plus two sprinkler heads that ' +
      'no longer pop up. Would like it done before the end of the month.',
    street: '212 Kingsley Ave',
    city: 'Palo Alto',
    zip: '94301',
    timeframe: 'within_month',
    photos: [photo('Front lawn', 95)],
    status: 'open',
    createdAt: '2026-09-06T14:00:00.000Z',
    updatedAt: '2026-09-06T14:00:00.000Z',
  },
  {
    id: 'job-4',
    ownerId: 'user2',
    type: 'electrical',
    title: 'Install two outdoor GFCI outlets',
    description:
      'Two weatherproof outlets on the back of the house, one either side of ' +
      'the deck. Panel has a free breaker slot.',
    street: '212 Kingsley Ave',
    city: 'Palo Alto',
    zip: '94301',
    timeframe: 'asap',
    photos: [photo('Deck exterior', 30)],
    // Already accepted: frozen for everyone, address unlocked for contractor2.
    status: 'accepted',
    createdAt: '2026-08-28T11:30:00.000Z',
    updatedAt: '2026-09-02T18:45:00.000Z',
    acceptedQuoteId: 'quote-2',
  },
  {
    id: 'job-5',
    ownerId: 'user1',
    type: 'electrical',
    title: 'Replace failing hallway light switch',
    description:
      'Switch buzzes and the light flickers. Single-gang box, 1920s building, ' +
      'so the wiring behind it may need attention too.',
    street: '55 Rondel Pl',
    city: 'San Francisco',
    zip: '94103',
    timeframe: 'within_week',
    photos: [],
    status: 'open',
    createdAt: '2026-09-09T08:15:00.000Z',
    updatedAt: '2026-09-09T08:15:00.000Z',
  },
];

export const QUOTES: Quote[] = [
  {
    id: 'quote-1',
    jobId: 'job-1',
    contractorId: 'contractor1',
    priceCents: 28000,
    message:
      'Can be out Thursday morning. Price covers replacing the trap assembly ' +
      'and sealing the joint; if the drain arm is corroded it may be a bit more.',
    status: 'pending',
    createdAt: '2026-09-05T10:10:00.000Z',
  },
  {
    id: 'quote-2',
    jobId: 'job-4',
    contractorId: 'contractor2',
    priceCents: 64000,
    message:
      'Two weatherproof GFCI outlets, in-use covers, run from the free slot in ' +
      'your panel. Permit included. One day of work.',
    status: 'accepted',
    createdAt: '2026-08-29T09:00:00.000Z',
  },
];
