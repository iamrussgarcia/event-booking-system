# Spotlight API

Contract between the Vue frontend and the Express backend. One file per feature area; each file lists its endpoints,
who can call them, and sample request and response bodies.

## Conventions

- **Base path:** every path in these files is relative to `/api`.
  `[POST] - "/users/login"` means `POST /api/users/login`.
  The only exception is the payment callback, `/webhooks/payment`, which is written out in full.
- **Format:** JSON in and out (`Content-Type: application/json`), except file upload (`multipart/form-data`) and the QR image.
- **Dates:** ISO 8601 strings with the Manila offset, for example `2027-02-14T20:00:00+08:00`.
- **Money:** whole pesos as numbers (`12500` means ₱12,500).
- **IDs:** `:id` is the record's ID. Public event pages use `:slug`. Seat IDs look like `A-5-12` (section, row, seat).

## Who can call an endpoint

| Label | Meaning |
|---|---|
| **Public** | No login needed |
| **Requires token** | A logged-in customer or admin |
| **Requires admin token** | Logged in with the `admin` role. Anyone else gets `403`. |

> **Open decision, how the token travels.** The spec says login starts a session in an httpOnly cookie. These files say
> "Requires token" to match the team's format, meaning "the credential that login gives you". If the team keeps cookie
> sessions, the browser sends it automatically and every `POST`, `PATCH`, `PUT` and `DELETE` also needs the CSRF token
> header. If the team switches to JWT, send `Authorization: Bearer <token>` and drop CSRF.

## Errors

Every error is JSON. Validation errors name the field so the form can show it under the right input.

```json
{
  "message": "Fix the highlighted fields.",
  "errors": { "email": "Email already used." }
}
```

| Status | When |
|---|---|
| `400` | Invalid input (field errors) |
| `401` | Not logged in, or wrong credentials |
| `403` | Logged in but not an admin |
| `404` | Unknown record, an unpublished event, or someone else's order |
| `409` | A rule blocks the action: seat just taken, hold expired, an admin edit rule |

## Shared values

| Name | Values |
|---|---|
| Seat state | `a` available, `h` held, `s` sold (a seat you are selecting is a client-only state) |
| Event status | `draft`, `published` |
| Sales status (computed) | `on_sale`, `selling_fast`, `almost_sold_out`, `sold_out`, `draft` |
| Order status | `pending`, `paid`, `failed`, `cancelled`, `refund-review` |
| Payment method | `gcash`, `maya`, `card` |
| User role | `customer`, `admin` |

## Files and owners

| File | Feature | Spec | Owner |
|---|---|---|---|
| [users.md](users.md) | Register, login, profile | F-01, F-08 | Person 1 Foundation |
| [events.md](events.md) | Homepage, events list, event details, VIP page | F-02 to F-04, F-09 | Person 1 Foundation |
| [seats-and-holds.md](seats-and-holds.md) | Seat plan data, polling, 10-minute hold | F-05, F-06 | Person 2 Seat engine |
| [checkout-and-payments.md](checkout-and-payments.md) | Checkout, payment, gateway callback | F-06 | Person 3 Checkout |
| [orders-and-tickets.md](orders-and-tickets.md) | Order history, tickets, QR image | F-07 | Person 3 Checkout |
| [admin-events.md](admin-events.md) | Event CRUD, publish, image upload | F-10 | Person 4 Admin |
| [admin-zones.md](admin-zones.md) | Zones, prices, VIP perks | F-11 | Person 4 Admin |
| [admin-orders.md](admin-orders.md) | Order list and detail | F-12 | Person 4 Admin |
| [admin-dashboard.md](admin-dashboard.md) | Dashboard counts | F-10 | Person 4 Admin |

## All endpoints

| Method | Path | Access | File |
|---|---|---|---|
| POST | `/users/register` | Public | users |
| POST | `/users/login` | Public | users |
| POST | `/users/logout` | Token | users |
| GET | `/users/profile` | Token | users |
| PATCH | `/users/profile` | Token | users |
| PATCH | `/users/password` | Token | users |
| GET | `/events` | Public | events |
| GET | `/events/featured` | Public | events |
| GET | `/events/:slug` | Public | events |
| GET | `/vip` | Public | events |
| GET | `/events/:id/seats` | Public | seats-and-holds |
| POST | `/holds` | Token | seats-and-holds |
| DELETE | `/holds/:holdId` | Token | seats-and-holds |
| POST | `/checkout` | Token | checkout-and-payments |
| POST | `/webhooks/payment` | Gateway only (full path, no `/api`) | checkout-and-payments |
| POST | `/payments/mock/:reference` | Dev and test only | checkout-and-payments |
| GET | `/orders` | Token | orders-and-tickets |
| GET | `/orders/:orderNumber` | Token (owner) | orders-and-tickets |
| GET | `/orders/:orderNumber/seats/:seatId/qr` | Token (owner) | orders-and-tickets |
| GET | `/admin/dashboard` | Admin | admin-dashboard |
| GET | `/admin/events` | Admin | admin-events |
| GET | `/admin/events/:id` | Admin | admin-events |
| POST | `/admin/events` | Admin | admin-events |
| PATCH | `/admin/events/:id` | Admin | admin-events |
| POST | `/admin/events/:id/publish` | Admin | admin-events |
| POST | `/admin/events/:id/unpublish` | Admin | admin-events |
| DELETE | `/admin/events/:id` | Admin | admin-events |
| POST | `/admin/uploads` | Admin | admin-events |
| GET | `/admin/events/:id/zones` | Admin | admin-zones |
| PUT | `/admin/events/:id/zones` | Admin | admin-zones |
| GET | `/admin/orders` | Admin | admin-orders |
| GET | `/admin/orders/:orderNumber` | Admin | admin-orders |

## Where these files go beyond the spec

The spec lists only four endpoints, so the rest are derived from the screens. These points need the team's agreement:

1. **Convenience fee.** The checkout screens add ₱250 per seat. The spec only mentions `total`. Orders and holds carry `fee`.
2. **Ticket holder names.** Checkout asks for a name per seat, so each entry in an order's `seats[]` has `holderName`.
3. **Door time.** The event form has a door time, so events have `doorsAt`.
4. **Description length.** The admin design requires at least 150 characters before an event can be published.
5. **Polling.** `GET /events/:id/seats?statusOnly=true` returns only seat states, for the 10-second refresh.
6. **QR image.** `GET /orders/:orderNumber/seats/:seatId/qr` returns a PNG. The spec says only that each ticket has a QR image.
7. **Mock payments.** `POST /payments/mock/:reference` exists only so the flow can be tested without a gateway account.
8. **No CSV export endpoint.** The spec leaves CSV export out. The admin screens build the CSV in the browser.
