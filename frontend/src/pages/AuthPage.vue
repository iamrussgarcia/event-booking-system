<script setup>
import AppIcon from '../components/AppIcon.vue'
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { register, signIn } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const mode = computed(() => (route.path === '/register' ? 'register' : 'login'))

const f = reactive({
  first: '',
  last: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  consent: false,
})
const errors = reactive({})
const formError = ref('')
const loading = ref(false)
const show = ref(false)
const showConfirm = ref(false)
const remember = ref(false)

const normalizePhone = (raw) => {
  let digits = String(raw || '').replace(/\s+/g, '')
  if (digits.startsWith('+63')) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

watch(
  () => ({ ...f }),
  (val) => {
    if (val.first.trim()) delete errors.first
    if (val.last.trim()) delete errors.last
    if (/^\S+@\S+\.\S+$/.test(val.email)) delete errors.email
    if (val.phone) {
      const clean = normalizePhone(val.phone)
      if (clean !== val.phone) f.phone = clean
      if (/^\d{9,13}$/.test(clean)) delete errors.phone
    }
    if (val.password.length >= 8 && /[0-9\W_]/.test(val.password)) delete errors.password
    if (val.confirmPassword && val.confirmPassword === val.password) delete errors.confirmPassword
    if (val.consent) delete errors.consent
  },
  { deep: true }
)

const submit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  formError.value = ''

  if (!/^\S+@\S+\.\S+$/.test(f.email)) errors.email = 'Enter a valid email address.'
  if (f.password.length < 8 || !/[0-9\W_]/.test(f.password)) {
    errors.password = 'Password must be at least 8 characters and include a number or symbol.'
  }

  let cleanPhone = ''
  if (mode.value === 'register') {
    if (!f.first.trim()) errors.first = 'First name is required.'
    if (!f.last.trim()) errors.last = 'Last name is required.'
    cleanPhone = normalizePhone(f.phone)
    if (!/^\d{9,13}$/.test(cleanPhone)) errors.phone = 'Phone must be 9 to 13 digits.'
    if (!f.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (f.confirmPassword !== f.password) {
      errors.confirmPassword = 'Passwords do not match.'
    }
    if (!f.consent) errors.consent = 'Please accept the privacy notice to register.'
  }

  if (Object.keys(errors).length) return

  loading.value = true
  try {
    if (mode.value === 'register') {
      await register({
        firstName: f.first.trim(),
        lastName: f.last.trim(),
        email: f.email.trim(),
        phone: cleanPhone,
        password: f.password,
        consent: f.consent,
      })
    } else {
      await signIn({ email: f.email.trim(), password: f.password })
    }
    router.push(route.query.next || '/')
  } catch (err) {
    const data = err?.response?.data || err
    const serverErrors = data?.errors
    if (serverErrors) {
      if (serverErrors.firstName) errors.first = serverErrors.firstName
      if (serverErrors.lastName) errors.last = serverErrors.lastName
      Object.assign(errors, serverErrors)
    } else {
      formError.value = data?.message || err?.message || 'Unable to connect to the server.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <span class="ico"><AppIcon name="ticket" /></span>
      <h1>SPOTLIGHT</h1>
      <p class="sub">Your Gateway to Live Arena Concerts in Manila</p>

      <div class="seg" role="tablist">
        <RouterLink to="/login" :class="{ on: mode === 'login' }" role="tab">
          <AppIcon name="log-in" /> Sign in
        </RouterLink>
        <RouterLink to="/register" :class="{ on: mode === 'register' }" role="tab">
          <AppIcon name="user" /> Create account
        </RouterLink>
      </div>

      <form novalidate @submit.prevent="submit">
        <div v-if="mode === 'register'" class="two">
          <label>
            FIRST NAME
            <input
              v-model="f.first"
              autocomplete="given-name"
              spellcheck="false"
              placeholder="Beatriz"
              :aria-invalid="!!errors.first"
            />
            <small v-if="errors.first">{{ errors.first }}</small>
          </label>
          <label>
            LAST NAME
            <input
              v-model="f.last"
              autocomplete="family-name"
              spellcheck="false"
              placeholder="Alonzo"
              :aria-invalid="!!errors.last"
            />
            <small v-if="errors.last">{{ errors.last }}</small>
          </label>
        </div>

        <label>
          EMAIL ADDRESS
          <span class="in">
            <AppIcon name="mail" />
            <input
              v-model="f.email"
              type="email"
              autocomplete="email"
              spellcheck="false"
              placeholder="e.g. beatriz.alonzo@gmail.com"
              :aria-invalid="!!errors.email"
            />
          </span>
          <small v-if="errors.email">{{ errors.email }}</small>
        </label>

        <label v-if="mode === 'register'">
          MOBILE NUMBER
          <span class="in">
            <b>PH +63</b>
            <input
              v-model="f.phone"
              inputmode="tel"
              placeholder="917 882 4491"
              :aria-invalid="!!errors.phone"
            />
          </span>
          <small v-if="errors.phone">{{ errors.phone }}</small>
        </label>

        <label>
          <span class="lr">
            PASSWORD
            <a v-if="mode === 'login'" href="#">Forgot password?</a>
          </span>
          <span class="in">
            <AppIcon name="lock" />
            <input
              v-model="f.password"
              :type="show ? 'text' : 'password'"
              :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
              placeholder="••••••••"
              :aria-invalid="!!errors.password"
            />
            <button
              type="button"
              :aria-label="show ? 'Hide password' : 'Show password'"
              @click="show = !show"
            >
              <AppIcon :name="show ? 'eye-off' : 'eye'" />
            </button>
          </span>
          <small v-if="errors.password">{{ errors.password }}</small>
        </label>

        <label v-if="mode === 'register'">
          CONFIRM PASSWORD
          <span class="in">
            <AppIcon name="lock" />
            <input
              v-model="f.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="••••••••"
              :aria-invalid="!!errors.confirmPassword"
            />
            <button
              type="button"
              :aria-label="showConfirm ? 'Hide confirm password' : 'Show confirm password'"
              @click="showConfirm = !showConfirm"
            >
              <AppIcon :name="showConfirm ? 'eye-off' : 'eye'" />
            </button>
          </span>
          <small v-if="errors.confirmPassword">{{ errors.confirmPassword }}</small>
        </label>

        <label v-if="mode === 'login'" class="chk">
          <input v-model="remember" type="checkbox" />
          <span>Remember this device for 30 days</span>
        </label>

        <label v-else class="chk">
          <input v-model="f.consent" type="checkbox" />
          <span>
            I agree to the
            <RouterLink to="/privacy">Privacy Notice</RouterLink>
            (Data Privacy Act of 2012) and
            <RouterLink to="/terms">Terms</RouterLink>.
          </span>
        </label>

        <small v-if="errors.consent" class="e">{{ errors.consent }}</small>
        <small v-if="formError" class="e">{{ formError }}</small>

        <button class="btn btn-primary go" type="submit" :disabled="loading">
          {{ loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN TO SPOTLIGHT' : 'CREATE MY ACCOUNT' }}
          <AppIcon name="arrow-right" />
        </button>

        <p class="note">
          <AppIcon name="zap" />
          <span>Preparing for an active ticket queue? Keep your session active to retain priority seat selection.</span>
        </p>
      </form>

      <p class="ssl">
        <AppIcon name="shield-check" /> 256-bit SSL encrypted connection • Verified Fan Protection
      </p>
    </div>

    <p class="partners">
      OFFICIAL TICKETING PARTNER:
      <span>Mall of Asia Arena</span>
      <span>Smart Araneta Coliseum</span>
      <span>Philippine Arena</span>
    </p>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 96px 20px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(ellipse at 50% 15%, #2d2058, var(--bg, #0d0e14) 62%);
}

.card {
  width: 100%;
  max-width: 440px;
  padding: 32px 28px 0;
  border-radius: var(--radius-lg);
  background: rgba(24, 26, 36, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  text-align: center;
  overflow: hidden;
}

.ico {
  font-size: 20px;
  display: inline-grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(160, 120, 255, 0.14);
  color: var(--primary);
}

h1 {
  margin-top: 12px;
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.08em;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.seg {
  display: flex;
  margin: 22px 0 24px;
  padding: 4px;
  border-radius: var(--radius-pill);
  background: var(--surface-lowest, #14151f);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.seg a {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  transition: background 0.15s ease, color 0.15s ease;
}

.seg a.on {
  background: var(--primary-strong);
  color: var(--on-primary);
}

form {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.two {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.two > label,
.two input {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 13px 14px;
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--surface-lowest, #14151f);
  color: var(--text, #f4f4f8);
  font: inherit;
  font-size: 14px;
  letter-spacing: 0;
  outline: 0;
  transition: border-color 0.15s ease;
}

input::placeholder {
  color: var(--text-subtle);
}

input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active,
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  background-color: var(--surface-lowest, #14151f) !important;
  background-image: none !important;
  color: var(--text, #f4f4f8) !important;
  -webkit-box-shadow: 0 0 0 1000px var(--surface-lowest, #14151f) inset !important;
  -webkit-text-fill-color: var(--text, #f4f4f8) !important;
  caret-color: var(--text, #f4f4f8);
  transition: background-color 9999s ease-in-out 0s;
}

.in {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: var(--radius);
  background: var(--surface-lowest, #14151f);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-subtle);
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.in input {
  flex: 1;
  padding: 13px 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.in b {
  flex-shrink: 0;
  padding-right: 8px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.in button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  color: var(--text-subtle);
}

input:focus,
.in:focus-within {
  border-color: var(--primary-strong);
}

input[aria-invalid='true'] {
  border-color: var(--danger);
}

.lr {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lr a {
  color: var(--primary);
  letter-spacing: 0;
  font-size: 11px;
}

small,
.e {
  color: var(--danger);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.35;
}

.chk {
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0;
  color: var(--text-muted);
}

.chk input[type='checkbox'] {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  padding: 0;
  accent-color: var(--primary-strong);
}

.chk span {
  flex: 1;
  min-width: 0;
}

.chk a {
  color: var(--text);
  text-decoration: underline;
}

.go {
  justify-content: center;
  gap: 8px;
  padding: 14px 18px;
  margin-top: 2px;
  font-weight: 600;
  letter-spacing: 0.04em;
  box-shadow: 0 0 24px rgba(160, 120, 255, 0.35);
}

.go:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--text-muted);
}

.ssl {
  margin: 22px -28px 0;
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: var(--text-subtle);
}

.partners {
  margin-top: 28px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-subtle);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.partners span {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0;
  font-size: 11px;
}
</style>