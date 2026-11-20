<script setup>
import AppIcon from '../../components/AppIcon.vue'
import AdminEventsPanel from '../../components/admin/AdminEventsPanel.vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { SEATS_PER_EVENT, admin, allOrders, eventCity, eventVenue } from '../../stores/admin'
import { seatMap } from '../../data/seatmap'
import { peso } from '../../data/events'
import { downloadCsv, ordersToRows } from '../../utils/csv'

const live = computed(() => admin.events.filter((e) => e.status === 'published'))
const drafts = computed(() => admin.events.length - live.value.length)
const paid = computed(() => allOrders.value.filter((o) => o.status === 'paid'))
const revenue = computed(() => paid.value.reduce((n, o) => n + o.total, 0))
const tickets = computed(() => paid.value.reduce((n, o) => n + o.tickets.length, 0))
const avgTicket = computed(() => (tickets.value ? Math.round(revenue.value / tickets.value) : 0))
const capacity = computed(() => live.value.length * SEATS_PER_EVENT)
const sold = computed(() => live.value.reduce((n, e) => n + e.sold, 0))
const soldPct = computed(() => (capacity.value ? (sold.value / capacity.value) * 100 : 0))
const held = computed(() => seatMap.seats.filter((s) => s.status === 'held').length)
const busy = computed(() => held.value / seatMap.seats.length > 0.15)
const accents = ['var(--secondary)', 'var(--primary-strong)', 'var(--gold)', 'var(--secondary)']
const venues = computed(() => {
  const by = new Map()
  live.value.forEach((e) => {
    const k = eventVenue(e)
    const v = by.get(k) ?? { name: k, city: eventCity(e), sold: 0, cap: 0 }
    v.sold += e.sold
    v.cap += SEATS_PER_EVENT
    by.set(k, v)
  })
  return [...by.values()].slice(0, 4)
})
const bigMoney = (n) => (n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : n >= 1e5 ? `₱${(n / 1e3).toFixed(1)}K` : peso(n))
const exportAll = () => downloadCsv('spotlight-orders.csv', ordersToRows(allOrders.value))
</script>

<template>
  <div class="a-head">
    <div>
      <span class="a-eyebrow"><i /> Operational pulse</span>
      <h1 class="a-title">Platform Overview</h1>
      <p class="a-lead">Real-time arena sales, inventory distribution, and active Metro Manila productions.</p>
    </div>
    <div class="a-actions">
      <button type="button" class="a-btn" @click="exportAll"><AppIcon name="download" /> Export Reports <span class="tag">CSV</span></button>
      <RouterLink to="/admin/events/new" class="a-btn primary"><AppIcon name="plus" /> Create New Event</RouterLink>
    </div>
  </div>

  <div class="stats">
    <article class="a-card stat">
      <header><small>LIVE PRODUCTIONS</small><span class="ico"><AppIcon name="ticket" size="18" /></span></header>
      <p class="big"><b>{{ live.length }}</b><span>Active Events</span></p>
      <footer>
        <span class="up"><AppIcon name="trending-up" /> {{ drafts }} draft{{ drafts === 1 ? '' : 's' }}</span>
        <span>Across {{ new Set(live.map(eventVenue)).size }} venues</span>
      </footer>
    </article>
    <article class="a-card stat">
      <header><small>GROSS BOOKINGS VOLUME</small><span class="ico"><AppIcon name="banknote" size="18" /></span></header>
      <p class="big"><b>{{ bigMoney(revenue) }}</b></p>
      <footer>
        <span class="up"><AppIcon name="arrow-up" /> {{ paid.length }} paid order{{ paid.length === 1 ? '' : 's' }}</span>
        <span>Avg ticket {{ peso(avgTicket) }}</span>
      </footer>
    </article>
    <article class="a-card stat">
      <header><small>ARENA CAPACITY SOLD</small><span class="ico"><AppIcon name="armchair" size="18" /></span></header>
      <p class="big"><b>{{ soldPct.toFixed(1) }}%</b><span>{{ sold.toLocaleString('en-PH') }} / {{ capacity.toLocaleString('en-PH') }}</span></p>
      <footer>
        <span class="up gold"><AppIcon name="zap" /> {{ tickets }} tickets issued</span>
        <span>{{ (capacity - sold).toLocaleString('en-PH') }} seats left</span>
      </footer>
    </article>
  </div>

  <section class="a-card flow">
    <span class="ico round"><AppIcon name="radar" size="22" /></span>
    <div class="txt">
      <b>Live Arena Throughput</b>
      <p>{{ held }} seats are held in checkout queues across {{ live.length }} live events.</p>
    </div>
    <div class="fside">
      <span class="ready"><small>SEAT HOLD WINDOW</small><b>10 minutes</b></span>
      <span class="a-pill nodot" :class="busy ? 'gold' : ''"><i class="d" :class="{ gold: busy }" /> {{ busy ? 'High Demand' : 'Queue Normal' }}</span>
    </div>
  </section>

  <AdminEventsPanel title="Upcoming Events" :page-size="6" />

  <div class="venues">
    <article v-for="(v, i) in venues" :key="v.name" class="a-card venue">
      <header><small>{{ v.name.toUpperCase() }} • {{ v.city.toUpperCase() }}</small><i :style="{ background: accents[i] }" /></header>
      <p><b>{{ ((v.sold / v.cap) * 100).toFixed(1) }}%</b><span>{{ v.sold.toLocaleString('en-PH') }} / {{ v.cap.toLocaleString('en-PH') }}</span></p>
      <div class="a-bar"><i :style="{ width: Math.min(100, (v.sold / v.cap) * 100) + '%', '--c': accents[i] }" /></div>
    </article>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-bottom: 24px; }
.stat { padding: 24px 28px; background: linear-gradient(160deg, var(--surface-low), #151720); display: flex; flex-direction: column; gap: 16px; }
.stat header, .venue header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.stat small { font-size: 12px; letter-spacing: 0.1em; color: var(--text-muted); }
.ico { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; background: var(--surface); color: var(--text-muted); }
.ico.round { width: 52px; height: 52px; border-radius: 50%; color: var(--primary); flex: none; }
.big { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; min-width: 0; }
.big b { font-family: var(--font-display); font-weight: 800; font-size: clamp(30px, 3vw, 46px); letter-spacing: -0.02em; line-height: 1.05; white-space: nowrap; }
.big span { font-size: 15px; color: var(--text-muted); }
.stat footer { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 14px; color: var(--text-muted); }
.up { display: inline-flex; align-items: center; gap: 6px; color: var(--secondary); font-weight: 500; }
.up.gold { color: var(--gold); }
.flow { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 32px; padding: 24px 28px; }
.flow .txt { flex: 1 1 280px; }
.flow .txt b { display: block; font-size: 17px; margin-bottom: 4px; }
.flow .txt p { font-size: 16px; color: var(--text-muted); }
.flow .fside { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.ready { text-align: right; }
.ready small { display: block; font-size: 11px; letter-spacing: 0.1em; color: var(--text-muted); }
.ready b { color: var(--secondary); font-size: 16px; font-weight: 600; }
.d { width: 8px; height: 8px; border-radius: 50%; background: var(--secondary); }
.d.gold { background: var(--gold); }
.venues { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-top: 32px; }
.venue { padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; }
.venue small { font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); }
.venue header i { width: 10px; height: 10px; border-radius: 50%; }
.venue p { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.venue p b { font-family: var(--font-display); font-size: 26px; font-weight: 600; }
.venue p span { font-size: 13px; color: var(--text-muted); }
@media (max-width: 1100px) {
  .stats { grid-template-columns: minmax(0, 1fr); }
  .venues { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .venues { grid-template-columns: minmax(0, 1fr); }
  .stat, .flow { padding: 20px; }
}
</style>
