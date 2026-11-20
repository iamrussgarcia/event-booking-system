import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../stores/auth'
import HomePage from '../pages/HomePage.vue'
import EventsPage from '../pages/EventsPage.vue'
import EventDetailPage from '../pages/EventDetailPage.vue'
import SeatPlanPage from '../pages/SeatPlanPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import ConfirmationPage from '../pages/ConfirmationPage.vue'
import TicketsPage from '../pages/TicketsPage.vue'
const AuthPage = () => import('../pages/AuthPage.vue')
const AccountPage = () => import('../pages/AccountPage.vue')
const VipPage = () => import('../pages/VipPage.vue')
const StaticPage = () => import('../pages/StaticPage.vue')
const Placeholder = () => import('../pages/PlaceholderPage.vue')
const AdminLayout = () => import('../pages/admin/AdminLayout.vue')
// Routes follow section 10 of the Technical Specification Document.
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: HomePage, meta: { title: 'Homepage' } },
    { path: '/events', component: EventsPage, meta: { title: 'Events' } },
    { path: '/events/:slug', component: EventDetailPage, meta: { title: 'Event Details' } },
    { path: '/events/:slug/seats', component: SeatPlanPage, meta: { title: 'Seat Selection' } },
    { path: '/checkout', component: CheckoutPage, meta: { title: 'Checkout', auth: true } },
    { path: '/orders/:orderNumber', component: ConfirmationPage, meta: { title: 'Confirmation', auth: true } },
    { path: '/login', component: AuthPage, meta: { title: 'Sign in', bare: true } },
    { path: '/register', component: AuthPage, meta: { title: 'Register', bare: true } },
    { path: '/account/tickets', component: TicketsPage, meta: { title: 'My Tickets', auth: true } },
    { path: '/account/profile', component: AccountPage, meta: { title: 'Profile Settings', auth: true } },
    { path: '/vip', component: VipPage, meta: { title: 'VIP' } },
    { path: '/faq', component: StaticPage, meta: { title: 'FAQ' } },
    { path: '/refund-policy', component: StaticPage, meta: { title: 'Refund Policy' } },
    { path: '/privacy', component: StaticPage, meta: { title: 'Privacy Notice' } },
    { path: '/terms', component: StaticPage, meta: { title: 'Terms of Service' } },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { title: 'Admin', admin: true, bare: true },
      children: [
        {
          path: '',
          component: () => import('../pages/admin/AdminDashboardPage.vue'),
          meta: { title: 'Admin Dashboard' },
        },
        {
          path: 'events',
          component: () => import('../pages/admin/AdminEventsPage.vue'),
          meta: { title: 'Admin Events' },
        },
        {
          path: 'events/new',
          component: () => import('../pages/admin/AdminEventEditorPage.vue'),
          meta: { title: 'New Event' },
        },
        {
          path: 'events/:id/edit',
          component: () => import('../pages/admin/AdminEventEditorPage.vue'),
          meta: { title: 'Edit Event' },
        },
        {
          path: 'events/:id/zones',
          component: () => import('../pages/admin/AdminZonesPage.vue'),
          meta: { title: 'Zones, Prices & VIP Perks' },
        },
        {
          path: 'orders',
          component: () => import('../pages/admin/AdminOrdersPage.vue'),
          meta: { title: 'Admin Orders' },
        },
        {
          path: 'orders/:orderNumber',
          component: () => import('../pages/admin/AdminOrdersPage.vue'),
          meta: { title: 'Order Detail' },
        },
      ],
    },
    { path: '/403', component: Placeholder, meta: { title: '403 – Admin access required' } },
    { path: '/:pathMatch(.*)*', component: Placeholder, meta: { title: 'Page not found (404)' } },
  ],
})
// Front-end guard only. The Express API must enforce roles server-side.
router.beforeEach((to) => {
  const needsAdmin = to.matched.some((r) => r.meta.admin)
  const needsAuth = needsAdmin || to.matched.some((r) => r.meta.auth)
  if (needsAuth && !auth.user) return { path: '/login', query: { next: to.fullPath } }
  if (needsAdmin && auth.user?.role !== 'admin') return '/403'
})
router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Spotlight'} – Spotlight`
})
export default router
