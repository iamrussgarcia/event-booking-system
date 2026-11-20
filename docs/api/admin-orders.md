# Admin Orders

View-only order list and detail. Spec: F-12. Owner: Person 4.

Every endpoint here **requires an admin token**. There is no endpoint to change an order: refunds and cancellations are
done by hand in the payment gateway dashboard.

### [GET] - "/admin/orders"

Requires admin token

No Request Body

Query parameters (all optional)

| Name | Example | Meaning |
|---|---|---|
| `q` | `SPL-2027` | Order number, buyer name or buyer email |
| `status` | `refund-review` | One of `paid`, `pending`, `refund-review`, `failed`, `cancelled` |
| `eventId` | `6553f1c2a1b2c3d4e5f60801` | Only this event |
| `method` | `gcash` | `gcash`, `maya` or `card` |
| `range` | `30` | Only orders from the last N days. Leave out for all time. |
| `page`, `pageSize` | `1`, `6` | Pagination |

Newest first.

Sample Response `200`

```json
{
  "page": 1,
  "pages": 1,
  "total": 3,
  "summary": {
    "total": 3,
    "paid": 1,
    "pending": 1,
    "refundReview": 1,
    "failed": 0,
    "cancelled": 0,
    "paidVolume": 25500
  },
  "orders": [
    {
      "orderNumber": "SPL-2027-90517",
      "createdAt": "2026-11-09T18:40:00+08:00",
      "status": "refund-review",
      "method": "card",
      "total": 8750,
      "seatCount": 1,
      "hasVip": false,
      "buyer": { "name": "Jana Reyes", "email": "jana.reyes@yahoo.com" },
      "event": {
        "id": "6553f1c2a1b2c3d4e5f60803",
        "title": "LUMINA: \"Constellation\" Manila Arena Tour",
        "venueName": "Bayview Arena",
        "heroImageUrl": "/uploads/lumina.jpg"
      }
    }
  ]
}
```

`summary` counts all orders (it ignores `status`, `page` and `pageSize`) so the status chips always show their totals.
No match returns `"orders": []` (the page shows "No orders found").

### [GET] - "/admin/orders/:orderNumber"

Requires admin token

No Request Body

Sample Response `200`

```json
{
  "order": {
    "orderNumber": "SPL-2027-90517",
    "createdAt": "2026-11-09T18:40:00+08:00",
    "status": "refund-review",
    "buyer": { "name": "Jana Reyes", "email": "jana.reyes@yahoo.com", "phone": "9271112233" },
    "event": {
      "id": "6553f1c2a1b2c3d4e5f60803",
      "title": "LUMINA: \"Constellation\" Manila Arena Tour",
      "startsAt": "2026-12-12T19:30:00+08:00",
      "venueName": "Bayview Arena",
      "venueAddress": "Seaside Blvd, Pasay City, Metro Manila",
      "heroImageUrl": "/uploads/lumina.jpg"
    },
    "seats": [
      {
        "seatId": "B-2-6",
        "label": "Section B · Row 2 · Seat 06",
        "zoneName": "Gold Amber Lower Box",
        "price": 8500,
        "holderName": "Jana Reyes"
      }
    ],
    "subtotal": 8500,
    "fee": 250,
    "total": 8750,
    "payment": {
      "method": "card",
      "reference": "pay_5d21b7e9",
      "status": "paid",
      "paidAt": "2026-11-09T18:52:10+08:00"
    }
  }
}
```

For `refund-review` the screen tells the admin that the payment arrived after the hold expired and must be refunded in the
gateway dashboard. QR tokens are never included in admin responses.

Errors: `404` `"No orders found."`
