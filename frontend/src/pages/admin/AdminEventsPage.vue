<script setup>
import AppIcon from '../../components/AppIcon.vue'
import AdminEventsPanel from '../../components/admin/AdminEventsPanel.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="a-head">
    <div>
      <span class="a-eyebrow"><i /> Event management</span>
      <h1 class="a-title">Events</h1>
      <p class="a-lead">Create, publish, feature and manage arena events. Events with sold seats cannot be unpublished or deleted.</p>
    </div>
    <div class="a-actions">
      <RouterLink to="/admin/events/new" class="a-btn primary"><AppIcon name="plus" /> Create New Event</RouterLink>
    </div>
  </div>
  <AdminEventsPanel title="All Events" manage :page-size="8" />
</template>
