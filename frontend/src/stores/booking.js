import { computed, reactive } from 'vue'
import { FEE_PER_SEAT, MAX_SEATS, seatLabel, zones } from '../data/seatmap'
export const HOLD_SECONDS = 10 * 60
const STORAGE_KEY = 'spotlight.orders'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}
export const booking = reactive({
  eventTitle: 'Aria Vale: City Lights Tour',
  eventDate: 'Sat, Feb 14, 2027 · 8:00 PM',
  venue: 'Bayview Arena, Pasay City',
  selected: [],
  holdEndsAt: null,
  orders: load(),
})
export const subtotal = computed(() => booking.selected.reduce((n, s) => n + zones[s.zone].price, 0))
export const fee = computed(() => booking.selected.length * FEE_PER_SEAT)
export const total = computed(() => subtotal.value + fee.value)
export function toggleSeat(seat) {
  if (seat.status !== 'available') return 'unavailable'
  const i = booking.selected.findIndex((s) => s.id === seat.id)
  if (i >= 0) {
    booking.selected.splice(i, 1)
    return 'ok'
  }
  if (booking.selected.length >= MAX_SEATS) return 'limit'
  booking.selected.push(seat)
  return 'ok'
}
export const clearSeats = () => {
  booking.selected = []
  booking.holdEndsAt = null
}
export const startHold = () => {
  booking.holdEndsAt = Date.now() + HOLD_SECONDS * 1000
}
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')
export function placeOrder(buyer, method, holders = {}) {
  const order = {
    orderNumber: 'SPL-' + Math.floor(100000 + Math.random() * 900000),
    eventTitle: booking.eventTitle,
    eventDate: booking.eventDate,
    venue: booking.venue,
    buyer,
    tickets: booking.selected.map((s) => ({
      seatId: s.id,
      label: seatLabel(s),
      zoneName: zones[s.zone].name,
      price: zones[s.zone].price,
      holder: holders[s.id] || buyer.name,
      qrToken: token(),
    })),
    subtotal: subtotal.value,
    fee: fee.value,
    total: total.value,
    method,
    createdAt: new Date().toISOString(),
  }
  // Mark the seats sold in this session, then persist the order.
  booking.selected.forEach((s) => (s.status = 'sold'))
  booking.orders.unshift(order)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(booking.orders))
  } catch {
    /* storage unavailable: order stays in memory */
  }
  clearSeats()
  return order
}
