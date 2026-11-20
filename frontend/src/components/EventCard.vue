<script setup>
import AppIcon from './AppIcon.vue'
import { RouterLink } from 'vue-router'
import { peso } from '../data/events'
defineProps({
  event: { type: Object, required: true },
})
</script>

<template>
  <article class="card">
    <RouterLink :to="`/events/${event.slug}`" class="media">
      <img :src="event.image" :alt="event.title" loading="lazy" />
      <span class="tag">{{ event.genre }} • {{ event.tag }}</span>
      <span class="range">{{ peso(event.priceFrom) }} - {{ peso(event.priceTo) }}</span>
    </RouterLink>
    <div class="body">
      <h3>{{ event.title }}</h3>
      <p class="artist">{{ event.artist }}</p>
      <p class="meta">
        <span><AppIcon name="calendar" /> {{ event.date }} • {{ event.time }}</span>
        <span><AppIcon name="map-pin" /> {{ event.venue }}</span>
      </p>
      <div class="foot">
        <div>
          <small>Starting at</small>
          <strong>{{ peso(event.priceFrom) }}</strong>
        </div>
        <RouterLink :to="`/events/${event.slug}`" class="btn btn-primary">{{ event.cta }}</RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--surface-low);
  border: 1px solid rgba(73, 68, 84, 0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tag,
.range {
  position: absolute;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}
.tag {
  top: 12px;
  left: 14px;
  color: var(--primary);
}
.range {
  right: 14px;
  bottom: 10px;
  color: var(--gold);
}
.body {
  padding: 16px 20px 20px;
}
h3 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 18px;
}
.artist {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-subtle);
}
.meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
}
.foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(73, 68, 84, 0.3);
}
small {
  display: block;
  font-size: 11px;
  color: var(--text-subtle);
}
strong {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--text);
}
.foot .btn {
  padding: 6px 16px;
  font-size: 12px;
}
</style>
