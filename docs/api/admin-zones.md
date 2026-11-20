# Admin Zones, Prices and VIP Perks

Group a venue's sections into zones and set price, color, VIP flag and perks. Spec: F-11. Owner: Person 4.

Every endpoint here **requires an admin token**.

Edit rules the backend must enforce (spec 6.3):

1. A **price change applies only to seats still available**. Sold and held seats keep their price.
2. A **section can change zone only while none of its seats are sold or held**. The section is "locked".
3. Sections with no zone are **not for sale**.
4. Perk text, zone names and colors can be edited any time.

Publishing is done from [admin-events.md](admin-events.md): it creates one availability record per seat.
Saving zones on a **draft** just stores the configuration; no seat records exist yet.

### [GET] - "/admin/events/:id/zones"

Requires admin token

No Request Body

Sample Response `200`

```json
{
  "event": { "id": "6553f1c2a1b2c3d4e5f60801", "title": "Aria Vale: City Lights World Tour", "status": "published", "sold": 41 },
  "sections": [
    {
      "id": "A",
      "label": "VIP Floor",
      "capacity": 66,
      "sold": 8,
      "held": 0,
      "locked": true,
      "zoneId": "vip"
    },
    {
      "id": "D",
      "label": "Side Tier L",
      "capacity": 9,
      "sold": 0,
      "held": 0,
      "locked": false,
      "zoneId": "silver"
    }
  ],
  "zones": [
    {
      "id": "vip",
      "name": "VIP Gold Prime",
      "color": "#ffb95f",
      "price": 12500,
      "vip": true,
      "perks": ["Soundcheck access", "Express fast-track entrance", "VIP lounge pass"]
    },
    {
      "id": "silver",
      "name": "Silver Blue Side Tier",
      "color": "#4cd7f6",
      "price": 4500,
      "vip": false,
      "perks": []
    }
  ]
}
```

- `locked` is `true` only for a published event whose section has sold or held seats.
- `zoneId` is `null` for a section that is not for sale.
- `perks` is an array, one entry per line of the perks text box.

Errors: `404` unknown event.

### [PUT] - "/admin/events/:id/zones"

Requires admin token

Sample Request Body

```json
{
  "sectionZones": {
    "A": "vip",
    "B": "gold",
    "C": "gold",
    "D": "silver",
    "E": "silver",
    "BALCONY": null
  },
  "zones": [
    {
      "id": "vip",
      "name": "VIP Gold Prime",
      "color": "#ffb95f",
      "price": 14500,
      "vip": true,
      "perks": ["Best front-row catwalk sightlines", "Early entry lane via Gate 1 Express"]
    },
    {
      "id": "gold",
      "name": "Gold Amber Lower Box",
      "color": "#f0a23c",
      "price": 8500,
      "vip": false,
      "perks": []
    },
    {
      "id": "silver",
      "name": "Silver Blue Side Tier",
      "color": "#4cd7f6",
      "price": 4500,
      "vip": false,
      "perks": []
    }
  ]
}
```

- Send the whole configuration; it replaces the old one.
- Use `null` for a section that is not for sale.
- Add a zone by sending a new `id`. Remove one by leaving it out, but only if no section uses it.

Sample Response `200`

```json
{
  "message": "Zones saved. Prices apply only to seats still available.",
  "updatedSeats": 203,
  "lockedSeats": 53
}
```

`updatedSeats` is how many available seats got the new price. `lockedSeats` is how many sold or held seats kept theirs.
For a draft both are `0`.

Errors

- `400` field errors: a zone name is empty, or a price is not above ₱0.

```json
{
  "message": "Fix the highlighted fields.",
  "errors": { "vip.price": "Price must be above ₱0." }
}
```

- `400` a removed zone is still used by a section.
- `409` a locked section changed zone.

```json
{
  "message": "Section B has sold or held seats, so its zone cannot change.",
  "sections": ["B"]
}
```
