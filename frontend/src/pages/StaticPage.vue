<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
const pages = {
  '/faq': {
    title: 'Frequently Asked Questions',
    body: [
      'You can buy up to 6 seats per order, and each seat becomes its own ticket with a QR image.',
      'Seats are held for 10 minutes once you continue to checkout. If the hold expires, the seats are released and you can start again.',
      'Payments run through a Philippine payment gateway in test mode. Card details never reach our servers.',
    ],
  },
  '/refund-policy': {
    title: 'Exchange & Refund Policy',
    body: [
      'All sales are final. Tickets can be exchanged up to 72 hours before the show for the same tier, subject to availability.',
      'If an event is cancelled, refunds are processed manually through the payment gateway dashboard.',
      'If a payment is confirmed after your hold expired and the seat was taken, the order is marked for a manual refund and you are told.',
    ],
  },
  '/privacy': {
    title: 'Privacy Notice',
    body: [
      'Spotlight collects your name, email and phone number to issue tickets, in line with the Philippine Data Privacy Act of 2012.',
      'Passwords are hashed. We do not store card details.',
      'You can edit your name, phone and password on your profile page.',
    ],
  },
  '/terms': {
    title: 'Terms of Service',
    body: [
      'Tickets are issued per seat and tied to the named ticket holder. Re-assignments lock 24 hours before showtime.',
      'Resale and transfers outside the Spotlight transfer flow are not permitted.',
      'Venue rules, including the clear bag policy and no re-entry rule, apply at every event.',
    ],
  },
}
const page = computed(() => pages[route.path])
</script>

<template>
  <section class="container doc">
    <small>SPOTLIGHT</small>
    <h1>{{ page?.title }}</h1>
    <p v-for="p in page?.body" :key="p">{{ p }}</p>
    <RouterLink to="/" class="btn btn-primary">Back to home</RouterLink>
  </section>
</template>

<style scoped>
.doc { max-width: 720px; padding-top: 140px; padding-bottom: 80px; display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
small { font-size: 11px; letter-spacing: .1em; color: var(--secondary); }
h1 { font-family: var(--font-display); font-size: 40px; }
p { line-height: 1.7; color: var(--text-muted); }
</style>
