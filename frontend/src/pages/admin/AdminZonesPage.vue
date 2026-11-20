<script setup>
import AppIcon from '../../components/AppIcon.vue'
import AdminEventHeader from '../../components/admin/AdminEventHeader.vue'
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { seatMap } from '../../data/seatmap'
import { peso } from '../../data/events'
import { SEATS_PER_EVENT, eventNotices, findEvent, persist, publishProblems, savedAgo, sections } from '../../stores/admin'

const route = useRoute()
const ev = findEvent(route.params.id)
const clone = () => (ev ? JSON.parse(JSON.stringify({ sectionZones: ev.sectionZones, zones: ev.zones })) : { sectionZones: {}, zones: {} })
const draft = reactive(clone())
const initial = ref(JSON.stringify(draft))
const msg = ref(null)
const errors = reactive({})
const zoom = ref(1)
const palette = ['#4cd7f6', '#a078ff', '#ffb95f', '#2dd4bf', '#f472b6', '#86efac']

const zoneIds = computed(() => Object.keys(draft.zones))
const dirty = computed(() => JSON.stringify(draft) !== initial.value)
const zoneOf = (s) => draft.zones[draft.sectionZones[s]]
const colorFor = (section) => zoneOf(section)?.color ?? '#2a2c37'

// ---- per-section facts from the seat map ----
const info = computed(() =>
  sections.map((s) => {
    const seats = seatMap.seats.filter((x) => x.section === s)
    const sold = seats.filter((x) => x.status === 'sold').length
    const held = seats.filter((x) => x.status === 'held').length
    const label = seatMap.labels.find((l) => l.text.startsWith(`SEC ${s} ·`))?.text.split('· ')[1] ?? ''
    return {
      id: s,
      name: `Section ${s === 'BALCONY' ? 'Balcony' : s}`,
      desc: label.toLowerCase().replace(/(^|\s)\w/g, (c) => c.toUpperCase()),
      capacity: seats.length,
      sold,
      held,
      pct: seats.length ? Math.round((sold / seats.length) * 100) : 0,
    }
  }),
)
// Edit rule: a section can change zone only while none of its seats are sold or held.
const locked = (s) => !!ev && ev.status === 'published' && (ev.sold > 0 || info.value.find((i) => i.id === s).sold + info.value.find((i) => i.id === s).held > 0)
const assigned = computed(() => seatMap.seats.filter((s) => draft.sectionZones[s.section]).length)
const lockedSeats = computed(() =>
  ev?.status === 'published' ? seatMap.seats.filter((s) => draft.sectionZones[s.section] && s.status !== 'available').length : 0,
)
const lockedNames = computed(() => info.value.filter((i) => locked(i.id) && draft.sectionZones[i.id]).map((i) => i.name.replace('Section ', 'Section ')))
const openSeats = computed(() => assigned.value - lockedSeats.value)
const usesVip = computed(() => Object.values(draft.sectionZones).some((z) => z && draft.zones[z]?.vip))
const usesGeneral = computed(() => Object.values(draft.sectionZones).some((z) => z && !draft.zones[z]?.vip))
const tierName = (z, i) => `TIER ${i + 1} • ${draft.zones[z].name.toUpperCase()}`
const perkCount = (z) => (draft.zones[z].perks ?? '').split('\n').filter((l) => l.trim()).length
const used = (z) => Object.values(draft.sectionZones).includes(z)

const chips = computed(() => {
  const c = []
  if (dirty.value) c.push({ tone: 'gold', dot: true, text: 'Editing (Unsaved Changes)' })
  else c.push(ev.status === 'published' ? { tone: 'cyan', dot: true, text: 'Published (Active Sales)' } : { tone: 'muted', dot: true, text: 'Draft (Saved)' })
  c.push({ tone: 'muted', icon: 'history', text: savedAgo(ev.updatedAt) })
  return c
})

// ---- zone cards ----
const addZone = () => {
  const id = `zone-${Date.now().toString(36)}`
  draft.zones[id] = { id, name: 'New Zone', price: 1000, color: palette[zoneIds.value.length % palette.length], vip: false, perks: '' }
}
const duplicateZone = (z) => {
  const id = `${z}-copy-${Date.now().toString(36)}`
  draft.zones[id] = { ...JSON.parse(JSON.stringify(draft.zones[z])), id, name: `${draft.zones[z].name} (copy)` }
}
const deleteZone = (z) => {
  if (used(z)) return
  delete draft.zones[z]
}

// ---- actions ----
const say = (ok, text) => (msg.value = { ok, text })
const save = () => {
  if (!ev) return false
  Object.keys(errors).forEach((k) => delete errors[k])
  zoneIds.value.forEach((z) => {
    if (!draft.zones[z].name.trim()) errors[z + 'n'] = 'Name is required.'
    if (!(draft.zones[z].price > 0)) errors[z + 'p'] = 'Price must be above ₱0.'
  })
  if (Object.keys(errors).length) {
    say(false, 'Fix the highlighted fields.')
    return false
  }
  ev.sectionZones = JSON.parse(JSON.stringify(draft.sectionZones))
  ev.zones = JSON.parse(JSON.stringify(draft.zones))
  ev.updatedAt = new Date().toISOString()
  persist()
  initial.value = JSON.stringify(draft)
  return true
}
const saveOnly = () => save() && say(true, 'Zones saved. Prices apply only to seats still available.')
const sync = () => {
  if (!save()) return
  say(true, `Zones saved and synced. New prices apply to ${openSeats.value} available seats; ${lockedSeats.value} sold or held seats keep their price.`)
}
const publish = () => {
  if (!save()) return
  const p = publishProblems(ev)
  if (p.length) return say(false, p.join(' '))
  ev.status = 'published'
  persist()
  say(true, `Published. ${assigned.value} seat records created.`)
}
</script>

<template>
  <p v-if="!ev" class="a-note bad">Event not found. <RouterLink to="/admin/events">Back to events</RouterLink></p>
  <template v-else>
    <AdminEventHeader :event="ev" tab="zones" end-label="Edit Configuration" :chips="chips" :notices="eventNotices(ev)" :zones-count="zoneIds.length">
      <template #actions>
        <a :href="`/events/${ev.id}/seats`" target="_blank" rel="noopener" class="a-btn">Preview Public Seatmap <AppIcon name="external-link" /></a>
        <button type="button" class="a-btn" @click="saveOnly">Save Changes</button>
        <button v-if="ev.status === 'published'" type="button" class="a-btn primary" @click="sync"><AppIcon name="refresh-cw" /> Update &amp; Sync Tickets</button>
        <button v-else type="button" class="a-btn primary" @click="publish"><AppIcon name="rocket" /> Publish Event</button>
      </template>
    </AdminEventHeader>

    <p v-if="msg" class="a-note" :class="msg.ok ? 'good' : 'bad'" :role="msg.ok ? 'status' : 'alert'">
      <AppIcon :name="msg.ok ? 'circle-check' : 'triangle-alert'" /> <span>{{ msg.text }}</span>
    </p>

    <div class="a-note warn notice" :class="{ plain: !lockedSeats }">
      <AppIcon :name="lockedSeats ? 'info' : 'layers'" size="22" />
      <div class="nt">
        <p v-if="lockedSeats">
          <b>Live Inventory Notice:</b> {{ lockedSeats }} seats in {{ lockedNames.join(', ') }} are already locked by customers. Price updates will selectively cascade to unreserved seats only.
        </p>
        <p v-else><b>{{ ev.status === 'published' ? 'No seats are locked.' : 'Draft:' }}</b> {{ ev.status === 'published' ? 'Changes apply to every seat.' : 'nothing is on sale yet. Publishing creates one availability record per seat.' }}</p>
        <small>Total arena capacity configured: <b>{{ assigned }}</b> of {{ SEATS_PER_EVENT }} max occupancy ({{ ((assigned / SEATS_PER_EVENT) * 100).toFixed(1) }}% indexed)</small>
      </div>
      <span class="gate">Gate access: <b>{{ [usesVip && 'Gate 1 (VIP)', usesGeneral && 'Gate 2 (GA)'].filter(Boolean).join(' & ') || 'None' }}</b></span>
    </div>

    <div class="zn">
      <div class="left">
        <section class="a-card blue">
          <header>
            <div><small>LAYOUT BLUEPRINT</small><h2>Bayview Arena — Horseshoe Stage Config</h2></div>
            <div class="zoom" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom in" @click="zoom = Math.min(2.2, zoom + 0.2)"><AppIcon name="plus" /></button>
              <button type="button" aria-label="Zoom out" @click="zoom = Math.max(0.8, zoom - 0.2)"><AppIcon name="minus" /></button>
              <button type="button" @click="zoom = 1">Reset</button>
            </div>
          </header>
          <div class="plan">
            <span v-if="usesVip" class="gate1"><AppIcon name="star" filled /> Gate 1 • VIP Express</span>
            <span v-if="usesGeneral" class="gate2"><AppIcon name="door-open" /> Gate 2 • General Entry</span>
            <div class="scroll">
              <svg :viewBox="seatMap.viewBox" role="img" aria-label="Seat plan colored by zone" :style="{ width: zoom * 100 + '%' }">
                <rect x="150" y="30" width="500" height="44" rx="6" fill="#1d1f29" />
                <text x="400" y="58" text-anchor="middle" fill="#cbc3d7" font-size="14" letter-spacing="3">MAIN STAGE</text>
                <text v-for="l in seatMap.labels" :key="l.text" :x="l.x" :y="l.y" :text-anchor="l.anchor" font-size="11" font-weight="600" :fill="colorFor(l.text.split(' ')[1])">{{ l.text }}</text>
                <circle v-for="s in seatMap.seats" :key="s.id" :cx="s.x" :cy="s.y" r="6" :fill="colorFor(s.section)" />
              </svg>
            </div>
          </div>
          <ul class="lg">
            <li v-for="z in zoneIds" :key="z"><i :style="{ background: draft.zones[z].color }" /> {{ draft.zones[z].name }}</li>
            <li><i style="background: #2a2c37" /> Not for Sale</li>
          </ul>
        </section>

        <section class="a-card assign">
          <h2>Section Zone Assignment</h2>
          <p class="sub">Bind physical arena sectors to commercial pricing profiles. Sections with no zone are not for sale.</p>
          <div class="a-scroll">
            <table class="a-table">
              <thead><tr><th>SECTION ID</th><th>CAPACITY</th><th>SALES STATUS</th><th>ASSIGNED ZONE</th></tr></thead>
              <tbody>
                <tr v-for="i in info" :key="i.id" :class="{ off: !draft.sectionZones[i.id] }">
                  <td>
                    <div class="sec">
                      <i :style="{ background: colorFor(i.id) }" />
                      <div>
                        <b>{{ i.name }}</b>
                        <span class="a-sub">{{ i.desc }}</span>
                        <span v-if="locked(i.id)" class="lock">Lock Active</span>
                      </div>
                    </div>
                  </td>
                  <td class="mono">{{ i.capacity.toLocaleString('en-PH') }}</td>
                  <td>
                    <b class="sold" :class="{ zero: !i.sold }">{{ i.sold }} sold</b> <span class="a-sub inl">({{ i.pct }}%)</span>
                    <span v-if="locked(i.id)" class="plock">Price locked</span>
                  </td>
                  <td>
                    <select v-model="draft.sectionZones[i.id]" :disabled="locked(i.id)" :aria-label="`Zone for ${i.name}`">
                      <option value="">Not for sale (Unassigned)</option>
                      <option v-for="z in zoneIds" :key="z" :value="z">{{ draft.zones[z].name }} ({{ peso(draft.zones[z].price || 0) }})</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside class="right">
        <header class="rh">
          <div><small>COMMERCE CONFIGURATION</small><h2>Ticketing Zones &amp; VIP Perks</h2></div>
          <button type="button" class="a-btn primary sm" @click="addZone"><AppIcon name="plus" /> Add Zone</button>
        </header>

        <article v-for="(z, n) in zoneIds" :key="z" class="a-card tier">
          <header>
            <span class="tn"><i :style="{ background: draft.zones[z].color }" /> {{ tierName(z, n) }}</span>
            <span class="ic">
              <button type="button" aria-label="Duplicate zone" @click="duplicateZone(z)"><AppIcon name="copy" /></button>
              <button type="button" class="del" :disabled="used(z)" :title="used(z) ? 'Reassign its sections before deleting' : 'Delete zone'" aria-label="Delete zone" @click="deleteZone(z)"><AppIcon name="trash" /></button>
            </span>
          </header>
          <div class="two">
            <label class="a-field">
              <span class="lbl sm">Zone Label</span>
              <input v-model="draft.zones[z].name" :aria-invalid="!!errors[z + 'n']" />
              <span v-if="errors[z + 'n']" class="err">{{ errors[z + 'n'] }}</span>
            </label>
            <label class="a-field">
              <span class="lbl sm">Base Price (PHP)</span>
              <span class="price"><b>₱</b><input v-model.number="draft.zones[z].price" type="number" min="1" step="50" :aria-invalid="!!errors[z + 'p']" /></span>
              <span v-if="errors[z + 'p']" class="err">{{ errors[z + 'p'] }}</span>
            </label>
          </div>
          <div class="vrow">
            <label class="vip"><input v-model="draft.zones[z].vip" type="checkbox" /> VIP Zone Status <AppIcon v-if="draft.zones[z].vip" name="badge-check" /></label>
            <label class="sw">Swatch: <span><input v-model="draft.zones[z].color" type="color" aria-label="Zone color" /> <code>{{ draft.zones[z].color.toUpperCase() }}</code></span></label>
          </div>
          <label class="a-field perks">
            <span class="lbl sm">Customer Perks &amp; Inclusions (one per line)<span class="cnt">{{ perkCount(z) }} Perk{{ perkCount(z) === 1 ? '' : 's' }} Registered</span></span>
            <textarea v-model="draft.zones[z].perks" rows="4" />
          </label>
          <div class="prev">
            <small>PUBLIC BOOKING UI PREVIEW:</small>
            <div class="pc">
              <span class="pn"><i :style="{ background: draft.zones[z].color }" /> {{ draft.zones[z].name || 'Unnamed zone' }} <em v-if="draft.zones[z].vip">VIP <AppIcon name="star" filled /></em></span>
              <span class="pp">{{ peso(draft.zones[z].price || 0) }} <u v-if="perkCount(z)">{{ perkCount(z) }} perk{{ perkCount(z) === 1 ? '' : 's' }} included</u></span>
            </div>
          </div>
        </article>

        <button type="button" class="add" @click="addZone">
          <span><AppIcon name="plus" size="26" /></span>
          <b>Create Additional Ticketing Tier</b>
          <small>Configure price tiers for side balconies, corporate boxes or press suites</small>
        </button>
      </aside>
    </div>
  </template>
</template>

<style scoped>
.notice { align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 20px; }
.notice.plain { background: var(--surface-low); color: var(--text-muted); border-color: rgba(73, 68, 84, 0.22); }
.nt { flex: 1 1 320px; }
.nt p { font-size: 16px; line-height: 1.5; }
.nt small { display: block; margin-top: 4px; font-size: 13px; color: var(--text-muted); }
.nt small b { color: var(--text); }
.notice .gate { margin-left: auto; font-size: 14px; color: var(--text-muted); }
.gate b { margin-left: 6px; padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(76, 215, 246, 0.12); color: var(--secondary); font-weight: 600; }
.zn { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.left, .right { display: flex; flex-direction: column; gap: 24px; min-width: 0; }
.blue { padding: 22px 24px; }
.blue header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.blue small, .rh small { font-size: 12px; letter-spacing: 0.1em; color: var(--secondary); }
.blue h2, .rh h2 { font-family: var(--font-display); font-size: 24px; font-weight: 500; line-height: 1.2; }
.zoom { display: flex; gap: 6px; }
.zoom button { min-width: 38px; height: 38px; padding: 0 12px; display: grid; place-items: center; border-radius: 10px; background: var(--surface); font-size: 14px; font-weight: 600; }
.plan { position: relative; border-radius: var(--radius); background: var(--surface-lowest); padding: 16px 12px 12px; }
.gate1, .gate2 { position: absolute; top: 14px; z-index: 1; display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: var(--radius-pill); background: rgba(25, 27, 36, 0.92); font-size: 13px; font-weight: 500; }
.gate1 { left: 14px; color: var(--gold); border: 1px solid rgba(255, 185, 95, 0.3); }
.gate2 { right: 14px; color: var(--secondary); border: 1px solid rgba(76, 215, 246, 0.3); }
.scroll { overflow: auto; padding-top: 28px; }
.scroll svg { display: block; height: auto; min-width: 100%; transition: width 0.2s; }
.lg { list-style: none; margin: 14px 0 0; padding: 14px 0 0; border-top: 1px solid rgba(73, 68, 84, 0.3); display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 20px; font-size: 14px; color: var(--text-muted); }
.lg i { display: inline-block; width: 12px; height: 12px; margin-right: 8px; border-radius: 50%; vertical-align: -1px; }
.assign { padding: 24px 0 8px; }
.assign h2, .assign .sub { padding: 0 24px; }
.assign h2 { font-size: 24px; }
.sub { margin: 4px 0 16px; font-size: 15px; color: var(--text-muted); }
.assign .a-table th, .assign .a-table td { padding: 14px 16px; }
.assign .a-table th:first-child, .assign .a-table td:first-child { padding-left: 24px; }
.assign .a-table td:last-child { padding-right: 24px; min-width: 210px; }
tr.off td { opacity: 0.7; }
.sec { display: flex; gap: 12px; align-items: flex-start; }
.sec > i { flex: none; width: 12px; height: 12px; margin-top: 7px; border-radius: 50%; }
.sec b { display: block; font-family: var(--font-display); font-size: 17px; font-weight: 600; white-space: nowrap; }
.sec .a-sub { font-size: 13px; max-width: 200px; }
.lock { display: inline-block; margin-top: 6px; padding: 3px 8px; border-radius: var(--radius-sm); background: rgba(255, 185, 95, 0.2); color: var(--gold); font-size: 11px; font-weight: 600; }
.mono { font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; }
.sold { white-space: nowrap; font-size: 17px; font-family: var(--font-display); color: var(--secondary); }
.sold.zero { color: var(--text-subtle); }
.inl { display: inline; }
.plock { display: block; width: max-content; margin-top: 6px; padding: 3px 8px; border-radius: var(--radius-sm); background: var(--surface); font-size: 11px; color: var(--text-muted); }
.assign select { width: 100%; padding: 11px 14px; border-radius: var(--radius); border: 0; background: var(--surface); color: var(--text); font: inherit; font-size: 14px; outline: 0; }
.assign select:disabled { opacity: 0.7; cursor: not-allowed; }
.rh { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.tier { padding: 20px 22px; }
.tier > header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
.tn { display: inline-flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; color: var(--text); min-width: 0; }
.tn i { flex: none; width: 14px; height: 14px; border-radius: 50%; }
.ic { display: flex; gap: 6px; }
.ic button { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 8px; color: var(--text-muted); }
.ic button:hover:not(:disabled) { background: var(--surface); }
.ic .del { color: var(--danger); }
.ic button:disabled { opacity: 0.35; cursor: not-allowed; }
.two { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; }
.tier .a-field { margin-bottom: 12px; gap: 6px; }
.lbl.sm { font-size: 13px; font-weight: 500; color: var(--text-muted); }
.tier input:not([type='checkbox']):not([type='color']), .tier textarea { padding: 12px 14px; font-size: 16px; }
.price { display: flex; align-items: center; border-radius: var(--radius); background: var(--surface-lowest); }
.price b { padding-left: 14px; color: var(--text-muted); font-weight: 500; }
.price input { background: none !important; padding-left: 8px !important; font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; }
.vrow { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; font-size: 14px; }
.vip { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; }
.vip svg { color: var(--gold); }
.vip input { width: 18px; height: 18px; accent-color: var(--primary-strong); }
.sw { display: inline-flex; align-items: center; gap: 8px; color: var(--text-muted); }
.sw span { display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px 4px 6px; border-radius: var(--radius-sm); background: var(--surface-lowest); }
.sw input { width: 22px; height: 22px; padding: 0; border: 0; background: none; cursor: pointer; }
.sw code { font-size: 13px; color: var(--text); }
.perks textarea { min-height: 96px; font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace; font-size: 14px !important; }
.cnt { margin-left: auto; color: var(--secondary); }
.prev { padding: 12px 14px; border-radius: var(--radius); background: var(--surface-lowest); }
.prev small { font-size: 11px; letter-spacing: 0.08em; color: var(--text-muted); }
.pc { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 8px; padding: 12px 14px; border-radius: 10px; background: var(--surface); }
.pn { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 17px; font-weight: 500; }
.pn i { width: 12px; height: 12px; border-radius: 50%; }
.pn em { padding: 3px 8px; border-radius: var(--radius-sm); background: rgba(255, 185, 95, 0.2); color: var(--gold); font-size: 11px; font-style: normal; font-weight: 700; }
.pp { font-size: 17px; font-weight: 600; }
.pp u { margin-left: 8px; font-size: 13px; font-weight: 400; color: var(--secondary); }
.add { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 20px; border-radius: 20px; border: 2px dashed rgba(73, 68, 84, 0.5); text-align: center; color: var(--text-muted); }
.add:hover { border-color: var(--primary-strong); color: var(--text); }
.add > span { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; background: var(--surface); color: var(--primary); }
.add b { font-size: 18px; color: var(--text); font-weight: 500; }
.add small { font-size: 13px; }
@media (max-width: 1100px) {
  .zn { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 700px) {
  /* Stack each section's details instead of scrolling the table sideways. */
  .assign .a-table thead { display: none; }
  .assign .a-table, .assign .a-table tbody { display: block; }
  .assign .a-table tr { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; padding: 14px 20px; border-bottom: 1px solid rgba(73, 68, 84, 0.2); }
  .assign .a-table td, .assign .a-table td:first-child, .assign .a-table td:last-child { padding: 0; border: 0; min-width: 0; }
  .assign .a-table td:first-child, .assign .a-table td:last-child { grid-column: 1 / -1; }
  .assign .a-table td:nth-child(2)::before { content: 'CAPACITY  '; font-size: 11px; letter-spacing: 0.08em; color: var(--text-muted); }
  .assign .a-table td:nth-child(3) { text-align: right; }
}
@media (max-width: 600px) {
  .two { grid-template-columns: minmax(0, 1fr); }
  .blue, .tier { padding: 18px 16px; }
  .blue h2, .rh h2 { font-size: 22px; }
  .scroll svg { min-width: 520px; }
  .notice .gate { margin-left: 0; }
}
</style>
