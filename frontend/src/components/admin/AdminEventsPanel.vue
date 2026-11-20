<script setup>
// The events table from the dashboard design. With `manage` it also shows the edit / publish / delete actions.
import AppIcon from '../AppIcon.vue'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  SEATS_PER_EVENT,
  admin,
  canDelete,
  canUnpublish,
  eventCity,
  eventImage,
  eventVenue,
  persist,
  publishProblems,
  salesStatus,
  when,
} from '../../stores/admin'

const props = defineProps({
  title: { type: String, default: 'Upcoming Events' },
  manage: { type: Boolean, default: false },
  pageSize: { type: Number, default: 6 },
})

const q = ref('')
const venue = ref('')
const status = ref('')
const page = ref(1)
const msg = ref(null)

const venues = computed(() => [...new Set(admin.events.map(eventVenue))])
const statuses = ['On Sale', 'Selling Fast', 'Almost Sold Out', 'Sold Out', 'Draft']
const rows = computed(() =>
  admin.events.filter(
    (e) =>
      (!venue.value || eventVenue(e) === venue.value) &&
      (!status.value || salesStatus(e).label === status.value) &&
      `${e.title} ${e.artist}`.toLowerCase().includes(q.value.trim().toLowerCase()),
  ),
)
const pages = computed(() => Math.max(1, Math.ceil(rows.value.length / props.pageSize)))
const shown = computed(() => rows.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))
watch([q, venue, status], () => (page.value = 1))
const live = computed(() => admin.events.filter((e) => e.status === 'published').length)
const barColor = { cyan: 'var(--secondary)', primary: 'var(--primary-strong)', gold: 'var(--gold)', muted: 'var(--text-subtle)' }

const say = (ok, text) => (msg.value = { ok, text })
const publish = (e) => {
  const p = publishProblems(e)
  if (p.length) return say(false, `Cannot publish "${e.title}": ${p.join(' ')}`)
  e.status = 'published'
  persist()
  say(true, `"${e.title}" is published. One availability record is created per seat.`)
}
const unpublish = (e) => {
  if (!canUnpublish(e)) return say(false, `"${e.title}" has sold seats and cannot be unpublished.`)
  e.status = 'draft'
  persist()
  say(true, `"${e.title}" was unpublished.`)
}
const remove = (e) => {
  if (!canDelete(e)) return say(false, 'Only drafts with no orders can be deleted.')
  if (!confirm(`Delete draft "${e.title}"? This cannot be undone.`)) return
  admin.events.splice(admin.events.indexOf(e), 1)
  persist()
  say(true, 'Draft deleted.')
}
const toggleFeatured = (e) => {
  e.featured = !e.featured
  persist()
}
</script>

<template>
  <section class="a-card ep">
    <div class="ep-head">
      <div class="ep-title">
        <h2>{{ title }}</h2>
        <span class="a-pill primary nodot">{{ live }} Active Shows</span>
      </div>
      <div class="ep-filters">
        <label class="f search"><AppIcon name="search" /><input v-model="q" type="search" placeholder="Filter headliners, tour..." aria-label="Filter events" /></label>
        <label class="f"><AppIcon name="map-pin" /><select v-model="venue" aria-label="Venue"><option value="">All Venues</option><option v-for="v in venues" :key="v">{{ v }}</option></select></label>
        <label class="f"><AppIcon name="filter" /><select v-model="status" aria-label="Status"><option value="">All Statuses</option><option v-for="s in statuses" :key="s">{{ s }}</option></select></label>
      </div>
    </div>

    <p v-if="msg" class="a-note" :class="msg.ok ? 'good' : 'bad'" role="status">
      <AppIcon :name="msg.ok ? 'circle-check' : 'triangle-alert'" /> <span>{{ msg.text }}</span>
    </p>

    <p v-if="!rows.length" class="a-empty">No events found.</p>
    <div v-else class="a-scroll">
      <table class="a-table">
        <thead>
          <tr>
            <th>PRODUCTION &amp; HEADLINER</th>
            <th>DATE &amp; SCHEDULE</th>
            <th>VENUE</th>
            <th>SALES STATUS</th>
            <th>INVENTORY</th>
            <th v-if="manage">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in shown" :key="e.id">
            <td>
              <div class="prod">
                <img :src="eventImage(e)" alt="" loading="lazy" />
                <div>
                  <RouterLink class="name" :to="`/admin/events/${e.id}/edit`">{{ e.title }}</RouterLink>
                  <span class="a-sub art">{{ e.artist }}</span>
                  <span v-if="e.genre" class="a-chip-sm">{{ e.genre }}</span>
                </div>
              </div>
            </td>
            <td>
              <b class="d">{{ when(e).date }}</b>
              <span class="a-sub"><em class="day">{{ when(e).day }}</em> • {{ when(e).time }}</span>
            </td>
            <td>
              <b class="d">{{ eventVenue(e) }}</b>
              <span class="a-sub">{{ eventCity(e) }}</span>
            </td>
            <td><span class="a-pill" :class="salesStatus(e).tone">{{ salesStatus(e).label }}</span></td>
            <td class="inv">
              <b>{{ e.sold.toLocaleString('en-PH') }}</b>
              <span class="a-sub">/ {{ SEATS_PER_EVENT.toLocaleString('en-PH') }}</span>
              <div class="a-bar"><i :style="{ width: Math.min(100, (e.sold / SEATS_PER_EVENT) * 100) + '%', '--c': barColor[salesStatus(e).tone] }" /></div>
            </td>
            <td v-if="manage">
              <div class="acts">
                <button type="button" class="ib" :class="{ on: e.featured }" :aria-pressed="e.featured" :aria-label="`Featured on homepage: ${e.title}`" title="Featured on homepage" @click="toggleFeatured(e)"><AppIcon name="star" :filled="e.featured" /></button>
                <RouterLink class="ib" :to="`/admin/events/${e.id}/edit`" :aria-label="`Edit ${e.title}`" title="Edit"><AppIcon name="pencil" /></RouterLink>
                <RouterLink class="ib" :to="`/admin/events/${e.id}/zones`" :aria-label="`Zones and prices for ${e.title}`" title="Zones, prices & VIP perks"><AppIcon name="armchair" /></RouterLink>
                <button v-if="e.status === 'draft'" class="ib pub" type="button" :aria-label="`Publish ${e.title}`" title="Publish" @click="publish(e)"><AppIcon name="rocket" /></button>
                <button v-else class="ib" type="button" :aria-label="`Unpublish ${e.title}`" title="Unpublish" @click="unpublish(e)"><AppIcon name="ban" /></button>
                <button class="ib del" type="button" :aria-label="`Delete ${e.title}`" title="Delete draft" @click="remove(e)"><AppIcon name="trash" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ep-foot">
      <p>Showing <b>{{ shown.length }}</b> of <b>{{ rows.length }}</b> scheduled arena events</p>
      <nav v-if="pages > 1" class="pager" aria-label="Pages">
        <button type="button" :disabled="page === 1" aria-label="Previous page" @click="page--"><AppIcon name="chevron-left" /></button>
        <button v-for="n in pages" :key="n" type="button" :class="{ on: n === page }" :aria-current="n === page ? 'page' : undefined" @click="page = n">{{ n }}</button>
        <button type="button" :disabled="page === pages" aria-label="Next page" @click="page++"><AppIcon name="chevron-right" /></button>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.ep { padding: 0; overflow: hidden; }
.ep-head { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; padding: 28px 28px 24px; }
.ep-title { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.ep-title h2 { font-family: var(--font-display); font-size: 32px; font-weight: 500; line-height: 1.15; }
.ep-filters { display: flex; gap: 10px; flex-wrap: wrap; }
.f { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: var(--radius-pill); background: var(--surface); color: var(--text-muted); }
.f input, .f select { background: none; border: 0; outline: 0; color: var(--text); font: inherit; font-size: 14px; padding: 11px 0; min-width: 0; }
.f select { font-weight: 600; cursor: pointer; padding-right: 4px; }
.f select option { background: var(--surface); }
.f.search { flex: 1 1 220px; min-width: 200px; }
.f.search input { flex: 1; }
.ep :deep(.a-note) { margin: 0 28px 16px; }
.a-scroll { border-top: 1px solid rgba(73, 68, 84, 0.3); background: var(--bg); }
.a-table th, .a-table td { padding-left: 28px; }
.a-table th:not(:first-child), .a-table td:not(:first-child) { padding-left: 16px; }
.prod { display: flex; align-items: center; gap: 14px; min-width: 230px; }
.prod img { width: 64px; height: 64px; flex: none; border-radius: 12px; object-fit: cover; }
.prod > div { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.name { font-family: var(--font-display); font-size: 18px; font-weight: 600; line-height: 1.2; }
.name:hover { color: var(--primary); }
.art { font-size: 15px; color: var(--text-muted); }
.d { display: block; font-size: 16px; font-weight: 500; }
.day { font-style: normal; color: var(--secondary); font-weight: 500; }
.inv { min-width: 130px; }
.inv b { font-size: 14px; }
.inv .a-sub { display: inline; margin-left: 4px; }
.inv .a-bar { margin-top: 8px; }
.acts { display: flex; gap: 4px; flex-wrap: nowrap; }
.ib { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 50%; background: var(--surface); color: var(--text-muted); border: 1px solid rgba(73, 68, 84, 0.3); }
.ib:hover { filter: brightness(1.25); color: var(--text); }
.ib.on { color: var(--gold); }
.ib.pub { background: var(--primary); color: var(--on-primary); border-color: transparent; }
.ib.del { color: var(--danger); }
.ep-foot { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding: 20px 28px; border-top: 1px solid rgba(73, 68, 84, 0.3); font-size: 14px; color: var(--text-muted); }
.ep-foot b { color: var(--text); }
.pager { display: flex; gap: 8px; }
.pager button { min-width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; background: var(--surface); font-weight: 600; }
.pager button.on { background: var(--primary-strong); color: var(--on-primary); }
.pager button:disabled { opacity: 0.4; cursor: not-allowed; }
@media (max-width: 600px) {
  .ep-head { padding: 20px 16px; }
  .ep-title h2 { font-size: 26px; }
  .ep :deep(.a-note) { margin: 0 16px 16px; }
  .ep-foot { padding: 16px; }
}
</style>
