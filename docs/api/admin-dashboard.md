# Admin Dashboard

Counts for the admin home page and the notification bell. Spec: F-10. Owner: Person 4.

Requires an **admin token**. Read-only. Everything is calculated from events, event seats and orders; nothing is stored.

### [GET] - "/admin/dashboard"

Requires admin token

No Request Body

Sample Response `200`

```json
{
  "liveEvents": 8,
  "draftEvents": 1,
  "venueCount": 6,
  "paidOrders": 1,
  "paidVolume": 25500,
  "ticketsIssued": 2,
  "avgTicketPrice": 12750,
  "capacity": {
    "sold": 339,
    "total": 2048,
    "percent": 16.6,
    "remaining": 1709
  },
  "heldSeats": 12,
  "needsRefund": 1,
  "venues": [
    { "name": "Bayview Arena", "city": "Pasay City", "sold": 28, "capacity": 512 },
    { "name": "Harbor Theater", "city": "Quezon City", "sold": 256, "capacity": 256 }
  ]
}
```

| Field | Meaning |
|---|---|
| `liveEvents`, `draftEvents` | Published and draft event counts |
| `venueCount` | Distinct venues among live events |
| `paidOrders`, `paidVolume` | Number and total (₱) of orders with status `paid` |
| `ticketsIssued` | Seats on paid orders |
| `avgTicketPrice` | `paidVolume` divided by `ticketsIssued`, rounded |
| `capacity` | Seats sold and total seats across live events, as a percent and a remainder |
| `heldSeats` | Seats currently held in checkout (unexpired holds) |
| `needsRefund` | Orders in `refund-review`. The bell badge shows this number. |
| `venues` | Sold and total seats per venue, for the venue cards |

The frontend does not show "vs last week" trends because there is no history to compute them from.
