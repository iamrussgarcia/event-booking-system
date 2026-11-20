import hero from '../assets/events/hero-aria-vale.jpg'
import ariaVale from '../assets/events/aria-vale.jpg'
import midnight from '../assets/events/midnight-orchard.jpg'
import kaito from '../assets/events/kaito-rivera.jpg'
import luna from '../assets/events/luna-bautista.jpg'
import neon from '../assets/events/manila-neon.jpg'
import opm from '../assets/events/opm-legends.jpg'
export const heroSlides = [
  { slug: 'aria-vale-nocturne', label: 'Aria Vale', image: hero },
  { slug: 'midnight-orchard', label: 'Midnight Orchard', image: midnight },
  { slug: 'luna-bautista', label: 'Luna Bautista', image: luna },
  { slug: 'manila-neon-nights', label: 'Neon Nights', image: neon },
]
export const events = [
  {
    slug: 'aria-vale-nocturne',
    title: 'Aria Vale: Nocturne Live',
    artist: 'Aria Vale with Manila Philharmonic',
    genre: 'POP',
    tag: 'SELLING FAST',
    date: 'Nov 28, 2025',
    time: '8:00 PM',
    venue: 'Bayview Arena, Pasay',
    priceFrom: 2500,
    priceTo: 12500,
    cta: 'Book Seats',
    image: ariaVale,
  },
  {
    slug: 'midnight-orchard',
    title: 'The Midnight Orchard: Overdrive',
    artist: 'The Midnight Orchard',
    genre: 'ROCK',
    tag: 'GENERAL SALE',
    date: 'Dec 06, 2025',
    time: '7:00 PM',
    venue: 'Harbor Theater, QC',
    priceFrom: 1800,
    priceTo: 6500,
    cta: 'Book Seats',
    image: midnight,
  },
  {
    slug: 'kaito-rivera',
    title: 'Kaito Rivera: Himig ng Maynila',
    artist: 'Kaito Rivera (Acoustic & Ambient)',
    genre: 'OPM',
    tag: 'BALCONY LEFT',
    date: 'Dec 14, 2025',
    time: '6:30 PM',
    venue: 'Harbor Theater, QC',
    priceFrom: 1500,
    priceTo: 4200,
    cta: 'Book Seats',
    image: kaito,
  },
  {
    slug: 'luna-bautista',
    title: 'Luna Bautista: Starlight Arena Tour',
    artist: 'Luna Bautista',
    genre: 'K-POP / POP',
    tag: 'VIP PRESALE',
    date: 'Dec 20, 2025',
    time: '7:30 PM',
    venue: 'Bayview Arena, Pasay',
    priceFrom: 2200,
    priceTo: 8500,
    cta: 'Book Seats',
    image: luna,
  },
  {
    slug: 'manila-neon-nights',
    title: 'Manila Neon Nights EDM Carnival',
    artist: 'Top International & Local DJs',
    genre: 'EDM',
    tag: 'EARLY BIRD',
    date: 'Dec 31, 2025',
    time: '6:00 PM',
    venue: 'Bayview Grounds, Pasay',
    priceFrom: 1200,
    priceTo: 5000,
    cta: 'Get Passes',
    image: neon,
  },
  {
    slug: 'opm-legends',
    title: 'OPM Legends Unplugged: Manila',
    artist: 'Various Iconic Pinoy Artists',
    genre: 'OPM CLASSICS',
    tag: 'NEW',
    date: 'Jan 10, 2026',
    time: '7:00 PM',
    venue: 'Harbor Theater, QC',
    priceFrom: 1600,
    priceTo: 5800,
    cta: 'Book Seats',
    image: opm,
  },
]
export const vipPackages = [
  {
    tier: 'SOUNDCHECK PASS',
    title: 'Aria Vale: Nocturne Live',
    venue: 'Bayview Arena Floor (Front Row A-D)',
    inclusions:
      'Soundcheck rehearsal access, flank catwalk lounge entry, priority merchandise booth, and collector metal laminate.',
    priceFrom: 12500,
    slug: 'aria-vale-nocturne',
  },
  {
    tier: 'DIAMOND VIP EXPERIENCE',
    title: 'Luna Bautista: Starlight Tour',
    venue: 'Bayview Diamond Pit Area',
    inclusions:
      'Early entry (90 min advance), signed tour poster, custom lanyard, and dedicated air-conditioned bar queue.',
    priceFrom: 8500,
    slug: 'luna-bautista',
  },
  {
    tier: 'PRIVATE THEATER BOX',
    title: 'The Midnight Orchard: Overdrive',
    venue: 'Harbor Theater VIP Suite Box',
    inclusions:
      'Elevated suite seating with engineered acoustic baffles, complimentary artisan mocktails, and reserved private parking.',
    priceFrom: 6500,
    slug: 'midnight-orchard',
  },
]
export const peso = (n) => '₱' + n.toLocaleString('en-PH')
