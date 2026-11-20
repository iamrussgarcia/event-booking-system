# Admin Events

Create, edit, publish and delete events. Spec: F-10. Owner: Person 4.

Every endpoint here **requires an admin token**. A logged-in customer gets `403`:

```json
{ "message": "Admin access required." }
```

Edit rules the backend must enforce (spec 6.3), not just the UI:

1. The venue cannot change after publishing.
2. An event can be unpublished only if no seats are sold.
3. Only drafts with no orders can be deleted.
4. An event shows **sold out** automatically when no seat is available.

### [GET] - "/admin/events"

Requires admin token

No Request Body

Query parameters (optional)

| Name | Example | Meaning |
|---|---|---|
| `q` | `aria` | Search title and artist |
| `status` | `draft` or `published` | Filter by status |
| `salesStatus` | `sold_out` | Filter by computed sales status |
| `venue` | `Bayview Arena` | Filter by venue name |
| `page`, `pageSize` | `1`, `8` | Pagination |

Sample Response `200`

```json
{
  "page": 1,
  "pages": 2,
  "total": 9,
  "events": [
    {
      "id": "6553f1c2a1b2c3d4e5f60801",
      "slug": "aria-vale-city-lights",
      "title": "Aria Vale: City Lights World Tour",
      "artistName": "Aria Vale",
      "genre": "Pop / Synth",
      "startsAt": "2027-02-14T20:00:00+08:00",
      "venue": { "id": "6553f1c2a1b2c3d4e5f60701", "name": "Bayview Arena", "city": "Pasay City" },
      "heroImageUrl": "/uploads/aria-vale.jpg",
      "status": "published",
      "salesStatus": "on_sale",
      "featured": true,
      "sold": 41,
      "capacity": 256
    }
  ]
}
```

### [GET] - "/admin/events/:id"

Requires admin token

No Request Body

Sample Response `200`: `{ "event": { ... } }` with every field from the create body below, plus `id`, `slug`, `status`,
`sold`, `capacity` and `updatedAt`.

Errors: `404` unknown event.

### [POST] - "/admin/events"

Requires admin token

Sample Request Body

```json
{
  "title": "Aria Vale: City Lights World Tour",
  "artistName": "Aria Vale",
  "genre": "Pop / Synth",
  "venueId": "6553f1c2a1b2c3d4e5f60701",
  "startsAt": "2027-02-14T20:00:00+08:00",
  "doorsAt": "2027-02-14T17:30:00+08:00",
  "heroImageUrl": "/uploads/aria-vale.jpg",
  "description": "Aria Vale returns to Manila for a full arena night ...",
  "faq": "How many seats can I buy? Up to 6 ...",
  "policies": {
    "exchangeRefund": "All sales are final ...",
    "waysToBuy": "GCash, Maya, cards"
  },
  "featured": false
}
```

- `venueId` must be one of the seeded venues. Venues are not managed in the app.
- `heroImageUrl` is the `path` returned by `/admin/uploads`.
- A new event is always created as a **draft**.

Sample Response `201`: `{ "event": { ... } }` with `"status": "draft"`.

Errors: `400` with field errors (`title`, `artistName`, `startsAt` are required), `409` when an event with the same
title already exists.

### [PATCH] - "/admin/events/:id"

Requires admin token

Sample Request Body (send only what changes)

```json
{
  "title": "Aria Vale: City Lights World Tour",
  "genre": "Pop / Synth / Live",
  "featured": true
}
```

Used by the form's Save button and by the star toggle in the list (`{ "featured": true }`).

Sample Response `200`: `{ "event": { ... } }`

Errors: `400` field errors. `409` `"The venue cannot change after publishing."` if `venueId` changes on a published event.

### [POST] - "/admin/events/:id/publish"

Requires admin token

No Request Body

Checks the event, then creates **one availability record per seat** at its zone price (see [admin-zones.md](admin-zones.md)).

Sample Response `200`

```json
{
  "status": "published",
  "seatRecordsCreated": 256
}
```

Errors: `400` when it cannot be published yet.

```json
{
  "message": "Cannot publish this event yet.",
  "problems": [
    "Description needs at least 150 characters.",
    "At least one section needs a zone."
  ]
}
```

The checks are: title, date and venue present; at least one section has a zone; every used zone has a price above ₱0;
description of at least 150 characters.

### [POST] - "/admin/events/:id/unpublish"

Requires admin token

No Request Body

Moves a published event back to draft. Seat records are kept.

Sample Response `200`

```json
{ "status": "draft" }
```

Errors: `409` `"This event has sold seats and cannot be unpublished."`

### [DELETE] - "/admin/events/:id"

Requires admin token

No Request Body

Sample Response `204`: no content.

Errors: `409` `"Only drafts with no orders can be deleted."`

### [POST] - "/admin/uploads"

Requires admin token

Request body is `multipart/form-data` with one file field named `image`.

| Field | Type | Rule |
|---|---|---|
| `image` | file | PNG or JPG, up to 10 MB |

Saved to the server's `uploads/` folder. Only the path is stored on the event.

Sample Response `201`

```json
{ "path": "/uploads/3b1f9a7c-aria-vale.jpg" }
```

Errors: `400` `"Choose a PNG or JPG image."` or `"Image must be 10 MB or smaller."`
