# Events

What visitors and customers see before buying: homepage, events page, event details, VIP page.
Spec: F-02, F-03, F-04, F-09. Owner: Person 1.

Only **published** events appear here. An unknown or unpublished event returns `404`.
An event is `sold_out` automatically when no seat is available.

### [GET] - "/events"

Public

No Request Body

Query parameters (all optional)

| Name         | Example                    | Meaning                     |
| ------------ | -------------------------- | --------------------------- |
| `q`          | `aria`                     | Search title and artist     |
| `location`   | `pasay`                    | Venue city or venue name    |
| `from`, `to` | `2027-02-01`, `2027-02-28` | Show date range             |
| `genre`      | `pop`                      | Genre contains this text    |
| `limit`      | `6`                        | Max results (homepage grid) |

Sorted by `startsAt`, soonest first. Upcoming events only. The frontend groups them by month.

Sample Response `200`

```json
{
  "total": 1,
  "events": [
    {
      "id": "6553f1c2a1b2c3d4e5f60801",
      "title": "Aria Vale: City Lights World Tour",
      "artistName": "Aria Vale",
      "genre": "Pop / Synth",
      "startsAt": "2027-02-14T20:00:00+08:00",
      "venue": {
        "id": "6553f1c2a1b2c3d4e5f60701",
        "name": "Bayview Arena",
        "city": "Pasay City"
      },
      "heroImageUrl": "/uploads/aria-vale.jpg",
      "featured": true,
      "priceFrom": 2500,
      "priceTo": 12500,
      "hasVip": true,
      "salesStatus": "on_sale"
    }
  ]
}
```

No matches returns `"events": []` (the page shows "No events found").

### [GET] - "/events/featured"

Public

No Request Body

Featured published events for the homepage carousel (set by the admin).

Sample Response `200`: `{ "events": [ ... ] }` with the same event shape as the list, plus `"description"`.

### [GET] - "/events/:id"

Public

No Request Body

Sample Response `200`

```json
{
  "event": {
    "id": "6553f1c2a1b2c3d4e5f60801",
    "title": "Aria Vale: City Lights World Tour",
    "artistName": "Aria Vale",
    "genre": "Pop / Synth",
    "startsAt": "2027-02-14T20:00:00+08:00",
    "doorsAt": "2027-02-14T17:30:00+08:00",
    "venue": {
      "id": "6553f1c2a1b2c3d4e5f60701",
      "name": "Bayview Arena",
      "city": "Pasay City",
      "address": "Seaside Blvd, Pasay City, Metro Manila"
    },
    "heroImageUrl": "/uploads/aria-vale.jpg",
    "description": "Aria Vale returns to Manila ...",
    "faq": "How many seats can I buy? Up to 6 ...",
    "policies": {
      "exchangeRefund": "All sales are final ...",
      "waysToBuy": "GCash, Maya, cards"
    },
    "zones": [
      {
        "id": "vip",
        "name": "VIP Gold Prime",
        "color": "#ffb95f",
        "price": 12500,
        "vip": true,
        "perks": [
          "Soundcheck access",
          "Express fast-track entrance",
          "VIP lounge pass"
        ]
      }
    ],
    "soldOut": false,
    "salesStatus": "on_sale"
  }
}
```

Errors: `404` unknown or unpublished.

### [GET] - "/vip"

Public

No Request Body

Spec: F-09 (Should). Upcoming published events that have at least one VIP zone.

Sample Response `200`

```json
{
  "events": [
    {
      "id": "6553f1c2a1b2c3d4e5f60801",
      "title": "Aria Vale: City Lights World Tour",
      "startsAt": "2027-02-14T20:00:00+08:00",
      "venue": { "name": "Bayview Arena", "city": "Pasay City" },
      "heroImageUrl": "/uploads/aria-vale.jpg",
      "vipZone": {
        "name": "VIP Gold Prime",
        "price": 12500,
        "perks": ["Soundcheck access", "Express fast-track entrance"]
      }
    }
  ]
}
```

No VIP events returns `"events": []`.
