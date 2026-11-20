<script setup>
import AppIcon from '../../components/AppIcon.vue'
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { auth, signOut } from '../../stores/auth'
import { allOrders } from '../../stores/admin'

const router = useRouter()
const route = useRoute()
// Remount when switching between 'new event' and a saved event, but keep state when only the tab changes.
const viewKey = computed(() => `${route.path.split('/')[2] ?? ''}-${route.params.id ?? ''}`)
const q = ref('')
const out = () => {
  signOut()
  router.push('/login')
}
const search = () => router.push({ path: '/admin/orders', query: q.value.trim() ? { q: q.value.trim() } : {} })
const refunds = computed(() => allOrders.value.filter((o) => o.status === 'refund-review').length)
const links = [
  ['/admin', 'Dashboard', 'layout-dashboard'],
  ['/admin/events', 'Events', 'ticket'],
  ['/admin/orders', 'Orders', 'receipt'],
]
</script>

<template>
  <div class="shell">
    <aside class="side">
      <div class="brand">
        <RouterLink to="/admin" class="logo">SPOTLIGHT</RouterLink>
        <span class="mnl">MNL</span>
        <small>ADMIN CONSOLE</small>
      </div>
      <nav aria-label="Admin">
        <RouterLink
          v-for="[to, label, icon] in links"
          :key="to"
          :to="to"
          :exact-active-class="to === '/admin' ? 'on' : ''"
          :active-class="to === '/admin' ? '' : 'on'"
        >
          <AppIcon :name="icon" /> {{ label }}
        </RouterLink>
      </nav>
      <div class="side-foot">
        <RouterLink to="/" class="site"><AppIcon name="arrow-left" /> View public site</RouterLink>
        <button type="button" class="signout" @click="out"><AppIcon name="log-out" /> Sign out</button>
      </div>
    </aside>

    <div class="col">
      <header class="top">
        <span class="chip"><i class="dot" /> Systems Live</span>
        <span class="chip"><AppIcon name="clock" /> PHT (UTC+8) Manila</span>
        <form class="top-search" role="search" @submit.prevent="search">
          <AppIcon name="search" />
          <input v-model="q" type="search" placeholder="Search drops, orders, seats..." aria-label="Search orders" />
        </form>
        <RouterLink
          :to="{ path: '/admin/orders', query: { status: 'refund-review' } }"
          class="bell"
          :aria-label="refunds ? `${refunds} orders need a refund` : 'No orders need a refund'"
        >
          <AppIcon name="bell" size="20" />
          <b v-if="refunds">{{ refunds }}</b>
        </RouterLink>
        <div class="me">
          <span>
            <b>Admin {{ auth.user?.firstName }} {{ auth.user?.lastName }}</b>
            <small>Super Admin • Manila Ops</small>
          </span>
          <span class="avatar"><AppIcon name="user" size="20" /></span>
        </div>
      </header>
      <main><RouterView :key="viewKey" /></main>
    </div>
  </div>
</template>

<style>
/* ---- Admin shell + shared admin styles (unscoped on purpose so every admin page can use them) ---- */
.shell { display: grid; grid-template-columns: 248px minmax(0, 1fr); min-height: 100vh; background: var(--bg); position: relative; z-index: 30; }
.shell .side { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 28px; padding: 28px 18px 24px; background: var(--surface-lowest); border-right: 1px solid rgba(73,68,84,.25); }
.shell .brand { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 4px 8px; padding: 0 8px; }
.shell .logo { font-family: var(--font-display); font-weight: 700; font-size: 22px; letter-spacing: .12em; color: var(--primary); }
.shell .mnl { padding: 4px 10px; border-radius: var(--radius-sm); background: var(--surface); font-size: 11px; font-weight: 600; color: var(--text-muted); }
.shell .brand small { grid-column: 1 / -1; font-size: 11px; letter-spacing: .18em; color: var(--secondary); }
.shell .side nav { display: flex; flex-direction: column; gap: 6px; }
.shell .side nav a { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: var(--radius); font-size: 15px; font-weight: 500; color: var(--text); }
.shell .side nav a:hover { background: var(--surface-low); }
.shell .side nav a.on { background: var(--primary-strong); color: var(--on-primary); font-weight: 600; }
.shell .side-foot { margin-top: auto; display: flex; flex-direction: column; gap: 6px; }
.shell .side-foot a, .shell .side-foot button { display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-radius: var(--radius); font-size: 14px; text-align: left; }
.shell .side-foot .site { color: var(--text-subtle); }
.shell .side-foot .signout { color: var(--danger); }
.shell .side-foot a:hover, .shell .side-foot button:hover { background: var(--surface-low); }
.shell .col { min-width: 0; display: flex; flex-direction: column; }
.shell .top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 20px 32px 0; }
.shell .chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--radius-pill); background: var(--surface-low); font-size: 13px; color: var(--text-muted); white-space: nowrap; }
.shell .chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--secondary); }
.shell .top-search { flex: 1 1 260px; max-width: 460px; margin-left: auto; display: flex; align-items: center; gap: 10px; padding: 11px 18px; border-radius: var(--radius-pill); background: var(--surface-low); color: var(--text-subtle); }
.shell .top-search input { flex: 1; min-width: 0; background: none; border: 0; outline: 0; color: var(--text); font: inherit; font-size: 14px; }
.shell .bell { position: relative; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; color: var(--text-muted); }
.shell .bell:hover { background: var(--surface-low); }
.shell .bell b { position: absolute; top: 2px; right: 0; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--gold); color: var(--on-gold); font-size: 10px; display: grid; place-items: center; }
.shell .me { display: flex; align-items: center; gap: 12px; text-align: right; }
.shell .me b { display: block; font-size: 14px; font-weight: 600; }
.shell .me small { display: block; font-size: 12px; color: var(--text-subtle); }
.shell .avatar { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; background: var(--primary); color: var(--on-primary); }
.shell main { padding: 24px 32px 64px; min-width: 0; }

/* page headings */
.a-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; letter-spacing: .14em; color: var(--secondary); text-transform: uppercase; }
.a-eyebrow i { width: 7px; height: 7px; border-radius: 50%; background: var(--secondary); }
.a-crumb { font-size: 13px; color: var(--text-muted); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.a-crumb b { color: var(--primary); font-weight: 600; }
.a-title { margin: 4px 0 0; font-family: var(--font-display); font-weight: 800; font-size: clamp(34px, 4.4vw, 52px); letter-spacing: -.02em; line-height: 1.05; }
.a-lead { margin-top: 12px; max-width: 520px; font-size: 16px; line-height: 1.55; color: var(--text-muted); }
.a-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
.a-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

/* buttons */
.a-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 20px; border-radius: var(--radius-pill); background: var(--surface); border: 1px solid rgba(73,68,84,.35); font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; transition: filter .15s; }
.a-btn:hover:not(:disabled):not([aria-disabled='true']) { filter: brightness(1.2); }
.a-btn:disabled, .a-btn[aria-disabled='true'] { opacity: .45; cursor: not-allowed; }
.a-btn.primary { background: var(--primary); border-color: transparent; color: var(--on-primary); box-shadow: 0 0 24px rgba(208,188,255,.3); }
.a-btn.gold { background: var(--gold); border-color: transparent; color: var(--on-gold); }
.a-btn.danger { color: var(--danger); }
.a-btn.sm { padding: 7px 14px; font-size: 12px; }
.a-btn .tag { padding: 2px 8px; border-radius: var(--radius-sm); background: var(--surface-lowest); font-size: 11px; color: var(--text-subtle); font-weight: 500; }

/* cards + tables */
.a-card { padding: 20px 24px; border-radius: 20px; background: var(--surface-low); border: 1px solid rgba(73,68,84,.22); }
.a-card > h2, .a-h2 { font-family: var(--font-display); font-size: 22px; font-weight: 600; }
.a-scroll { overflow-x: auto; }
.a-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.a-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: .1em; color: var(--text-muted); white-space: nowrap; border-bottom: 1px solid rgba(73,68,84,.3); }
.a-table td { padding: 16px; border-bottom: 1px solid rgba(73,68,84,.16); vertical-align: middle; }
.a-table tbody tr:last-child td { border-bottom: 0; }
.a-sub { display: block; font-size: 12px; color: var(--text-subtle); }
.a-empty { padding: 36px; text-align: center; color: var(--text-subtle); }

/* pills + badges */
.a-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: var(--radius-pill); background: var(--surface); font-size: 12px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
.a-pill::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.a-pill.nodot::before { display: none; }
.a-pill.cyan { background: rgba(76,215,246,.12); color: var(--secondary); }
.a-pill.primary { background: rgba(160,120,255,.2); color: var(--primary); }
.a-pill.gold { background: rgba(255,185,95,.16); color: var(--gold); }
.a-pill.danger { background: var(--danger-bg); color: var(--danger); }
.a-pill.muted { background: var(--surface); color: var(--text-muted); }
.a-chip-sm { display: inline-block; padding: 3px 10px; border-radius: var(--radius-sm); background: var(--surface); font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--primary); text-transform: uppercase; }

/* progress bars */
.a-bar { height: 5px; border-radius: 3px; background: var(--surface); overflow: hidden; }
.a-bar > i { display: block; height: 100%; border-radius: 3px; background: var(--c, var(--primary-strong)); }

/* forms */
.a-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; font-size: 14px; font-weight: 600; }
.a-field > span.lbl { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.a-input, .a-field input:not([type='checkbox']):not([type='color']):not([type='file']), .a-field select, .a-field textarea { width: 100%; padding: 14px 18px; border-radius: var(--radius); border: 1px solid transparent; background: var(--surface-lowest); color: var(--text); font: inherit; font-size: 16px; font-weight: 400; outline: 0; }
.a-field input:focus, .a-field select:focus, .a-field textarea:focus, .a-input:focus { border-color: var(--primary-strong); }
.a-field textarea { min-height: 120px; resize: vertical; line-height: 1.5; }
.a-field [aria-invalid='true'] { border-color: #ffb4ab; background: rgba(147,0,10,.25); }
.a-field .hint { font-size: 12px; font-weight: 400; color: var(--text-subtle); }
.a-field .err { color: var(--danger); font-weight: 500; font-size: 13px; }
.a-field .ok { color: var(--secondary); font-size: 13px; font-weight: 500; display: inline-flex; gap: 6px; align-items: center; }
.a-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.a-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }

/* banners */
.a-note { display: flex; gap: 12px; align-items: flex-start; padding: 14px 18px; border-radius: var(--radius); background: var(--surface); font-size: 14px; line-height: 1.5; color: var(--text-muted); margin-bottom: 20px; }
.a-note > svg { margin-top: 3px; }
.a-note.good { background: #14301f; color: #86efac; }
.a-note.bad { background: var(--danger-bg); color: var(--danger); }
.a-note.warn { background: rgba(255,185,95,.12); color: var(--gold); border: 1px solid rgba(255,185,95,.2); }
.a-note b { color: inherit; }

/* toggle + tabs */
.a-switch { position: relative; flex: none; width: 52px; height: 30px; border-radius: 15px; background: var(--surface); transition: background .15s; }
.a-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: transform .15s; }
.a-switch[aria-checked='true'] { background: var(--primary-strong); }
.a-switch[aria-checked='true']::after { transform: translateX(22px); }
.a-tabs { display: inline-flex; flex-wrap: wrap; gap: 6px; padding: 6px; border-radius: 18px; background: var(--surface-low); }
.a-tabs a, .a-tabs span.off { display: inline-flex; align-items: center; gap: 10px; padding: 11px 18px; border-radius: 14px; font-size: 15px; font-weight: 600; color: var(--text-muted); }
.a-tabs a.on { background: var(--primary-strong); color: var(--on-primary); }
.a-tabs span.off { opacity: .45; cursor: not-allowed; }
.a-tabs .count { min-width: 22px; height: 22px; padding: 0 6px; display: inline-grid; place-items: center; border-radius: 11px; background: #ffb4ab; color: #690005; font-size: 11px; font-weight: 700; }
.a-tabs .tier { padding: 3px 9px; border-radius: var(--radius-sm); background: rgba(76,215,246,.15); color: var(--secondary); font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.a-tabs a.on .tier { background: rgba(52,0,128,.2); color: var(--on-primary); }

@media (max-width: 1100px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .shell .side { position: static; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px 20px; padding: 14px 16px; border-right: 0; border-bottom: 1px solid rgba(73,68,84,.25); }
  .shell .brand { grid-template-columns: auto auto; gap: 0 10px; padding: 0; }
  .shell .brand small { display: none; }
  .shell .side nav { flex-direction: row; flex-wrap: wrap; gap: 4px; }
  .shell .side nav a { padding: 10px 14px; font-size: 14px; }
  .shell .side-foot { margin: 0 0 0 auto; flex-direction: row; }
  .shell .side-foot a, .shell .side-foot button { padding: 10px 12px; font-size: 13px; }
  .shell .top { padding: 16px 16px 0; }
  .shell main { padding: 20px 16px 48px; }
  .shell .top-search { order: 5; flex-basis: 100%; max-width: none; margin-left: 0; }
  .shell .me { margin-left: auto; }
  .a-grid2, .a-grid3 { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .shell .me > span:first-child { display: none; }
  .shell .side-foot .site { display: none; }
  .a-btn { padding: 11px 16px; }
}
</style>
