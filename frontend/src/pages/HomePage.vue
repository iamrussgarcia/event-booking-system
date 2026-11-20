<script setup>
import AppIcon from '../components/AppIcon.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import EventCard from '../components/EventCard.vue'
import { events, heroSlides, peso, vipPackages } from '../data/events'
const router = useRouter()
const current = ref(0)
let timer
const go = (i) => {
  current.value = (i + heroSlides.length) % heroSlides.length
}
const start = () => {
  timer = window.setInterval(() => go(current.value + 1), 6000)
}
onMounted(start)
onBeforeUnmount(() => clearInterval(timer))
const venue = ref('')
const timeline = ref('30')
const genre = ref('')
const findEvents = () =>
  router.push({ path: '/events', query: { venue: venue.value, days: timeline.value, genre: genre.value } })
</script>

<template>
  <!-- Hero carousel -->
  <section class="hero">
    <img v-for="(s, i) in heroSlides" :key="s.slug" :src="s.image" alt="" class="bg" :class="{ on: i === current }" />
    <div class="shade-v" />
    <div class="shade-h" />

    <div class="container content">
      <div class="badges">
        <span class="badge hot"><i /> Selling Fast • 84% Sold</span>
        <span class="badge tour">Manila Tour 2025</span>
      </div>
      <h1>ARIA VALE:<br /><span>“NOCTURNE”</span><br />WORLD TOUR</h1>
      <p class="when">
        <span><AppIcon name="calendar" /> FRI, NOV 28, 2025 • Gates Open 5:00 PM</span>
        <span><AppIcon name="map-pin" /> Bayview Arena, Pasay City</span>
      </p>
      <p class="blurb">
        The record-shattering vocal virtuoso descends on Manila for an immersive sensory production featuring 60-piece symphonic accompaniment.
      </p>
      <div class="cta">
        <RouterLink to="/events/aria-vale-nocturne" class="btn btn-primary big"><AppIcon name="ticket" /> Get Tickets <AppIcon name="arrow-right" /></RouterLink>
        <div class="tiers">
          <small>OFFICIAL TIERS</small>
          <strong>{{ peso(2500) }} <em>to</em> {{ peso(12500) }}</strong>
        </div>
      </div>
      <div class="dots">
        <button v-for="(s, i) in heroSlides" :key="s.slug" :class="{ on: i === current }" :aria-label="s.label" @click="go(i)" />
      </div>
    </div>

    <button class="arrow left" aria-label="Previous slide" @click="go(current - 1)"><AppIcon name="chevron-left" size="28" /></button>
    <button class="arrow right" aria-label="Next slide" @click="go(current + 1)"><AppIcon name="chevron-right" size="28" /></button>

    <div class="container thumbs">
      <button v-for="(s, i) in heroSlides" :key="s.slug" :class="{ on: i === current }" @click="go(i)">
        0{{ i + 1 }} {{ s.label }}
      </button>
    </div>
  </section>

  <!-- Find events bar -->
  <div class="container">
    <form class="finder" @submit.prevent="findEvents">
      <label>
        <small>VENUE / METRO AREA</small>
        <select v-model="venue">
          <option value="">All Manila Venues (Bayview, Harbor, MOA)</option>
          <option value="bayview">Bayview Arena</option>
          <option value="harbor">Harbor Theater</option>
        </select>
      </label>
      <label>
        <small>TIMELINE</small>
        <select v-model="timeline">
          <option value="30">Any Date (Next 30 Days)</option>
          <option value="7">This Week</option>
          <option value="90">Next 90 Days</option>
        </select>
      </label>
      <label>
        <small>GENRE &amp; EXPERIENCE</small>
        <select v-model="genre">
          <option value="">All Genres (Pop, Rock, OPM, EDM)</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="opm">OPM</option>
          <option value="edm">EDM</option>
        </select>
      </label>
      <button type="submit" class="btn btn-primary find"><AppIcon name="search" /> Find Events</button>
    </form>
  </div>

  <!-- Upcoming shows -->
  <section class="container upcoming">
    <div class="head">
      <div>
        <small class="eyebrow"><AppIcon name="circle" filled size="8" /> ARENA CALENDAR</small>
        <h2>Upcoming Shows</h2>
        <p>Live music and arena spectacles across Metro Manila</p>
      </div>
      <RouterLink to="/events" class="viewall">View All Events <AppIcon name="arrow-right" /></RouterLink>
    </div>
    <div class="grid">
      <EventCard v-for="e in events" :key="e.slug" :event="e" />
    </div>
  </section>

  <!-- VIP teaser -->
  <section class="vip">
    <div class="container">
      <div class="vip-head">
        <span class="pill"><AppIcon name="star" filled /> SPOTLIGHT PRESTIGE TIER</span>
        <h2>Sit closer. <span>Sit VIP.</span></h2>
        <p>Unmatched stage proximity, private express turnstiles, dedicated soundcheck access, and commemorative RFID passes.</p>
      </div>
      <div class="vip-grid">
        <article v-for="p in vipPackages" :key="p.tier" class="vip-card">
          <span class="tier">{{ p.tier }}</span>
          <h3>{{ p.title }}</h3>
          <small class="where">{{ p.venue }}</small>
          <div class="incl">
            <small>Package Inclusions</small>
            <p>{{ p.inclusions }}</p>
          </div>
          <div class="vip-foot">
            <div>
              <small>VIP Tier from</small>
              <strong>{{ peso(p.priceFrom) }}</strong>
            </div>
            <RouterLink :to="`/events/${p.slug}`" class="btn btn-gold">See VIP seats</RouterLink>
          </div>
        </article>
      </div>
      <ul class="trust">
        <li><b>100% Guaranteed Official</b><span>Authentic arena barcodes directly synced with gate turnstiles</span></li>
        <li><b>Dynamic Anti-Screenshot QR</b><span>Encrypted high-frequency refresh passes on your smartphone</span></li>
        <li><b>24/7 Manila VIP Concierge</b><span>Direct hotline for seating assistance, transfers, and venue entry</span></li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  height: 760px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.8s;
}
.bg.on {
  opacity: 1;
}
.shade-v {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #11131c, rgba(17, 19, 28, 0.6) 50%, rgba(17, 19, 28, 0));
}
.shade-h {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(17, 19, 28, 0.9), rgba(17, 19, 28, 0.4) 50%, rgba(17, 19, 28, 0));
}
.content {
  position: relative;
  padding-bottom: 120px;
  max-width: 768px;
  margin: 0 auto 0 max(0px, calc((100vw - 1280px) / 2));
}
.badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 16px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(12px);
}
.badge.hot {
  background: var(--danger-bg);
  color: var(--danger);
}
.badge.hot i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
}
.badge.tour {
  background: rgba(40, 41, 51, 0.7);
  color: var(--secondary);
}
h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 64px;
  letter-spacing: -1.4px;
  text-transform: uppercase;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.8);
}
h1 span {
  color: var(--primary);
}
.when {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-top: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gold);
}
.when span:last-child {
  color: var(--text-muted);
}
.blurb {
  margin-top: 12px;
  max-width: 560px;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-muted);
}
.cta {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
}
.btn.big {
  padding: 14px 28px;
  font-size: 15px;
}
.tiers small {
  display: block;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}
.tiers strong {
  font-family: var(--font-display);
  color: var(--text);
}
.tiers em {
  font-style: normal;
  font-size: 11px;
  color: var(--text-subtle);
}
.dots {
  display: flex;
  gap: 6px;
  margin-top: 28px;
}
.dots button {
  width: 8px;
  height: 4px;
  border-radius: 4px;
  background: var(--outline-variant);
  transition: width 0.3s;
}
.dots button.on {
  width: 32px;
  background: var(--primary);
}
.arrow {
  position: absolute;
  top: 50%;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(40, 41, 51, 0.6);
  display: grid;
  place-items: center;
  font-size: 22px;
  line-height: 1;
}
.arrow.left {
  left: 24px;
}
.arrow.right {
  right: 24px;
}
.thumbs {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: flex;
  justify-content: flex-end;
}
.thumbs button {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-subtle);
  background: rgba(25, 27, 36, 0.8);
}
.thumbs button.on {
  color: var(--text);
}

/* Finder */
.finder {
  position: relative;
  z-index: 2;
  margin-top: -60px;
  display: grid;
  grid-template-columns: repeat(3, 1fr) 220px;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--surface-low);
  border: 1px solid rgba(73, 68, 84, 0.3);
}
.finder label {
  padding: 10px 16px;
  border-radius: var(--radius);
  background: var(--surface);
}
.finder small {
  display: block;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}
.finder select {
  width: 100%;
  margin-top: 4px;
  background: none;
  border: 0;
  outline: 0;
  color: var(--text);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
}
.finder select option {
  background: var(--surface);
}
.find {
  justify-content: center;
  border-radius: var(--radius);
}

/* Upcoming */
.upcoming {
  padding-top: 56px;
  padding-bottom: 64px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}
.eyebrow {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--secondary);
}
h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 36px;
  margin-top: 4px;
}
.head p {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-subtle);
}
.viewall {
  font-size: 13px;
  font-weight: 600;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* VIP */
.vip {
  padding: 64px 0;
  background: var(--surface-lowest);
}
.vip-head {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 40px;
}
.pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 185, 95, 0.15);
  color: var(--gold);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
}
.vip-head h2 {
  margin-top: 14px;
}
.vip-head h2 span {
  color: var(--gold);
}
.vip-head p {
  margin-top: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}
.vip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.vip-card {
  padding: 24px;
  border-radius: var(--radius-lg);
  background: var(--surface-low);
  border: 1px solid rgba(255, 185, 95, 0.25);
}
.tier {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  background: rgba(255, 185, 95, 0.15);
  color: var(--gold);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.vip-card h3 {
  margin-top: 14px;
  font-family: var(--font-display);
  font-size: 20px;
}
.where {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-subtle);
}
.incl {
  margin: 16px 0;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--surface-lowest);
}
.incl small {
  font-size: 10px;
  color: var(--text-subtle);
}
.incl p {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}
.vip-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.vip-foot small {
  display: block;
  font-size: 10px;
  color: var(--text-subtle);
}
.vip-foot strong {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--gold);
}
.vip-foot .btn {
  padding: 8px 16px;
  font-size: 12px;
}
.trust {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 32px 0 0;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  background: var(--surface-low);
}
.trust b {
  display: block;
  font-size: 12px;
}
.trust span {
  font-size: 10px;
  color: var(--text-subtle);
}

@media (max-width: 600px) {
  h1 {
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.5px;
    overflow-wrap: anywhere;
  }
}
@media (max-width: 900px) {
  .grid,
  .vip-grid,
  .trust {
    grid-template-columns: minmax(0, 1fr);
  }
  .finder {
    grid-template-columns: minmax(0, 1fr);
  }
  .head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .thumbs,
  .arrow {
    display: none;
  }
}
</style>
