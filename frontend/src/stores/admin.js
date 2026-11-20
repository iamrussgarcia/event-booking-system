import { computed, reactive } from 'vue'
import heroFallback from '../assets/detail/hero.jpg'
import { listing } from '../data/listing'
import { seatMap, zones as zoneDefaults } from '../data/seatmap'
import { booking } from './booking'
export const sections = ['A', 'B', 'C', 'D', 'E', 'BALCONY']
export const venues = ['Bayview Arena, Pasay City']
const defaultSections = () => ({ A: 'vip', B: 'gold', C: 'gold', D: 'silver', E: 'silver', BALCONY: 'general' })
const defaultZones = () =>
  Object.fromEntries(
    Object.values(zoneDefaults).map((z) => [
      z.id,
      { id: z.id, name: z.name, color: z.color, price: z.price, vip: !!z.vip, perks: z.perks ?? '' },
    ]),
  )
export const MIN_DESCRIPTION = 150
export const SEATS_PER_EVENT = seatMap.seats.length
const describe = (e) =>
  `${e.title} features ${e.artist} live at ${e.venue}. Expect a full-production arena night with reserved seating, an interactive seat plan at checkout, and e-tickets delivered instantly by SMS and email after payment.`
const KEY = 'spotlight.admin.events'
const seed = () =>
  listing.map((e, i) => ({
    id: e.slug,
    title: e.title,
    artist: e.artist,
    genre: e.genre,
    date: e.startsAt.slice(0, 10),
    time: e.startsAt.slice(11, 16),
    doors: '17:30',
    updatedAt: null,
    venue: venues[0],
    description: describe({ title: e.title, artist: e.artist, venue: `${e.venue}, ${e.city}` }),
    faq: '',
    policy: '',
    waysToBuy: 'GCash, Maya, GrabPay, cards',
    status: e.slug === 'luna-holiday-nocturnes' ? 'draft' : 'published',
    featured: i < 4,
    sold: e.soldOut ? seatMap.seats.length : (i * 7) % 40,
    sectionZones: defaultSections(),
    zones: defaultZones(),
  }))
const load = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw).map((e) => ({ doors: '17:30', updatedAt: null, ...e }))
  } catch {
    /* fall through to seed */
  }
  return seed()
}
export const admin = reactive({ events: load() })
export const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(admin.events))
  } catch {
    /* storage unavailable */
  }
}
export const findEvent = (id) => admin.events.find((e) => e.id === id)
export const blank = () => ({
  id: '',
  title: '',
  artist: '',
  genre: '',
  date: '',
  time: '20:00',
  doors: '17:30',
  updatedAt: null,
  venue: venues[0],
  description: '',
  faq: '',
  policy: '',
  waysToBuy: '',
  status: 'draft',
  featured: false,
  sold: 0,
  sectionZones: defaultSections(),
  zones: defaultZones(),
})
export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
export function upsert(e, isNew) {
  const id = e.id || slugify(e.title)
  if (!id) return 'Title is required.'
  if (isNew && findEvent(id)) return 'An event with this title already exists.'
  const stamped = { ...e, id, updatedAt: new Date().toISOString() }
  if (isNew) admin.events.unshift(stamped)
  else Object.assign(findEvent(e.id), stamped)
  persist()
  return null
}
// Edit rules from spec section 6.3.
export const canUnpublish = (e) => e.status === 'published' && e.sold === 0
export const canDelete = (e) => e.status === 'draft' && e.sold === 0
export const publishProblems = (e) => {
  const p = []
  if (!e.title || !e.date || !e.venue) p.push('Title, date and venue are required.')
  if ((e.description ?? '').trim().length < MIN_DESCRIPTION) p.push(`Description needs at least ${MIN_DESCRIPTION} characters.`)
  if (!Object.values(e.sectionZones).some(Boolean)) p.push('At least one section needs a zone.')
  const used = new Set(Object.values(e.sectionZones).filter(Boolean))
  used.forEach((z) => {
    if (e.zones[z].price <= 0) p.push(`${e.zones[z].name} needs a price above ₱0.`)
  })
  return p
}
export const isSoldOut = (e) => e.sold >= SEATS_PER_EVENT

// ---- display helpers shared by the admin screens ----
const meta = (e) => listing.find((l) => l.slug === e.id)
export const eventImage = (e) => e.image || meta(e)?.image || heroFallback
export const eventVenue = (e) => meta(e)?.venue ?? e.venue.split(',')[0].trim()
export const eventCity = (e) => meta(e)?.city ?? e.venue.split(',')[1]?.trim() ?? ''
export const eventCode = (e) => `EVT-MNL-${e.date.slice(0, 4) || '0000'}-${e.date.slice(5, 7)}${e.date.slice(8, 10)}`
export const salesStatus = (e) => {
  if (e.status === 'draft') return { label: 'Draft', tone: 'muted' }
  const pct = e.sold / SEATS_PER_EVENT
  if (pct >= 1) return { label: 'Sold Out', tone: 'muted' }
  if (pct >= 0.9) return { label: 'Almost Sold Out', tone: 'gold' }
  if (pct >= 0.5) return { label: 'Selling Fast', tone: 'primary' }
  return { label: 'On Sale', tone: 'cyan' }
}
export const when = (e) => {
  const d = new Date(`${e.date}T${e.time || '00:00'}`)
  if (Number.isNaN(d.getTime())) return { date: '—', day: '', time: '' }
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' PHT',
  }
}
export const savedAgo = (iso) => {
  if (!iso) return 'Not saved yet'
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Saved just now'
  if (mins < 60) return `Saved ${mins} min${mins === 1 ? '' : 's'} ago`
  return `Saved ${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}
const demo = [
  {
    orderNumber: 'SPL-2027-88924',
    eventTitle: 'Aria Vale: City Lights World Tour',
    eventDate: 'Sat, Feb 14, 2027 · 8:00 PM',
    venue: 'Bayview Arena',
    buyer: { name: 'Beatriz Alonzo', email: 'beatriz.alonzo@gmail.com', phone: '917 882 4491' },
    tickets: [
      {
        seatId: 'A-5-12',
        label: 'Section A · Row 5 · Seat 12',
        zoneName: 'VIP Gold Prime',
        price: 12500,
        holder: 'Beatriz Alonzo',
        qrToken: 'demo1',
      },
      {
        seatId: 'A-5-11',
        label: 'Section A · Row 5 · Seat 11',
        zoneName: 'VIP Gold Prime',
        price: 12500,
        holder: 'Carlos Miguel Tan',
        qrToken: 'demo2',
      },
    ],
    subtotal: 25000,
    fee: 500,
    total: 25500,
    method: 'GCash',
    createdAt: '2026-11-10T20:14:00',
    status: 'paid',
    eventId: 'aria-vale-city-lights',
  },
  {
    orderNumber: 'SPL-2027-91042',
    eventTitle: 'Neon Horizon Festival 2027',
    eventDate: 'Sat, Mar 27, 2027 · 6:00 PM',
    venue: 'Harbor Theater',
    buyer: { name: 'Miguel Santos', email: 'miguel.santos@gmail.com', phone: '918 555 0100' },
    tickets: [
      {
        seatId: 'BALCONY-2-4',
        label: 'Section Balcony · Row 2 · Seat 04',
        zoneName: 'General Teal Balcony',
        price: 2500,
        holder: 'Miguel Santos',
        qrToken: 'demo3',
      },
    ],
    subtotal: 2500,
    fee: 250,
    total: 2750,
    method: 'Maya',
    createdAt: '2026-11-11T09:02:00',
    status: 'pending',
    eventId: 'neon-horizon',
  },
  {
    orderNumber: 'SPL-2027-90517',
    eventTitle: 'LUMINA: "Constellation" Manila Arena Tour',
    eventDate: 'Sat, Dec 12, 2026 · 7:30 PM',
    venue: 'Bayview Arena',
    buyer: { name: 'Jana Reyes', email: 'jana.reyes@yahoo.com', phone: '927 111 2233' },
    tickets: [
      {
        seatId: 'B-2-6',
        label: 'Section B · Row 2 · Seat 06',
        zoneName: 'Gold Amber Lower Box',
        price: 8500,
        holder: 'Jana Reyes',
        qrToken: 'demo4',
      },
    ],
    subtotal: 8500,
    fee: 250,
    total: 8750,
    method: 'Credit or Debit Card',
    createdAt: '2026-11-09T18:40:00',
    status: 'refund-review',
    eventId: 'lumina-constellation',
  },
]
export const allOrders = computed(() => [
  ...booking.orders.map((o) => ({ ...o, status: 'paid', eventId: '' })),
  ...demo,
])

// ---- order helpers ----
export const orderStatuses = {
  paid: { label: 'Paid', tone: 'cyan' },
  pending: { label: 'Pending', tone: 'gold' },
  'refund-review': { label: 'Needs refund', tone: 'gold' },
  failed: { label: 'Failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
}
export const seatParts = (t) => {
  const m = /Section (\w+) · Row (\d+) · Seat (\d+)/.exec(t.label)
  return m ? { section: m[1], row: m[2], seat: m[3] } : { section: '—', row: '—', seat: '—' }
}
export const orderEvent = (o) => admin.events.find((e) => e.id === o.eventId || e.title === o.eventTitle)
export const orderImage = (o) => {
  const e = orderEvent(o)
  return e ? eventImage(e) : heroFallback
}

// Counts shown on the event tabs: blocking problems in "Details", empty fields in "Text & Policies".
export const eventNotices = (e) => ({
  details: [!e.title?.trim(), !e.artist?.trim(), !e.date, (e.description ?? '').trim().length < MIN_DESCRIPTION].filter(Boolean).length,
  policies: ['faq', 'policy', 'waysToBuy'].filter((k) => !(e[k] ?? '').trim()).length,
})
