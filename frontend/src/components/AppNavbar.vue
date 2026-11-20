<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { auth, signOut } from '../stores/auth'
const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)
const out = () => {
  signOut()
  menuOpen.value = false
  router.push('/')
}
watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)
</script>

<template>
  <header class="nav">
    <div class="container nav-inner">
      <RouterLink to="/" class="logo">SPOTLIGHT<span class="dot" /></RouterLink>
      <nav class="links">
        <RouterLink to="/events" active-class="active">Events</RouterLink>
        <RouterLink to="/vip" active-class="active">VIP</RouterLink>
        <RouterLink to="/events" class="venues">Venues</RouterLink>
      </nav>
      <label class="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input type="search" placeholder="Search artist or event..." />
      </label>
      <div class="actions">
        <span class="currency">₱ PHP</span>
        <div class="desk-only">
          <RouterLink v-if="auth.user?.role === 'admin'" to="/admin" class="signin">Admin</RouterLink>
          <template v-if="!auth.user">
            <RouterLink to="/login" class="signin">Sign in</RouterLink>
            <RouterLink to="/register" class="btn btn-primary">Register</RouterLink>
          </template>
          <button v-else type="button" class="signin" @click="out">Sign out</button>
        </div>
        <RouterLink :to="auth.user ? '/account/profile' : '/login'" class="avatar" aria-label="My account">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
        </RouterLink>
        <button type="button" class="burger" :aria-expanded="menuOpen" aria-controls="mobile-menu" aria-label="Menu" @click="menuOpen = !menuOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path v-if="!menuOpen" d="M4 7h16M4 12h16M4 17h16" /><path v-else d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
    </div>
    <nav v-if="menuOpen" id="mobile-menu" class="mobile-menu" aria-label="Main menu">
      <RouterLink to="/events">Events</RouterLink>
      <RouterLink to="/vip">VIP</RouterLink>
      <RouterLink to="/events">Venues</RouterLink>
      <RouterLink v-if="auth.user" to="/account/tickets">My Tickets</RouterLink>
      <RouterLink v-if="auth.user?.role === 'admin'" to="/admin">Admin</RouterLink>
      <template v-if="!auth.user">
        <RouterLink to="/login">Sign in</RouterLink>
        <RouterLink to="/register" class="btn btn-primary">Register</RouterLink>
      </template>
      <button v-else type="button" @click="out">Sign out</button>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 20;
  height: 80px;
  background: rgba(17, 19, 28, 0.6);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(73, 68, 84, 0.3);
}
.nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
}
.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.08em;
  display: flex;
  align-items: flex-start;
  gap: 3px;
}
.dot {
  width: 6px;
  height: 6px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--primary-strong);
}
.links {
  display: flex;
  gap: 4px;
}
.links a {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-subtle);
}
.links a.active {
  background: var(--surface);
  color: var(--text);
}
.search {
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--surface-low);
  color: var(--text-subtle);
}
.search input {
  flex: 1;
  background: none;
  border: 0;
  outline: 0;
  color: var(--text);
  font: inherit;
  font-size: 13px;
}
.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}
.currency {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--gold);
  font-size: 11px;
  font-weight: 600;
}
.avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
  color: var(--primary);
}
.desk-only {
  display: flex;
  align-items: center;
  gap: 16px;
}
.signin {
  white-space: nowrap;
}
.burger {
  display: none;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
}
.mobile-menu {
  display: none;
}
@media (max-width: 900px) {
  .links,
  .search,
  .currency {
    display: none;
  }
}
@media (max-width: 760px) {
  .nav-inner {
    gap: 12px;
  }
  .desk-only {
    display: none;
  }
  .burger {
    display: grid;
  }
  .actions {
    gap: 10px;
  }
  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 16px 16px;
    background: rgba(17, 19, 28, 0.97);
    border-bottom: 1px solid rgba(73, 68, 84, 0.4);
  }
  .mobile-menu a,
  .mobile-menu button {
    padding: 14px 12px;
    border-radius: var(--radius);
    font-size: 15px;
    font-weight: 500;
    text-align: left;
    color: var(--text-muted);
  }
  .mobile-menu a.router-link-active {
    background: var(--surface);
    color: var(--text);
  }
  .mobile-menu .btn {
    justify-content: center;
    color: var(--on-primary);
    margin-top: 6px;
  }
}
</style>
