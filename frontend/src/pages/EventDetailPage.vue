<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import heroImg from '../assets/detail/hero.jpg'
import mapImg from '../assets/detail/map.jpg'
import { eventBySlug, featuredDetail } from '../data/listing'
import { zones } from '../data/seatmap'
import { peso } from '../data/events'
const route = useRoute()
const tabs = ['Event Details', 'Frequently Asked Questions', 'Exchange & Refund Policy', 'Ways to Buy (PH Channels)']
const tab = ref(0)
// The Figma frame is Aria Vale: City Lights Tour. Other listed events reuse the same layout.
const listed = computed(() => eventBySlug(route.params.slug))
const isFeatured = computed(() => route.params.slug === featuredDetail.slug || !listed.value)
const title = computed(() => (isFeatured.value ? featuredDetail.title : listed.value.title))
const venue = computed(() => (isFeatured.value ? featuredDetail.venue : listed.value.venue))
const timeline = [
  {
    t: '5:30 PM',
    c: '#4cd7f6',
    h: 'Arena Gates & Concourse Food Market Opens',
    p: 'All security checks, bag inspections, and official merch booths active on Level 1 & 2 concourses.',
  },
  {
    t: '6:45 PM',
    c: '#ffb95f',
    h: 'Opening Act: Kaito Rivera (Acoustic Set)',
    p: 'Special guest performance introducing tracks from his debut Manila EP.',
  },
  {
    t: '8:00 PM - 10:45 PM',
    c: '#a078ff',
    h: 'Aria Vale: City Lights Main Show',
    p: 'Complete 2-act symphony spectacle with special guest appearances and Valentine encore.',
  },
  {
    t: '11:15 PM',
    c: '#494454',
    h: 'Concert Curfew & Dedicated Transit Shuttles',
    p: 'Direct buses towards EDSA Carousel and LRT-1 Baclaran stationed outside Seaside Plaza Gate.',
  },
]
const transit = [
  {
    h: 'EDSA Carousel Express',
    p: 'Drop-off directly at SM MOA Seaside Globe Stop. 4-minute covered walkway to Bayview Arena North Gate.',
    i: 'bus',
  },
  {
    h: 'MRT-3 / LRT-1 Connections',
    p: 'Free dedicated SPOTLIGHT e-shuttle runs every 10 mins from Taft Avenue Station directly to Gate 4.',
    i: 'train-front',
  },
  {
    h: 'Arena & Seaside Parking',
    p: '2,500 dedicated multi-level parking slots available. Pre-book parking pass with your ticket for guaranteed slot.',
    i: 'square-parking',
  },
]
const faq = [
  ['How many seats can I buy?', 'Up to 6 seats per order. Each seat becomes its own ticket with a QR image.'],
  [
    'How long are my seats held?',
    'Seats are held for 10 minutes once you continue to checkout. After that they are released to the general queue.',
  ],
  [
    'Can I pick my exact seats?',
    'Yes. Choose seats on the interactive seat plan; zone colors, prices and live availability are shown.',
  ],
]
const policy = [
  'All sales are final. Tickets are exchangeable up to 72 hours before the show for the same tier, subject to availability.',
  'If an event is cancelled, refunds are processed manually through the payment gateway dashboard.',
  'Late payment confirmations after a seat hold expired are flagged for a manual refund.',
]
const channels = ['GCash', 'Maya', 'GrabPay', 'Visa / Mastercard', 'BPI Online']
</script>

<template>
  <div class="page">
    <div class="alertbar container"><nav><RouterLink to="/">Home</RouterLink> / <RouterLink to="/events">Events</RouterLink> / <b>{{ title }}</b></nav><span class="live"><AppIcon name="zap" /> Live seat availability active</span></div>

    <section class="hero">
      <img :src="heroImg" alt="" class="bgimg" />
      <div class="shade" />
      <div class="container grid">
        <div class="main">
          <div class="badges">
            <span class="b gold"><AppIcon name="star" filled /> VALENTINE SPECIAL 2027 • METRO MANILA LEG</span>
            <span class="b hot"><i /> Selling Fast • 88% Claimed</span>
            <span class="b cyan">Live Orchestra Setup</span>
          </div>
          <p class="kicker">WORLD TOUR LIVE IN MANILA</p>
          <h1 v-if="isFeatured">ARIA VALE:<br /><span>CITY LIGHTS<br />TOUR</span></h1>
          <h1 v-else class="plain">{{ title }}</h1>
          <div class="meta">
            <div class="m"><span class="ic v"><AppIcon name="calendar" /></span><div><small>DATE &amp; SHOW TIME</small><strong>{{ isFeatured ? 'Sat, Feb 14, 2027' : listed.weekday + ', ' + listed.mon + ' ' + listed.day }}</strong><p>8:00 PM (Doors open 5:30 PM)</p></div></div>
            <div class="m"><span class="ic c"><AppIcon name="map-pin" /></span><div><small>ARENA VENUE</small><strong>{{ venue }}</strong><p>{{ featuredDetail.address }}</p></div></div>
          </div>
        </div>
        <aside class="call">
          <div class="r1"><small>OFFICIAL TIER RANGE</small><span class="gc">GCash / Maya Ready</span></div>
          <p class="range"><span>From</span><b>{{ peso(zones.general.price) }}</b><span class="to">to {{ peso(zones.vip.price) }}</span></p>
          <p class="note">Excludes convenience fee. Tier allocations update in real-time based on live Manila gate checkouts.</p>
          <RouterLink :to="`/events/${$route.params.slug}/seats`" class="btn btn-primary cta"><AppIcon name="ticket" /> Choose Seats on Arena Matrix</RouterLink>
          <div class="two"><button type="button"><AppIcon name="calendar" /> Add to Calendar</button><button type="button"><AppIcon name="arrow-up-right" /> Share Tour</button></div>
          <div class="sec"><span><AppIcon name="lock" /> 128-bit Encrypted Cart</span><span>100% Guaranteed Seats</span></div>
        </aside>
      </div>
    </section>

    <section class="container zones">
      <h2>Price Zones</h2>
      <div class="zgrid">
        <RouterLink v-for="z in Object.values(zones)" :key="z.id" :to="`/events/${$route.params.slug}/seats`" class="z" :style="{ '--c': z.color }">
          <i /><small>{{ z.vip ? 'VIP ZONE' : 'ZONE' }}</small><b>{{ z.short }}</b><strong>{{ peso(z.price) }}</strong>
        </RouterLink>
      </div>
    </section>

    <section class="container body">
      <div class="tabs" role="tablist">
        <button v-for="(t, i) in tabs" :key="t" role="tab" :aria-selected="tab === i" :class="{ on: tab === i }" @click="tab = i">{{ t }}</button>
      </div>

      <div v-if="tab === 0" class="cols">
        <div class="left">
          <article class="card">
            <div class="ttl"><h3>The Valentine Symphony<br />Experience</h3><span class="pill">SPECIAL<br />EDITION</span></div>
            <p>Global sensation <b>Aria Vale</b> returns to Manila for the largest arena performance of her career. Specially orchestrated for Valentine's evening 2027 at the iconic Bayview Arena Pasay, the <em>City Lights Tour</em> fuses synth-pop grandeur with the sweeping richness of the 70-piece Manila Philharmonic Ensemble.</p>
            <p>Fans will experience groundbreaking visual design orchestrated by creative director Yves Chen, highlighted by a 34-meter motorized kinetic lighting cloud suspended over the audience and high-definition immersive projection mapping that morphs the arena into a luminous nighttime cityscape.</p>
            <div class="bento">
              <div><b style="color: var(--primary)">70-Piece</b><small>Full Orchestra backing on all headline arrangements</small></div>
              <div><b style="color: var(--secondary)">360° Sound</b><small>L-Acoustics K1 Hyperreal immersive concert setup</small></div>
              <div><b style="color: var(--gold)">3 Hours</b><small>Setlist featuring 28 hit tracks and acoustic encores</small></div>
            </div>
          </article>
          <article class="card">
            <h3 class="tl"><AppIcon name="clock" /> Official Concert Timeline • Sat, Feb 14</h3>
            <ol class="timeline">
              <li v-for="x in timeline" :key="x.t" :style="{ '--c': x.c }">
                <small :style="{ color: x.c }">{{ x.t }}</small><b>{{ x.h }}</b><p>{{ x.p }}</p>
              </li>
            </ol>
          </article>
        </div>
        <div class="right">
          <article class="card">
            <div class="vh"><span class="ic v"><AppIcon name="map-pin" /></span><div><h3>Bayview Arena Pasay</h3><p>Seaside Blvd cor. Pacific Rim, Pasay City</p></div></div>
            <div class="map">
              <img :src="mapImg" alt="Map showing Bayview Arena in Pasay City" />
              <div class="shade2" />
              <span class="gate"><i /> Gate 1 VIP Valet Open</span>
              <a class="waze" href="https://maps.google.com/?q=Pasay+City" target="_blank" rel="noopener">Open Waze / Maps <AppIcon name="arrow-up-right" /></a>
            </div>
            <div v-for="t in transit" :key="t.h" class="tr"><span><AppIcon :name="t.i" /></span><div><b>{{ t.h }}</b><p>{{ t.p }}</p></div></div>
          </article>
          <div class="bag"><span><AppIcon name="backpack" /></span><div><b>Clear Bag Policy Enforced</b><p>Max bag size: 12" x 6" x 12" clear plastic, vinyl or PVC.</p></div><a href="#">Guidelines</a></div>
        </div>
      </div>

      <div v-else-if="tab === 1" class="card plain-card">
        <details v-for="f in faq" :key="f[0]" open><summary>{{ f[0] }}</summary><p>{{ f[1] }}</p></details>
      </div>
      <div v-else-if="tab === 2" class="card plain-card"><ul><li v-for="p in policy" :key="p">{{ p }}</li></ul></div>
      <div v-else class="card plain-card"><p>Pay securely online with verified Philippine channels. Card details never reach our servers.</p><div class="ch"><span v-for="c in channels" :key="c">{{ c }}</span></div></div>
    </section>

    <section class="container seatcta">
      <div><h2>Ready to pick your seats?</h2><p>See where you will sit and what it costs, with live availability refreshed every 10 seconds.</p></div>
      <RouterLink :to="`/events/${$route.params.slug}/seats`" class="btn btn-primary">Open Seat Plan <AppIcon name="arrow-right" /></RouterLink>
    </section>
  </div>
</template>

<style scoped>
.page { padding-top: 80px; }
.alertbar { display: flex; justify-content: space-between; padding-top: 10px; padding-bottom: 10px; font-size: 12px; color: var(--text-subtle); }
.alertbar b { color: var(--text); font-weight: 500; }
.live { color: var(--secondary); }
.hero { position: relative; background: var(--surface-lowest); overflow: hidden; padding: 40px 0; }
.bgimg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; }
.shade { position: absolute; inset: 0; background: linear-gradient(to top, #11131c, rgba(12,14,23,.7) 50%, rgba(12,14,23,.3)); }
.grid { position: relative; display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: end; min-height: 388px; }
.main { display: flex; flex-direction: column; gap: 16px; }
.badges { display: flex; flex-wrap: wrap; gap: 8px; }
.b { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 600; }
.b.gold { background: rgba(255,185,95,.15); color: var(--gold); letter-spacing: .03em; }
.b.hot { background: var(--danger-bg); color: var(--danger); }
.b.hot i { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); }
.b.cyan { background: #282933; color: var(--secondary); }
.kicker { font-size: 14px; font-weight: 600; letter-spacing: .1em; color: var(--primary); }
h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(36px, 6vw, 56px); line-height: 70px; letter-spacing: -1.4px; text-transform: uppercase; }
h1.plain { line-height: 1.1; }
h1 span { background: linear-gradient(90deg, #d0bcff, #a078ff, #4cd7f6); -webkit-background-clip: text; background-clip: text; color: transparent; }
.meta { display: flex; gap: 16px; padding-top: 4px; }
.m { flex: 1; display: flex; gap: 12px; padding: 14px; border-radius: var(--radius); background: rgba(29,31,41,.7); backdrop-filter: blur(12px); }
.ic { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 8px; }
.ic.v { background: rgba(160,120,255,.2); }
.ic.c { background: rgba(76,215,246,.15); }
.m small { display: block; font-size: 11px; letter-spacing: .05em; color: var(--text-subtle); }
.m strong { display: block; font-family: var(--font-display); font-size: 20px; font-weight: 600; }
.m p { font-size: 14px; color: var(--text-muted); }
.call { display: flex; flex-direction: column; gap: 14px; padding: 24px; border-radius: var(--radius-lg); background: rgba(40,41,51,.9); backdrop-filter: blur(24px); box-shadow: 0 25px 50px -12px rgba(0,0,0,.25); }
.r1 { display: flex; justify-content: space-between; align-items: center; }
.r1 small { font-size: 11px; letter-spacing: .1em; color: var(--text-subtle); }
.gc { padding: 2px 8px; border-radius: var(--radius-sm); background: rgba(76,215,246,.2); color: var(--secondary); font-size: 11px; font-weight: 600; }
.range { display: flex; align-items: baseline; gap: 8px; }
.range span { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.range b { font-family: var(--font-display); font-weight: 800; font-size: 38px; }
.range .to { color: var(--text-subtle); }
.note { font-size: 14px; line-height: 20px; color: #6f697c; }
.cta { justify-content: center; padding: 14px 24px; font-weight: 700; box-shadow: 0 0 12px rgba(160,120,255,.45); }
.two { display: flex; gap: 8px; }
.two button { flex: 1; padding: 10px; border-radius: var(--radius); background: var(--surface); font-size: 12px; font-weight: 600; }
.sec { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-subtle); }
.zones { padding-top: 32px; }
.zones h2, .seatcta h2 { font-family: var(--font-display); font-size: 24px; }
.zgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
.z { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 16px 20px; border-radius: var(--radius); background: var(--surface-low); border: 1px solid rgba(73,68,84,.3); transition: border-color .15s; }
.z:hover { border-color: var(--c); }
.z i { position: absolute; top: 16px; right: 16px; width: 12px; height: 12px; border-radius: 50%; background: var(--c); }
.z small { font-size: 10px; letter-spacing: .1em; color: var(--text-subtle); }
.z b { font-family: var(--font-display); font-size: 18px; }
.z strong { color: var(--c); font-size: 16px; }
.body { padding-top: 40px; padding-bottom: 24px; }
.tabs { display: flex; gap: 8px; overflow: auto; padding-bottom: 16px; }
.tabs button { flex: none; padding: 10px 24px; border-radius: var(--radius-pill); background: var(--surface); color: var(--text-muted); font-size: 14px; font-weight: 600; }
.tabs button.on { background: var(--primary-strong); color: var(--on-primary); font-weight: 700; box-shadow: 0 0 6px rgba(160,120,255,.3); }
.cols { display: grid; grid-template-columns: 7fr 5fr; gap: 40px; margin-top: 8px; align-items: start; }
.left, .right { display: flex; flex-direction: column; gap: 24px; }
.card { padding: 24px; border-radius: var(--radius-lg); background: var(--surface); display: flex; flex-direction: column; gap: 16px; }
.ttl { display: flex; justify-content: space-between; align-items: center; }
.ttl h3 { font-family: var(--font-display); font-size: 28px; letter-spacing: -.7px; line-height: 36px; }
.pill { padding: 4px 12px; border-radius: var(--radius-pill); background: rgba(208,188,255,.1); color: var(--primary); font-size: 11px; font-weight: 600; line-height: 14px; }
.card p { font-size: 16px; line-height: 26px; color: var(--text-muted); }
.card p b { color: var(--text); }
.card p em { color: var(--primary); }
.bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 8px; }
.bento div { padding: 14px; border-radius: var(--radius); background: var(--surface-low); }
.bento b { display: block; font-family: var(--font-display); font-size: 20px; }
.bento small { font-size: 11px; color: var(--text-subtle); }
.tl { font-family: var(--font-display); font-size: 20px; }
.timeline { list-style: none; margin: 0; padding: 0 0 0 16px; border-left: 2px solid #32343e; margin-left: 6px; display: flex; flex-direction: column; gap: 16px; }
.timeline li { position: relative; padding-left: 8px; }
.timeline li::before { content: ''; position: absolute; left: -29px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 4px var(--bg); }
.timeline small { display: block; font-size: 12px; font-weight: 700; }
.timeline b { display: block; margin-top: 2px; font-family: var(--font-display); font-size: 14px; }
.timeline p { font-size: 14px; line-height: 20px; color: var(--text-subtle); }
.vh { display: flex; gap: 12px; align-items: center; }
.vh .ic { width: 48px; height: 48px; border-radius: 12px; background: rgba(160,120,255,.15); }
.vh h3 { font-family: var(--font-display); font-size: 20px; }
.vh p { font-size: 14px; color: var(--text-subtle); line-height: 20px; }
.map { position: relative; height: 208px; border-radius: var(--radius); overflow: hidden; }
.map img { width: 100%; height: 100%; object-fit: cover; }
.shade2 { position: absolute; inset: 0; background: linear-gradient(to top, rgba(12,14,23,.9), rgba(12,14,23,0) 70%); }
.gate { position: absolute; left: 12px; bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; }
.gate i { width: 10px; height: 10px; border-radius: 50%; background: var(--danger); }
.waze { position: absolute; right: 12px; bottom: 12px; padding: 6px 12px; border-radius: 8px; background: rgba(55,57,67,.9); font-size: 11px; font-weight: 600; }
.tr { display: flex; gap: 12px; padding: 12px; border-radius: var(--radius); background: var(--surface-low); }
.tr b { font-family: var(--font-display); font-size: 12px; }
.tr p { font-size: 14px; line-height: 20px; color: var(--text-subtle); }
.bag { display: flex; gap: 12px; align-items: center; padding: 16px; border-radius: var(--radius); background: rgba(40,41,51,.6); }
.bag b { font-family: var(--font-display); font-size: 11px; }
.bag p { font-size: 14px; color: var(--text-subtle); }
.bag a { margin-left: auto; font-size: 11px; font-weight: 600; color: var(--primary); }
.plain-card { max-width: 800px; }
.plain-card details { padding: 12px 0; border-bottom: 1px solid rgba(73,68,84,.3); }
.plain-card summary { cursor: pointer; font-weight: 600; }
.plain-card ul { margin: 0; padding-left: 20px; line-height: 1.7; color: var(--text-muted); }
.ch { display: flex; flex-wrap: wrap; gap: 8px; }
.ch span { padding: 6px 14px; border-radius: var(--radius-pill); background: var(--surface-low); color: var(--secondary); font-size: 13px; font-weight: 600; }
.seatcta { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin: 24px auto 64px; padding: 28px 32px; border-radius: var(--radius-lg); background: var(--surface-low); }
.seatcta p { margin-top: 4px; font-size: 14px; color: var(--text-subtle); }
@media (max-width: 960px) {
  .grid, .cols { grid-template-columns: minmax(0, 1fr); }
  .meta, .seatcta { flex-direction: column; align-items: stretch; }
  .zgrid { grid-template-columns: repeat(2, 1fr); }
  .bento { grid-template-columns: minmax(0, 1fr); }
  h1 { line-height: 1.1; }
}
</style>
