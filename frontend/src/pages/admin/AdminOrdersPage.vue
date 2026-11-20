<script setup>
import AppIcon from '../../components/AppIcon.vue'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { GATEWAY_URLS } from '../../config'
import { allOrders, orderEvent, orderImage, orderStatuses, seatParts } from '../../stores/admin'
import { downloadCsv, ordersToRows } from '../../utils/csv'

const route = useRoute()
const router = useRouter()

const q = ref(String(route.query.q ?? ''))
const status = ref(String(route.query.status ?? ''))
const range = ref('all')
const eventFilter = ref('')
const method = ref('')
const page = ref(1)
const pageSize = 6
const panelOpen = ref(true)

// The top-bar search and bell link here with ?q= / ?status=
watch(
  () => route.query,
  (qs) => {
    q.value = String(qs.q ?? '')
    status.value = String(qs.status ?? '')
  },
)
watch([q, status, range, eventFilter, method], () => (page.value = 1))

const all = computed(() => [...allOrders.value].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))))
const events = computed(() => [...new Set(all.value.map((o) => o.eventTitle))])
const methods = computed(() => [...new Set(all.value.map((o) => o.method))])
const inRange = (o) => range.value === 'all' || Date.now() - new Date(o.createdAt).getTime() <= Number(range.value) * 86400000
const base = computed(() =>
  all.value.filter(
    (o) =>
      inRange(o) &&
      (!eventFilter.value || o.eventTitle === eventFilter.value) &&
      (!method.value || o.method === method.value) &&
      `${o.orderNumber} ${o.buyer.name} ${o.buyer.email}`.toLowerCase().includes(q.value.trim().toLowerCase().replace(/^#/, '')),
  ),
)
const rows = computed(() => base.value.filter((o) => !status.value || o.status === status.value))
const pages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))
const shown = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize))

const count = (s) => all.value.filter((o) => o.status === s).length
const paidTotal = computed(() => all.value.filter((o) => o.status === 'paid').reduce((n, o) => n + o.total, 0))
const pctOf = (n) => (all.value.length ? ((n / all.value.length) * 100).toFixed(1) : '0.0')
const chips = computed(() => [
  { key: '', label: 'All', n: all.value.length },
  ...Object.entries(orderStatuses).map(([key, v]) => ({ key, label: v.label, n: count(key) })),
])

// ---- selected order for the side panel ----
const selected = computed(() => {
  if (!panelOpen.value) return null
  const id = route.params.orderNumber
  if (id) return all.value.find((o) => o.orderNumber === id) ?? null
  return rows.value[0] ?? null
})
const missing = computed(() => route.params.orderNumber && !all.value.some((o) => o.orderNumber === route.params.orderNumber))
const open = (o) => {
  panelOpen.value = true
  router.push({ path: `/admin/orders/${o.orderNumber}`, query: route.query })
}
const close = () => {
  panelOpen.value = false
  if (route.params.orderNumber) router.push({ path: '/admin/orders', query: route.query })
}
const reset = () => {
  q.value = ''
  status.value = ''
  range.value = 'all'
  eventFilter.value = ''
  method.value = ''
  router.push({ path: route.path, query: {} })
}

// ---- formatting ----
const money = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = (n) => (n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `₱${(n / 1e3).toFixed(1)}K` : `₱${n}`)
const day = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
const clock = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const vat = (o) => (o.total * 12) / 112
const isVip = (o) => o.tickets.some((t) => /vip/i.test(t.zoneName))
const seatsState = (o) => (o.status === 'refund-review' ? 'Voided / Unlocked' : o.status === 'pending' ? 'Held' : o.status === 'paid' ? 'Issued' : 'Released')
const totalLabel = (o) => (o.status === 'refund-review' ? 'Total Refund Amount' : o.status === 'paid' ? 'Total Paid' : 'Total Due')
const exportRows = () => downloadCsv('spotlight-orders.csv', ordersToRows(rows.value))
</script>

<template>
  <div class="a-head">
    <div>
      <nav class="a-crumb" aria-label="Breadcrumb"><span>Console</span><AppIcon name="chevron-right" /><b>Orders Management</b></nav>
      <h1 class="a-title">Orders</h1>
      <p class="a-lead">Monitor live ticketing transactions, fraud screening, customer seat allocations, and payment gateway reconciliation across Metro Manila venues.</p>
    </div>
    <div class="a-actions">
      <button type="button" class="a-btn" @click="exportRows"><AppIcon name="download" /> Export CSV</button>
      <a v-if="GATEWAY_URLS.portal" :href="GATEWAY_URLS.portal" target="_blank" rel="noopener" class="a-btn primary"><AppIcon name="wallet" /> Payment Gateway Portal <AppIcon name="external-link" /></a>
      <button v-else type="button" class="a-btn primary" disabled aria-disabled="true" title="Add the gateway dashboard URL in src/config.js"><AppIcon name="wallet" /> Payment Gateway Portal <AppIcon name="external-link" /></button>
    </div>
  </div>

  <div class="stats">
    <article class="a-card st"><header><small>TOTAL ORDERS</small><span class="ico"><AppIcon name="receipt" size="18" /></span></header><b>{{ all.length.toLocaleString('en-PH') }}</b><p><em>{{ compact(paidTotal) }}</em> paid volume</p></article>
    <article class="a-card st"><header><small>PAID</small><span class="ico cy"><AppIcon name="badge-check" size="18" /></span></header><b>{{ count('paid').toLocaleString('en-PH') }}</b><p><em>{{ pctOf(count('paid')) }}%</em> of all orders</p></article>
    <article class="a-card st"><header><small>PENDING SETTLEMENT</small><span class="ico"><AppIcon name="clock" size="18" /></span></header><b>{{ count('pending').toLocaleString('en-PH') }}</b><p><em>{{ pctOf(count('pending')) }}%</em> awaiting payment</p></article>
    <article class="a-card st warn"><header><small><i /> NEEDS REFUND</small><span class="ico go"><AppIcon name="triangle-alert" size="18" /></span></header><b>{{ count('refund-review') }} <span>Action required</span></b><p>Manual gateway reversal queue</p></article>
    <article class="a-card st"><header><small>FAILED / VOID</small><span class="ico rd"><AppIcon name="circle-x" size="18" /></span></header><b>{{ (count('failed') + count('cancelled')).toLocaleString('en-PH') }}</b><p><em>{{ pctOf(count('failed') + count('cancelled')) }}%</em> released to pool</p></article>
  </div>

  <section class="a-card filters">
    <div class="frow">
      <label class="f search"><AppIcon name="search" /><input v-model="q" type="search" placeholder="Search order no. or buyer..." aria-label="Search orders" /></label>
      <label class="f"><AppIcon name="calendar" /><select v-model="range" aria-label="Date range"><option value="all">All time</option><option value="30">Last 30 Days</option><option value="7">Last 7 Days</option></select></label>
      <label class="f"><AppIcon name="landmark" /><select v-model="eventFilter" aria-label="Event"><option value="">All Events ({{ events.length }})</option><option v-for="e in events" :key="e">{{ e }}</option></select></label>
      <label class="f"><AppIcon name="credit-card" /><select v-model="method" aria-label="Payment method"><option value="">All Payment Methods</option><option v-for="m in methods" :key="m">{{ m }}</option></select></label>
      <button type="button" class="f ref" aria-label="Reset filters" title="Reset filters" @click="reset"><AppIcon name="refresh-cw" /></button>
    </div>
    <div class="chips" role="group" aria-label="Status">
      <button v-for="c in chips" :key="c.key" type="button" :class="{ on: status === c.key, gold: c.key === 'refund-review' }" :aria-pressed="status === c.key" @click="status = c.key">
        <i v-if="c.key === 'refund-review'" /> {{ c.label }} <b>{{ c.n }}</b>
      </button>
    </div>
  </section>

  <div class="wrap" :class="{ solo: !selected && !missing }">
    <section class="a-card tbl">
      <header>
        <h2>Active Transactions <span class="a-pill muted nodot sm">Showing {{ shown.length }} of {{ rows.length }}</span></h2>
        <span class="sort">Sort: <b>Date (Newest)</b> <AppIcon name="arrow-down" /></span>
      </header>
      <p v-if="!rows.length" class="a-empty">No orders match these filters.</p>
      <div v-else class="a-scroll">
        <table class="a-table">
          <thead><tr><th>ORDER NO.</th><th>BUYER</th><th>EVENT</th><th>TOTAL / STATUS</th></tr></thead>
          <tbody>
            <tr v-for="o in shown" :key="o.orderNumber" :class="{ cur: selected?.orderNumber === o.orderNumber, ref: o.status === 'refund-review' }" @click="open(o)">
              <td>
                <RouterLink class="no" :to="{ path: `/admin/orders/${o.orderNumber}`, query: route.query }" @click.stop="panelOpen = true">#{{ o.orderNumber }}</RouterLink>
                <span class="a-sub">{{ day(o.createdAt) }} · {{ clock(o.createdAt).slice(0, 5) }}</span>
              </td>
              <td>
                <b class="who">{{ o.buyer.name }} <em v-if="isVip(o)">VIP</em></b>
                <span class="a-sub">{{ o.buyer.email }}</span>
              </td>
              <td>
                <div class="ev"><img :src="orderImage(o)" alt="" loading="lazy" /><div><b>{{ o.eventTitle }}</b><span class="a-sub">{{ o.venue }} · {{ o.tickets.length }} seat{{ o.tickets.length === 1 ? '' : 's' }}</span></div></div>
              </td>
              <td class="amt"><b>{{ money(o.total) }}</b><span class="a-pill sm" :class="orderStatuses[o.status]?.tone">{{ orderStatuses[o.status]?.label ?? o.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer>
        <span>Page {{ page }} of {{ pages }}</span>
        <nav v-if="pages > 1" class="pager" aria-label="Pages">
          <button type="button" :disabled="page === 1" aria-label="Previous page" @click="page--"><AppIcon name="chevron-left" /></button>
          <button v-for="n in pages" :key="n" type="button" :class="{ on: n === page }" :aria-current="n === page ? 'page' : undefined" @click="page = n">{{ n }}</button>
          <button type="button" :disabled="page === pages" aria-label="Next page" @click="page++"><AppIcon name="chevron-right" /></button>
        </nav>
      </footer>
    </section>

    <aside v-if="missing" class="a-card panel"><p class="a-note bad">No order found for {{ route.params.orderNumber }}.</p></aside>
    <aside v-else-if="selected" class="a-card panel" aria-label="Order details">
      <header>
        <div>
          <h2>Order Details</h2>
          <span class="num">#{{ selected.orderNumber }}</span>
          <small>Created: {{ day(selected.createdAt) }} · {{ clock(selected.createdAt) }} PHT</small>
        </div>
        <span class="a-pill" :class="orderStatuses[selected.status]?.tone">{{ orderStatuses[selected.status]?.label }}</span>
        <button type="button" class="x" aria-label="Close order details" @click="close"><AppIcon name="x" size="20" /></button>
      </header>

      <div v-if="selected.status === 'refund-review'" class="alert">
        <b><AppIcon name="triangle-alert" size="20" /> Gateway Reversal Required</b>
        <p>Payment was confirmed after the seat hold expired. Spotlight inventory holds have been released back to the general pool. Please finalize the manual settlement reversal on the payment processor dashboard.</p>
        <div class="gw">
          <a v-if="GATEWAY_URLS.gcash" :href="GATEWAY_URLS.gcash" target="_blank" rel="noopener" class="a-btn gold sm">Open GCash Portal <AppIcon name="external-link" /></a>
          <button v-else type="button" class="a-btn gold sm" disabled aria-disabled="true" title="Add the gateway URL in src/config.js">Open GCash Portal <AppIcon name="external-link" /></button>
          <a v-if="GATEWAY_URLS.maya" :href="GATEWAY_URLS.maya" target="_blank" rel="noopener" class="a-btn sm">Open Maya Merchant Console <AppIcon name="external-link" /></a>
          <button v-else type="button" class="a-btn sm" disabled aria-disabled="true" title="Add the gateway URL in src/config.js">Open Maya Merchant Console <AppIcon name="external-link" /></button>
        </div>
      </div>

      <h3 class="sec">BUYER INFORMATION</h3>
      <dl class="card kv">
        <div><dt>Full Name</dt><dd class="big">{{ selected.buyer.name }}</dd></div>
        <div><dt>Payment Reference</dt><dd class="mono">{{ selected.orderNumber }}-PAY</dd></div>
        <div><dt>Email Address</dt><dd>{{ selected.buyer.email }}</dd></div>
        <div><dt>Mobile Number</dt><dd class="mono">+63 {{ selected.buyer.phone }}</dd></div>
      </dl>

      <h3 class="sec">EVENT &amp; VENUE</h3>
      <div class="card evt">
        <img :src="orderImage(selected)" alt="" />
        <div>
          <b>{{ selected.eventTitle }}</b>
          <span class="when">{{ selected.eventDate }}</span>
        </div>
        <p><AppIcon name="map-pin" /> {{ selected.venue }}{{ orderEvent(selected) ? `, ${orderEvent(selected).venue.split(',')[1]?.trim() ?? ''}` : '' }}</p>
      </div>

      <h3 class="sec">SEATS ALLOCATION <span class="a-pill gold nodot sm">Status: {{ seatsState(selected) }}</span></h3>
      <div class="card seatsb">
        <div class="a-scroll">
          <table class="a-table">
            <thead><tr><th>SECTION</th><th>ROW</th><th>SEAT</th><th>TIER ZONE</th><th>PRICE</th></tr></thead>
            <tbody>
              <tr v-for="t in selected.tickets" :key="t.seatId">
                <td>Sec {{ seatParts(t).section }}</td>
                <td>Row {{ seatParts(t).row }}</td>
                <td class="sn">{{ seatParts(t).seat }}</td>
                <td><span class="zone">{{ t.zoneName }}</span><span class="a-sub">{{ t.holder }}</span></td>
                <td class="mono">{{ money(t.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl class="sum">
          <div><dt>Subtotal ({{ selected.tickets.length }} ticket{{ selected.tickets.length === 1 ? '' : 's' }})</dt><dd>{{ money(selected.subtotal) }}</dd></div>
          <div><dt>Ticketing Platform Fee</dt><dd :class="{ waive: !selected.fee }">{{ selected.fee ? money(selected.fee) : 'Waived' }}</dd></div>
          <div><dt>Value Added Tax (12% Included)</dt><dd>{{ money(vat(selected)) }}</dd></div>
          <div class="tot" :class="{ gold: selected.status === 'refund-review' }"><dt>{{ totalLabel(selected) }}</dt><dd>{{ money(selected.total) }}</dd></div>
        </dl>
      </div>

      <h3 class="sec">PAYMENT &amp; SETTLEMENT METADATA</h3>
      <dl class="card kv one">
        <div><dt>Payment Method</dt><dd>{{ selected.method }}</dd></div>
        <div><dt>Gateway Mode</dt><dd>Test mode (no real charge)</dd></div>
        <div><dt>Order Status</dt><dd>{{ orderStatuses[selected.status]?.label }}</dd></div>
        <div><dt>Created</dt><dd>{{ day(selected.createdAt) }} · {{ clock(selected.createdAt) }} PHT</dd></div>
      </dl>
    </aside>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.st { padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; }
.st header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.st small { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); }
.st b { font-family: var(--font-display); font-size: 36px; font-weight: 500; line-height: 1.05; }
.st b span { margin-left: 8px; font-family: var(--font-body); font-size: 14px; font-weight: 400; color: var(--gold); }
.st p { font-size: 14px; color: var(--text-muted); }
.st p em { font-style: normal; color: var(--secondary); font-weight: 500; }
.st.warn { background: linear-gradient(160deg, rgba(255, 185, 95, 0.2), var(--surface-low) 70%); border-color: rgba(255, 185, 95, 0.3); }
.st.warn small { color: var(--gold); }
.st.warn small i { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
.ico { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; background: var(--surface); color: var(--text-muted); }
.ico.cy { background: rgba(76, 215, 246, 0.15); color: var(--secondary); }
.ico.go { background: rgba(255, 185, 95, 0.2); color: var(--gold); }
.ico.rd { background: var(--danger-bg); color: var(--danger); }
.filters { padding: 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px; }
.frow { display: flex; gap: 10px; flex-wrap: wrap; }
.f { display: flex; align-items: center; gap: 8px; padding: 0 16px; border-radius: var(--radius); background: var(--surface); color: var(--text-muted); }
.f input, .f select { background: none; border: 0; outline: 0; color: var(--text); font: inherit; font-size: 14px; padding: 13px 0; min-width: 0; }
.f select { font-weight: 500; cursor: pointer; max-width: 170px; }
.f select option { background: var(--surface); }
.f.search { flex: 1 1 220px; }
.f.search input { flex: 1; }
.f.ref { width: 46px; justify-content: center; padding: 0; }
.chips { display: flex; gap: 10px; flex-wrap: wrap; }
.chips button { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: var(--radius-pill); background: var(--surface); font-size: 14px; color: var(--text-muted); }
.chips button b { font-weight: 500; color: var(--secondary); }
.chips button i { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
.chips button.on { background: var(--primary-strong); color: var(--on-primary); font-weight: 600; }
.chips button.on b { color: inherit; }
.chips button.on.gold, .chips button.gold.on { background: var(--gold); color: var(--on-gold); }
.chips button.gold:not(.on) { color: var(--gold); }
.wrap { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.wrap.solo { grid-template-columns: minmax(0, 1fr); }
.tbl { padding: 0; overflow: hidden; }
.tbl > header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; padding: 20px 24px; }
.tbl h2 { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-family: var(--font-body); font-size: 19px; font-weight: 600; }
.a-pill.sm { padding: 4px 12px; font-size: 12px; }
.sort { font-size: 14px; color: var(--text-muted); }
.sort b { color: var(--text); font-weight: 500; }
.tbl .a-scroll { background: var(--bg); }
.tbl .a-table th, .tbl .a-table td { padding: 16px 12px; }
.wrap:not(.solo) .ev img { display: none; }
.tbl .a-sub { overflow-wrap: anywhere; }
.tbl .a-table th:first-child, .tbl .a-table td:first-child { padding-left: 24px; }
.tbl tbody tr { cursor: pointer; }
.tbl tbody tr:hover td { background: rgba(255, 255, 255, 0.02); }
.tbl tbody tr.cur td { background: var(--surface); }
.tbl tbody tr.cur td:first-child { box-shadow: inset 4px 0 var(--primary-strong); }
.tbl tbody tr.ref.cur td:first-child { box-shadow: inset 4px 0 var(--gold); }
.no { font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; font-size: 13px; font-weight: 700; color: var(--text); white-space: nowrap; }
.ref .no { color: var(--gold); }
.who { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; }
.who em { padding: 2px 8px; border-radius: var(--radius-sm); background: rgba(160, 120, 255, 0.2); color: var(--primary); font-size: 11px; font-style: normal; font-weight: 700; }
.ev { display: flex; align-items: center; gap: 12px; min-width: 130px; }
.ev img { width: 40px; height: 40px; flex: none; border-radius: 8px; object-fit: cover; }
.ev b { display: block; font-size: 15px; font-weight: 600; }
.seats { display: inline-grid; place-items: center; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 6px; background: var(--surface); font-weight: 600; }
.amt { white-space: nowrap; }
.amt b { display: block; margin-bottom: 6px; font-weight: 600; }
.tbl > footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 24px; border-top: 1px solid rgba(73, 68, 84, 0.3); font-size: 14px; color: var(--text-muted); }
.pager { display: flex; gap: 6px; }
.pager button { min-width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px; background: var(--surface); font-weight: 600; }
.pager button.on { background: var(--primary-strong); color: var(--on-primary); }
.pager button:disabled { opacity: 0.4; cursor: not-allowed; }
.panel { position: sticky; top: 16px; padding: 22px; max-height: calc(100vh - 32px); overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.panel > header { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.panel > header > div { flex: 1; min-width: 160px; }
.panel h2 { font-family: var(--font-display); font-size: 26px; font-weight: 500; }
.num { display: block; margin-top: 4px; font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; font-size: 13px; font-weight: 700; color: var(--gold); word-break: break-all; }
.panel header small { display: block; margin-top: 4px; font-size: 13px; color: var(--text-muted); }
.x { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; color: var(--text-muted); }
.x:hover { background: var(--surface); }
.alert { padding: 16px 18px; border-radius: var(--radius); background: rgba(255, 185, 95, 0.14); border: 1px solid rgba(255, 185, 95, 0.25); color: var(--gold); }
.alert b { display: flex; align-items: center; gap: 8px; font-size: 17px; }
.alert p { margin: 8px 0 12px; font-size: 15px; line-height: 1.55; color: var(--text-muted); }
.gw { display: flex; gap: 8px; flex-wrap: wrap; }
.sec { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; font-size: 13px; letter-spacing: 0.08em; font-weight: 600; color: var(--text-muted); }
.card { padding: 16px 18px; border-radius: var(--radius); background: var(--surface-lowest); }
.kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 20px; margin: 0; }
.kv.one { grid-template-columns: minmax(0, 1fr); gap: 10px; }
.kv.one > div { display: flex; justify-content: space-between; gap: 12px; }
.kv dt { font-size: 13px; color: var(--text-muted); }
.kv dd { margin: 4px 0 0; font-size: 15px; overflow-wrap: anywhere; }
.kv.one dd { margin: 0; text-align: right; }
.kv dd.big { font-family: var(--font-display); font-size: 19px; font-weight: 600; }
.mono { font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; font-size: 14px; }
.evt { display: grid; grid-template-columns: 64px 1fr; gap: 10px 14px; align-items: center; }
.evt img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; }
.evt b { display: block; font-family: var(--font-display); font-size: 19px; line-height: 1.25; font-weight: 600; }
.when { display: block; margin-top: 4px; color: var(--secondary); font-size: 15px; }
.evt p { grid-column: 1 / -1; display: flex; gap: 8px; align-items: center; font-size: 14px; color: var(--text-muted); }
.evt p svg { color: var(--secondary); flex: none; }
.seatsb { padding: 0; overflow: hidden; }
.seatsb .a-table th, .seatsb .a-table td { padding: 12px 14px; font-size: 14px; }
.seatsb .a-table th { background: var(--surface); }
.sn { color: var(--secondary); font-weight: 700; }
.zone { display: inline-block; padding: 4px 10px; border-radius: 8px; background: rgba(160, 120, 255, 0.2); color: var(--primary); font-size: 12px; font-weight: 600; }
.sum { margin: 0; padding: 14px 18px; background: var(--surface-low); display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: var(--text-muted); }
.sum > div { display: flex; justify-content: space-between; gap: 12px; }
.sum dt, .sum dd { margin: 0; }
.sum dd { color: var(--text); }
.sum .waive { color: var(--secondary); }
.sum .tot { margin-top: 6px; align-items: center; }
.sum .tot dt { font-family: var(--font-display); font-size: 17px; color: var(--text); }
.sum .tot dd { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--primary); }
.sum .tot.gold dd { color: var(--gold); }
@media (max-width: 1200px) {
  .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .wrap { grid-template-columns: minmax(0, 1fr); }
  .panel { position: static; max-height: none; }
}
@media (max-width: 600px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .st { padding: 16px; }
  .st b { font-size: 28px; }
  .kv { grid-template-columns: minmax(0, 1fr); }
  .f select { max-width: 150px; }
}
</style>
