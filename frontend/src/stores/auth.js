import { reactive } from 'vue'
const KEY = 'spotlight.user'
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null')
  } catch {
    return null
  }
}
export const auth = reactive({ user: read() })
const save = () => {
  try {
    if (auth.user) localStorage.setItem(KEY, JSON.stringify(auth.user))
    else localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable: session lasts until reload */
  }
}
// Front-end only: no password is stored or verified until the Express API exists.
// Any email containing "admin" signs in as the admin role so the admin screens can be previewed.
export function signIn(email) {
  const name = email.split('@')[0].replace(/[._]/g, ' ')
  const [first, ...rest] = name.split(' ')
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  auth.user = {
    firstName: cap(first || 'Guest'),
    lastName: cap(rest.join(' ') || 'User'),
    email,
    phone: '',
    role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
  }
  save()
}
export function register(u) {
  auth.user = { ...u, role: u.email.toLowerCase().includes('admin') ? 'admin' : 'customer' }
  save()
}
export function updateProfile(patch) {
  if (auth.user) {
    Object.assign(auth.user, patch)
    save()
  }
}
export function signOut() {
  auth.user = null
  save()
}
