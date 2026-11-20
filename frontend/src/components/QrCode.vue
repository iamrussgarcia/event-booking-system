<script setup>
import { computed } from 'vue'
// Reference-only QR-style image drawn from the ticket token (spec: the QR is a visual
// reference, checking at the venue is outside the system). Not a scannable QR code.
const props = defineProps({
  token: { type: String, required: true },
  size: { type: Number, default: undefined },
})
const N = 25
const cells = computed(() => {
  let h = 2166136261
  for (const c of props.token) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  const next = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296
  const out = []
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && next() > 0.52) out.push({ x, y })
  return out
})
const finders = [
  [0, 0],
  [N - 7, 0],
  [0, N - 7],
]
</script>

<template>
  <svg :width="size ?? 100" :height="size ?? 100" :viewBox="`-1 -1 ${N + 2} ${N + 2}`" role="img" aria-label="Ticket QR reference" shape-rendering="crispEdges">
    <rect x="-1" y="-1" :width="N + 2" :height="N + 2" fill="#fff" />
    <rect v-for="c in cells" :key="`${c.x}-${c.y}`" :x="c.x" :y="c.y" width="1" height="1" fill="#0c0e17" />
    <g v-for="[fx, fy] in finders" :key="`${fx}${fy}`">
      <rect :x="fx" :y="fy" width="7" height="7" fill="#0c0e17" />
      <rect :x="fx + 1" :y="fy + 1" width="5" height="5" fill="#fff" />
      <rect :x="fx + 2" :y="fy + 2" width="3" height="3" fill="#0c0e17" />
    </g>
  </svg>
</template>
