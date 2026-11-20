<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import a from '../assets/events/aria-vale.jpg'
import b from '../assets/events/midnight-orchard.jpg'
import c from '../assets/events/manila-neon.jpg'
import d from '../assets/events/luna-bautista.jpg'
import e from '../assets/events/opm-legends.jpg'
import f from '../assets/events/kaito-rivera.jpg'
import { peso } from '../data/events'
const filters = ['All Genres', 'Pop & K-Pop', 'Rock & OPM', 'Electronic & Festivals', 'Metro Manila Live']
const active = ref('All Genres')
const shows = [
  {
    slug: 'aria-vale-city-lights',
    img: a,
    tag: 'VIP GOLD PRIME',
    title: 'Aria Vale: City Lights World Tour',
    date: 'Sat, Feb 14, 2027 • 8:00 PM',
    venue: 'Bayview Arena, Pasay City',
    price: 12500,
    genre: 'Pop & K-Pop',
    zone: 'BAYVIEW ARENA',
    zoneTag: 'VIP FLOOR PIT',
    perks: [
      'Stage catwalk apron priority sightlines & soundcheck pass',
      'Gate 1 VIP Express lane & turnstile priority',
      'Backstage VIP Lounge access with complimentary mocktails & laminate',
    ],
  },
  {
    slug: 'midnight-orchard-residencies',
    img: b,
    tag: 'VIP DIAMOND BOX',
    title: 'The Midnight Echoes: Eclipse Live',
    date: 'Sat, Mar 20, 2027 • 7:30 PM',
    venue: 'Smart Araneta Coliseum, QC',
    price: 8800,
    genre: 'Rock & OPM',
    zone: 'ARANETA 360 COLISEUM',
    zoneTag: 'DIAMOND BOX 107',
    perks: [
      'Private elevated box seating with direct soundboard sightline',
      'Dedicated VIP suite runner & gourmet refreshments',
      'Commemorative tour merch pack & VIP NFC pass',
    ],
  },
  {
    slug: 'neon-horizon',
    img: c,
    tag: 'VIP ULTRA DECK',
    title: 'Neon Horizon Festival 2027',
    date: 'Sat, Mar 27, 2027 • 6:00 PM',
    venue: 'Harbor Theater, Seaside Grounds, Pasay',
    price: 6500,
    genre: 'Electronic & Festivals',
    zone: 'FESTIVAL LAYOUT',
    zoneTag: 'ULTRA DECK WEST',
    perks: [
      'Elevated VIP deck with 360° panoramic laser view & table service',
      'Fast-track security turnstile & air-conditioned private restrooms',
      '3 complimentary craft drink tokens & official festival wristband',
    ],
  },
  {
    slug: 'solaris-celestial',
    img: d,
    tag: 'VIP SOUNDCHECK ROYALE',
    title: 'SOLARIS: Celestial World Tour',
    date: 'Fri, Apr 16, 2027 • 7:00 PM',
    venue: 'Mall of Asia Arena, Pasay City',
    price: 14000,
    genre: 'Pop & K-Pop',
    zone: 'MOA ARENA HORSESHOE',
    zoneTag: 'SOUNDCHECK FLOOR A',
    perks: [
      'Intimate 45-minute pre-show soundcheck & send-off event',
      'Standing VIP Zone A directly against the extended catwalk',
      'Exclusive collector photocard set, lanyard & VIP gift box',
    ],
  },
  {
    slug: 'manila-phil-opm',
    img: e,
    tag: 'VIP ORCHESTRA CENTER',
    title: 'Manila Phil. x OPM Legends',
    date: 'Sun, May 2, 2027 • 7:00 PM',
    venue: 'Bayview Arena, Pasay City',
    price: 7200,
    genre: 'Rock & OPM',
    zone: 'SYMPHONY HALL TIER',
    zoneTag: 'ROWS 1-2 CENTER',
    perks: [
      'Rows 1-4 acoustic sweet-spot center floor seating',
      'Pre-concert cocktail reception at the Marina Lounge',
      'Autographed symphony program & meet-and-greet queue',
    ],
  },
  {
    slug: 'kaito-midnight-city',
    img: f,
    tag: 'VIP FRONT ACCESS',
    title: 'Kaito Rivera: Midnight City',
    date: 'Sun, May 16, 2027 • 7:30 PM',
    venue: 'Harbor Theater, Pasay',
    price: 6500,
    genre: 'Pop & K-Pop',
    zone: 'HARBOR THEATER INTIMATE',
    zoneTag: 'TABLES TI-T6',
    perks: [
      'Front row table seating with priority beverage service',
      'Intimate Q&A session with artist 1 hour before doors',
      'Limited-edition signed vinyl and priority venue exit pass',
    ],
  },
]
const list = computed(() =>
  shows.filter(
    (s) => active.value === 'All Genres' || s.genre === active.value || (active.value === 'Metro Manila Live' && true),
  ),
)
const faq = [
  [
    'What do VIP seats include?',
    "VIP tickets include front-tier unobstructed sightlines (catwalk pit or center lower bowl), expedited turnstile access through Gate 1 VIP Express lanes, access to dedicated air-conditioned VIP lounges with complimentary refreshments, priority merchandise queues, and commemorative tour laminates or NFC digital badges. Specific inclusions vary slightly per artist and venue — check each event's perk breakdown above.",
  ],
  [
    'Can I upgrade later?',
    'Upgrades depend on availability of the VIP zone for that show. Contact the VIP Concierge before the event; price differences apply.',
  ],
  [
    'Refund rules?',
    'All sales are final. Tickets can be exchanged up to 72 hours before the show for the same tier, subject to availability.',
  ],
]
const open = ref(0)
</script>

<template>
  <div class="page">
    <header class="container hero">
      <span class="pill"><AppIcon name="sparkles" /> SPOTLIGHT VIP ACCESS • EXCLUSIVE ARENA PRIVILEGES</span>
      <h1>Sit closer. <span>Sit VIP.</span></h1>
      <p class="lead">Premium seats with extra perks.</p>
      <p class="sub">Unobstructed catwalk sightlines, dedicated fast-track arena gates, private air-conditioned lounges, and artist-grade hospitality curated for unforgettable Manila show nights.</p>
      <ul class="perks">
        <li><b>Front Row Sightlines</b><small>Catwalk apron or floor bases</small></li>
        <li><b>Soundcheck &amp; Early</b><small>Doors open 90m ahead</small></li>
        <li><b>Private VIP Lounges</b><small>Concierge &amp; bar hospitality</small></li>
        <li><b>Anti-Scalper Lock</b><small>100% verified turnstiles</small></li>
      </ul>
    </header>

    <section class="container shows">
      <div class="head">
        <div><small class="eyebrow">MANILA ARENAS &amp; STADIUM DROPS</small><h2>Upcoming VIP Concerts &amp; Live Arenas</h2></div>
        <div class="chips" role="tablist"><button v-for="x in filters" :key="x" :class="{ on: active === x }" role="tab" @click="active = x">{{ x }}</button></div>
      </div>
      <p v-if="!list.length" class="none">No VIP concerts for this genre yet.</p>
      <div class="grid">
        <article v-for="s in list" :key="s.slug" class="card">
          <div class="img"><img :src="s.img" :alt="s.title" loading="lazy" /><span class="tag"><AppIcon name="star" /> {{ s.tag }}</span><span class="price">{{ peso(s.price) }}</span></div>
          <div class="body">
            <small class="when"><AppIcon name="calendar" /> {{ s.date }}</small>
            <h3>{{ s.title }}</h3>
            <p class="venue"><AppIcon name="map-pin" /> {{ s.venue }}</p>
            <ul><li v-for="p in s.perks" :key="p"><AppIcon name="check" /> {{ p }}</li></ul>
            <div class="plan"><small>{{ s.zone }}</small><em>{{ s.zoneTag }}</em></div>
            <RouterLink :to="`/events/${s.slug}`" class="btn btn-primary go">Choose VIP seats <AppIcon name="arrow-right" /></RouterLink>
          </div>
        </article>
      </div>
    </section>

    <section class="container faq">
      <small class="eyebrow gold">NEED CLARIFICATION?</small>
      <h2>Frequently Asked Questions</h2>
      <p>Everything you need to know about Spotlight VIP arena privileges</p>
      <div class="acc">
        <div v-for="(q, i) in faq" :key="q[0]" class="qa">
          <button type="button" :aria-expanded="open === i" @click="open = open === i ? -1 : i">{{ q[0] }}<span><AppIcon :name="open === i ? 'chevron-up' : 'chevron-down'" /></span></button>
          <p v-if="open === i">{{ q[1] }}</p>
        </div>
      </div>
    </section>

    <section class="container concierge">
      <div>
        <span class="pill"><AppIcon name="star" filled /> HIGH VOLUME &amp; ELITE BOOKINGS</span>
        <h2>Planning a VIP group or corporate suite booking?</h2>
        <p>Spotlight Concierge handles private executive boxes (12-24 guests), corporate entertainment passes, bespoke backstage catering, and customized ticketing invoice arrangements.</p>
        <small><AppIcon name="phone" /> +63 (2) 8888-SPOT (7768) &nbsp; <AppIcon name="mail" /> vip@spotlight.ph</small>
      </div>
      <a class="btn btn-gold" href="mailto:vip@spotlight.ph">Contact VIP Concierge <AppIcon name="arrow-right" /></a>
    </section>
  </div>
</template>

<style scoped>
.page { padding-top: 80px; }
.hero { text-align: center; padding-top: 48px; padding-bottom: 40px; }
.pill { display: inline-block; padding: 5px 16px; border-radius: var(--radius-pill); background: rgba(255,185,95,.12); color: var(--gold); font-size: 10px; font-weight: 600; letter-spacing: .08em; }
h1 { margin-top: 18px; font-family: var(--font-display); font-weight: 800; font-size: clamp(40px, 7vw, 64px); letter-spacing: -1.4px; }
h1 span { background: linear-gradient(90deg, var(--primary), var(--primary-strong)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lead { margin-top: 8px; font-family: var(--font-display); font-size: 20px; color: var(--gold); }
.sub { max-width: 620px; margin: 12px auto 0; line-height: 1.6; color: var(--text-muted); }
.perks { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 760px; margin: 28px auto 0; padding: 16px; border-radius: var(--radius-lg); background: var(--surface-low); text-align: left; }
.perks b { display: block; font-size: 12px; }
.perks small { font-size: 10px; color: var(--text-subtle); }
.shows { padding-top: 40px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 24px; }
.eyebrow { font-size: 10px; letter-spacing: .1em; color: var(--gold); }
.eyebrow.gold { display: block; text-align: center; }
h2 { margin-top: 6px; font-family: var(--font-display); font-size: 36px; max-width: 420px; line-height: 1.15; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; max-width: 420px; }
.chips button { padding: 6px 16px; border-radius: var(--radius-pill); background: var(--surface); font-size: 11px; font-weight: 600; color: var(--text-muted); }
.chips .on { background: var(--primary-strong); color: var(--on-primary); }
.none { padding: 32px; text-align: center; color: var(--text-subtle); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.card { border-radius: var(--radius-lg); background: var(--surface-low); border: 1px solid rgba(255,185,95,.2); overflow: hidden; }
.img { position: relative; aspect-ratio: 16 / 9; }
.img img { width: 100%; height: 100%; object-fit: cover; }
.tag { position: absolute; top: 12px; left: 12px; padding: 3px 10px; border-radius: var(--radius-sm); background: rgba(12,14,23,.85); color: var(--gold); font-size: 9px; font-weight: 700; letter-spacing: .05em; }
.price { position: absolute; right: 12px; bottom: 10px; font-family: var(--font-display); font-weight: 700; color: var(--gold); text-shadow: 0 1px 8px #000; }
.body { padding: 18px 20px 20px; }
.when { font-size: 11px; color: var(--secondary); }
h3 { margin-top: 6px; font-family: var(--font-display); font-size: 22px; line-height: 1.2; }
.venue { margin-top: 6px; font-size: 12px; color: var(--text-subtle); }
ul { list-style: none; margin: 14px 0; padding: 14px; border-radius: var(--radius); background: var(--surface-lowest); display: flex; flex-direction: column; gap: 8px; }
.body li { font-size: 12px; line-height: 1.4; color: var(--text-muted); }
.plan { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 14px; border-radius: var(--radius); background: var(--surface-lowest); }
.plan small { font-size: 9px; letter-spacing: .06em; color: var(--text-subtle); }
.plan em { padding: 2px 8px; border-radius: var(--radius-sm); background: rgba(255,185,95,.2); color: var(--gold); font-size: 9px; font-style: normal; font-weight: 700; }
.go { width: 100%; justify-content: center; }
.faq { text-align: center; padding-top: 80px; }
.faq h2 { max-width: none; font-size: 32px; }
.faq > p { margin-top: 6px; font-size: 13px; color: var(--text-subtle); }
.acc { max-width: 720px; margin: 28px auto 0; display: flex; flex-direction: column; gap: 12px; text-align: left; }
.qa { border-radius: var(--radius); background: var(--surface-low); border: 1px solid rgba(73,68,84,.25); }
.qa button { width: 100%; display: flex; justify-content: space-between; padding: 18px 20px; font-size: 14px; font-weight: 600; text-align: left; }
.qa p { padding: 0 20px 20px; font-size: 14px; line-height: 1.6; color: var(--text-muted); }
.concierge { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin: 80px auto; padding: 36px 40px; border-radius: var(--radius-lg); background: linear-gradient(120deg, var(--surface-low), rgba(255,185,95,.14)); border: 1px solid rgba(255,185,95,.2); }
.concierge h2 { max-width: 460px; font-size: 32px; }
.concierge p { max-width: 520px; margin-top: 10px; font-size: 14px; line-height: 1.6; color: var(--text-muted); }
.concierge small { display: block; margin-top: 14px; font-size: 11px; color: var(--text-subtle); }
@media (max-width: 960px) {
  .grid { grid-template-columns: minmax(0, 1fr); }
  .perks { grid-template-columns: 1fr 1fr; }
  .head, .concierge { flex-direction: column; align-items: flex-start; }
  .chips { justify-content: flex-start; }
}
</style>
