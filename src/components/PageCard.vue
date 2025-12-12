<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Page } from '@/models'
import { usePagesStore, useCategoriesStore, useTagsStore, useUiStore } from '@/stores'
import { formatDate, truncateText, getFaviconUrl } from '@/utils/helpers'
import { COLOR_CLASSES } from '@/models/category.model'

const props = defineProps<{
  page: Page
}>()

const pagesStore = usePagesStore()
const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()
const uiStore = useUiStore()

const showActions = ref(false)

const category = computed(() =>
  props.page.categoryId ? categoriesStore.findById(props.page.categoryId) : null
)

const tags = computed(() =>
  props.page.tags.map(id => tagsStore.findById(id)).filter(Boolean)
)

const categoryClasses = computed(() => {
  if (!category.value) return null
  return COLOR_CLASSES[category.value.color]
})

function openPage() {
  pagesStore.incrementVisit(props.page.id)
  window.open(props.page.url, '_blank')
}

async function toggleFavorite(e: Event) {
  e.stopPropagation()
  await pagesStore.toggleFavorite(props.page.id)
}

async function toggleArchive(e: Event) {
  e.stopPropagation()
  await pagesStore.toggleArchive(props.page.id)
}

async function deletePage(e: Event) {
  e.stopPropagation()
  if (confirm('Delete this page?')) {
    await pagesStore.deletePage(props.page.id)
  }
}

function editPage(e: Event) {
  e.stopPropagation()
  uiStore.startEditing(props.page.id)
}
</script>

<template>
  <article
    class="group relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
    @click="openPage"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <div class="flex gap-3">
      <!-- Screenshot or Favicon -->
      <div class="flex-shrink-0 w-16 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          v-if="page.screenshot"
          :src="page.screenshot"
          :alt="page.title"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <img
            :src="getFaviconUrl(page.url)"
            :alt="page.domain"
            class="w-6 h-6"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ page.title }}
        </h3>

        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {{ page.domain }}
        </p>

        <div class="flex items-center gap-2 mt-1">
          <!-- Category badge -->
          <span
            v-if="category && categoryClasses"
            :class="[
              'px-1.5 py-0.5 text-xs rounded',
              categoryClasses.bg,
              categoryClasses.text
            ]"
          >
            {{ category.name }}
          </span>

          <!-- Tags -->
          <span
            v-for="tag in tags.slice(0, 2)"
            :key="tag!.id"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            #{{ tag!.name }}
          </span>

          <span
            v-if="tags.length > 2"
            class="text-xs text-gray-400"
          >
            +{{ tags.length - 2 }}
          </span>
        </div>
      </div>

      <!-- Favorite indicator -->
      <div class="flex-shrink-0 flex flex-col items-end justify-between">
        <button
          @click="toggleFavorite"
          :class="[
            'p-1 rounded transition-colors',
            page.isFavorite
              ? 'text-yellow-500'
              : 'text-gray-300 hover:text-yellow-500'
          ]"
        >
          <svg
            class="w-4 h-4"
            :fill="page.isFavorite ? 'currentColor' : 'none'"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        <span class="text-xs text-gray-400">
          {{ formatDate(page.createdAt) }}
        </span>
      </div>
    </div>

    <!-- Hover Actions -->
    <div
      v-show="showActions"
      class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1"
    >
      <button
        @click="editPage"
        class="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
        title="Edit"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        @click="toggleArchive"
        class="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition-colors"
        :title="page.isArchived ? 'Unarchive' : 'Archive'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </button>

      <button
        @click="deletePage"
        class="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
        title="Delete"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </article>
</template>
