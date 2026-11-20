# Seats and Holds

The interactive seat plan and the 10-minute hold. Spec: F-05, F-06. Owner: Person 2.

This is the part that must never double-book. Rules the backend must keep:

- Each seat of an event is its own record, claimed with **one atomic update**.
- A hold lasts **10 minutes**. An expired hold counts as available, so no cleanup job is needed.
- Hold is all-or-nothing: if one seat was just taken, release the others and name the missing seat.
- A customer can pick at most **6 seats**.
- Sections with no zone are not for sale and are left out of the response.

### [GET] - "/events/:id/seats"

Public (anyone can look at the plan; logging in is needed to continue to checkout)

No Request Body

Loads the layout once. The frontend then polls with `?statusOnly=true` every 10 seconds.

Sample Response `200`

```json
{
  "event": {
    "id": "6553f1c2a1b2c3d4e5f60801",
    "title": "Aria Vale: City Lights World Tour",
    "startsAt": "2027-02-14T20:00:00+08:00",
    "soldOut": false
  },
  "viewBox": "0 0 800 700",
  "stage": { "x": 150, "y": 30, "width": 500, "height": 44, "label": "MAIN STAGE" },
  "sections": [
    { "id": "A", "label": "SEC A · VIP FLOOR", "zoneId": "vip", "x": 400, "y": 392, "anchor": "middle" }
  ],
  "zones": [
    {
      "id": "vip",
      "name": "VIP Gold Prime",
      "color": "#ffb95f",
      "price": 12500,
      "vip": true,
      "perks": ["Soundcheck access", "Express fast-track entrance"]
    }
  ],
  "seats": [
    { "id": "A-5-12", "sectionId": "A", "row": 5, "number": 12, "x": 412.5, "y": 370, "zoneId": "vip", "price": 12500 }
  ],
  "states": { "A-5-12": "a", "A-5-11": "h", "A-5-10": "s" },
  "mine": [],
  "serverTime": "2027-01-20T10:15:00+08:00"
}
```

- `states` uses `a` available, `h` held, `s` sold. An expired hold is reported as `a`.
- `mine` lists seats held by the logged-in user, so the plan can show them as selected after a page refresh.
  It is `[]` for visitors.

Errors: `404` unknown or unpublished event.

### [GET] - "/events/:id/seats?statusOnly=true"

Public

No Request Body

Same route with a lighter response: only seat IDs and states, for the 10-second refresh.

Sample Response `200`

```json
{
  "states": { "A-5-12": "a", "A-5-11": "h", "A-5-10": "s" },
  "mine": ["A-5-11"],
  "serverTime": "2027-01-20T10:15:10+08:00"
}
```

### [POST] - "/holds"

Requires token

Sample Request Body

```json
{
  "eventId": "6553f1c2a1b2c3d4e5f60801",
  "seatIds": ["A-5-12", "A-5-11"]
}
```

Holds the seats for 10 minutes. A customer has one active hold per event; a new hold releases the previous one.

Sample Response `201`

```json
{
  "holdId": "6553f1c2a1b2c3d4e5f60a01",
  "eventId": "6553f1c2a1b2c3d4e5f60801",
  "heldUntil": "2027-01-20T10:25:00+08:00",
  "seats": [
    { "seatId": "A-5-12", "label": "Section A · Row 5 · Seat 12", "zoneName": "VIP Gold Prime", "price": 12500 },
    { "seatId": "A-5-11", "label": "Section A · Row 5 · Seat 11", "zoneName": "VIP Gold Prime", "price": 12500 }
  ],
  "subtotal": 25000,
  "fee": 500,
  "total": 25500
}
```

Errors

- `400` no seats, more than 6 seats, or an unknown seat ID.
- `401` not logged in.
- `404` unknown or unpublished event.
- `409` a seat was just taken. Nothing stays held.

```json
{
  "message": "Section A · Row 5 · Seat 12 was just taken. Please choose another seat.",
  "unavailableSeatIds": ["A-5-12"]
}
```

### [DELETE] - "/holds/:holdId"

Requires token

No Request Body

Releases the seats of the customer's own hold (for example when they go back to the plan). Safe to call twice.

Sample Response `204`: no content, also when the hold already expired.

Errors: `404` if the hold belongs to someone else.
