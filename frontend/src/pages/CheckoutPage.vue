<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import poster from '../assets/detail/hero.jpg'
import { seatLabel, zones } from '../data/seatmap'
import { booking, clearSeats, fee, HOLD_SECONDS, placeOrder, subtotal, total } from '../stores/booking'
import { peso } from '../data/events'
const router = useRouter()
const now = ref(Date.now())
let tick
const buyer = reactive({ name: '', email: '', phone: '' })
const holders = reactive({})
const same = reactive({})
const method = ref('GCash')
const agreeBag = ref(false)
const agreeTerms = ref(false)
const errors = reactive({})
const paying = ref(false)
const remaining = computed(() =>
  booking.holdEndsAt ? Math.max(0, Math.round((booking.holdEndsAt - now.value) / 1000)) : 0,
)
const clock = computed(
  () => `${String(Math.floor(remaining.value / 60)).padStart(2, '0')}:${String(remaining.value % 60).padStart(2, '0')}`,
)
const progress = computed(() => (remaining.value / HOLD_SECONDS) * 100)
const expired = computed(() => booking.selected.length > 0 && remaining.value === 0)
const methods = [
  {
    id: 'GCash',
    icon: 'G',
    tags: ['Instant Auth', 'MOST POPULAR'],
    desc: 'Seamless QR checkout or direct mobile wallet login',
    note: '0% Fee',
  },
  {
    id: 'Credit or Debit Card',
    icon: '',
    iconName: 'credit-card',
    tags: [],
    desc: 'Visa, Mastercard, JCB, American Express accepted',
    note: 'VISA  MC  JCB',
  },
  { id: 'Maya', icon: 'm', tags: ['Scan QR Ph'], desc: 'Pay with Maya App or any QR Ph interoperable bank', note: '' },
]
const toggleSame = (id) => {
  holders[id] = same[id] ? buyer.name : ''
}
const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (buyer.name.trim().length < 2) errors.name = 'Enter your full legal name.'
  if (!/^\S+@\S+\.\S+$/.test(buyer.email)) errors.email = 'Enter a valid email address.'
  if (!/^\d[\d\s]{8,12}$/.test(buyer.phone.trim())) errors.phone = 'Enter a valid mobile number (e.g. 917 882 4491).'
  booking.selected.forEach((s) => {
    if (!(holders[s.id] ?? '').trim()) errors['h' + s.id] = 'Assigned guest name is required.'
  })
  if (!agreeBag.value || !agreeTerms.value) errors.agree = 'Please accept both policies to continue.'
  return !Object.keys(errors).length
}
const pay = async () => {
  if (expired.value || !booking.selected.length || !validate()) return
  paying.value = true
  await new Promise((r) => setTimeout(r, 900)) // mock payment provider (test mode)
  const order = placeOrder({ ...buyer }, method.value, { ...holders })
  router.push(`/orders/${order.orderNumber}`)
}
const release = () => {
  clearSeats()
  router.push(`/events/aria-vale-city-lights/seats`)
}
onMounted(() => {
  tick = window.setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => clearInterval(tick))
</script>

<template>
  <div class="page container">
    <div v-if="!booking.selected.length" class="empty card">
      <h1>Your cart is empty</h1>
      <p>Choose your seats first. They are held for 10 minutes once you continue to checkout.</p>
      <RouterLink to="/events/aria-vale-city-lights/seats" class="btn btn-primary">Choose seats</RouterLink>
    </div>

    <template v-else>
      <div class="steps">
        <ol>
          <li class="done"><i><AppIcon name="check" /></i> 1 Seats</li><li class="cur"><i>2</i> 2 Details</li><li><i>3</i> 3 Payment</li><li class="off"><i>4</i> 4 Confirmation</li>
        </ol>
        <div class="held"><i /> <AppIcon name="lock" /> Seats held for <b>{{ clock }}</b></div>
      </div>
      <div class="meter"><i :style="{ width: progress + '%' }" /></div>

      <div v-if="expired" class="expired" role="alert">
        Your 10-minute hold expired and the seats were released.
        <button type="button" @click="release">Start again</button>
      </div>

      <form class="layout" novalidate @submit.prevent="pay">
        <div class="forms">
          <section class="card">
            <div class="h"><h2><i>1</i> Buyer Information</h2><span class="tag">PRIMARY CONTACT</span></div>
            <label class="f">Full Legal Name (as per Gov't ID)
              <input v-model="buyer.name" autocomplete="name" placeholder="Beatriz Alonzo" :aria-invalid="!!errors.name" />
              <small v-if="errors.name" class="err">{{ errors.name }}</small>
            </label>
            <div class="two">
              <label class="f">Email Address <em>(for E-Ticket PDF &amp; QR)</em>
                <input v-model="buyer.email" type="email" autocomplete="email" placeholder="you@example.com" :aria-invalid="!!errors.email" />
                <small v-if="errors.email" class="err">{{ errors.email }}</small>
                <small v-else class="hint">ⓘ Instant ticket delivery will be sent to this inbox</small>
              </label>
              <label class="f">Mobile Number (SMS verification &amp; entry alert)
                <span class="phone"><b>PH +63</b><input v-model="buyer.phone" inputmode="tel" autocomplete="tel-national" placeholder="917 882 4491" :aria-invalid="!!errors.phone" /></span>
                <small v-if="errors.phone" class="err">{{ errors.phone }}</small>
                <small v-else class="hint">Standard carrier SMS updates apply</small>
              </label>
            </div>
          </section>

          <section class="card">
            <div class="h"><h2><i>2</i> Ticket Holders</h2><span class="tag cyan"><AppIcon name="shield-check" /> Strict Anti-Scalper ID Match</span></div>
            <p class="sec"><b>Bayview Arena Security Requirement:</b> Holder names must match a valid government ID or school pass presented at turnstiles. Re-assignments are locked 24 hours prior to showtime.</p>
            <div v-for="(s, i) in booking.selected" :key="s.id" class="holder">
              <div class="hr">
                <span><em>{{ zones[s.zone].vip ? 'FLOOR TIER 1' : zones[s.zone].short.toUpperCase() }}</em> Seat {{ i + 1 }}: {{ seatLabel(s) }}</span>
                <label class="chk"><input v-model="same[s.id]" type="checkbox" @change="toggleSame(s.id)" /> Same as Buyer</label>
              </div>
              <label class="f">Assigned Guest Name
                <input v-model="holders[s.id]" placeholder="Guest full name" :aria-invalid="!!errors['h' + s.id]" />
                <small v-if="errors['h' + s.id]" class="err">{{ errors['h' + s.id] }}</small>
              </label>
            </div>
          </section>

          <section class="card">
            <div class="h"><h2><i>3</i> Select Payment Method</h2><span class="tag cyan">BSP Accredited</span></div>
            <label v-for="m in methods" :key="m.id" class="pm" :class="{ on: method === m.id }">
              <input v-model="method" type="radio" name="pay" :value="m.id" />
              <span class="pi"><AppIcon v-if="m.iconName" :name="m.iconName" /><template v-else>{{ m.icon }}</template></span>
              <div><b>{{ m.id }} <u v-for="t in m.tags" :key="t">{{ t }}</u></b><p>{{ m.desc }}</p></div>
              <small>{{ m.note }}</small>
            </label>
            <p class="ssl"><AppIcon name="lock" /> You will be securely routed via PCI-DSS Level 1 compliant gateway with 256-bit SSL encryption. Test mode: no real charge is made.</p>
          </section>

          <section class="card policies">
            <h3>ARENA COMPLIANCE &amp; SPOTLIGHT POLICIES</h3>
            <label class="chk"><input v-model="agreeBag" type="checkbox" /><span>I have read and agree to the <b>Bayview Arena Bag Policy</b> (clear bags under 30×30cm only) and adhere to the strict <b>No Re-entry Rule</b>.</span></label>
            <label class="chk"><input v-model="agreeTerms" type="checkbox" /><span>I accept the <RouterLink to="/terms">Terms of Service</RouterLink> and recognize that all sales are final, non-refundable, and subject to Spotlight's Anti-Scalper transfer protocols.</span></label>
            <small v-if="errors.agree" class="err">{{ errors.agree }}</small>
          </section>
        </div>

        <aside class="side">
          <div class="card sum">
            <div class="poster"><img :src="poster" alt="" /><span>LIVE ARENA TOUR</span><h3>{{ booking.eventTitle }}</h3></div>
            <div class="when"><p><AppIcon name="calendar" /> {{ booking.eventDate.replace(' · ', ' • ') }}</p><p><AppIcon name="map-pin" /> Bayview Arena, Pasay City, Metro Manila</p></div>
            <div class="res"><small>RESERVED ALLOCATION</small><em>{{ booking.selected.length }} Tickets</em></div>
            <div v-for="s in booking.selected" :key="s.id" class="line"><div><b>Seat {{ s.section }}-{{ s.row }}-{{ s.num }}</b><p>{{ zones[s.zone].name }}</p></div><strong>{{ peso(zones[s.zone].price) }}</strong></div>
            <dl class="tot">
              <div><dt>Seats Subtotal</dt><dd>{{ peso(subtotal) }}</dd></div>
              <div><dt>Convenience &amp; Arena Facility Fee ⓘ</dt><dd>{{ peso(fee) }}</dd></div>
              <div><dt>Anti-Counterfeit QR Issuance</dt><dd class="free">FREE</dd></div>
            </dl>
            <div class="due"><div><small>TOTAL PAYABLE AMOUNT</small><p>All Taxes &amp; Fees Included</p></div><strong>{{ peso(total) }}</strong></div>
            <button type="submit" class="btn pay" :disabled="paying || expired"><template v-if="paying">Processing…</template><template v-else><AppIcon name="lock" /> Confirm &amp; Pay {{ peso(total) }}</template></button>
            <p class="split">Need split billing? Pay {{ peso(Math.round(total / 2)) }} for your seat only</p>
            <ul class="trust"><li><AppIcon name="check" /> Official Bayview Arena Ticketing Partner</li><li><AppIcon name="zap" /> Instant SMS &amp; Email Ticket Delivery</li><li><AppIcon name="qr-code" /> Non-Duplicable Encrypted QR Code</li></ul>
          </div>
          <div class="card help"><span><AppIcon name="headphones" /></span><div><b>Need help with checkout?</b><p>Manila Arena Concierge 24/7</p></div><a href="#">Live Chat</a></div>
        </aside>
      </form>
    </template>
  </div>
</template>

<style scoped>
.page { padding-top: 104px; padding-bottom: 64px; }
.card { padding: 24px; border-radius: var(--radius-lg); background: var(--surface-low); border: 1px solid rgba(73,68,84,.25); }
.empty { max-width: 560px; margin: 40px auto; text-align: center; display: flex; flex-direction: column; gap: 14px; align-items: center; }
.empty h1 { font-family: var(--font-display); }
.empty p { color: var(--text-subtle); }
.steps { display: flex; align-items: center; justify-content: space-between; }
.steps ol { display: flex; gap: 14px; list-style: none; margin: 0; padding: 0; font-size: 12px; color: var(--text-subtle); }
.steps li { display: flex; align-items: center; gap: 8px; }
.steps i { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--surface); font-style: normal; font-size: 11px; }
.steps .done i { background: #2a3b34; color: var(--secondary); }
.steps .cur { color: var(--text); }
.steps .cur i { background: var(--primary-strong); color: var(--on-primary); }
.steps .off { opacity: .5; }
.held { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--radius-pill); background: var(--surface); font-size: 13px; }
.held i { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
.held b { font-family: var(--font-display); font-size: 18px; color: var(--gold); }
.meter { height: 4px; margin: 16px 0 28px; border-radius: 4px; background: var(--surface); overflow: hidden; }
.meter i { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), var(--primary)); transition: width 1s linear; }
.expired { margin-bottom: 20px; padding: 14px 18px; border-radius: var(--radius); background: var(--danger-bg); color: var(--danger); }
.expired button { margin-left: 12px; text-decoration: underline; color: #fff; }
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 24px; align-items: start; }
.forms { display: flex; flex-direction: column; gap: 24px; }
.h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.h h2 { display: flex; align-items: center; gap: 12px; font-family: var(--font-display); font-size: 22px; }
.h h2 i { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: #2a2c46; font-style: normal; font-size: 12px; }
.tag { padding: 4px 12px; border-radius: var(--radius-sm); background: rgba(202,129,0,.25); color: var(--gold); font-size: 10px; font-weight: 600; letter-spacing: .06em; }
.tag.cyan { background: none; color: var(--gold); }
.f { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; margin-bottom: 14px; }
.f em { font-style: normal; font-weight: 400; color: var(--text-subtle); }
.f input, .phone { padding: 14px 16px; border-radius: var(--radius); background: var(--surface-lowest); border: 1px solid transparent; color: var(--text); font: inherit; font-size: 14px; font-weight: 400; outline: 0; }
.f input:focus, .phone:focus-within { border-color: var(--primary-strong); }
.f input[aria-invalid='true'] { border-color: var(--danger); }
.phone { display: flex; align-items: center; gap: 12px; padding: 0; overflow: hidden; }
.phone b { padding: 14px 12px; background: #20222c; font-size: 12px; font-weight: 500; }
.phone input { flex: 1; border: 0; background: none; }
.hint { font-weight: 400; color: var(--text-subtle); font-size: 11px; }
.err { color: var(--danger); font-weight: 500; font-size: 12px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sec { margin-bottom: 16px; padding: 16px; border-radius: var(--radius); background: var(--surface); font-size: 14px; line-height: 1.5; color: var(--text-muted); }
.sec b { color: var(--text); }
.holder { margin-bottom: 14px; padding: 16px; border-radius: var(--radius); background: var(--surface); }
.hr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 14px; font-weight: 600; }
.hr em { margin-right: 8px; padding: 2px 8px; border-radius: var(--radius-sm); background: rgba(202,129,0,.3); color: var(--gold); font-size: 10px; font-style: normal; }
.chk { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; font-weight: 400; color: var(--text-muted); cursor: pointer; }
.chk input { accent-color: var(--primary-strong); margin-top: 2px; }
.pm { display: flex; align-items: center; gap: 16px; padding: 16px; margin-bottom: 10px; border-radius: var(--radius); background: var(--surface); cursor: pointer; border: 1px solid transparent; }
.pm.on { border-color: rgba(160,120,255,.5); box-shadow: 0 0 20px rgba(160,120,255,.15); }
.pm input { accent-color: var(--primary-strong); }
.pi { display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 10px; background: #1f3a40; color: var(--secondary); font-weight: 700; }
.pm div { flex: 1; }
.pm b { font-family: var(--font-display); font-size: 15px; }
.pm u { margin-left: 8px; padding: 2px 8px; border-radius: var(--radius-sm); background: rgba(76,215,246,.15); color: var(--secondary); font-family: var(--font-body); font-size: 10px; text-decoration: none; font-weight: 600; }
.pm p { margin-top: 2px; font-size: 14px; color: var(--text-muted); }
.pm small { font-size: 11px; color: var(--text-subtle); }
.ssl { padding: 10px 14px; border-radius: var(--radius); background: var(--surface-lowest); font-size: 11px; color: var(--text-subtle); }
.policies { display: flex; flex-direction: column; gap: 14px; }
.policies h3 { font-size: 13px; letter-spacing: .08em; color: var(--text-muted); }
.policies .chk { font-size: 14px; }
.policies a { text-decoration: underline; }
.side { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 96px; }
.sum { padding: 0; overflow: hidden; }
.poster { position: relative; height: 150px; }
.poster img { width: 100%; height: 100%; object-fit: cover; }
.poster::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, var(--surface-low), transparent 70%); }
.poster span { position: absolute; left: 16px; bottom: 44px; z-index: 1; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--secondary); color: #00363f; font-size: 10px; font-weight: 700; }
.poster h3 { position: absolute; left: 16px; bottom: 12px; z-index: 1; font-family: var(--font-display); font-size: 20px; }
.when { padding: 12px 16px; font-size: 12px; line-height: 1.8; }
.res { display: flex; justify-content: space-between; padding: 10px 16px; background: var(--surface); font-size: 11px; letter-spacing: .06em; }
.res em { font-style: normal; color: var(--secondary); }
.line { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; font-size: 13px; }
.line p { color: var(--text-muted); }
.line strong { font-family: var(--font-display); }
.tot { margin: 0; padding: 8px 16px; background: var(--surface); font-size: 13px; }
.tot div { display: flex; justify-content: space-between; margin: 8px 0; color: var(--text-muted); }
.tot dt, .tot dd { margin: 0; }
.free { color: var(--secondary); font-weight: 600; font-size: 11px; }
.due { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--surface-low); }
.due small { font-size: 11px; letter-spacing: .06em; color: var(--text-subtle); }
.due p { margin-top: 6px; font-size: 11px; color: var(--gold); }
.due strong { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--gold); }
.pay { width: calc(100% - 32px); margin: 8px 16px; justify-content: center; padding: 14px; background: var(--primary-strong); color: var(--on-primary); }
.pay:disabled { opacity: .5; cursor: not-allowed; }
.split { text-align: center; font-size: 11px; color: var(--text-subtle); }
.trust { list-style: none; margin: 0; padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: var(--text-muted); }
.help { display: flex; align-items: center; gap: 12px; padding: 16px 20px; }
.help div { flex: 1; font-size: 12px; }
.help p { color: var(--text-subtle); }
.help a { font-size: 12px; }
@media (max-width: 960px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .side { position: static; }
  .two { grid-template-columns: minmax(0, 1fr); }
  .steps { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
