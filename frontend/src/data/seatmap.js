import { reactive } from 'vue'
export const zones = {
  vip: {
    id: 'vip',
    name: 'VIP Gold Prime',
    short: 'VIP Gold',
    price: 12500,
    color: '#ffb95f',
    vip: true,
    perks: 'Soundcheck access, express fast-track entrance, VIP lounge pass & tour laminate.',
  },
  gold: { id: 'gold', name: 'Gold Amber Lower Box', short: 'Gold Amber', price: 8500, color: '#f0a23c' },
  silver: { id: 'silver', name: 'Silver Blue Side Tier', short: 'Silver Blue', price: 4500, color: '#4cd7f6' },
  general: { id: 'general', name: 'General Teal Balcony', short: 'General Teal', price: 2500, color: '#2dd4bf' },
}
export const FEE_PER_SEAT = 250
export const MAX_SEATS = 6
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
export function buildSeatMap() {
  const rand = rng(20270214)
  const seats = []
  const labels = [
    { text: 'SEC A · VIP FLOOR', x: 400, y: 392, anchor: 'middle', zone: 'vip' },
    { text: 'SEC B · LOWER BOWL LEFT', x: 150, y: 345, anchor: 'start', zone: 'gold' },
    { text: 'SEC C · LOWER BOWL RIGHT', x: 650, y: 345, anchor: 'end', zone: 'gold' },
    { text: 'SEC D · SIDE TIER L', x: 40, y: 455, anchor: 'start', zone: 'silver' },
    { text: 'SEC E · SIDE TIER R', x: 760, y: 455, anchor: 'end', zone: 'silver' },
    { text: 'SEC BALCONY · UPPER BOWL BLEACHERS', x: 400, y: 538, anchor: 'middle', zone: 'general' },
  ]
  const block = (section, zone, cx, cy, rows, n0, dn, sp, rowGap, curve, tilt = 0) => {
    for (let r = 1; r <= rows; r++) {
      const n = n0 + (r - 1) * dn
      for (let i = 0; i < n; i++) {
        const off = i - (n - 1) / 2
        const x = cx + off * sp + tilt * (r - 1)
        const y = cy + (r - 1) * rowGap + curve * off * off
        const roll = rand()
        const status = roll < 0.16 ? 'sold' : roll < 0.22 ? 'held' : 'available'
        seats.push({ id: `${section}-${r}-${i + 1}`, section, row: r, num: i + 1, zone, x, y, status })
      }
    }
  }
  block('A', 'vip', 400, 290, 6, 6, 2, 21, 20, 0)
  block('B', 'gold', 160, 380, 4, 5, 1, 19, 20, 0.2, 14)
  block('C', 'gold', 640, 380, 4, 5, 1, 19, 20, 0.2, -14)
  block('D', 'silver', 90, 470, 3, 3, 0, 24, 24, 0)
  block('E', 'silver', 710, 470, 3, 3, 0, 24, 24, 0)
  block('BALCONY', 'general', 400, 560, 5, 20, 2, 24, 26, -0.04)
  return { seats, labels, viewBox: '0 0 800 700' }
}
export const seatLabel = (s) =>
  `Section ${s.section === 'BALCONY' ? 'Balcony' : s.section} · Row ${s.row} · Seat ${String(s.num).padStart(2, '0')}`
// Shared singleton so selection, checkout and confirmation all see the same seat statuses.
export const seatMap = reactive(buildSeatMap())
