<script setup>
// Header shared by the event form and the zones screen: breadcrumb, status chips, actions slot and the 3 tabs.
import AppIcon from '../AppIcon.vue'
import { RouterLink } from 'vue-router'
import { eventCode } from '../../stores/admin'

defineProps({
  event: { type: Object, default: null },
  isNew: { type: Boolean, default: false },
  tab: { type: String, required: true },
  endLabel: { type: String, default: 'Edit' },
  chips: { type: Array, default: () => [] },
  notices: { type: Object, default: () => ({ details: 0, policies: 0 }) },
  zonesCount: { type: Number, default: 0 },
})
</script>

<template>
  <div class="eh">
    <div class="row1">
      <RouterLink to="/admin/events" class="a-btn sm back"><AppIcon name="arrow-left" /> Back to Events</RouterLink>
      <nav class="a-crumb" aria-label="Breadcrumb">
        <span>/</span>
        <RouterLink to="/admin/events">Events</RouterLink>
        <span>/</span>
        <b class="ttl">{{ event?.title || 'New event' }}</b>
        <span>/</span>
        <b>{{ isNew ? 'New' : endLabel }}</b>
      </nav>
      <span v-if="event?.date" class="code">EVENT ID: <b>{{ eventCode(event) }}</b></span>
    </div>

    <div class="chips">
      <span v-for="c in chips" :key="c.text" class="a-pill nodot" :class="c.tone">
        <AppIcon v-if="c.icon" :name="c.icon" />
        <i v-else-if="c.dot" class="d" />
        {{ c.text }}
      </span>
    </div>

    <div class="a-actions acts"><slot name="actions" /></div>

    <div class="a-tabs" role="tablist" aria-label="Event sections">
      <RouterLink
        :to="isNew ? { path: '/admin/events/new' } : { path: `/admin/events/${event.id}/edit` }"
        :class="{ on: tab === 'details' }"
        role="tab"
        :aria-selected="tab === 'details'"
      >
        <AppIcon name="sliders-horizontal" /> 1. Details <span v-if="notices.details" class="count">{{ notices.details }}</span>
      </RouterLink>
      <RouterLink
        :to="isNew ? { path: '/admin/events/new', query: { tab: 'policies' } } : { path: `/admin/events/${event.id}/edit`, query: { tab: 'policies' } }"
        :class="{ on: tab === 'policies' }"
        role="tab"
        :aria-selected="tab === 'policies'"
      >
        <AppIcon name="file-text" /> 2. Text &amp; Policies <span v-if="notices.policies" class="count">{{ notices.policies }}</span>
      </RouterLink>
      <RouterLink v-if="!isNew" :to="`/admin/events/${event.id}/zones`" :class="{ on: tab === 'zones' }" role="tab" :aria-selected="tab === 'zones'">
        <AppIcon name="armchair" /> 3. Zones &amp; VIP Perks <span class="tier">{{ zonesCount }} {{ zonesCount === 1 ? 'Tier' : 'Tiers' }}</span>
      </RouterLink>
      <span v-else class="off" title="Save the draft first to configure zones"><AppIcon name="armchair" /> 3. Zones &amp; VIP Perks</span>
    </div>
  </div>
</template>

<style scoped>
.eh { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.row1 { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.back { padding: 9px 16px; font-size: 14px; }
.a-crumb a:hover { color: var(--primary); }
.ttl { color: var(--text); font-weight: 600; }
.code { margin-left: auto; font-size: 13px; letter-spacing: 0.04em; color: var(--text-muted); }
.code b { margin-left: 6px; padding: 5px 10px; border-radius: var(--radius-sm); background: var(--surface-low); color: var(--secondary); font-weight: 600; }
.chips { display: flex; gap: 10px; flex-wrap: wrap; }
.chips .a-pill { padding: 8px 16px; font-size: 14px; font-weight: 500; }
.d { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.acts { gap: 10px; }
.a-tabs { align-self: flex-start; max-width: 100%; }
@media (max-width: 600px) {
  .code { margin-left: 0; }
  .a-tabs a, .a-tabs span.off { padding: 10px 12px; font-size: 14px; }
}
</style>
