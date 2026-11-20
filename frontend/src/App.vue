<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
const route = useRoute()
// Auth screens and the admin area bring their own chrome.
const isAdmin = () => route.matched.some((r) => r.meta.admin)
</script>

<template>
  <div class="app">
    <template v-if="isAdmin()"><RouterView /></template>
    <template v-else>
      <AppNavbar />
      <main><RouterView /></main>
      <AppFooter v-if="!route.meta.bare" />
    </template>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
}
</style>
