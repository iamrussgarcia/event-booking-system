<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { listing, monthTaglines } from '../data/listing'
import { peso } from '../data/events'
const query = ref('')
const location = ref('')
const genre = ref('')
const showAll = ref(false)
const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  return listing.filter((e) => {
    const hay = `${e.title} ${e.artist} ${e.venue} ${e.city} ${e.genre}`.toLowerCase()
    return (
      (!q || hay.includes(q)) &&
      (!location.value || e.venue.toLowerCase().includes(location.value)) &&
      (!genre.value || e.genre.toLowerCase().includes(genre.value))
    )
  })
})
const visible = computed(() => (showAll.value ? matches.value : matches.value.slice(0, 9)))
const groups = computed(() => {
  const map = new Map()
  for (const e of visible.value) map.set(e.month, [...(map.get(e.month) ?? []), e])
  return [...map.entries()]
})
const reset = () => {
  query.value = ''
  location.value = ''
  genre.value = ''
}
const toneClass = (t) => `b-${t}`
</script>

<template>
  <div class="page">
    <header class="container hero">
      <span class="eyebrow"><b>LIVE ENTERTAINMENT INDEX</b> <i /> {{ listing.length }} Productions Tracked</span>
      <h1>Events</h1>
      <p>Concerts, tours, and live arena spectacles across Metro Manila. Real-time floor availability, official VIP presale allocations, and verified digital access.</p>
    </header>

    <section class="container panel">
      <label class="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input v-model="query" type="search" placeholder="Search by artist, headliner, band or landmark Manila arena..." />
      </label>
      <div class="filters">
        <select v-model="location" aria-label="Location">
          <option value="">Location</option>
          <option value="bayview">Bayview Arena</option>
          <option value="harbor">Harbor Theater</option>
          <option value="araneta">Smart Araneta</option>
          <option value="asia">Mall of Asia Arena</option>
        </select>
        <select v-model="genre" aria-label="Genre">
          <option value="">Genres</option>
          <option value="pop">Pop</option>
          <option value="edm">EDM</option>
          <option value="rock">Rock</option>
          <option value="acoustic">Acoustic</option>
        </select>
        <button type="button" class="reset" @click="reset">Reset filters</button>
      </div>
    </section>

    <div v-if="!groups.length" class="container empty">
      <h2>No events found</h2>
      <button class="btn btn-primary" @click="reset">Clear filters</button>
    </div>

    <section v-for="[month, items] in groups" :key="month" class="container month">
      <div class="month-head">
        <h2>{{ month }} <span class="count">{{ items.length }} {{ items.length === 1 ? 'Event' : 'Events' }}</span></h2>
        <small>{{ monthTaglines[month] }}</small>
      </div>
      <article v-for="e in items" :key="e.slug" class="row" :class="{ sold: e.soldOut }">
        <div class="date">
          <small>{{ e.weekday }}</small><strong>{{ e.day }}</strong><small class="mon">{{ e.mon }}</small>
        </div>
        <div class="thumb">
          <img :src="e.image" :alt="e.title" loading="lazy" />
          <span class="genre">{{ e.genre }}</span>
          <span v-if="e.soldOut" class="stamp">SOLD OUT</span>
        </div>
        <div class="info">
          <div class="badges"><span v-for="b in e.badges" :key="b.text" class="badge" :class="toneClass(b.tone)">{{ b.text }}</span></div>
          <h3>{{ e.title }}</h3>
          <p class="who"><b>{{ e.artist }}</b> <span>•</span> <em><AppIcon name="map-pin" /> {{ [e.venue, e.city].filter(Boolean).join(', ') }}</em></p>
          <p class="facts"><span v-for="(f, i) in e.facts" :key="f"><template v-if="i">• </template>{{ f }}</span></p>
        </div>
        <div class="buy">
          <div class="price">
            <small>{{ e.tierLabel }}</small>
            <strong v-if="e.soldOut">{{ peso(e.priceFrom) }}</strong>
            <strong v-else>From {{ peso(e.priceFrom) }}</strong>
          </div>
          <button v-if="e.soldOut" class="btn waitlist" type="button"><AppIcon name="timer" /> Join Waitlist</button>
          <RouterLink v-else :to="`/events/${e.slug}`" class="btn btn-primary">Find Tickets <AppIcon name="arrow-right" /></RouterLink>
        </div>
      </article>
    </section>

    <div v-if="groups.length" class="container more">
      <small>Showing <b>{{ visible.length }}</b> of <b>{{ matches.length }}</b> verified Manila productions</small>
      <div class="bar"><i :style="{ width: (visible.length / Math.max(matches.length, 1)) * 100 + '%' }" /></div>
      <button v-if="visible.length < matches.length" class="btn load" @click="showAll = true"><AppIcon name="chevron-down" /> Load More Events</button>
    </div>

    <section class="container alert">
      <div>
        <h3>Never miss a drop in Metro Manila</h3>
        <p>Get instantaneous presale alerts, venue door opens, and backstage pass drops directly to your inbox.</p>
      </div>
      <form @submit.prevent>
        <input type="email" placeholder="Enter your email address" required />
        <button class="btn btn-primary" type="submit">Get Presale Access</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-top: 104px;
}
.hero .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--text-muted);
}
.eyebrow b {
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: rgba(160, 120, 255, 0.2);
  color: var(--primary);
  letter-spacing: 0.05em;
}
.eyebrow i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--secondary);
}
h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 56px;
  letter-spacing: -1.4px;
  margin-top: 8px;
}
.hero p {
  max-width: 560px;
  margin-top: 8px;
  color: var(--text-subtle);
  line-height: 1.6;
}
.panel {
  margin-top: 28px;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  background: var(--surface-low);
  border: 1px solid rgba(73, 68, 84, 0.3);
}
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--surface-lowest);
  color: var(--text-subtle);
}
.search input {
  flex: 1;
  background: none;
  border: 0;
  outline: 0;
  color: var(--text);
  font: inherit;
  font-size: 14px;
}
.filters {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.filters select {
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--outline-variant);
  color: var(--text);
  font: inherit;
  font-size: 12px;
}
.reset {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-subtle);
}
.month {
  margin-top: 36px;
}
.month-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 12px 0;
}
.month-head h2 {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: -0.7px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.count {
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--primary-strong);
  color: var(--on-primary);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0;
}
.month-head small {
  font-size: 11px;
  color: var(--text-subtle);
}
.row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 14px;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface-low);
}
.row.sold .info,
.row.sold .date {
  opacity: 0.6;
}
.date {
  flex: none;
  width: 80px;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--surface-lowest);
}
.date small {
  font-size: 11px;
  font-weight: 700;
  color: var(--secondary);
}
.date .mon {
  font-weight: 600;
  color: var(--text-subtle);
}
.date strong {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 40px;
  line-height: 44px;
}
.thumb {
  position: relative;
  flex: none;
  width: 128px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.genre {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(12, 14, 23, 0.8);
  color: var(--secondary);
  font-size: 10px;
  font-weight: 700;
}
.stamp {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(12, 14, 23, 0.5);
  color: var(--danger);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.info {
  flex: 1;
  min-width: 0;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 4px;
}
.badge {
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
}
.b-gold {
  background: rgba(202, 129, 0, 0.3);
  color: var(--gold);
}
.b-cyan {
  background: rgba(3, 181, 211, 0.2);
  color: var(--secondary);
}
.b-violet {
  background: rgba(160, 120, 255, 0.2);
  color: var(--primary);
}
.b-plain {
  background: #282933;
  color: var(--text-muted);
}
.b-danger {
  background: var(--danger-bg);
  color: var(--danger);
}
h3 {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: -0.5px;
  line-height: 28px;
}
.who {
  margin-top: 2px;
  font-size: 14px;
  color: var(--text-muted);
}
.who b {
  font-weight: 500;
  color: var(--text);
}
.who em {
  font-style: normal;
  color: var(--text-subtle);
}
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-subtle);
}
.facts span:last-child:not(:first-child) {
  color: var(--secondary);
}
.buy {
  flex: none;
  display: flex;
  align-items: center;
  gap: 24px;
}
.price {
  text-align: right;
}
.price small {
  display: block;
  font-size: 11px;
  color: var(--text-subtle);
}
.price strong {
  font-family: var(--font-display);
  font-size: 20px;
}
.buy .btn {
  padding: 12px 24px;
}
.waitlist {
  background: var(--surface);
  color: var(--text);
}
.more {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-subtle);
}
.bar {
  width: 160px;
  height: 3px;
  border-radius: 3px;
  background: var(--surface);
}
.bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--primary-strong);
}
.load {
  background: var(--surface);
  color: var(--text);
}
.empty {
  text-align: center;
  padding: 80px 0;
}
.empty h2 {
  margin-bottom: 16px;
}
.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 56px;
  margin-bottom: 56px;
  padding: 24px 28px;
  border-radius: var(--radius-lg);
  background: var(--surface-low);
}
.alert h3 {
  font-size: 18px;
}
.alert p {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-subtle);
  max-width: 360px;
}
.alert form {
  display: flex;
  gap: 10px;
}
.alert input {
  width: 260px;
  padding: 10px 16px;
  border-radius: var(--radius-pill);
  border: 0;
  background: var(--surface-lowest);
  color: var(--text);
  font: inherit;
  font-size: 13px;
}
@media (max-width: 960px) {
  h1 {
    font-size: 40px;
  }
  .row {
    flex-wrap: wrap;
  }
  .info {
    flex-basis: 100%;
    order: 3;
  }
  .buy {
    margin-left: auto;
  }
  .alert,
  .alert form {
    flex-direction: column;
    align-items: stretch;
  }
  .alert input {
    width: 100%;
  }
}
@media (max-width: 600px) {
  .row {
    padding: 16px;
    gap: 16px;
  }
  .buy {
    flex: 1 1 100%;
    margin-left: 0;
    justify-content: space-between;
    gap: 12px;
  }
  .filters,
  .bar {
    flex-wrap: wrap;
  }
}
</style>
