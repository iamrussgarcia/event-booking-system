# Technical Specifications Document

## 1. Title Page

# - **Project Name**: Spotlight – Ticket Booking Web Application with Interactive Seat Plan _(working title, to be confirmed with the client)_

- **Version**: 1.0 

- **Date**: October 20, 2026

- **Author(s)**: G2 - Apura, Figueroa, Gabunada, Garcia, 

## 2. Table of Contents

# 1. Introduction

2. Overall Description

3. Visual Mockup Reference

4. Features

5. Functional Requirements

6. Non-Functional Requirements

7. Data Requirements

8. External Interface Requirements

9. Glossary

10. Appendices 

## 3. Introduction

# * **Purpose**: A ticket booking web app for concerts and special events in Metro Manila. Customers find an event, **pick their exact seats on an interactive seat plan**, pay online, and get one ticket per seat. The seat plan is what sets the product apart from sites that sell only a ticket type. A basic admin area lets the owner publish events and set seat zones, prices, and VIP perks.

* **Business Goals** (from the client's reference slides):

  1. Visitors immediately see upcoming and featured events.

  2. Events are easy to browse and filter.

  3. Every event has its own page with complete information.

  4. Customers see where they will sit and what it costs; VIP seating is easy to find.

  5. Returning customers manage their tickets in one place.

* **Scope**:* _In scope (Must)_: registration and login; homepage; events page with search and filters; event details; interactive seat plan; seat hold; checkout and payment (test mode); confirmation and My Tickets; basic admin (events, zones, prices, VIP perks, orders).

* _If time allows (Should)_: profile, VIP page, confirmation email, seat plan polish.

* _Out of scope_: see 6.3.- **Definitions**:

  - **Seat plan**: visual map of a venue where seats can be selected

  - **Zone**: group of seats sharing a price and color (e.g., VIP, Gold, General)

  - **VIP zone**: a zone marked VIP, with a list of perks

  - **Hold**: temporary reservation of seats during checkout (10 minutes)

  - **SVG**: vector graphics format used to draw the seat plan

- **References**:

  - Client briefing "Visual Mockup for an Event Booking System" (`compiled.zip`)

  - Reference sites named by the client: Ticketmaster, Live Nation PH, StubHub (inspiration only, not to be copied)

  - Companion documents: `02_ERD_NoSQL.md`, `03_Wireframe_Stitch.md`

## 4. Overall Description

# - **Product Perspective**: A standalone responsive web app for one business owner selling tickets to events in Philippine venues. Not a marketplace.

- **Product Functions**: see the feature list in 6.1.

- **User Classes**:

  - **Visitors**: browse and search; must register to buy.

  - **Customers**: registered buyers, mostly on mobile phones.

  - **Admin**: owner or staff; one admin role with full access.

- **Operating Environment**:

  - **Client**: modern browsers on desktop and mobile, responsive from 360px. **HTML5 and Bootstrap 5**, plus vanilla JavaScript for the seat plan.

  - **Server**: **Express.js** on Node.js, EJS templates, and a small JSON API for seat status and holds.

  - **Database**: MongoDB (NoSQL) with Mongoose, on MongoDB Atlas.

  - **Hosting**: any Node host with HTTPS.

- **Assumptions and Dependencies**:

  - Payment runs through a Philippine gateway (for example PayMongo or Xendit) in **test mode**. Going live needs the client's gateway account approved. _To confirm._

  - Currency is Philippine Peso (₱).

  - The team prepares the seat layout of **one venue** as data with a generator script (a real floor plan if the client supplies one, otherwise a realistic sample).

  - Ticket checking at the venue is outside the system. Each ticket belongs to one seat; its QR image is only a reference.

## 5. Visual Mockup Reference

# Wireframes come from `03_Wireframe_Stitch.md`.| Client reference                              | Client's request                                                 | How this spec covers it                                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| #1 Homepage, #4 Featured Events               | Highlight upcoming events and featured artists                   | **F-02**: carousel of featured events (set by admin in F-10), find-events bar, upcoming grid                                          |
| #2 Event Listings, #3 Event Calendar          | Easy to browse; find events without scrolling through everything | **F-03**: one Events page, grouped by month, with search and filters (the two references were nearly the same screen)                 |
| #5 Event Details                              | A complete page per event                                        | **F-04**: tabs for Details, FAQ, Exchange & Refund Policy, Ways to Buy; **F-05** seat plan on the same page                           |
| #6 Customer Profile                           | Manage personal information in one place                         | **F-07** My Tickets (Must), **F-08** profile (Should)                                                                                 |
| #6–#8 VIP Guide, Meet & Greet, Special Access | Dedicated VIP page; ideas left to the team                       | **Our idea:** VIP is a **zone on the seat plan** with perks (F-11), shown in the legend (Must) and on an optional **VIP page** (F-09) |
| StubHub references                            | Mobile-friendly discovery                                        | Mobile-first layout (section 8)                                                                                                       |

## 6. Features

### 6.1 Feature List

# | ID   | Feature                         | Description                                                                                    | Priority |
| ---- | ------------------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| F-01 | Registration and Login          | Email and password accounts                                                                    | Must     |
| F-02 | Homepage                        | Featured carousel, find-events bar, upcoming grid                                              | Must     |
| F-03 | Events Page                     | Grouped by month; search; filters for location, date, genre                                    | Must     |
| F-04 | Event Details                   | Banner, date and venue, description, FAQ, refund policy, ways to buy                           | Must     |
| F-05 | Interactive Seat Plan           | Pick seats on a venue map with zone colors, prices, live availability                          | Must     |
| F-06 | Hold, Checkout, Payment         | 10-minute hold; buyer details; payment in test mode                                            | Must     |
| F-07 | Confirmation and My Tickets     | One ticket per seat with seat label and QR image; order history                                | Must     |
| F-08 | Profile                         | Edit name, phone, password                                                                     | Should   |
| F-09 | VIP Page                        | Upcoming events with VIP seats and perks, linking to the seat plan                             | Should   |
| F-10 | Admin: Access and Events        | Dashboard counts; create, edit, publish, unpublish, delete events; featured flag; image upload | Must     |
| F-11 | Admin: Zones, Prices, VIP Perks | Group venue sections into zones; set price, color, VIP flag, perks                             | Must     |
| F-12 | Admin: Orders                   | View-only list with search and detail page                                                     | Must     |
| F-13 | Confirmation Email              | Ticket details by email after payment                                                          | Should   |
| F-14 | Seat Plan Polish                | Pinch to zoom, keyboard seat selection                                                         | Should   |

### 6.2 The Differentiator: Interactive Seat Plan (F-05)

# - The venue is drawn inside the event page: a stage, sections, and seats in rows, colored by **zone**. A legend shows each zone's name, price, and perks.

- Seat states: **available**, **selected** (by you), **held** (by someone else), **sold**.

- Click or tap to select up to 6 seats. A summary panel lists each seat (section, row, number), its price, and the total; a tooltip shows the same on hover.

- Zoom with buttons; drag or scroll to move. Seat states refresh on load and **every 10 seconds**.

- "Continue" **holds the seats for 10 minutes** with a countdown. If a seat was just taken, the customer is told which one and returns to the plan.

- Built as a small custom SVG renderer in vanilla JavaScript from the venue's JSON layout (no paid service). 

- MVP limit: venues up to about **2,000 seats**, straight or gently curved rows.

### 6.3 Basic Admin (F-10, F-11, F-12) and What Is Left Out

# Admin pages need the admin role; others get a 403 page.| Area                            | What the admin can do                                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Events (F-10)                   | Search and filter the list; create; edit title, artist, genre, date and time, venue (from the seeded venues), image, description, FAQ, refund policy, ways to buy; set **featured**; publish; unpublish; delete drafts |
| Zones, prices, VIP perks (F-11) | Pick a zone per section (dropdown); per zone set name, color, price, **VIP** checkbox, and **perks** (one per line); read-only seat-plan preview. Publishing creates one availability record per seat                  |
| Orders (F-12)                   | List with search (order number, buyer email) and status filter; detail with buyer, seats, prices, payment reference                                                                                                    |**Edit rules** (so changes never break existing sales):1) The venue cannot change after publishing.

2) A price change applies only to seats still available.

3) A section can change zone only while none of its seats are sold or held. Sections with no zone are not for sale.

4) Perk text, zone names, and colors can be edited any time.

5) An event can be unpublished only if no seats are sold; only drafts with no orders can be deleted.

6) An event shows **Sold out** automatically when no seat is available.**Left out to keep the build to two weeks:** venue admin screens and seat-map editor (the team loads layouts with a seed script); seat blocking, reports, and CSV exports; refunds, event cancellation, and email resend in the app (done manually in the gateway dashboard); user management; ticket scanning by ushers; month-grid calendar; "best available" helper, add-ons, and VIP time slots; ads, resale, promo codes, social login, native app, multi-language.

## 7. Functional Requirements

### Use Cases

# * **Use Case 1**: Register and Find an Event (F-01, F-02, F-03, F-04)* **Actors**: Visitor, Customer

* **Preconditions**: At least one published event exists.

* **Main Flow**: Visitor registers with name, email, and password > the system validates, creates the account, and logs in > user browses the homepage or Events page > searches or filters by location, date, or genre > opens an event.

* **Alternate Flows**: Email already used or invalid input > error message. No results > "No events found" with a link to clear filters.

* **Errors**: 404 for unknown or unpublished events.* **Use Case 2**: Choose Seats and Book (F-05, F-06, F-07)* **Description**: The core use case.

* **Actors**: Customer, Payment Gateway

* **Preconditions**: Customer is logged in; the event is on sale.

* **Postconditions**: Seats are sold; the order is paid; one ticket per seat is in My Tickets.

* **Main Flow**: Customer opens the event > selects up to 6 seats > reviews the summary > clicks "Continue" > the system claims each seat with one atomic update and holds them for 10 minutes > customer enters buyer details > pays through the gateway > the gateway's signed callback confirms payment > the system marks seats sold, creates a random token per seat, and shows the confirmation and tickets.

* **Alternate Flows**: A seat was just taken > the system releases the others, names the missing seat, and returns to the plan. Hold expires > seats are released; start again. Payment fails or is cancelled > seats are released; customer can retry. Payment confirmed after the hold expired and a seat was taken > order marked for manual refund and the customer is told.* **Use Case 3**: View Tickets and Edit Profile (F-07, F-08)* **Actors**: Customer

* **Main Flow**: Customer opens My Tickets > opens an order > sees each seat's ticket (event, date, venue, seat label, QR image). Optionally edits name, phone, or password (Should).

* **Alternate Flows**: Invalid input > field-level error.* **Use Case 4**: Admin Publishes an Event (F-10, F-11)* **Actors**: Admin

* **Preconditions**: Admin is logged in; the venue layout was loaded by the team.

* **Postconditions**: The event is visible and every seat is available at its zone price.

* **Main Flow**: Admin creates the event (details, image, venue) > opens Zones > chooses a zone per section > sets names, colors, prices, VIP checkboxes, and perks > checks the preview > clicks Publish > the system creates one availability record per seat.

* **Alternate Flows**: Missing fields > validation errors. Edits after publishing follow the rules in 6.3.* **Use Case 5**: Admin Views Orders (F-12)- **Actors**: Admin

- **Main Flow**: Admin opens Orders > searches or filters by status > opens an order to see buyer, seats, prices, and payment reference.

- **Alternate Flows**: No match > "No orders found".

### System Features (processing and error handling)

# | Feature                              | Processing                                                                                                           | Error handling                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Registration and Login (F-01)        | Validate; hash password; start a session (httpOnly cookie)                                                           | Invalid input, duplicate email, wrong credentials                                             |
| Browse and Event Details (F-02–F-04) | Indexed queries on published, upcoming events                                                                        | Empty-state message; 404                                                                      |
| Interactive Seat Plan (F-05)         | Server sends the layout and a compact seat-status list; browser draws the SVG and polls every 10 s                   | "Seat unavailable"; 6-seat limit; retry banner if the network fails                           |
| Hold, Checkout, Payment (F-06)       | Atomic claim per seat; pending order; gateway in test mode; signature-checked, repeat-safe callback; mark seats sold | Seat taken, hold expired, payment failed or cancelled, late payment flagged for manual refund |
| Tickets and Profile (F-07, F-08)     | Random token per seat; QR image; save profile                                                                        | Field-level errors                                                                            |
| VIP Page (F-09, Should)              | Query upcoming published events with a VIP zone                                                                      | Empty-state message                                                                           |
| Basic Admin (F-10–F-12)              | Role check; validate; apply the edit rules; on publish create per-seat records                                       | Field errors; 403 for non-admins; clear message when an edit rule blocks an action            |

## 8. Non-Functional Requirements

# - **Performance**: pages load within 2 seconds on 4G; the seat plan renders within 2 seconds for up to 2,000 seats; seat status requests carry only seat IDs and states.

- **Security**:

  - Passwords hashed; HTTPS everywhere; card details never reach our servers (hosted payment page).

  - Admin routes need the admin role; httpOnly, secure, sameSite cookies; CSRF tokens; validated input and escaped output; `helmet` headers.

  - Ticket QR tokens are random and unguessable; the payment callback is signature-verified.

  - Philippine Data Privacy Act of 2012: privacy notice and consent at registration.

- **Usability**: mobile-first from 360px; finding an event and buying seats takes no more than 5 steps; zones are told apart by name in the legend, not by color alone.

- **Reliability**: **no double-booking**, so two customers can never hold or buy the same seat; daily Atlas backups.

- **Supportability**: code in Git with a short README (setup, seed command, environment variables); MVC folders `routes/`, `controllers/`, `models/`, `views/`, `public/`.

## 9. Data Requirements

# - **Data Models** (MongoDB; diagram and samples in `02_ERD_NoSQL.md`; five collections):

  - **users**: email, passwordHash, firstName, lastName, phone, role, createdAt

  - **venues**: name, city, address, seatMap { viewBox, stage, sections\[], seats\[] }

  - **events**: slug, title, artistName, venueId, genre, startsAt, status, featured, heroImageUrl, description, faq, policies, zones\[]

  - **eventSeats**: eventId, seatId, sectionId, zoneId, price, status (available, held, sold), heldBy, holdId, heldUntil, orderId _(one record per seat per event)_

  - **orders**: orderNumber, userId, eventId, seats\[], total, status, payment, createdAt _(each entry of_ `seats[]` _is one ticket: seatId, label, zoneName, price, qrToken)_

- **Database Requirements**:

  - A venue's layout is stored once and reused by every event at that venue.

  - Each seat of an event is its own record, so every hold and sale is a single-record update. That prevents double-booking without transactions. An expired hold counts as available, so no cleanup job is needed.

  - Indexes for event search and for seat lookups by event.

- **Data Storage and Retrieval**:

  - Customers see only their own orders; admins see all.

  - Event images are uploaded by the admin (`multer`) to the server's `uploads/` folder; only the path is stored.

  - Orders keep seat labels and prices as at the time of sale.

## 10. External Interface Requirements

# - **User Interfaces** (EJS pages with Bootstrap 5):| Page                          | Path                                                                                      | Who                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| Homepage, Events list         | `/`, `/events`                                                                            | Everyone                                 |
| Event details with seat plan  | `/events/:slug`                                                                           | Everyone (login to continue to checkout) |
| Checkout, confirmation        | `/checkout`, `/orders/:orderNumber`                                                       | Customer                                 |
| Login, Register               | `/login`, `/register`                                                                     | Visitor                                  |
| My Tickets, Profile           | `/account/tickets`, `/account/profile`                                                    | Customer                                 |
| VIP page                      | `/vip`                                                                                    | Everyone (Should)                        |
| Admin dashboard, orders       | `/admin`, `/admin/orders`, `/admin/orders/:orderNumber`                                   | Admin                                    |
| Admin events, zones and perks | `/admin/events`, `/admin/events/new`, `/admin/events/:id/edit`, `/admin/events/:id/zones` | Admin                                    |
| Static                        | `/faq`, `/refund-policy`, `/privacy`, `/terms`                                            | Everyone                                 |- **API Interfaces**:

  - JSON: `GET /api/events/:id/seats` (layout and seat states), `POST /api/holds` (hold seats), `DELETE /api/holds/:holdId` (release), `POST /webhooks/payment` (gateway callback).

  - Payment gateway API in test mode, behind a small "payment provider" interface so a **mock provider** can replace it if integration is not ready in time.

  - Email service (SMTP or provider API), only for F-13.

- **Hardware Interfaces**: none.

- **Software Interfaces**: MongoDB Atlas; payment gateway; email service (Should).

## 11. Glossary

# - **Seat plan / seat map**: visual map of a venue where seats can be chosen

- **Zone**: group of seats with one price, color, and optional perks

- **VIP zone / Perk**: a zone marked VIP; a perk is a short line such as "Early entry lane"

- **Hold**: temporary reservation of seats during checkout (10 minutes)

- **Ticket**: one seat on a paid order, with a seat label and a reference QR image

- **Webhook**: callback from the payment gateway confirming a payment result

- **Seed**: script that loads the venue layout and sample events

## 12. Appendices

### Appendix A: Delivery Plan and Feasibility

# **A.1 Assumptions*** **Window:** Tue Nov 3 – Mon Nov 16, 2026 = **10 working days**. Mon Nov 2 and Mon Nov 30 are holidays (verify against the official proclamations).

* **Team:** 4 developers, each able to do Express code and HTML/JavaScript, full-time on this project.

* **Productivity:** 70% of each day is coding time, so each person gives **7 person-days**.

* Estimates are working guesses for a bootcamp-level team, not guarantees.**A.2 Work breakdown (person-days)**| Group      | Work items                                                                                                                                                                    | Days     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Foundation | Skeleton, models, layout, theme, sessions (1.5); registration, login, role guard (1.0); seed with seat-layout generator and per-seat records (1.5)                            | 4.0      |
| Customer   | Homepage (1.0); events page (1.5); event details (1.0); seat plan (3.0); hold, release, countdown (1.5); checkout, payment, callback (2.5); confirmation and My Tickets (1.0) | 11.5     |
| Admin      | Shell, dashboard, events CRUD, image upload (2.5); zones, perks, preview, publish (2.0); orders (1.0)                                                                         | 5.5      |
| Quality    | Double-booking tests, full-flow tests, mobile pass, fixes                                                                                                                     | 2.5      |
| Launch     | Deploy, environment variables, production seed                                                                                                                                | 1.0      |
|            | **Must total**                                                                                                                                                                | **24.5** |
| Should     | Profile 0.5 · VIP page 0.5 · Confirmation email 1.0 · Seat plan polish 1.5                                                                                                    | 3.5      |
|            | **Must + Should**                                                                                                                                                             | **28.0** |**A.4 Day plan and checkpoints**| Days | Dates     | Focus                                                                                                                                                                     |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–2  | Nov 3–4   | Skeleton, theme, auth, seed with sample venue; **start the seat plan on day 1** (riskiest part)                                                                           |
| 3–4  | Nov 5–6   | Browse pages, event details, seat status API, seat selection, hold API, admin shell. **Checkpoint 1 (Fri Nov 6):** browse, open an event, select seats; admin login works |
| 5–6  | Nov 9–10  | Hold flow with countdown, checkout, payment, admin events                                                                                                                 |
| 7–8  | Nov 11–12 | Tickets, zones and perks, admin orders; Should items if on track. **Checkpoint 2 and feature freeze (Thu Nov 12):** full test-mode purchase; admin can publish an event   |
| 9–10 | Nov 13–16 | Testing (two users on one seat, expiry, failed payment), mobile pass, fixes, deploy, demo and handover                                                                    |

### Appendix B: Document URLs

- ERD: <https://miro.com/app/board/uXjVEXqMZpo=/> 

- Wireframe: <https://stitch.withgoogle.com/projects/8741238950472922734> 

- Trello Board: <https://trello.com/b/SvNXWoQ7/mcp-side-project>&#x20;
