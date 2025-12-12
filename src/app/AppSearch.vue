<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUiStore, useCategoriesStore } from '@/stores'
import { debounce } from '@/utils/helpers'

const uiStore = useUiStore()
const categoriesStore = useCategoriesStore()

const localQuery = ref('')
const showFilters = ref(false)

const debouncedSetSearch = debounce((value: string) => {
  uiStore.setSearchQuery(value)
}, 300)

watch(localQuery, (value) => {
  debouncedSetSearch(value)
})

const hasActiveFilters = computed(() => {
  return uiStore.activeCategoryId !== null || uiStore.activeTagId !== null
})

function clearFilters() {
  uiStore.setActiveSection('all')
  localQuery.value = ''
  uiStore.clearSearch()
}
</script>

<template>
  <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        v-model="localQuery"
        type="text"
        placeholder="Search pages..."
        class="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
      />

      <button
        v-if="localQuery"
        @click="localQuery = ''; uiStore.clearSearch()"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Category Filter Pills -->
    <div class="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
      <button
        v-for="category in categoriesStore.categoriesWithCount"
        :key="category.id"
        @click="uiStore.setActiveCategory(uiStore.activeCategoryId === category.id ? null : category.id)"
        :class="[
          'flex items-center gap-1 px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors',
          uiStore.activeCategoryId === category.id
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
      >
        <span>{{ category.name }}</span>
        <span class="opacity-70">({{ category.pageCount }})</span>
      </button>
    </div>

    <button
      v-if="hasActiveFilters"
      @click="clearFilters"
      class="mt-2 text-xs text-blue-500 hover:text-blue-600"
    >
      Clear filters
    </button>
  </div>
</template>
