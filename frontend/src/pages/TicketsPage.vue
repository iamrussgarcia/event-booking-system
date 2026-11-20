<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import poster from '../assets/detail/hero.jpg'
import QrCode from '../components/QrCode.vue'
import { booking } from '../stores/booking'
import { peso } from '../data/events'
// Sample order shown when the customer has not booked in this browser yet (matches the Figma frame).
const sample = {
  orderNumber: 'SPL-2027-88924',
  eventTitle: 'Aria Vale: City Lights World Tour',
  eventDate: 'Saturday, February 14, 2027 • 8:00 PM PHT (Gates 5:30 PM)',
  venue: 'Bayview Arena, Seaside Blvd, Pasay City • Gate 1 VIP Express',
  buyer: { name: 'Beatriz Alonzo', email: 'beatriz.alonzo@gmail.com', phone: '917 882 4491' },
  tickets: [
    {
      seatId: 'A-5-12',
      label: 'Section A · Row 5 · Seat 12',
      zoneName: 'VIP Gold Prime',
      price: 14500,
      holder: 'Beatriz Alonzo',
      qrToken: '88a92fv1a',
    },
    {
      seatId: 'A-5-11',
      label: 'Section A · Row 5 · Seat 11',
      zoneName: 'VIP Gold Prime',
      price: 14500,
      holder: 'Carlos Miguel Tan',
      qrToken: '88a92fv2b',
    },
  ],
  subtotal: 29000,
  fee: 1500,
  total: 30500,
  method: 'GCash',
  createdAt: '2026-11-10T20:14:00',
}
const tab = ref('upcoming')
const q = ref('')
const open = ref(null)
const active = ref(0)
const orders = computed(() => (booking.orders.length ? booking.orders : [sample]))
const shown = computed(() =>
  orders.value.filter((o) => `${o.eventTitle} ${o.venue}`.toLowerCase().includes(q.value.toLowerCase())),
)
if (!open.value) open.value = orders.value[0]?.orderNumber ?? null
const toggle = (o) => {
  open.value = open.value === o.orderNumber ? null : o.orderNumber
  active.value = 0
}
const seatParts = (label) => {
  const m = label.match(/Section (\S+) · Row (\d+) · Seat (\d+)/)
  return { section: m?.[1] ?? '', row: m?.[2] ?? '', seat: m?.[3] ?? '' }
}
const past = [
  { t: 'The Midnight Echoes Manila', v: 'Araneta Coliseum • Lower Box', d: 'ATTENDED • NOV 2026' },
  { t: 'Aurora Lights Indie Night', v: 'Seaside Amphitheater • VIP Standing', d: 'ATTENDED • AUG 2026' },
]
</script>

<template>
  <div class="page container">
    <nav class="crumbs"><RouterLink to="/">Home</RouterLink> / <RouterLink to="/account/profile">Account</RouterLink> / <b>My Tickets</b></nav>

    <section class="profile">
      <div class="av"><AppIcon name="id-card" /></div>
      <div><h2>{{ orders[0].buyer.name }} <em><AppIcon name="star" filled /> Spotlight VIP Fan</em></h2><p>Verified Resident • Manila PH · ID Validated #PH-992-801</p></div>
      <div class="stats"><div><small>ACTIVE PASSES</small><b>{{ orders.reduce((n, o) => n + o.tickets.length, 0) }} Arena</b></div><div><small>FAN POINTS</small><b class="g">4,850 <i>pts</i></b></div></div>
    </section>

    <div class="layout">
      <aside class="nav">
        <div class="menu">
          <a class="on"><AppIcon name="ticket" /> My Tickets <span>{{ orders.length }} Active</span></a>
          <RouterLink to="/account/profile"><AppIcon name="user" /> Profile Settings</RouterLink>
          <a><AppIcon name="credit-card" /> Payment Methods <small>GCash/Visa</small></a>
          <a><AppIcon name="bell" /> Alerts &amp; Drops <i /></a>
          <a class="out"><AppIcon name="log-out" /> Sign Out</a>
        </div>
        <div class="shield"><span><AppIcon name="shield-check" /></span><div><b>Turnstile Fraud Shield</b><p>Dynamic rolling security prevents screenshots. E-tickets refresh tokens every 60s at venue turnstiles.</p><small><AppIcon name="circle" filled size="8" /> Active Shield v3.4 (NFC Ready)</small></div></div>
      </aside>

      <main>
        <div class="top">
          <div><h1>My Tickets</h1><p>Manage your active arena passes, view digital QR turnstile tickets, or transfer to friends.</p></div>
          <div class="seg"><button :class="{ on: tab === 'upcoming' }" @click="tab = 'upcoming'">Upcoming ({{ orders.length }})</button><button :class="{ on: tab === 'past' }" @click="tab = 'past'">Past Events (5)</button></div>
        </div>
        <label class="search"><AppIcon name="search" /> <input v-model="q" type="search" placeholder="Search by artist or venue..." /><select aria-label="Venue filter"><option>All Venues (Metro Manila)</option></select></label>

        <template v-if="tab === 'upcoming'">
          <p v-if="!shown.length" class="none">No tickets match your search.</p>
          <article v-for="o in shown" :key="o.orderNumber" class="order">
            <div class="oh">
              <div class="th"><img :src="poster" alt="" /><span>VIP GOLD</span></div>
              <div class="oi">
                <div class="bd"><em class="ok"><AppIcon name="circle" filled size="8" /> CONFIRMED • VALIDATED</em><em>{{ o.tickets.length }} Seats Reserved</em></div>
                <h3>{{ o.eventTitle }}</h3>
                <p><AppIcon name="calendar" /> {{ o.eventDate }}</p><p><AppIcon name="map-pin" /> {{ o.venue }}</p>
              </div>
              <div class="oa"><small>Order #{{ o.orderNumber }}</small><button class="btn btn-primary" type="button" @click="toggle(o)"><AppIcon name="qr-code" /> View Pass</button></div>
            </div>

            <div v-if="open === o.orderNumber" class="pass">
              <div class="ptabs">
                <button v-for="(t, i) in o.tickets" :key="t.seatId" :class="{ on: active === i }" @click="active = i">Pass {{ i + 1 }}: {{ t.holder }} ({{ t.label.replace('Section ', 'Sec ').replace(/ · /g, ' · ') }})</button>
                <small><AppIcon name="refresh-cw" /> Turnstile sync active</small>
              </div>
              <div v-if="o.tickets[active]" class="tix">
                <div class="tt"><em><AppIcon name="star" filled /> {{ o.tickets[active].zoneName.toUpperCase() }}</em><small>Pass ID: #{{ o.tickets[active].qrToken.slice(0, 7).toUpperCase() }}</small><span><AppIcon name="circle" filled size="8" /> LIVE NFC READY</span></div>
                <p class="vip"><b>VIP Gold Access Included:</b> Priority Gate 1 express lane, Pre-show Soundcheck access (6:00 PM), Backstage VIP Lounge complimentary mocktails, and Commemorative Tour Lanyard.</p>
                <div class="body">
                  <div class="q"><QrCode :token="o.tickets[active].qrToken" :size="100" /><code>AUTH-{{ o.tickets[active].qrToken.slice(0, 8).toUpperCase() }}</code></div>
                  <div class="d">
                    <div class="big">
                      <div><small>SECTION</small><b>SEC {{ seatParts(o.tickets[active].label).section }}</b></div>
                      <div><small>ROW</small><b class="p">ROW {{ seatParts(o.tickets[active].label).row }}</b></div>
                      <div><small>SEAT</small><b class="c">SEAT {{ seatParts(o.tickets[active].label).seat }}</b></div>
                    </div>
                    <dl>
                      <div><dt>Ticket Holder:</dt><dd>{{ o.tickets[active].holder }} <AppIcon name="check" /></dd></div>
                      <div><dt>Venue Entrance:</dt><dd>VIP Gate 1 (Express Lane)</dd></div>
                      <div><dt>Price Level:</dt><dd>{{ peso(o.tickets[active].price) }} PHP ({{ o.tickets[active].zoneName }})</dd></div>
                    </dl>
                    <div class="ref"><small>Turnstile Code Refresh <b>Refreshes in 42s</b></small><i /></div>
                  </div>
                </div>
                <div class="wal"><button>Apple Wallet</button><button>Google Wallet</button><button>Download PDF</button><button>Transfer</button></div>
              </div>
            </div>
          </article>

          <article class="order small">
            <div class="oh">
              <div class="th"><img :src="poster" alt="" /><span class="ga">GA TIER 1</span></div>
              <div class="oi"><div class="bd"><em>CONFIRMED ORDER</em><em>1 Pass Reserved</em></div><h3>Neon Horizon Festival 2027</h3><p><AppIcon name="calendar" /> Saturday, March 27, 2027 • 6:00 PM PHT</p><p><AppIcon name="map-pin" /> Harbor Theater, Seaside Grounds, Pasay City</p><p class="warn"><AppIcon name="lock" /> QR Turnstile Code unlocks 72 hours prior to show date.</p></div>
              <div class="oa"><small>Order #SPL-2027-91042</small><button class="btn alt" type="button"><AppIcon name="eye" /> View Details</button></div>
            </div>
          </article>
        </template>

        <section v-else class="memories"><p>Archived passes appear below.</p></section>

        <section class="mem">
          <div class="mh"><div><h3>Recent Concert Memories</h3><p>Archived digital passes and verified certificates of attendance</p></div><a>View All Past (5) <AppIcon name="arrow-right" /></a></div>
          <div class="mg"><div v-for="p in past" :key="p.t" class="mc"><img :src="poster" alt="" /><div><small>{{ p.d }}</small><b>{{ p.t }}</b><p>{{ p.v }}</p></div></div></div>
        </section>
        <div class="supp"><AppIcon name="circle-help" /> Need to reassign name on ticket or having turnstile QR issues? <a>Contact 24/7 Manila Arena Support <AppIcon name="arrow-right" /></a></div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page { padding-top: 96px; padding-bottom: 64px; }
.crumbs { font-size: 11px; color: var(--text-subtle); margin-bottom: 12px; }
.crumbs b { color: var(--text); font-weight: 500; }
.profile { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: var(--radius-lg); background: linear-gradient(90deg, #26224a, var(--surface-low) 55%, #3a2c14); margin-bottom: 24px; }
.av { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 14px; background: #2a2c46; font-size: 24px; }
.profile h2 { font-family: var(--font-display); font-size: 24px; }
.profile em { margin-left: 8px; padding: 3px 10px; border-radius: var(--radius-pill); background: rgba(202,129,0,.3); color: var(--gold); font-family: var(--font-body); font-style: normal; font-size: 10px; }
.profile p { margin-top: 4px; font-size: 12px; color: var(--text-muted); }
.stats { margin-left: auto; display: flex; gap: 14px; }
.stats div { padding: 10px 18px; border-radius: var(--radius); background: rgba(12,14,23,.7); }
.stats small { display: block; font-size: 9px; letter-spacing: .08em; color: var(--text-subtle); }
.stats b { font-family: var(--font-display); font-size: 18px; }
.stats .g { color: var(--gold); }
.stats i { font-size: 11px; font-style: normal; color: var(--text-subtle); }
.layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; align-items: start; }
.nav { display: flex; flex-direction: column; gap: 16px; }
.menu { padding: 8px; border-radius: var(--radius-lg); background: var(--surface-low); }
.menu a { display: flex; align-items: center; justify-content: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius); font-size: 13px; color: var(--text-muted); cursor: pointer; }
.menu a > :last-child:not(:first-child) { margin-left: auto; }
.menu a.on { background: var(--surface); color: var(--text); font-weight: 600; box-shadow: inset 3px 0 var(--primary-strong); }
.menu span { padding: 2px 8px; border-radius: var(--radius-pill); background: var(--primary-strong); color: var(--on-primary); font-size: 10px; font-weight: 600; }
.menu small { font-size: 10px; color: var(--text-subtle); }
.menu i { width: 6px; height: 6px; border-radius: 50%; background: var(--secondary); }
.menu .out { color: var(--danger); margin-top: 8px; }
.shield { display: flex; gap: 12px; padding: 16px; border-radius: var(--radius-lg); background: var(--surface-low); font-size: 12px; }
.shield p { margin: 6px 0; line-height: 1.5; color: var(--text-muted); }
.shield small { color: var(--secondary); font-size: 10px; }
.top { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; background: var(--surface-low); }
.top h1 { font-family: var(--font-display); font-size: 32px; }
.top p { margin-top: 6px; max-width: 360px; font-size: 13px; color: var(--text-subtle); line-height: 1.5; }
.seg { display: flex; padding: 4px; border-radius: var(--radius-pill); background: var(--surface-lowest); }
.seg button { padding: 12px 24px; border-radius: var(--radius-pill); font-size: 13px; font-weight: 600; color: var(--text-muted); }
.seg .on { background: var(--primary-strong); color: var(--on-primary); }
.search { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding: 0 24px 20px; background: var(--surface-low); border-radius: 0 0 var(--radius-lg) var(--radius-lg); color: var(--text-subtle); }
.search input { flex: 0 1 260px; padding: 10px 14px; border: 0; border-radius: var(--radius-pill); background: var(--surface-lowest); color: var(--text); font: inherit; font-size: 13px; outline: 0; }
.search { flex-wrap: wrap; }
.search input { flex: 1 1 180px; }
.search select { margin-left: auto; max-width: 100%; background: none; border: 0; color: var(--text-muted); font-size: 12px; }
.order { margin-bottom: 20px; border-radius: var(--radius-lg); background: var(--surface-low); overflow: hidden; border: 1px solid rgba(73,68,84,.25); }
.oh { display: flex; align-items: center; gap: 18px; padding: 20px 24px; }
.th { position: relative; flex: none; width: 84px; height: 84px; border-radius: 12px; overflow: hidden; }
.th img { width: 100%; height: 100%; object-fit: cover; }
.th span { position: absolute; left: 6px; bottom: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--primary-strong); color: var(--on-primary); font-size: 9px; font-weight: 700; }
.th .ga { background: var(--secondary); color: #00363f; }
.oi { flex: 1; min-width: 0; }
.bd { display: flex; gap: 8px; margin-bottom: 6px; }
.bd em { padding: 2px 8px; border-radius: var(--radius-pill); background: #282933; font-style: normal; font-size: 10px; color: var(--text-muted); }
.bd .ok { background: rgba(3,181,211,.2); color: var(--secondary); }
.oi h3 { font-family: var(--font-display); font-size: 20px; }
.oi p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.oi .warn { color: var(--gold); font-size: 11px; margin-top: 6px; }
.oa { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.oa small { font-size: 10px; color: var(--text-subtle); font-family: monospace; }
.alt { background: var(--surface); color: var(--text); }
.order.small .oh { opacity: .95; }
.pass { padding: 20px 24px 28px; background: var(--surface-lowest); }
.ptabs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.ptabs button { padding: 8px 16px; border-radius: var(--radius-pill); background: var(--surface); font-size: 11px; font-weight: 600; color: var(--text-muted); }
.ptabs button.on { background: var(--primary); color: var(--on-primary); }
.ptabs small { margin-left: auto; font-size: 11px; color: var(--secondary); }
.tix { max-width: 560px; margin: 0 auto; padding: 18px 20px; border-radius: var(--radius-lg); background: var(--surface); border-top: 4px solid var(--gold); }
.tt { display: flex; align-items: center; gap: 10px; }
.tt em { padding: 3px 12px; border-radius: var(--radius-pill); background: rgba(202,129,0,.3); color: var(--gold); font-style: normal; font-size: 10px; font-weight: 700; }
.tt small { font-size: 10px; color: var(--text-subtle); font-family: monospace; }
.tt span { margin-left: auto; font-size: 10px; color: var(--secondary); font-family: monospace; }
.vip { margin: 14px 0; padding: 14px 16px; border-radius: var(--radius); background: rgba(202,129,0,.2); font-size: 13px; line-height: 1.5; color: var(--gold); }
.body { display: flex; gap: 16px; padding: 18px; border-radius: var(--radius-lg); background: var(--surface-lowest); }
.q { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.q svg { border-radius: 8px; width: 104px; height: 104px; }
.q code { font-size: 9px; color: var(--secondary); }
.d { flex: 1; }
.big { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.big div { padding: 8px; border-radius: 8px; background: var(--surface); text-align: center; }
.big small { display: block; font-size: 8px; letter-spacing: .08em; color: var(--text-subtle); }
.big b { font-family: var(--font-display); font-size: 17px; }
.big .p { color: var(--primary); }
.big .c { color: var(--secondary); }
.d dl { margin: 12px 0; font-size: 11px; }
.d dl div { display: flex; justify-content: space-between; margin: 6px 0; color: var(--text-muted); }
.d dt, .d dd { margin: 0; }
.d dd { color: var(--text); font-weight: 500; }
.ref small { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-subtle); }
.ref b { color: var(--secondary); font-weight: 500; }
.ref i { display: block; height: 4px; margin-top: 6px; border-radius: 4px; background: linear-gradient(90deg, var(--secondary) 70%, var(--surface) 70%); }
.wal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 14px; }
.wal button { padding: 9px; border-radius: var(--radius); background: var(--surface-low); font-size: 10px; font-weight: 600; }
.none { padding: 24px; text-align: center; color: var(--text-subtle); }
.memories { padding: 24px; color: var(--text-subtle); }
.mem { margin-top: 36px; }
.mh { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14px; }
.mh h3 { font-family: var(--font-display); font-size: 20px; }
.mh p { font-size: 12px; color: var(--text-subtle); }
.mh a { font-size: 11px; font-weight: 600; color: var(--primary); }
.mg { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.mc { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--radius); background: var(--surface-low); }
.mc img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; filter: grayscale(1); }
.mc small { font-size: 9px; letter-spacing: .06em; color: var(--text-subtle); }
.mc b { display: block; font-size: 13px; }
.mc p { font-size: 11px; color: var(--text-subtle); }
.supp { display: flex; justify-content: space-between; margin-top: 18px; padding: 16px 20px; border-radius: var(--radius); background: var(--surface-low); font-size: 12px; color: var(--text-muted); }
.supp a { color: var(--primary); font-weight: 600; font-size: 11px; }
@media (max-width: 960px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .profile, .top, .oh { flex-direction: column; align-items: flex-start; }
  .stats { margin-left: 0; }
  .oa { align-items: flex-start; }
  .body { flex-direction: column; align-items: center; }
  .wal, .mg { grid-template-columns: 1fr 1fr; }
}
</style>
