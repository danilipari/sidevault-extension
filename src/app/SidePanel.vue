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

// Initialize collapsed state after pages are loaded
watch(
  () => pagesStore.isInitialized,
  (initialized) => {
    if (initialized) {
      uiStore.initializeCollapsedState(pagesStore.totalPages > 0)
    }
  }
)

// Expand when opening save modal
watch(
  () => uiStore.isSaveModalOpen,
  (isOpen) => {
    if (isOpen) {
      uiStore.expand()
    }
  }
)

// Expand when searching
watch(
  () => uiStore.searchQuery,
  (query) => {
    if (query) {
      uiStore.expand()
    }
  }
)

// Listen for save trigger from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRIGGER_SAVE') {
    uiStore.expand()
    uiStore.openSaveModal()
  }
})

function handleAddClick() {
  uiStore.expand()
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
  <!-- Outer container always fills the panel -->
  <div class="flex h-screen w-full bg-gray-100 dark:bg-gray-950">
    <!-- Collapsed View -->
    <template v-if="uiStore.isCollapsed">
      <!-- Narrow sidebar strip -->
      <div class="flex flex-col w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shrink-0">
        <!-- Header -->
        <header class="flex flex-col items-center py-3 px-2 border-b border-gray-200 dark:border-gray-700">
          <!-- Logo/Expand button -->
          <button
            @click="uiStore.expand()"
            class="flex items-center justify-center w-10 h-10 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="Expand sidebar"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </button>

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

        <!-- Icon list -->
        <main class="flex-1 overflow-y-auto">
          <div v-if="isLoading" class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
          <template v-else-if="hasPages">
            <PageIconGrid :pages="pagesStore.filteredPages" />
          </template>
          <div v-else class="flex items-center justify-center h-32">
            <button
              @click="handleAddClick"
              class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Save your first page"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </main>
      </div>

      <!-- Clickable expand area -->
      <div
        @click="uiStore.expand()"
        class="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors"
        title="Click to expand"
      >
        <div class="text-gray-400 dark:text-gray-600 flex flex-col items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span class="text-xs">Expand</span>
        </div>
      </div>
    </template>

    <!-- Expanded View -->
    <div v-else class="flex flex-col w-full bg-white dark:bg-gray-900">
      <AppHeader @collapse="uiStore.collapse()" />
      <AppSearch />

      <!-- Main Content -->
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
