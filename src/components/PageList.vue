<script setup lang="ts">
import type { Page } from '@/models'
import PageCard from './PageCard.vue'

defineProps<{
  pages: Page[]
}>()
</script>

<template>
  <div class="divide-y divide-gray-100 dark:divide-gray-800">
    <PageCard
      v-for="page in pages"
      :key="page.id"
      :page="page"
    />
  </div>
</template>
