<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="container grid">
      <div class="brand">
        <div class="logo">SPOTLIGHT<span class="dot" /></div>
        <p>Live Ticketing Manila. The premier real-time ticketing terminal for arena concerts, live electronic music, and stadium tours across the Philippines.</p>
        <span class="status"><i /> Live Seating Engine Active</span>
      </div>
      <div>
        <h4>Navigation</h4>
        <RouterLink to="/events">Events</RouterLink>
        <RouterLink to="/vip">VIP Access</RouterLink>
        <RouterLink to="/faq">About</RouterLink>
        <RouterLink to="/faq">FAQ</RouterLink>
      </div>
      <div>
        <h4>Manila Venues</h4>
        <RouterLink to="/events">Bayview Arena</RouterLink>
        <RouterLink to="/events">Harbor Theater</RouterLink>
        <RouterLink to="/events">All Metro Venues</RouterLink>
      </div>
      <div>
        <h4>Legal &amp; Policies</h4>
        <RouterLink to="/refund-policy">Refund Policy</RouterLink>
        <RouterLink to="/privacy">Privacy Policy</RouterLink>
        <RouterLink to="/terms">Terms of Service</RouterLink>
      </div>
      <div>
        <h4>Payment Methods</h4>
        <p class="small">Instant checkout with verified Philippine payment channels:</p>
        <div class="chips">
          <span>GCash</span><span>Maya</span><span>GrabPay</span><span>Visa / MC</span><span>BPI</span>
        </div>
      </div>
    </div>
    <div class="container bottom">
      <span>© 2025 Spotlight Live Philippines Inc. All rights reserved.</span>
      <span class="tz">Manila Standard Time (GMT+8)</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--surface-lowest);
  border-top: 1px solid rgba(73, 68, 84, 0.3);
  padding: 48px 0 24px;
  font-size: 13px;
  color: var(--text-subtle);
}
.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr 1.3fr;
  gap: 32px;
}
.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.08em;
  color: var(--text);
  margin-bottom: 12px;
}
.dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-left: 3px;
  border-radius: 50%;
  background: var(--primary-strong);
  vertical-align: super;
}
.brand p {
  line-height: 1.6;
  max-width: 260px;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: 11px;
  color: var(--text-muted);
}
.status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--secondary);
}
h4 {
  margin: 0 0 14px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
}
div > a {
  display: block;
  margin-bottom: 10px;
}
div > a:hover {
  color: var(--primary);
}
.small {
  line-height: 1.5;
  margin-bottom: 10px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chips span {
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--secondary);
  font-size: 11px;
  font-weight: 600;
}
.bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 16px 24px;
  border-radius: var(--radius);
  background: var(--surface-low);
  font-size: 12px;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .bottom {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
