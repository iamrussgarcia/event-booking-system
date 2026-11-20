# Checkout and Payments

Turn a hold into a paid order. Spec: F-06. Owner: Person 3.

Card details never reach our servers: the customer pays on the gateway's hosted page (PayMongo or Xendit in test mode).
Wrap the gateway in a small **payment provider** interface so a **mock provider** can replace it.

Order lifecycle

1. `POST /checkout` creates a `pending` order from the customer's hold and starts a payment.
2. The customer pays on the gateway page.
3. The gateway calls `POST /webhooks/payment`. Only then do seats become sold.
4. The frontend polls `GET /orders/:orderNumber` until the status is no longer `pending`.

### [POST] - "/checkout"

Requires token

Sample Request Body

```json
{
  "holdId": "6553f1c2a1b2c3d4e5f60a01",
  "buyer": {
    "name": "Beatriz Alonzo",
    "email": "beatriz@mail.com",
    "phone": "9178824491"
  },
  "holders": [
    { "seatId": "A-5-12", "name": "Beatriz Alonzo" },
    { "seatId": "A-5-11", "name": "Carlos Miguel Tan" }
  ],
  "paymentMethod": "gcash"
}
```

- `holders` must name every held seat. The name is printed on that seat's ticket.
- `paymentMethod` is `gcash`, `maya` or `card`.

Sample Response `201`

```json
{
  "order": {
    "orderNumber": "SPL-2027-88924",
    "status": "pending",
    "subtotal": 25000,
    "fee": 500,
    "total": 25500
  },
  "payment": {
    "provider": "paymongo",
    "reference": "pay_8f3a1c2d",
    "checkoutUrl": "https://checkout.paymongo.com/..."
  }
}
```

The frontend redirects the browser to `payment.checkoutUrl`.

Errors

- `400` a held seat has no holder name, or the holder list does not match the hold.
- `401` not logged in.
- `404` the hold does not exist or belongs to someone else.
- `409` the hold expired. The seats were released and the customer must choose again.

```json
{ "message": "Your hold expired. Please choose your seats again." }
```

### [POST] - "/webhooks/payment"

Called by the payment gateway only. Full path, no `/api` prefix. No login: it is protected by the **signature header**
(the header name depends on the gateway, for example `X-Signature`).

Sample Request Body (the provider adapter turns the gateway's own payload into this shape)

```json
{
  "event": "payment.paid",
  "reference": "pay_8f3a1c2d",
  "orderNumber": "SPL-2027-88924",
  "amount": 25500,
  "currency": "PHP",
  "paidAt": "2027-01-20T10:21:30+08:00"
}
```

`event` is `payment.paid`, `payment.failed` or `payment.cancelled`.

What the backend does

| Event                                             | Result                                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `payment.paid`, hold still valid                  | Order becomes `paid`. Seats become `s` (sold). A random `qrToken` is created for each seat. Confirmation email is sent (F-13, if built). |
| `payment.paid`, hold expired and a seat was taken | Order becomes `refund-review`. The customer is told. Refund is done by hand in the gateway dashboard.                                    |
| `payment.failed` or `payment.cancelled`           | Order becomes `failed` or `cancelled`. Seats are released so the customer can retry.                                                     |

Must be **repeat-safe**: the gateway may send the same event twice, and the second one changes nothing.

Sample Response `200`

```json
{ "received": true }
```

Errors: `401` when the signature is missing or wrong. Nothing is changed.

### [POST] - "/payments/mock/:reference"

Dev and test only. Disabled when `NODE_ENV=production`.

Plays the part of the gateway when the mock provider is active, so the whole flow can be tested without a gateway account.
It runs the same code as the webhook.

Sample Request Body

```json
{
  "outcome": "success"
}
```

`outcome` is `success`, `failed` or `cancelled`.

Sample Response `200`

```json
{ "orderNumber": "SPL-2027-88924", "status": "paid" }
```

Errors: `404` unknown reference, `403` in production.

### IF ON CRUNCH TIME, CREATE A HAPPY PATH FOR PAYMENTS
