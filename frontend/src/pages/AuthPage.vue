<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { register, signIn } from '../stores/auth'
const route = useRoute()
const router = useRouter()
const mode = computed(() => (route.path === '/register' ? 'register' : 'login'))
const f = reactive({ first: '', last: '', email: '', phone: '', password: '', consent: false })
const errors = reactive({})
const show = ref(false)
const remember = ref(false)
const submit = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!/^\S+@\S+\.\S+$/.test(f.email)) errors.email = 'Enter a valid email address.'
  if (f.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (mode.value === 'register') {
    if (!f.first.trim()) errors.first = 'First name is required.'
    if (!f.last.trim()) errors.last = 'Last name is required.'
    if (!f.consent) errors.consent = 'Please accept the privacy notice to register.'
  }
  if (Object.keys(errors).length) return
  if (mode.value === 'register') register({ firstName: f.first, lastName: f.last, email: f.email, phone: f.phone })
  else signIn(f.email)
  router.push(route.query.next || '/')
}
</script>

<template>
  <div class="page">
    <div class="card">
      <span class="ico"><AppIcon name="ticket" /></span>
      <h1>SPOTLIGHT</h1>
      <p class="sub">Your Gateway to Live Arena Concerts in Manila</p>

      <div class="seg" role="tablist">
        <RouterLink to="/login" :class="{ on: mode === 'login' }" role="tab"><AppIcon name="log-in" /> Sign in</RouterLink>
        <RouterLink to="/register" :class="{ on: mode === 'register' }" role="tab"><AppIcon name="user" /> Create account</RouterLink>
      </div>

      <form novalidate @submit.prevent="submit">
        <div v-if="mode === 'register'" class="two">
          <label>FIRST NAME<input v-model="f.first" autocomplete="given-name" :aria-invalid="!!errors.first" /><small v-if="errors.first">{{ errors.first }}</small></label>
          <label>LAST NAME<input v-model="f.last" autocomplete="family-name" :aria-invalid="!!errors.last" /><small v-if="errors.last">{{ errors.last }}</small></label>
        </div>
        <label>EMAIL ADDRESS
          <span class="in"><AppIcon name="mail" /><input v-model="f.email" type="email" autocomplete="email" placeholder="e.g. beatriz.alonzo@gmail.com" :aria-invalid="!!errors.email" /></span>
          <small v-if="errors.email">{{ errors.email }}</small>
        </label>
        <label v-if="mode === 'register'">MOBILE NUMBER
          <span class="in"><b>PH +63</b><input v-model="f.phone" inputmode="tel" placeholder="917 882 4491" /></span>
        </label>
        <label>
          <span class="lr">PASSWORD <a v-if="mode === 'login'" href="#">Forgot password?</a></span>
          <span class="in"><AppIcon name="lock" /><input v-model="f.password" :type="show ? 'text' : 'password'" autocomplete="current-password" placeholder="••••••••" :aria-invalid="!!errors.password" />
            <button type="button" :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show"><AppIcon :name="show ? 'eye-off' : 'eye'" /></button></span>
          <small v-if="errors.password">{{ errors.password }}</small>
        </label>

        <label v-if="mode === 'login'" class="chk"><input v-model="remember" type="checkbox" /> Remember this device for 30 days</label>
        <label v-else class="chk"><input v-model="f.consent" type="checkbox" /> I agree to the <RouterLink to="/privacy">Privacy Notice</RouterLink> (Data Privacy Act of 2012) and <RouterLink to="/terms">Terms</RouterLink>.</label>
        <small v-if="errors.consent" class="e">{{ errors.consent }}</small>

        <button class="btn btn-primary go" type="submit">{{ mode === 'login' ? 'SIGN IN TO SPOTLIGHT' : 'CREATE MY ACCOUNT' }} <AppIcon name="arrow-right" /></button>
        <p class="note"><AppIcon name="zap" /> Preparing for an active ticket queue? Keep your session active to retain priority seat selection.</p>
      </form>
      <p class="ssl"><AppIcon name="shield-check" /> 256-bit SSL encrypted connection • Verified Fan Protection</p>
    </div>
    <p class="partners">OFFICIAL TICKETING PARTNER: <span>Mall of Asia Arena</span><span>Smart Araneta Coliseum</span><span>Philippine Arena</span></p>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; padding: 120px 24px 48px; display: flex; flex-direction: column; align-items: center; background: radial-gradient(ellipse at 50% 20%, #2a2050, var(--bg) 60%); }
.card { width: 100%; max-width: 412px; padding: 32px 32px 0; border-radius: var(--radius-lg); background: rgba(29,31,41,.92); text-align: center; overflow: hidden; }
.ico { font-size: 22px; display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface); }
h1 { margin-top: 12px; font-family: var(--font-display); font-size: 26px; letter-spacing: .06em; }
.sub { margin-top: 6px; font-size: 13px; color: var(--text-muted); }
.seg { display: flex; margin: 24px 0; padding: 3px; border-radius: var(--radius-pill); background: var(--surface-lowest); }
.seg a { flex: 1; padding: 10px; border-radius: var(--radius-pill); font-size: 13px; font-weight: 600; }
.seg a.on { background: var(--primary-strong); color: var(--on-primary); }
form { text-align: left; display: flex; flex-direction: column; gap: 14px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 10px; letter-spacing: .08em; color: var(--text-muted); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
input { padding: 14px 16px; border-radius: var(--radius); border: 1px solid transparent; background: var(--surface-lowest); color: var(--text); font: inherit; font-size: 14px; letter-spacing: 0; outline: 0; }
.in { display: flex; align-items: center; gap: 10px; padding: 0 16px; border-radius: var(--radius); background: var(--surface-lowest); border: 1px solid transparent; color: var(--text-subtle); font-size: 14px; }
.in input { flex: 1; padding: 14px 0; background: none; }
.in b { font-size: 12px; font-weight: 500; color: var(--text-muted); }
.in button { color: var(--text-subtle); }
input:focus, .in:focus-within { border-color: var(--primary-strong); }
input[aria-invalid='true'] { border-color: var(--danger); }
.lr { display: flex; justify-content: space-between; }
.lr a { color: var(--primary); letter-spacing: 0; font-size: 11px; }
small, .e { color: var(--danger); font-size: 12px; letter-spacing: 0; }
.chk { flex-direction: row; align-items: center; gap: 8px; font-size: 13px; letter-spacing: 0; }
.chk a { text-decoration: underline; }
.go { justify-content: center; padding: 14px; letter-spacing: .04em; box-shadow: 0 0 20px rgba(160,120,255,.4); }
.note { padding: 14px; border-radius: var(--radius); background: #373943; font-size: 13px; line-height: 1.5; color: var(--text-muted); }
.ssl { margin: 24px -32px 0; padding: 14px; background: var(--surface-low); font-size: 11px; color: var(--text-subtle); }
.partners { margin-top: 32px; font-size: 10px; letter-spacing: .06em; color: var(--text-subtle); display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; }
.partners span { padding: 6px 12px; border-radius: var(--radius-sm); background: var(--surface); color: var(--text-muted); font-weight: 600; letter-spacing: 0; font-size: 11px; }
</style>
