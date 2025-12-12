<script setup lang="ts">
import type { Page } from '@/models'
import { usePagesStore } from '@/stores'
import { getFaviconUrl } from '@/utils/helpers'

defineProps<{
  pages: Page[]
}>()

const pagesStore = usePagesStore()

function openPage(page: Page) {
  pagesStore.incrementVisit(page.id)
  window.open(page.url, '_blank')
}
</script>

<template>
  <div class="flex flex-col items-center gap-2 p-2">
    <button
      v-for="page in pages"
      :key="page.id"
      @click="openPage(page)"
      class="relative group flex items-center justify-center w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors overflow-hidden shrink-0"
      :title="page.title"
    >
      <!-- Screenshot thumbnail or favicon -->
      <img
        v-if="page.screenshot"
        :src="page.screenshot"
        :alt="page.title"
        class="w-full h-full object-cover"
      />
      <img
        v-else
        :src="getFaviconUrl(page.url)"
        :alt="page.domain"
        class="w-5 h-5"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />

      <!-- Favorite indicator -->
      <div
        v-if="page.isFavorite"
        class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"
      ></div>
    </button>
  </div>
</template>
