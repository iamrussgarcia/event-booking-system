// Downloads rows (an array of arrays) as a CSV file in the browser.
const cell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function downloadCsv(filename, rows) {
  const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// One row per order, for the admin "Export" buttons.
export const ordersToRows = (orders) => [
  ['Order number', 'Created', 'Buyer', 'Email', 'Event', 'Seats', 'Subtotal (PHP)', 'Fees (PHP)', 'Total (PHP)', 'Method', 'Status'],
  ...orders.map((o) => [
    o.orderNumber,
    o.createdAt,
    o.buyer.name,
    o.buyer.email,
    o.eventTitle,
    o.tickets.length,
    o.subtotal,
    o.fee,
    o.total,
    o.method,
    o.status,
  ]),
]
