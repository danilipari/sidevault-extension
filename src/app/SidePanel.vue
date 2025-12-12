<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { usePagesStore, useCategoriesStore, useTagsStore, useUiStore } from '@/stores'
import AppHeader from './AppHeader.vue'
import AppSearch from './AppSearch.vue'
import AppEmptyState from './AppEmptyState.vue'
import PageList from '@/components/PageList.vue'
import PageIconGrid from '@/components/PageIconGrid.vue'
import SavePageModal from '@/components/SavePageModal.vue'

const pagesStore = usePagesStore()
const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()
const uiStore = useUiStore()

const isLoading = computed(() =>
  pagesStore.isLoading || categoriesStore.isLoading || tagsStore.isLoading
)

const hasPages = computed(() => pagesStore.filteredPages.length > 0)

// Apply filters based on UI state
watch(
  () => [uiStore.activeSection, uiStore.activeCategoryId, uiStore.activeTagId, uiStore.searchQuery],
  () => {
    const filters: Record<string, unknown> = {}

    if (uiStore.activeSection === 'favorites') {
      filters.isFavorite = true
    } else if (uiStore.activeSection === 'archived') {
      filters.isArchived = true
    } else if (uiStore.activeSection === 'category' && uiStore.activeCategoryId) {
      filters.categoryId = uiStore.activeCategoryId
    } else if (uiStore.activeSection === 'tag' && uiStore.activeTagId) {
      filters.tags = [uiStore.activeTagId]
    }

    if (uiStore.searchQuery) {
      filters.search = uiStore.searchQuery
    }

    pagesStore.setFilters(filters)
  },
  { immediate: true }
)

// Listen for save trigger from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRIGGER_SAVE') {
    uiStore.openSaveModal()
  }
})

function handleAddClick() {
  uiStore.openSaveModal()
}

onMounted(async () => {
  await Promise.all([
    pagesStore.initialize(),
    categoriesStore.initialize(),
    tagsStore.initialize()
  ])
})
</script>

<template>
  <!-- Container with CSS container query support -->
  <div class="panel-container">
    <!-- Compact View (narrow panel) -->
    <div class="compact-view">
      <header class="flex flex-col items-center py-3 px-1 border-b border-gray-200 dark:border-gray-700">
        <!-- Logo -->
        <div class="flex items-center justify-center w-10 h-10 text-blue-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        <!-- Add button -->
        <button
          @click="handleAddClick"
          class="mt-2 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title="Save current page"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>
      <main class="flex-1 overflow-y-auto">
        <div v-if="isLoading" class="flex items-center justify-center h-20">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
        <template v-else-if="hasPages">
          <PageIconGrid :pages="pagesStore.filteredPages" />
        </template>
        <div v-else class="flex items-center justify-center h-20">
          <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
      </main>
    </div>

    <!-- Full View (wide panel) -->
    <div class="full-view">
      <AppHeader />
      <AppSearch />
      <main class="flex-1 overflow-y-auto">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <template v-else>
          <PageList v-if="hasPages" :pages="pagesStore.filteredPages" />
          <AppEmptyState v-else />
        </template>
      </main>
    </div>

    <!-- Save Modal -->
    <SavePageModal
      v-if="uiStore.isSaveModalOpen"
      @close="uiStore.closeSaveModal()"
    />
  </div>
</template>

<style scoped>
.panel-container {
  container-type: inline-size;
  width: 100%;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

/* Compact view: shown when panel is narrow (< 150px) */
.compact-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* Full view: hidden by default */
.full-view {
  display: none;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* When panel is wide enough (>= 150px), show full view */
@container (min-width: 150px) {
  .compact-view {
    display: none;
  }
  .full-view {
    display: flex;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .panel-container {
    background: #111827;
  }
}
</style>
