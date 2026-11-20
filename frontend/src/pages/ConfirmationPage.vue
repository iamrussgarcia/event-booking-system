<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import poster from '../assets/detail/hero.jpg'
import mapImg from '../assets/detail/map.jpg'
import QrCode from '../components/QrCode.vue'
import { booking } from '../stores/booking'
import { peso } from '../data/events'
const route = useRoute()
const order = computed(() => booking.orders.find((o) => o.orderNumber === route.params.orderNumber))
const paidAt = computed(() =>
  order.value
    ? new Date(order.value.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
    : '',
)
const parts = (label) => {
  const m = label.match(/Section (\S+) · Row (\d+) · Seat (\d+)/)
  return { section: m?.[1] ?? '', row: m?.[2].padStart(2, '0') ?? '', seat: m?.[3] ?? '' }
}
const print = () => window.print()
</script>

<template>
  <div class="page container">
    <div v-if="!order" class="card nf">
      <h1>Order not found</h1>
      <p>We couldn't find order {{ $route.params.orderNumber }} in this browser.</p>
      <RouterLink to="/account/tickets" class="btn btn-primary">Go to My Tickets</RouterLink>
    </div>

    <template v-else>
      <ol class="steps"><li><AppIcon name="check" /> 1 Seats</li><li><AppIcon name="check" /> 2 Details</li><li><AppIcon name="check" /> 3 Payment</li><li class="cur"><AppIcon name="check" /> 4 Confirmed</li></ol>

      <header class="head">
        <div class="seal"><AppIcon name="check" /></div>
        <span class="issued"><AppIcon name="circle" filled size="8" /> INSTANT ACCESS ISSUED</span>
        <h1>You're going!</h1>
        <p>Booking confirmed. Your digital tickets are ready and a copy has been sent to <u>{{ order.buyer.email }}</u>.</p>
        <div class="facts">
          <div><small>ORDER REF</small><b>#{{ order.orderNumber }}</b></div>
          <div><small>TRANSACTION TIME</small><b>{{ paidAt }}</b></div>
          <div><small>PAYMENT METHOD</small><b>{{ order.method }} (Test mode)</b></div>
        </div>
      </header>

      <div class="layout">
        <div class="main">
          <section class="event">
            <img :src="poster" alt="" />
            <div class="ov">
              <span class="tg"><em><AppIcon name="star" /> VIP Lounge Included</em> <em class="c">World Tour 2027</em></span>
              <small>SPOTLIGHT EXCLUSIVE ARENA EVENT</small>
              <h2>{{ order.eventTitle.replace('Tour', 'World Tour') }}</h2>
              <div class="dv">
                <p><b>Saturday, February 14, 2027</b>8:00 PM PHT • Gates Open 5:30 PM<em>Pre-Show Soundcheck 6:00 PM</em></p>
                <p><b>Bayview Arena</b>Seaside Blvd, Mall of Asia Complex, Pasay City<em class="g">Gate 1 VIP Express Turnstile • Sec A Catwalk</em></p>
              </div>
            </div>
          </section>

          <div class="th"><div><h2>Your Digital Tickets</h2><p>{{ order.tickets.length }} {{ order.tickets.length === 1 ? 'Seat' : 'Seats' }} Reserved under {{ order.buyer.name }}</p></div><span class="val"><AppIcon name="check" /> Validated</span></div>

          <article v-for="(t, i) in order.tickets" :key="t.seatId" class="ticket">
            <div class="tl">
              <div class="tr"><span class="zone">{{ t.zoneName.toUpperCase() }}</span><small>Pass {{ i + 1 }} of {{ order.tickets.length }}</small></div>
              <div class="grid">
                <div><small>SECTION</small><b>{{ parts(t.label).section }}</b></div>
                <div><small>ROW</small><b>{{ parts(t.label).row }}</b></div>
                <div><small>SEAT</small><b class="seat">{{ parts(t.label).seat }}</b></div>
              </div>
              <div class="hold"><div><small>TICKET HOLDER</small><b>{{ t.holder }}</b></div><em><AppIcon name="star" /> VIP Soundcheck Included</em></div>
            </div>
            <div class="tq"><QrCode :token="t.qrToken" :size="100" /><small>SCAN AT TURNSTILE</small><code>AUTH: {{ t.qrToken.slice(0, 8).toUpperCase() }}</code></div>
          </article>

          <div class="actions">
            <RouterLink to="/account/tickets" class="btn btn-primary"><AppIcon name="qr-code" /> View My Tickets in App</RouterLink>
            <button type="button" class="btn alt"><AppIcon name="credit-card" /> Add to Apple / Google Wallet</button>
            <button type="button" class="btn alt" @click="print"><AppIcon name="download" /> Download PDF E-Tickets</button>
            <button type="button" class="btn alt"><AppIcon name="calendar" /> Add to Calendar (.ics)</button>
          </div>
        </div>

        <aside class="side">
          <div class="card guide">
            <h3><AppIcon name="calendar-days" /> Concert Day Guide <em>Gate 1 VIP</em></h3>
            <div class="map"><img :src="mapImg" alt="Map of Bayview Arena" /><span><b>Bayview Arena Main Gate</b>Seaside Blvd, Pasay</span></div>
            <p><b>Gate 1 VIP Express Turnstiles</b>Dedicated entry lane opens at 5:30 PM. Have your digital QR ready on full phone screen brightness.</p>
            <p><b>Clear Bag Policy Enforced</b>Clear PVC bags up to 12" x 6" x 12" only. Non-clear clutches must not exceed 4.5" x 6.5".</p>
            <p><b>Metro Manila Transit Tips</b>EDSA Carousel SM MOA / Seaside terminal is a 4-minute walk. Designated Grab &amp; JoyRide pick-up bay at North Concierge.</p>
          </div>

          <div class="card ord">
            <h3>Order Summary <em>PAID</em></h3>
            <dl>
              <div><dt>{{ order.tickets.length }}x Tickets<br /><small>{{ order.tickets.map((t) => t.label.replace('Section ', 'Sec ')).join(' | ') }}</small></dt><dd>{{ peso(order.subtotal) }}</dd></div>
              <div><dt>Bayview Arena Facility Fee</dt><dd>{{ peso(order.fee) }}</dd></div>
              <div><dt>Anti-Counterfeit QR Issuance</dt><dd class="inc">INCLUDED</dd></div>
            </dl>
            <div class="paid"><div><b>Total Paid</b><small>Verified via {{ order.method }}</small></div><strong>{{ peso(order.total) }}</strong></div>
            <button type="button" class="ghost" @click="print"><AppIcon name="receipt" /> Download Official BIR Tax Invoice</button>
            <button type="button" class="ghost"><AppIcon name="arrow-left-right" /> Transfer a Ticket to a Friend</button>
          </div>

          <div class="card help"><span><AppIcon name="headphones" /></span><div><b>Need assistance?</b><p>Our Manila Concierge desk is open 24/7 for VIP attendees.</p><a href="#">Live Chat Support</a> • <a href="#">FAQ &amp; Ticket Policies</a></div></div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page { padding-top: 104px; padding-bottom: 64px; }
.card { padding: 24px; border-radius: var(--radius-lg); background: var(--surface-low); border: 1px solid rgba(73,68,84,.25); }
.nf { max-width: 520px; margin: 40px auto; text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.steps { display: flex; justify-content: center; gap: 40px; list-style: none; margin: 0; padding: 0; font-size: 12px; color: var(--text-subtle); }
.steps .cur { padding: 6px 16px; border-radius: var(--radius-pill); background: var(--surface); color: var(--primary); font-weight: 600; }
.head { display: flex; flex-direction: column; align-items: center; text-align: center; margin: 32px 0 40px; }
.seal { display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: #0e5568; color: var(--secondary); font-size: 28px; box-shadow: 0 0 40px rgba(76,215,246,.35); }
.issued { margin-top: 28px; padding: 4px 14px; border-radius: var(--radius-pill); background: var(--surface); color: var(--secondary); font-size: 10px; letter-spacing: .1em; }
.head h1 { margin-top: 10px; font-family: var(--font-display); font-weight: 800; font-size: 56px; letter-spacing: -1px; }
.head > p { margin-top: 12px; max-width: 460px; font-size: 18px; line-height: 1.5; color: var(--text-muted); }
.head u { color: var(--text); }
.facts { display: flex; gap: 36px; margin-top: 28px; padding: 14px 32px; border-radius: var(--radius); background: var(--surface-low); text-align: left; }
.facts small { display: block; font-size: 9px; letter-spacing: .08em; color: var(--text-subtle); }
.facts b { font-size: 13px; }
.facts div:first-child b { color: var(--primary); }
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 342px; gap: 28px; align-items: start; }
.main { display: flex; flex-direction: column; gap: 24px; }
.event { position: relative; border-radius: var(--radius-lg); overflow: hidden; min-height: 316px; }
.event img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.event::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, var(--surface-low) 20%, transparent 80%); }
.ov { position: relative; z-index: 1; padding: 16px 24px 24px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 316px; }
.tg { position: absolute; top: 16px; left: 24px; display: flex; gap: 8px; }
.tg em { padding: 3px 10px; border-radius: var(--radius-pill); background: rgba(12,14,23,.7); color: var(--gold); font-size: 10px; font-style: normal; }
.tg em.c { background: #00a7c4; color: #fff; }
.ov small { font-size: 10px; letter-spacing: .08em; color: var(--gold); }
.ov h2 { margin: 4px 0 18px; font-family: var(--font-display); font-size: 36px; }
.dv { display: flex; gap: 32px; font-size: 14px; color: var(--text-muted); }
.dv b { display: block; color: var(--text); }
.dv em { display: block; font-size: 11px; font-style: normal; color: var(--gold); margin-top: 2px; }
.dv em.g { color: var(--text-subtle); }
.th { display: flex; justify-content: space-between; align-items: flex-end; }
.th h2 { font-family: var(--font-display); font-size: 28px; }
.th p { font-size: 14px; color: var(--text-subtle); }
.val { padding: 4px 12px; border-radius: var(--radius-pill); background: rgba(255,185,95,.12); color: var(--gold); font-size: 11px; }
.ticket { display: grid; grid-template-columns: 1fr 180px; border-radius: var(--radius-lg); background: var(--surface-low); border: 1px solid rgba(73,68,84,.25); overflow: hidden; }
.tl { padding: 20px 24px; }
.tr { display: flex; justify-content: space-between; align-items: center; }
.zone { padding: 3px 12px; border-radius: var(--radius-pill); background: rgba(202,129,0,.3); color: var(--gold); font-size: 10px; font-weight: 600; }
.tr small, .grid small, .hold small { font-size: 10px; letter-spacing: .06em; color: var(--text-subtle); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0; padding: 12px 16px; border-radius: var(--radius); background: var(--surface); }
.grid b { display: block; font-family: var(--font-display); font-size: 22px; }
.grid .seat { color: var(--secondary); }
.hold { display: flex; justify-content: space-between; align-items: flex-end; }
.hold b { display: block; font-size: 14px; }
.hold em { font-size: 11px; font-style: normal; color: var(--gold); }
.tq { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-left: 1px dashed var(--outline-variant); padding: 16px; }
.tq svg { border-radius: 6px; }
.tq small { font-size: 9px; letter-spacing: .06em; color: var(--text-subtle); }
.tq code { font-size: 9px; font-weight: 600; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; }
.alt { background: var(--surface-low); color: var(--text); border: 1px solid rgba(73,68,84,.3); }
.side { display: flex; flex-direction: column; gap: 20px; }
.guide h3, .ord h3 { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-display); font-size: 18px; }
.guide em, .ord em { padding: 2px 8px; border-radius: var(--radius-sm); background: rgba(76,215,246,.18); color: var(--secondary); font-family: var(--font-body); font-size: 10px; font-style: normal; }
.ord em { background: rgba(76,215,246,.18); }
.map { position: relative; height: 128px; margin: 14px 0; border-radius: var(--radius); overflow: hidden; }
.map img { width: 100%; height: 100%; object-fit: cover; }
.map span { position: absolute; left: 10px; bottom: 8px; font-size: 10px; color: var(--text-muted); }
.map span b { display: block; font-size: 11px; color: var(--text); }
.guide p { margin-top: 12px; font-size: 13px; line-height: 1.5; color: var(--text-muted); }
.guide p b { display: block; color: var(--gold); font-size: 11px; }
.ord dl { margin: 14px 0; font-size: 12px; }
.ord dl div { display: flex; justify-content: space-between; gap: 12px; margin: 10px 0; color: var(--text-muted); }
.ord dt, .ord dd { margin: 0; }
.ord dt small { color: var(--text-subtle); font-size: 10px; }
.inc { color: var(--gold); font-weight: 600; font-size: 11px; }
.paid { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; }
.paid b { display: block; font-family: var(--font-display); font-size: 20px; }
.paid small { font-size: 10px; color: var(--text-subtle); }
.paid strong { font-family: var(--font-display); font-size: 24px; color: var(--primary); }
.ghost { display: block; width: 100%; margin-top: 8px; padding: 10px; border-radius: var(--radius); background: var(--surface); font-size: 11px; }
.help { display: flex; gap: 14px; font-size: 14px; }
.help p { margin: 4px 0 8px; color: var(--text-muted); }
.help a { font-size: 11px; color: var(--secondary); }
@media (max-width: 960px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .ticket { grid-template-columns: minmax(0, 1fr); }
  .tq { border-left: 0; border-top: 1px dashed var(--outline-variant); }
  .facts, .dv { flex-direction: column; gap: 12px; }
  .head h1 { font-size: 40px; }
}
@media print { .steps, .actions, .side, .head { display: none; } }
</style>
