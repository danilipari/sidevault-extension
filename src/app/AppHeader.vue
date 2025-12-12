<script setup lang="ts">
import { computed } from 'vue'
import { usePagesStore, useCategoriesStore, useUiStore } from '@/stores'

const pagesStore = usePagesStore()
const categoriesStore = useCategoriesStore()
const uiStore = useUiStore()

const sectionTitle = computed(() => {
  switch (uiStore.activeSection) {
    case 'favorites':
      return 'Favorites'
    case 'archived':
      return 'Archived'
    case 'category':
      const cat = categoriesStore.findById(uiStore.activeCategoryId || '')
      return cat?.name || 'Category'
    case 'tag':
      return 'Tagged'
    default:
      return 'All Pages'
  }
})

const pageCount = computed(() => {
  if (uiStore.activeSection === 'favorites') {
    return pagesStore.favoritePages.length
  }
  if (uiStore.activeSection === 'archived') {
    return pagesStore.archivedPages.length
  }
  return pagesStore.filteredPages.length
})
</script>

<template>
  <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          SideVault
        </h1>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <button
        @click="uiStore.openSaveModal()"
        class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        title="Save current page (Cmd+Shift+S)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </header>

  <div class="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-2">
      <button
        v-if="uiStore.activeSection !== 'all'"
        @click="uiStore.setActiveSection('all')"
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ sectionTitle }}
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400">
        ({{ pageCount }})
      </span>
    </div>

    <div class="flex items-center gap-1">
      <button
        @click="uiStore.setActiveSection('all')"
        :class="[
          'px-2 py-1 text-xs rounded transition-colors',
          uiStore.activeSection === 'all'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        ]"
      >
        All
      </button>
      <button
        @click="uiStore.setActiveSection('favorites')"
        :class="[
          'px-2 py-1 text-xs rounded transition-colors',
          uiStore.activeSection === 'favorites'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        ]"
      >
        Favorites
      </button>
      <button
        @click="uiStore.setActiveSection('archived')"
        :class="[
          'px-2 py-1 text-xs rounded transition-colors',
          uiStore.activeSection === 'archived'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        ]"
      >
        Archive
      </button>
    </div>
  </div>
</template>
