<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth, signOut, updateProfile } from '../stores/auth'
import { booking } from '../stores/booking'
const router = useRouter()
const user = computed(() => auth.user)
const form = reactive({
  first: user.value?.firstName ?? 'Beatriz',
  last: user.value?.lastName ?? 'Alonzo',
  phone: user.value?.phone ?? '917 882 4491',
})
const email = computed(() => user.value?.email ?? 'beatriz.alonzo@gmail.com')
const saved = ref(false)
const err = reactive({})
const pw = reactive({ current: '', next: '', confirm: '' })
const pwShow = ref(false)
const pwMsg = ref('')
const len = computed(() => pw.next.length >= 8)
const sym = computed(() => /[\d\W]/.test(pw.next))
const passes = computed(() => (booking.orders.length ? booking.orders.reduce((n, o) => n + o.tickets.length, 0) : 2))
const save = () => {
  Object.keys(err).forEach((k) => delete err[k])
  if (!form.first.trim()) err.first = 'First name is required.'
  if (!form.last.trim()) err.last = 'Last name is required.'
  if (!/^\d[\d\s]{8,12}$/.test(form.phone.trim())) err.phone = 'Enter a valid mobile number.'
  if (Object.keys(err).length) return
  updateProfile({ firstName: form.first, lastName: form.last, phone: form.phone })
  saved.value = true
}
const changePw = () => {
  pwMsg.value = ''
  if (!pw.current) pwMsg.value = 'Enter your current password.'
  else if (!len.value || !sym.value) pwMsg.value = 'New password does not meet the criteria.'
  else if (pw.next !== pw.confirm) pwMsg.value = 'Passwords do not match.'
  else {
    pwMsg.value = 'Password updated (front-end preview only).'
    pw.current = pw.next = pw.confirm = ''
  }
}
const out = () => {
  signOut()
  router.push('/')
}
</script>

<template>
  <div class="page container">
    <nav class="crumbs"><RouterLink to="/">Home</RouterLink> / <RouterLink to="/account/tickets">Account</RouterLink> / <b>Profile Settings</b></nav>

    <section class="profile">
      <div class="av">{{ form.first[0] }}{{ form.last[0] }}</div>
      <div>
        <h1>{{ form.first }} {{ form.last }} <em><AppIcon name="star" filled /> Spotlight VIP Fan</em><em class="g">Member since 2024</em></h1>
        <p><AppIcon name="circle" filled size="8" /> {{ passes }} Active Digital Passes on Metro Manila Nodes • SEC-ID: #MNL-88241</p>
      </div>
      <div class="stats"><div><small>RESERVED PASSES</small><b>{{ passes }} Floor</b></div><div><small>FAN POINTS</small><b class="gd">4,850 pts</b></div></div>
    </section>

    <div class="layout">
      <aside>
        <div class="menu">
          <small>ACCOUNT MANAGEMENT</small>
          <RouterLink to="/account/tickets"><AppIcon name="ticket" /> My Tickets <span>{{ passes }} Active</span></RouterLink>
          <a class="on"><AppIcon name="user" /> Profile Settings <AppIcon name="chevron-right" /></a>
          <a><AppIcon name="credit-card" /> Payment Methods <i>GCash/Cards</i></a>
          <a><AppIcon name="bell" /> Alerts &amp; Drops</a>
          <hr />
          <a @click="out"><AppIcon name="log-out" /> Sign Out</a>
        </div>
        <div class="shield"><span><AppIcon name="shield-check" /></span><div><b>Turnstile Fraud Shield</b><p>Your mobile phone and profile name are synchronized with turnstile scanners across MOA Arena and Smart Araneta Coliseum.</p></div></div>
      </aside>

      <main>
        <div v-if="saved" class="ok" role="status"><AppIcon name="check" /> <b>Saved:</b> Your personal profile details have been successfully updated. <button type="button" aria-label="Dismiss" @click="saved = false"><AppIcon name="x" /></button></div>

        <form class="card" novalidate @submit.prevent="save">
          <div class="h"><span class="ic"><AppIcon name="id-card" /></span><div><h2>Personal Information</h2><p>Manage your personal details used for e-ticket delivery and gate security turnstile verification.</p></div><em class="kyc">KYC Tier: Verified</em></div>
          <div class="two">
            <label>First Name<input v-model="form.first" :aria-invalid="!!err.first" /><small v-if="err.first">{{ err.first }}</small></label>
            <label>Last Name<input v-model="form.last" :aria-invalid="!!err.last" /><small v-if="err.last">{{ err.last }}</small></label>
            <label>Mobile Phone Number<span class="in"><b>PH +63</b><input v-model="form.phone" inputmode="tel" :aria-invalid="!!err.phone" /></span><small v-if="err.phone">{{ err.phone }}</small></label>
            <label><span>Email Address <AppIcon name="lock" /></span><span class="in lock"><input :value="email" disabled /></span></label>
          </div>
          <p class="info">ⓘ Email cannot be edited directly as it is bound to active digital tickets and turnstile QR passes. To update your authenticated login address, please submit a verified ticket custody transfer request to <b>Spotlight Security Desk</b>.</p>
          <div class="fr"><small>Changes apply immediately across all authorized mobile wallets.</small><button class="btn btn-primary" type="submit"><AppIcon name="save" /> Save Changes</button></div>
        </form>

        <form class="card" novalidate @submit.prevent="changePw">
          <div class="h"><span class="ic"><AppIcon name="shield-check" /></span><div><h2>Security &amp; Password</h2><p>Ensure your account is protected with a strong, unique password.</p></div><em class="kyc grey">Updated 3 mos ago</em></div>
          <label>Current Password<span class="in"><input v-model="pw.current" :type="pwShow ? 'text' : 'password'" autocomplete="current-password" /></span></label>
          <div class="two">
            <label>New Password<span class="in"><input v-model="pw.next" :type="pwShow ? 'text' : 'password'" placeholder="Enter new password" autocomplete="new-password" /></span></label>
            <label>Confirm New Password<span class="in"><input v-model="pw.confirm" :type="pwShow ? 'text' : 'password'" placeholder="Re-type new password" autocomplete="new-password" /><button type="button" :aria-label="pwShow ? 'Hide passwords' : 'Show passwords'" @click="pwShow = !pwShow"><AppIcon :name="pwShow ? 'eye-off' : 'eye'" /></button></span></label>
          </div>
          <div class="crit"><b>SECURITY CRITERIA:</b><span :class="{ y: len }"><AppIcon :name="len ? 'check' : 'circle'" /> At least 8 characters length</span><span :class="{ y: sym }"><AppIcon :name="sym ? 'check' : 'circle'" /> Include at least one number or symbol</span></div>
          <div class="fr"><small :class="{ e: pwMsg && !pwMsg.startsWith('Password updated') }">{{ pwMsg || 'You will be required to authenticate via SMS 2FA code.' }}</small><button class="btn alt" type="submit"><AppIcon name="key-round" /> Update Password</button></div>
        </form>

        <div class="next"><span class="th"><AppIcon name="mic" /></span><div><small>NEXT LIVE EVENT <AppIcon name="circle" filled size="8" /></small><b>Aria Vale: City Lights Tour</b><p>Sat, Feb 14, 2027 • Bayview Arena • <em>{{ passes }} Floor Seats Reserved</em></p></div><RouterLink to="/account/tickets" class="btn tix">View Tickets &amp; QR Codes <AppIcon name="arrow-right" /></RouterLink></div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page { padding-top: 96px; padding-bottom: 64px; }
.crumbs { font-size: 11px; color: var(--text-subtle); margin-bottom: 12px; }
.crumbs b { color: var(--text); font-weight: 500; }
.profile { display: flex; align-items: center; gap: 18px; padding: 22px 24px; border-radius: var(--radius-lg); background: var(--surface-low); border-top: 3px solid; border-image: linear-gradient(90deg, var(--secondary), var(--primary-strong), var(--gold)) 1; margin-bottom: 24px; }
.av { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #2a2c46; border: 2px solid var(--primary-strong); font-family: var(--font-display); font-size: 22px; }
h1 { font-family: var(--font-display); font-size: 32px; }
h1 em { margin-left: 8px; padding: 3px 10px; border-radius: var(--radius-pill); background: rgba(202,129,0,.3); color: var(--gold); font-family: var(--font-body); font-size: 10px; font-style: normal; vertical-align: 6px; }
h1 em.g { background: var(--surface); color: var(--text-muted); }
.profile p { margin-top: 4px; font-size: 12px; color: var(--text-muted); }
.stats { margin-left: auto; display: flex; padding: 10px 20px; border-radius: var(--radius); background: rgba(12,14,23,.7); gap: 22px; }
.stats small { display: block; font-size: 9px; letter-spacing: .08em; color: var(--text-subtle); }
.stats b { font-family: var(--font-display); font-size: 17px; }
.gd { color: var(--gold); }
.layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; align-items: start; }
aside { display: flex; flex-direction: column; gap: 16px; }
.menu { padding: 12px; border-radius: var(--radius-lg); background: var(--surface-low); }
.menu small { display: block; padding: 4px 10px 10px; font-size: 9px; letter-spacing: .1em; color: var(--text-subtle); }
.menu a { display: flex; justify-content: flex-start; gap: 10px; align-items: center; padding: 12px 14px; border-radius: var(--radius); font-size: 13px; color: var(--text-muted); cursor: pointer; }
.menu a > :last-child:not(:first-child) { margin-left: auto; }
.menu a.on { background: var(--surface); color: var(--text); font-weight: 600; box-shadow: inset 3px 0 var(--primary-strong); }
.menu span { padding: 2px 8px; border-radius: var(--radius-pill); background: var(--surface); font-size: 10px; }
.menu i { font-size: 10px; font-style: normal; color: var(--text-subtle); }
.menu hr { border: 0; border-top: 1px solid rgba(73,68,84,.3); margin: 8px 0; }
.shield { display: flex; gap: 12px; padding: 16px; border-radius: var(--radius-lg); background: var(--surface-lowest); font-size: 12px; }
.shield p { margin-top: 6px; line-height: 1.5; color: var(--text-muted); }
main { display: flex; flex-direction: column; gap: 20px; }
.ok { display: flex; align-items: center; gap: 8px; padding: 14px 18px; border-radius: var(--radius); background: #14301f; color: #86efac; font-size: 13px; }
.ok button { margin-left: auto; color: var(--text-muted); }
.card { padding: 24px; border-radius: var(--radius-lg); background: var(--surface-low); display: flex; flex-direction: column; gap: 16px; border: 1px solid rgba(73,68,84,.25); }
.h { display: flex; align-items: center; gap: 12px; }
.h > div { flex: 1; }
.ic { font-size: 20px; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; background: var(--surface); }
h2 { font-family: var(--font-display); font-size: 20px; }
.h p { font-size: 12px; color: var(--text-subtle); }
.kyc { padding: 3px 10px; border-radius: var(--radius-sm); background: rgba(76,215,246,.15); color: var(--secondary); font-size: 10px; font-style: normal; font-weight: 600; }
.kyc.grey { background: var(--surface); color: var(--text-muted); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; }
input { padding: 14px 16px; border-radius: var(--radius); border: 1px solid transparent; background: var(--surface-lowest); color: var(--text); font: inherit; font-size: 14px; font-weight: 400; outline: 0; }
.in { display: flex; align-items: center; gap: 10px; padding: 0 16px 0 0; border-radius: var(--radius); background: var(--surface-lowest); border: 1px solid transparent; }
.in input { flex: 1; background: none; }
.in b { padding: 14px 12px; background: #20222c; border-radius: var(--radius) 0 0 var(--radius); font-size: 12px; font-weight: 500; }
.in button { color: var(--text-subtle); }
.in.lock input { color: var(--text-subtle); }
input:focus, .in:focus-within { border-color: var(--primary-strong); }
input[aria-invalid='true'] { border-color: var(--danger); }
small { font-size: 12px; color: var(--text-subtle); font-weight: 400; }
small.e, label small { color: var(--danger); }
.info { padding: 14px 16px; border-radius: var(--radius); background: var(--surface-lowest); font-size: 12px; line-height: 1.5; color: var(--text-muted); }
.info b { color: var(--primary); }
.fr { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.alt { background: var(--surface); color: var(--text); }
.crit { display: flex; flex-wrap: wrap; gap: 8px 32px; padding: 14px 16px; border-radius: var(--radius); background: var(--surface-lowest); font-size: 12px; color: var(--text-subtle); }
.crit b { flex-basis: 100%; font-size: 10px; letter-spacing: .06em; color: var(--text); }
.crit .y { color: var(--secondary); }
.next { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: var(--radius-lg); background: linear-gradient(90deg, rgba(76,215,246,.12), var(--surface-low)); border-left: 4px solid var(--secondary); }
.next > div { flex: 1; }
.next small { font-size: 10px; letter-spacing: .06em; color: var(--secondary); }
.next b { display: block; font-family: var(--font-display); font-size: 20px; }
.next p { font-size: 12px; color: var(--text-muted); }
.next em { color: var(--gold); font-style: normal; font-weight: 600; }
.th { font-size: 24px; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--surface); }
.tix { background: rgba(76,215,246,.15); color: var(--secondary); border-radius: var(--radius); }
@media (max-width: 960px) {
  .layout, .two { grid-template-columns: minmax(0, 1fr); }
  .profile, .fr, .next { flex-direction: column; align-items: flex-start; }
  .stats { margin-left: 0; }
}
</style>
