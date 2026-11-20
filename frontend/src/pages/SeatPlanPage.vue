<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { MAX_SEATS, seatLabel, seatMap, zones } from '../data/seatmap'
import { booking, clearSeats, fee, HOLD_SECONDS, startHold, subtotal, toggleSeat, total } from '../stores/booking'
import { peso } from '../data/events'
const router = useRouter()
const zoom = ref(1)
const hover = ref(null)
const toast = ref('')
let toastTimer
let tick
const now = ref(Date.now())
const remaining = computed(() =>
  booking.holdEndsAt ? Math.max(0, Math.round((booking.holdEndsAt - now.value) / 1000)) : HOLD_SECONDS,
)
const clock = computed(
  () => `${String(Math.floor(remaining.value / 60)).padStart(2, '0')}:${String(remaining.value % 60).padStart(2, '0')}`,
)
const progress = computed(() => (remaining.value / HOLD_SECONDS) * 100)
const show = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value = ''), 4000)
}
const isSelected = (s) => booking.selected.some((x) => x.id === s.id)
const seatFill = (s) => {
  if (s.status === 'sold') return '#2a2c37'
  if (s.status === 'held') return '#3a3d4a'
  return zones[s.zone].color
}
const pick = (s) => {
  const res = toggleSeat(s)
  if (res === 'unavailable')
    show(
      `Seat Unavailable — ${seatLabel(s)} is ${s.status === 'held' ? 'held by another queue member' : 'sold out'}. Please tap an adjacent seat.`,
    )
  else if (res === 'limit') show(`You can select up to ${MAX_SEATS} seats per order.`)
  else if (booking.selected.length && !booking.holdEndsAt) startHold()
  else if (!booking.selected.length) booking.holdEndsAt = null
}
const onKey = (e, s) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    pick(s)
  }
}
const counts = computed(() => ({
  available: seatMap.seats.filter((s) => s.status === 'available').length,
}))
const expire = () => {
  clearSeats()
  show('Your hold expired and the seats were released. Please choose again.')
}
const simulateTimeout = () => {
  if (booking.selected.length) expire()
}
const checkout = () => {
  if (!booking.selected.length) return
  startHold()
  router.push('/checkout')
}
onMounted(() => {
  tick = window.setInterval(() => {
    now.value = Date.now()
    if (booking.holdEndsAt && remaining.value === 0) expire()
  }, 1000)
})
onBeforeUnmount(() => {
  clearInterval(tick)
  clearTimeout(toastTimer)
})
watch(zoom, (z) => (zoom.value = Math.min(2.2, Math.max(0.8, z))))
</script>

<template>
  <div class="page">
    <div v-if="booking.selected.length" class="lock">
      <span class="bolt"><AppIcon name="zap" /></span>
      <b>Your selected seats are locked</b>
      <span class="clock">{{ clock }}</span>
      <small>remaining before release to general queue</small>
      <div class="bar"><i :style="{ width: progress + '%' }" /></div>
      <button type="button" @click="simulateTimeout">Simulate Timeout</button>
    </div>

    <div class="container crumbs">
      <nav><RouterLink to="/">Home</RouterLink> / <RouterLink to="/events">Events</RouterLink> / <RouterLink to="/events/aria-vale-city-lights">{{ booking.eventTitle }}</RouterLink> / <b>Seat Selection</b></nav>
      <div class="ev"><i /> <b>ARIA VALE: CITY LIGHTS TOUR</b> <span><AppIcon name="calendar" /> Sat, Feb 14, 2027 · 8:00 PM</span> <span><AppIcon name="map-pin" /> Bayview Arena, Pasay City</span></div>
    </div>

    <div class="container layout">
      <section class="left">
        <div class="map card">
          <div class="map-tools">
            <span class="live"><i /> LIVE ARENA FLOOR</span>
            <div class="ctl">
              <button type="button" aria-label="Zoom in" @click="zoom += 0.2">+</button>
              <button type="button" aria-label="Zoom out" @click="zoom -= 0.2">−</button>
              <button type="button" aria-label="Reset view" @click="zoom = 1"><AppIcon name="refresh-cw" /></button>
              <span>Stage Centered</span>
            </div>
          </div>

          <div class="canvas">
            <svg :viewBox="seatMap.viewBox" role="group" aria-label="Seat plan" :style="{ width: `${zoom * 100}%` }">
              <defs>
                <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#a078ff" stop-opacity=".35" />
                  <stop offset="1" stop-color="#a078ff" stop-opacity="0" />
                </linearGradient>
              </defs>
              <rect x="150" y="30" width="500" height="44" rx="6" fill="#1d1f29" />
              <text x="400" y="58" text-anchor="middle" class="stage">MAIN STAGE • CATWALK • ORCHESTRA APRON</text>
              <polygon points="360,120 440,120 560,350 240,350" fill="url(#beam)" />
              <text v-for="l in seatMap.labels" :key="l.text" :x="l.x" :y="l.y" :text-anchor="l.anchor" class="sec" :fill="zones[l.zone].color">{{ l.text }}</text>

              <g v-for="s in seatMap.seats" :key="s.id">
                <circle
                  :cx="s.x"
                  :cy="s.y"
                  :r="isSelected(s) ? 8 : 6.5"
                  :fill="isSelected(s) ? '#a078ff' : seatFill(s)"
                  :stroke="isSelected(s) ? '#e9ddff' : 'none'"
                  stroke-width="2"
                  :class="['seat', s.status]"
                  tabindex="0"
                  role="button"
                  :aria-label="`${seatLabel(s)}, ${zones[s.zone].name}, ${peso(zones[s.zone].price)}, ${s.status}`"
                  :aria-pressed="isSelected(s)"
                  @click="pick(s)"
                  @keydown="onKey($event, s)"
                  @mouseenter="hover = s"
                  @mouseleave="hover = null"
                  @focus="hover = s"
                  @blur="hover = null"
                />
                <path v-if="isSelected(s)" :transform="`translate(${s.x} ${s.y})`" d="M-3.2 0.2 L-1 2.6 L3.4 -2.4" class="tick" />
              </g>
            </svg>

            <div v-if="hover" class="tip">
              <div><small>{{ zones[hover.zone].name.toUpperCase() }}</small><b>{{ peso(zones[hover.zone].price) }}</b></div>
              <strong>{{ seatLabel(hover) }}</strong>
              <em>{{ hover.status === 'available' ? 'Eye-Level View' : hover.status === 'held' ? 'Held in cart' : 'Sold out' }}</em>
            </div>
          </div>
        </div>

        <div class="card legend">
          <div class="lrow">
            <span class="lbl">TIERS &amp; PRICING:</span>
            <span v-for="z in Object.values(zones)" :key="z.id"><i :style="{ background: z.color }" /> {{ z.short }} <b>{{ peso(z.price) }}</b></span>
          </div>
          <div class="lrow">
            <span class="lbl">STATUS:</span>
            <span><i class="s-av" /> Available</span>
            <span><i class="s-sel" /> Your Selected</span>
            <span><i class="s-held" /> Held in Cart</span>
            <span><i class="s-sold" /> Sold Out</span>
          </div>
        </div>

        <div class="card perks">
          <span class="star"><AppIcon name="star" /></span>
          <div>
            <h3>VIP GOLD PASS PERKS <em>INCLUDED</em></h3>
            <p>{{ zones.vip.perks }}</p>
          </div>
          <button type="button" class="btn alt">View All Tiers</button>
        </div>
      </section>

      <aside class="right">
        <div class="card summary">
          <div class="top">
            <small>BAYVIEW ARENA MANILA</small>
            <span class="lock-pill">LIVE LOCK</span>
          </div>
          <h2>Aria Vale</h2>
          <p class="tour">City Lights World Tour 2027</p>
          <p class="when"><AppIcon name="clock" /> Saturday, Feb 14, 2027 · 8:00 PM PHT</p>

          <div class="yours">
            <h3>Your Seats <span class="of">{{ booking.selected.length }} of {{ MAX_SEATS }} Max</span></h3>
            <button type="button" class="clear" @click="clearSeats">Clear All</button>
          </div>

          <p v-if="!booking.selected.length" class="none">Select seats on the map to see them here. {{ counts.available }} seats are available.</p>
          <ul v-else class="seats">
            <li v-for="s in booking.selected" :key="s.id">
              <span class="sec">{{ s.section === 'BALCONY' ? 'BL' : s.section }}</span>
              <div>
                <b>{{ seatLabel(s) }}</b>
                <small>{{ zones[s.zone].name }}</small>
              </div>
              <strong>{{ peso(zones[s.zone].price) }}</strong>
              <button type="button" :aria-label="`Remove ${seatLabel(s)}`" @click="pick(s)"><AppIcon name="x" /></button>
            </li>
          </ul>

          <dl class="tot">
            <div><dt>Seats Subtotal ({{ booking.selected.length }} items)</dt><dd>{{ peso(subtotal) }}</dd></div>
            <div><dt>Facility &amp; Ticketing Fee ⓘ</dt><dd>{{ peso(fee) }}</dd></div>
            <div><dt>E-Ticket Delivery (SMS &amp; Mobile App)</dt><dd class="free">FREE</dd></div>
            <div class="grand"><dt>Total Due</dt><dd>{{ peso(total) }}</dd></div>
            <small>VAT inclusive where applicable</small>
          </dl>

          <button type="button" class="btn go" :disabled="!booking.selected.length" @click="checkout">
            <AppIcon name="lock" /> Lock &amp; Continue to Checkout <AppIcon name="arrow-right" />
          </button>
          <p class="hold"><AppIcon name="clock" /> Seats are held for 10 minutes once you proceed.</p>
          <div class="trust"><span><AppIcon name="refresh-cw" /> Real-time seat engine</span><span><AppIcon name="shield-check" /> Official Box Office</span></div>
          <div class="pay">FAST CHECKOUT: <b class="g">GCash</b> <b class="m">Maya</b> <b class="p">GrabPay</b> <b>VISA/MC</b></div>
        </div>

        <div class="card promise">
          <span><AppIcon name="image" /></span>
          <div><b>Bayview Sound Sightline Promise</b><p>Every arena node is calibrated for direct speaker projection.</p></div>
        </div>
      </aside>
    </div>

    <div v-if="toast" class="toast" role="alert">
      <span class="warn">!</span>
      <div><b>{{ toast.split(' — ')[0] }}</b><p>{{ toast.includes(' — ') ? toast.split(' — ')[1] : '' }}</p></div>
      <button type="button" aria-label="Dismiss" @click="toast = ''"><AppIcon name="x" /></button>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: 80px;
  padding-bottom: 48px;
}
.lock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px max(24px, calc((100vw - 1232px) / 2));
  background: var(--surface);
  font-size: 14px;
}
.bolt {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 185, 95, 0.2);
  color: var(--gold);
}
.clock {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--gold);
}
.lock small {
  font-size: 12px;
  color: var(--text-muted);
}
.bar {
  margin-left: auto;
  width: 200px;
  height: 4px;
  border-radius: 4px;
  background: var(--outline-variant);
}
.bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--gold);
  transition: width 1s linear;
}
.lock > button {
  font-size: 12px;
  color: var(--gold);
  text-decoration: underline;
}
.crumbs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  padding-bottom: 14px;
  font-size: 12px;
  color: var(--text-subtle);
}
.crumbs b {
  color: var(--secondary);
  font-weight: 500;
}
.ev {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
}
.ev b {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.04em;
}
.ev i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--secondary);
}
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 372px;
  gap: 24px;
  align-items: start;
}
.card {
  border-radius: var(--radius-lg);
  background: var(--surface-low);
  border: 1px solid rgba(73, 68, 84, 0.25);
}
.left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.map {
  padding: 20px;
  background: linear-gradient(180deg, #1a1a2e, var(--surface-low));
}
.map-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
}
.live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: 11px;
  letter-spacing: 0.06em;
}
.live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--secondary);
}
.ctl {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: 12px;
}
.ctl button {
  width: 28px;
  height: 28px;
  font-size: 16px;
  color: var(--text-muted);
}
.ctl span {
  margin-left: 8px;
}
.canvas {
  position: relative;
  overflow: auto;
  margin-top: 8px;
  -webkit-overflow-scrolling: touch;
}
.canvas > svg {
  display: block;
  width: 100%;
  height: auto;
  transition: width 0.2s;
}
.stage {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.2em;
  fill: var(--text-muted);
}
.sec {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
}
.seat {
  cursor: pointer;
  outline: none;
  transition: r 0.1s;
}
.seat.sold,
.seat.held {
  cursor: not-allowed;
}
.seat:focus-visible {
  stroke: #fff;
  stroke-width: 2;
}
.tick {
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}
.tip {
  position: absolute;
  left: 50%;
  top: 28%;
  transform: translateX(-50%);
  min-width: 210px;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: rgba(40, 41, 51, 0.96);
  border: 1px solid var(--outline-variant);
  pointer-events: none;
}
.tip div {
  display: flex;
  justify-content: space-between;
}
.tip small {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--gold);
}
.tip b {
  color: var(--gold);
  font-size: 12px;
}
.tip strong {
  display: block;
  margin: 4px 0;
  font-size: 14px;
}
.tip em {
  font-size: 12px;
  font-style: normal;
  color: var(--text-muted);
}
.legend {
  padding: 16px 20px;
  font-size: 12px;
}
.lrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 18px;
  padding: 6px 0;
}
.lrow .lbl {
  margin-right: auto;
  color: var(--text-subtle);
  letter-spacing: 0.06em;
}
.lrow i {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  vertical-align: -2px;
  border-radius: 50%;
}
.s-av {
  border: 2px solid var(--text-subtle);
}
.s-sel {
  background: var(--primary-strong);
}
.s-held {
  background: #3a3d4a;
}
.s-sold {
  background: #2a2c37;
}
.perks {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(90deg, var(--surface-low), rgba(255, 185, 95, 0.08));
}
.star {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 185, 95, 0.18);
  color: var(--gold);
  font-size: 18px;
}
.perks h3 {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 0.06em;
  color: var(--gold);
}
.perks h3 em {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--gold);
  color: var(--on-gold);
  font-family: var(--font-body);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  vertical-align: 2px;
}
.perks p {
  margin-top: 2px;
  font-size: 14px;
  color: var(--text-muted);
}
.alt {
  margin-left: auto;
  flex: none;
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 12px;
}
.right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 96px;
}
.summary {
  padding: 24px;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.top small {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--secondary);
}
.lock-pill {
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  background: rgba(160, 120, 255, 0.2);
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
}
.summary h2 {
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: 32px;
}
.tour {
  margin-top: 4px;
  color: var(--text-muted);
}
.when {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-subtle);
}
.yours {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 12px;
}
.yours h3 {
  font-family: var(--font-display);
  font-size: 20px;
}
.of {
  margin-left: 8px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--primary-strong);
  color: var(--on-primary);
  font-family: var(--font-body);
  font-size: 11px;
}
.clear {
  font-size: 12px;
  color: var(--text-subtle);
}
.none {
  padding: 16px;
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 13px;
  color: var(--text-subtle);
}
.seats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.seats li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--surface);
}
.seats .sec {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 185, 95, 0.18);
  color: var(--gold);
  font-size: 12px;
}
.seats li > div {
  flex: 1;
  min-width: 0;
}
.seats b {
  display: block;
  font-size: 13px;
}
.seats small {
  font-size: 11px;
  color: var(--gold);
}
.seats strong {
  font-family: var(--font-display);
  font-size: 14px;
}
.seats button {
  color: var(--text-subtle);
}
.tot {
  margin: 16px 0;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 14px;
}
.tot div {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  color: var(--text-muted);
}
.tot dt,
.tot dd {
  margin: 0;
}
.free {
  color: var(--gold);
  font-size: 12px;
  font-weight: 600;
}
.grand {
  margin-top: 16px !important;
  align-items: baseline;
}
.grand dt {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--text);
}
.grand dd {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  color: var(--primary);
}
.tot > small {
  display: block;
  text-align: right;
  font-size: 11px;
  color: var(--text-subtle);
}
.go {
  width: 100%;
  justify-content: center;
  padding: 16px 24px;
  font-family: var(--font-display);
  font-size: 18px;
  background: var(--primary-strong);
  color: var(--on-primary);
}
.go:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hold {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--gold);
}
.trust {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-subtle);
}
.pay {
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-subtle);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.pay b {
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}
.pay .g {
  color: #4a90ff;
}
.pay .m {
  color: #3ddc84;
}
.pay .p {
  color: #22c55e;
}
.promise {
  display: flex;
  gap: 16px;
  padding: 20px;
  font-size: 14px;
}
.promise p {
  margin-top: 4px;
  color: var(--text-muted);
}
.toast {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 40;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 400px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: #2a2b36;
  border: 1px solid var(--outline-variant);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
.warn {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #93000a;
  color: #fff;
  font-weight: 700;
}
.toast b {
  color: var(--danger);
}
.toast p {
  margin-top: 2px;
  font-size: 13px;
  color: var(--text-muted);
}
.toast button {
  margin-left: auto;
  color: var(--text-subtle);
}
@media (max-width: 1000px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .right {
    position: static;
  }
  .crumbs {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .ev {
    flex-wrap: wrap;
  }
  .lock {
    flex-wrap: wrap;
  }
  .bar {
    width: 100%;
    margin: 0;
  }
}
@media (max-width: 600px) {
  /* Seats are tiny at phone width, so the map scrolls sideways at a readable size. */
  .canvas > svg {
    min-width: 560px;
  }
  .lrow {
    justify-content: flex-start;
    gap: 8px 16px;
  }
  .lrow .lbl {
    flex-basis: 100%;
  }
  .grand dd {
    font-size: 24px;
  }
  .map {
    padding: 12px;
  }
  .ctl button {
    width: 36px;
    height: 36px;
  }
  .card {
    min-width: 0;
  }
}
</style>
