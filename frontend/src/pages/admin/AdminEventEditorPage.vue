<script setup>
import AppIcon from '../../components/AppIcon.vue'
import AdminEventHeader from '../../components/admin/AdminEventHeader.vue'
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import mapImg from '../../assets/detail/map.jpg'
import { seatMap } from '../../data/seatmap'
import {
  MIN_DESCRIPTION,
  SEATS_PER_EVENT,
  blank,
  canUnpublish,
  eventImage,
  findEvent,
  persist,
  publishProblems,
  savedAgo,
  slugify,
  upsert,
  venues,
} from '../../stores/admin'

const route = useRoute()
const router = useRouter()
const existing = findEvent(route.params.id)
const isNew = !existing
const form = reactive(existing ? JSON.parse(JSON.stringify(existing)) : blank())
const initial = ref(JSON.stringify(form))
const tab = computed(() => (route.query.tab === 'policies' ? 'policies' : 'details'))
const msg = ref(null)
const errors = reactive({})
const attempted = ref(false)

// ---- derived state ----
const dirty = computed(() => JSON.stringify(form) !== initial.value)
const locked = computed(() => !isNew && form.status === 'published' && form.sold > 0)
const descLen = computed(() => (form.description ?? '').trim().length)
const descShort = computed(() => descLen.value < MIN_DESCRIPTION && (descLen.value > 0 || attempted.value))
const detailProblems = computed(() => {
  const p = []
  if (!form.title.trim()) p.push('title')
  if (!form.artist.trim()) p.push('artist')
  if (!form.date) p.push('date')
  if (descLen.value < MIN_DESCRIPTION) p.push('description')
  return p
})
const policyGaps = computed(() => ['faq', 'policy', 'waysToBuy'].filter((k) => !(form[k] ?? '').trim()).length)
const notices = computed(() => ({ details: detailProblems.value.length, policies: policyGaps.value }))
const noticeTotal = computed(() => notices.value.details + notices.value.policies)
const chips = computed(() => {
  const c = []
  if (dirty.value) c.push({ tone: 'gold', dot: true, text: form.status === 'published' ? 'Editing Published Event (Unsaved Changes)' : 'Editing Draft (Unsaved Changes)' })
  else if (isNew) c.push({ tone: 'muted', dot: true, text: 'New Draft (Not saved yet)' })
  else c.push(form.status === 'published' ? { tone: 'cyan', dot: true, text: 'Published (Active Sales)' } : { tone: 'muted', dot: true, text: 'Draft (Saved)' })
  c.push({ tone: 'muted', icon: 'history', text: savedAgo(existing?.updatedAt ?? null) })
  if (noticeTotal.value) c.push({ tone: 'danger', icon: 'triangle-alert', text: `${noticeTotal.value} validation notice${noticeTotal.value === 1 ? '' : 's'} pending` })
  return c
})
const zonesCount = computed(() => new Set(Object.values(form.sectionZones).filter(Boolean)).size)

// ---- genres as chips (stored as "POP / SYNTH") ----
const genres = computed(() => form.genre.split(/\s*[/,]\s*/).filter(Boolean))
const adding = ref(false)
const genreDraft = ref('')
const genreInput = ref(null)
const startAdding = () => {
  adding.value = true
  nextTick(() => genreInput.value?.focus())
}
const setGenres = (list) => (form.genre = list.join(' / '))
const addGenre = () => {
  const g = genreDraft.value.trim()
  if (g && !genres.value.some((x) => x.toLowerCase() === g.toLowerCase())) setGenres([...genres.value, g])
  genreDraft.value = ''
  adding.value = false
}
const removeGenre = (g) => setGenres(genres.value.filter((x) => x !== g))

// ---- images (preview only; real upload needs the API) ----
const hero = reactive({ url: '', name: '', size: '' })
const poster = reactive({ url: '', name: '' })
const heroSrc = computed(() => hero.url || eventImage(form))
const onHero = (ev) => {
  const file = ev.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return (errors.image = 'Choose an image file (PNG or JPG).')
  if (file.size > 10 * 1024 * 1024) return (errors.image = 'Image must be 10 MB or smaller.')
  delete errors.image
  hero.url = URL.createObjectURL(file)
  hero.name = file.name
  hero.size = (file.size / 1024 / 1024).toFixed(1) + ' MB'
}
const onPoster = (ev) => {
  const file = ev.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return (errors.poster = 'Choose an image file (PNG or JPG).')
  delete errors.poster
  poster.url = URL.createObjectURL(file)
  poster.name = file.name
}

// ---- capacity overview from the real seat map ----
const cap = computed(() => {
  const mine = seatMap.seats.filter((s) => form.sectionZones[s.section])
  const sold = mine.filter((s) => s.status === 'sold').length
  const held = mine.filter((s) => s.status === 'held').length
  return { assigned: mine.length, sold, held, open: mine.length - sold - held, unassigned: SEATS_PER_EVENT - mine.length }
})
const pct = (n) => (n / SEATS_PER_EVENT) * 100

// ---- actions ----
const say = (ok, text) => (msg.value = { ok, text })
const validate = () => {
  attempted.value = true
  Object.keys(errors).forEach((k) => k !== 'image' && k !== 'poster' && delete errors[k])
  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.artist.trim()) errors.artist = 'Artist is required.'
  if (!form.date) errors.date = 'Date is required.'
  return !errors.title && !errors.artist && !errors.date
}
const save = () => {
  if (!validate()) return say(false, 'Fix the highlighted fields before saving.')
  const err = upsert(form, isNew && !findEvent(form.id || slugify(form.title)))
  if (err) return say(false, err)
  initial.value = JSON.stringify(form)
  if (isNew) router.replace({ path: `/admin/events/${form.id || slugify(form.title)}/edit` })
  else say(true, form.status === 'published' ? 'Changes saved.' : 'Draft saved.')
  return true
}
const publish = () => {
  if (!validate()) return say(false, 'Fix the highlighted fields before publishing.')
  const err = upsert(form, isNew && !findEvent(form.id || slugify(form.title)))
  if (err) return say(false, err)
  const ev = findEvent(form.id || slugify(form.title))
  const problems = publishProblems(ev)
  if (problems.length) {
    initial.value = JSON.stringify(form)
    return say(false, `Saved as a draft, but it cannot be published yet: ${problems.join(' ')}`)
  }
  ev.status = 'published'
  form.status = 'published'
  persist()
  initial.value = JSON.stringify(form)
  say(true, 'Event published. One availability record is created per seat.')
}
const unpublish = () => {
  if (!canUnpublish(form)) return say(false, 'This event has sold seats and cannot be unpublished.')
  const ev = findEvent(form.id)
  ev.status = 'draft'
  form.status = 'draft'
  persist()
  initial.value = JSON.stringify(form)
  say(true, 'Event unpublished and moved back to draft.')
}
</script>

<template>
  <AdminEventHeader :event="isNew ? { title: form.title, date: form.date } : form" :is-new="isNew" :tab="tab" :chips="chips" :notices="notices" :zones-count="zonesCount">
    <template #actions>
      <a v-if="!isNew" :href="`/events/${form.id}`" target="_blank" rel="noopener" class="a-btn">
        <AppIcon name="eye" /> Preview Public Page <AppIcon name="external-link" />
      </a>
      <button type="button" class="a-btn" @click="save"><AppIcon name="save" /> {{ form.status === 'published' ? 'Save Changes' : 'Save Draft' }}</button>
      <button v-if="form.status !== 'published'" type="button" class="a-btn primary" @click="publish"><AppIcon name="rocket" /> Publish Event</button>
      <button v-else type="button" class="a-btn" :disabled="!canUnpublish(form)" :title="canUnpublish(form) ? '' : 'Events with sold seats cannot be unpublished'" @click="unpublish">Unpublish</button>
    </template>
  </AdminEventHeader>

  <p v-if="msg" class="a-note" :class="msg.ok ? 'good' : 'bad'" :role="msg.ok ? 'status' : 'alert'">
    <AppIcon :name="msg.ok ? 'circle-check' : 'triangle-alert'" /> <span>{{ msg.text }}</span>
  </p>
  <p v-if="locked" class="a-note warn"><AppIcon name="lock" /> <span>This event has sold seats: it cannot be unpublished or deleted, and its venue is locked.</span></p>

  <!-- ===== Tab 1: Details ===== -->
  <div v-if="tab === 'details'" class="ed">
    <div class="left">
      <form class="a-card info" novalidate @submit.prevent="save">
        <header>
          <h2><AppIcon name="star" size="26" /> Event Information</h2>
          <small>Fields with * are mandatory</small>
        </header>

        <label class="a-field">
          <span class="lbl">Event Title *<span v-if="form.title.trim() && !errors.title" class="ok"><AppIcon name="circle-check" /> Valid</span></span>
          <span class="inp"><input v-model="form.title" :aria-invalid="!!errors.title" autocomplete="off" /><AppIcon v-if="form.title.trim() && !errors.title" name="badge-check" size="22" class="tick" /></span>
          <span v-if="errors.title" class="err">{{ errors.title }}</span>
        </label>

        <label class="a-field">
          <span class="lbl">Artist / Headliner *</span>
          <span class="inp lead"><AppIcon name="mic" /><input v-model="form.artist" :aria-invalid="!!errors.artist" autocomplete="off" /></span>
          <span v-if="errors.artist" class="err">{{ errors.artist }}</span>
        </label>

        <div class="a-field">
          <span class="lbl">Genre Category *</span>
          <div class="genres">
            <span v-for="g in genres" :key="g" class="gchip">{{ g }} <button type="button" :aria-label="`Remove ${g}`" @click="removeGenre(g)"><AppIcon name="x" /></button></span>
            <div v-if="adding" class="gadd">
              <input ref="genreInput" v-model="genreDraft" placeholder="New genre" aria-label="New genre" @keydown.enter.prevent="addGenre" @blur="addGenre" />
            </div>
            <button v-else type="button" class="gnew" @click="startAdding"><AppIcon name="plus" /> Add Genre</button>
          </div>
        </div>

        <label class="a-field">
          <span class="lbl">Arena Venue *</span>
          <span class="inp lead"><AppIcon name="map-pin" /><select v-model="form.venue" :disabled="!isNew && form.status === 'published'"><option v-for="v in venues" :key="v">{{ v }}</option></select></span>
          <span class="venue-note"><AppIcon name="map" /> Seat map is locked to Bayview Arena 360 Horseshoe layout.</span>
        </label>

        <div class="a-grid3 times">
          <label class="a-field">
            <span class="lbl">Event Date *</span>
            <input v-model="form.date" type="date" :aria-invalid="!!errors.date" />
            <span v-if="errors.date" class="err">{{ errors.date }}</span>
            <span v-else class="hint">{{ form.date ? new Date(form.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date' }}</span>
          </label>
          <label class="a-field">
            <span class="lbl">Door Time *</span>
            <input v-model="form.doors" type="time" />
            <span class="hint">Gates open</span>
          </label>
          <label class="a-field">
            <span class="lbl">Showtime *</span>
            <input v-model="form.time" type="time" />
            <span class="hint">Show starts</span>
          </label>
        </div>

        <div class="feature">
          <div>
            <b><AppIcon name="zap" /> Feature on Homepage Hero Banner</b>
            <p>Displays a high-visibility banner on the Manila homepage carousel.</p>
          </div>
          <button type="button" class="a-switch" role="switch" :aria-checked="form.featured" aria-label="Feature on homepage hero banner" @click="form.featured = !form.featured" />
        </div>

        <label class="a-field">
          <span class="lbl">Event Description *<span class="count" :class="{ bad: descLen < MIN_DESCRIPTION }">{{ descLen }} / {{ MIN_DESCRIPTION }} min characters</span></span>
          <textarea v-model="form.description" rows="5" :aria-invalid="descShort" aria-describedby="desc-err" />
        </label>
        <p v-if="descShort" id="desc-err" class="a-note bad" role="alert">
          <AppIcon name="triangle-alert" size="20" />
          <span>Description must be at least {{ MIN_DESCRIPTION }} characters before the event can be published. Currently {{ descLen }} characters.</span>
        </p>
      </form>

      <section class="a-card cap">
        <header>
          <h2><AppIcon name="chart-line" /> Arena Capacity Overview</h2>
          <span class="tgt">Configured: {{ cap.assigned }} / {{ SEATS_PER_EVENT }} seats ({{ Math.round(pct(cap.assigned)) }}%)</span>
        </header>
        <div class="seg" role="img" :aria-label="`${cap.sold} sold, ${cap.held} held, ${cap.open} open, ${cap.unassigned} not for sale`">
          <i :style="{ width: pct(cap.sold) + '%', background: 'var(--primary-strong)' }" />
          <i :style="{ width: pct(cap.held) + '%', background: 'var(--gold)' }" />
          <i :style="{ width: pct(cap.open) + '%', background: 'var(--secondary)' }" />
        </div>
        <ul class="legend">
          <li><i style="background: var(--primary-strong)" /> SOLD <b>{{ cap.sold }}</b></li>
          <li><i style="background: var(--gold)" /> HELD <b>{{ cap.held }}</b></li>
          <li><i style="background: var(--secondary)" /> OPEN <b>{{ cap.open }}</b></li>
          <li><i style="background: var(--text-subtle)" /> NOT FOR SALE <b>{{ cap.unassigned }}</b></li>
        </ul>
      </section>
    </div>

    <aside class="right">
      <section class="a-card hero">
        <header>
          <h3><AppIcon name="image" size="20" /> Hero Banner &amp; Poster (16:9) *</h3>
          <span class="a-pill cyan nodot sm">1920×1080</span>
        </header>
        <figure>
          <img :src="heroSrc" alt="Hero banner preview" />
          <span class="tagline">MAIN HERO ASSET</span>
          <figcaption><span>{{ hero.name || 'Current hero image' }}</span><span>{{ hero.size }}</span></figcaption>
        </figure>
        <label class="a-btn sm pick">
          <AppIcon name="image" /> Replace hero image
          <input type="file" accept="image/png,image/jpeg" @change="onHero" />
        </label>
        <span v-if="errors.image" class="err" role="alert">{{ errors.image }}</span>
        <p class="help">PNG, JPG up to 10MB • Recommended 1920×1080px resolution with central focus for responsive mobile cropping.</p>
        <div class="poster">
          <span class="thumb"><img v-if="poster.url" :src="poster.url" alt="Mobile poster preview" /><AppIcon v-else name="image" size="22" /></span>
          <div>
            <b>Mobile 3:4 Portrait Poster</b>
            <small>{{ poster.name || 'Optional — used by the mobile app' }}</small>
          </div>
          <label class="edit" aria-label="Choose mobile poster"><AppIcon name="pencil" /><input type="file" accept="image/png,image/jpeg" @change="onPoster" /></label>
        </div>
        <span v-if="errors.poster" class="err" role="alert">{{ errors.poster }}</span>
        <p class="help">Images are previewed only. Saving them needs the API.</p>
      </section>

      <section class="a-card gates">
        <header>
          <h3><AppIcon name="door-open" size="22" /> Gates &amp; Entry Notes</h3>
          <span class="venue-tag">Bayview Arena</span>
        </header>
        <div class="note"><i /><div><b>Gate 1 VIP Express Lane</b><p>Includes a dedicated soundcheck holding bay and red-carpet security bypass.</p></div></div>
        <div class="note"><i /><div><b>Turnstile NFC &amp; Dynamic QR Auto-Sync</b><p>Prevents ticket resale fraud with rolling 15-second barcode refreshes.</p></div></div>
      </section>

      <section class="a-card arena">
        <header><small>ARENA CONFIGURATION</small><b>HORSESHOE STAGE</b></header>
        <figure>
          <img :src="mapImg" alt="Map showing Bayview Arena in Pasay City" loading="lazy" />
          <span><AppIcon name="map-pin" /> Bayview Arena • Pasay City</span>
        </figure>
      </section>
    </aside>
  </div>

  <!-- ===== Tab 2: Text & Policies ===== -->
  <form v-else class="a-card policies" novalidate @submit.prevent="save">
    <header>
      <h2><AppIcon name="file-text" size="26" /> Text &amp; Policies</h2>
      <small>Shown on the public event page</small>
    </header>
    <label class="a-field"><span class="lbl">FAQ<span v-if="!form.faq.trim()" class="count bad">Empty</span></span><textarea v-model="form.faq" rows="5" /></label>
    <label class="a-field"><span class="lbl">Exchange &amp; refund policy<span v-if="!form.policy.trim()" class="count bad">Empty</span></span><textarea v-model="form.policy" rows="5" /></label>
    <label class="a-field"><span class="lbl">Ways to buy<span v-if="!form.waysToBuy.trim()" class="count bad">Empty</span></span><textarea v-model="form.waysToBuy" rows="3" /></label>
    <div class="a-actions">
      <button class="a-btn primary" type="submit"><AppIcon name="save" /> {{ form.status === 'published' ? 'Save Changes' : 'Save Draft' }}</button>
      <RouterLink :to="isNew ? '/admin/events/new' : `/admin/events/${form.id}/edit`" class="a-btn">Back to details</RouterLink>
    </div>
  </form>

  <p class="foot"><AppIcon name="lock-keyhole" size="20" /> Arena seating allocation is securely held. All draft changes remain sandboxed until published.</p>
</template>

<style scoped>
.ed { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.left, .right { display: flex; flex-direction: column; gap: 24px; min-width: 0; }
.info { padding: 28px; }
.info header, .policies header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.info h2, .policies h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 30px; font-weight: 500; color: var(--text); }
.info h2 svg, .policies h2 svg { color: var(--primary); }
.info header small, .policies header small { font-size: 14px; color: var(--text-muted); }
.inp { position: relative; display: flex; align-items: center; }
.inp input, .inp select { flex: 1; }
.inp.lead > svg { position: absolute; left: 16px; color: var(--text-subtle); pointer-events: none; }
.inp.lead input, .inp.lead select { padding-left: 46px; }
.inp .tick { position: absolute; right: 16px; color: var(--secondary); }
.a-field .ok { margin-left: auto; }
.venue-note { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 400; color: var(--secondary); }
.genres { display: flex; flex-wrap: wrap; gap: 10px; }
.gchip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--radius-pill); background: rgba(160, 120, 255, 0.18); color: var(--primary); font-size: 14px; font-weight: 500; }
.gchip button { display: grid; place-items: center; color: inherit; }
.gnew { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--radius-pill); background: var(--surface); font-size: 14px; font-weight: 500; color: var(--text-muted); }
.gadd input { padding: 8px 14px !important; width: 150px !important; border-radius: var(--radius-pill) !important; font-size: 14px !important; }
.feature { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; padding: 18px 20px; border-radius: var(--radius); background: var(--surface); }
.feature b { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; }
.feature b svg { color: var(--primary); }
.feature p { margin-top: 6px; font-size: 15px; line-height: 1.5; color: var(--text-muted); }
.count { margin-left: auto; font-size: 13px; font-weight: 500; color: var(--text-muted); }
.count.bad { color: var(--gold); }
.times .a-field { margin-bottom: 20px; }
.cap { padding: 22px 24px; }
.cap header, .gates header, .hero header, .arena header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.cap h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 18px; font-weight: 500; }
.cap h2 svg { color: var(--secondary); }
.tgt { font-size: 14px; color: var(--secondary); font-weight: 500; }
.seg { display: flex; height: 14px; margin: 18px 0 14px; border-radius: 7px; overflow: hidden; background: var(--surface); }
.seg i { display: block; height: 100%; }
.legend { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px 24px; flex-wrap: wrap; font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); }
.legend i { display: inline-block; width: 9px; height: 9px; margin-right: 8px; border-radius: 50%; }
.legend b { margin-left: 6px; color: var(--text); }
.hero, .gates, .arena { padding: 22px 24px; }
.hero { display: flex; flex-direction: column; gap: 14px; }
.hero h3, .gates h3 { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; font-family: var(--font-body); }
.hero h3 svg { color: var(--primary); }
.a-pill.sm { padding: 4px 12px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; }
.hero figure { position: relative; margin: 0; border-radius: var(--radius); overflow: hidden; aspect-ratio: 16 / 9; background: var(--surface-lowest); }
.hero figure img { width: 100%; height: 100%; object-fit: cover; }
.tagline { position: absolute; top: 14px; left: 14px; padding: 5px 10px; border-radius: var(--radius-sm); background: rgba(12, 14, 23, 0.7); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; }
.hero figcaption { position: absolute; inset: auto 0 0 0; display: flex; justify-content: space-between; gap: 8px; padding: 28px 14px 12px; background: linear-gradient(transparent, rgba(12, 14, 23, 0.85)); font-size: 14px; }
.pick { align-self: flex-start; position: relative; cursor: pointer; }
.pick input, .edit input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.help { font-size: 15px; line-height: 1.5; color: var(--text-muted); }
.err { color: var(--danger); font-size: 13px; }
.poster { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--radius); background: var(--surface-lowest); }
.thumb { width: 52px; height: 68px; flex: none; display: grid; place-items: center; border-radius: 8px; overflow: hidden; background: var(--surface); color: var(--text-subtle); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.poster > div { flex: 1; min-width: 0; }
.poster b { display: block; font-size: 16px; }
.poster small { display: block; margin-top: 2px; font-size: 14px; color: var(--secondary); }
.edit { position: relative; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; background: var(--surface); cursor: pointer; }
.venue-tag { font-size: 13px; color: var(--secondary); font-weight: 500; }
.gates header { margin-bottom: 14px; }
.note { display: flex; gap: 12px; margin-top: 10px; padding: 14px 16px; border-radius: var(--radius); background: var(--surface); }
.note i { flex: none; width: 14px; height: 14px; margin-top: 3px; border-radius: 3px; background: var(--secondary); }
.note b { font-size: 16px; font-weight: 600; }
.note p { margin-top: 4px; font-size: 15px; line-height: 1.5; color: var(--text-muted); }
.arena header { margin-bottom: 14px; }
.arena small { font-size: 13px; letter-spacing: 0.08em; color: var(--text-muted); }
.arena header b { font-size: 12px; letter-spacing: 0.06em; color: var(--gold); }
.arena figure { position: relative; margin: 0; border-radius: var(--radius); overflow: hidden; aspect-ratio: 16 / 7; }
.arena figure img { width: 100%; height: 100%; object-fit: cover; }
.arena figure span { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: var(--radius-pill); background: rgba(12, 14, 23, 0.85); font-size: 14px; white-space: nowrap; }
.arena figure span svg { color: var(--secondary); }
.policies { max-width: 880px; padding: 28px; }
.foot { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding: 18px 22px; border-radius: var(--radius); background: var(--surface-low); font-size: 16px; color: var(--text-muted); }
.foot svg { color: var(--secondary); flex: none; }
@media (max-width: 1100px) {
  .ed { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .info, .policies { padding: 20px 16px; }
  .info h2, .policies h2 { font-size: 24px; }
  .hero, .gates, .arena, .cap { padding: 18px 16px; }
}
</style>
