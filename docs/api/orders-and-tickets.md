# Orders and Tickets

The customer's own orders: the confirmation page and My Tickets. Spec: F-07. Owner: Person 3.

- Customers see **only their own** orders. Someone else's order number returns `404`.
- One ticket per seat. Seat labels and prices are saved as they were at the time of sale.
- `qrToken` is random and unguessable. It is only present once the order is `paid`.

### [GET] - "/orders"

Requires token

No Request Body

Query parameters (optional)

| Name | Example | Meaning |
|---|---|---|
| `when` | `upcoming` or `past` | Splits the My Tickets tabs by show date |

Newest first.

Sample Response `200`

```json
{
  "orders": [
    {
      "orderNumber": "SPL-2027-88924",
      "status": "paid",
      "total": 25500,
      "createdAt": "2027-01-20T10:21:30+08:00",
      "event": {
        "id": "6553f1c2a1b2c3d4e5f60801",
        "slug": "aria-vale-city-lights",
        "title": "Aria Vale: City Lights World Tour",
        "startsAt": "2027-02-14T20:00:00+08:00",
        "venueName": "Bayview Arena",
        "heroImageUrl": "/uploads/aria-vale.jpg"
      },
      "seats": [
        {
          "seatId": "A-5-12",
          "label": "Section A · Row 5 · Seat 12",
          "zoneName": "VIP Gold Prime",
          "price": 12500,
          "holderName": "Beatriz Alonzo",
          "qrToken": "f3a9c1e07b2d44a58c9e6b10d2a7f845"
        }
      ]
    }
  ]
}
```

### [GET] - "/orders/:orderNumber"

Requires token

No Request Body

Used by the confirmation page after payment and by order detail.

Sample Response `200`

```json
{
  "order": {
    "orderNumber": "SPL-2027-88924",
    "status": "paid",
    "createdAt": "2027-01-20T10:21:30+08:00",
    "buyer": { "name": "Beatriz Alonzo", "email": "beatriz@mail.com", "phone": "9178824491" },
    "event": {
      "id": "6553f1c2a1b2c3d4e5f60801",
      "slug": "aria-vale-city-lights",
      "title": "Aria Vale: City Lights World Tour",
      "startsAt": "2027-02-14T20:00:00+08:00",
      "doorsAt": "2027-02-14T17:30:00+08:00",
      "venueName": "Bayview Arena",
      "venueAddress": "Seaside Blvd, Pasay City, Metro Manila",
      "heroImageUrl": "/uploads/aria-vale.jpg"
    },
    "seats": [
      {
        "seatId": "A-5-12",
        "label": "Section A · Row 5 · Seat 12",
        "zoneName": "VIP Gold Prime",
        "price": 12500,
        "holderName": "Beatriz Alonzo",
        "qrToken": "f3a9c1e07b2d44a58c9e6b10d2a7f845"
      }
    ],
    "subtotal": 25000,
    "fee": 500,
    "total": 25500,
    "payment": {
      "method": "gcash",
      "reference": "pay_8f3a1c2d",
      "paidAt": "2027-01-20T10:21:30+08:00"
    }
  }
}
```

While `status` is `pending`, `qrToken` is left out and `payment.paidAt` is `null`.
For `refund-review` the customer is told the order needs a manual refund.

Errors: `404` unknown order or not the caller's order.

### [GET] - "/orders/:orderNumber/seats/:seatId/qr"

Requires token

No Request Body

Returns the ticket's QR image as `image/png`. The code contains the seat's `qrToken`.
It is a reference image only: ticket scanning at the venue is outside the system.

Sample Response `200`: image bytes with `Content-Type: image/png`.

Errors: `404` unknown order or seat, not the caller's order, or the order is not `paid`.
