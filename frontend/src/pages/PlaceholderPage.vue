<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <section class="container ph">
    <small>FIGMA FRAME</small>
    <h1>{{ route.meta.title }}</h1>
    <p>This screen is routed and waiting to be built from its Figma frame.</p>
  </section>
</template>

<style scoped>
.ph {
  padding-top: 160px;
  min-height: 70vh;
}
small {
  color: var(--secondary);
  letter-spacing: 0.1em;
  font-size: 11px;
}
h1 {
  font-family: var(--font-display);
  font-size: 40px;
  margin-top: 8px;
}
p {
  margin-top: 8px;
  color: var(--text-subtle);
}
</style>
