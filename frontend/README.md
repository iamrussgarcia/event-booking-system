# Spotlight frontend

Vue 3 + Vite, plain JavaScript (no TypeScript).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Structure

```
src/
  pages/        one file per routed screen (HomePage.vue, SeatPlanPage.vue, ...)
    admin/      admin screens, wrapped by AdminLayout.vue
  components/   shared pieces (AppNavbar, AppFooter, EventCard, QrCode, AppIcon)
  stores/       small reactive stores (auth, booking, admin)
  data/         seed data and the generated seat map
  router/       routes and the auth/admin guards
  styles/       global CSS tokens
```

Page files are named `<Name>Page.vue`.

## Icons

Use Lucide icons through the `AppIcon` component, never emoji:

```vue
<AppIcon name="calendar" />
```

The icon scales with the surrounding font size and takes the text colour. To use a new icon, import it from
`@lucide/vue` and register it in `src/components/AppIcon.vue`.

## Status

The app is front-end only for now. Sign-in, orders and admin edits are kept in `localStorage`, and payment is a mock.
The route guards are a convenience: the Express API must enforce roles and seat holds on the server.
