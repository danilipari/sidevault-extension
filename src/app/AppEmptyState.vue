<script setup lang="ts">
import { useUiStore } from '@/stores'

const uiStore = useUiStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
    <div class="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </div>

    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No saved pages yet
    </h3>

    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
      Save your favorite web pages to access them quickly from this sidebar.
    </p>

    <button
      @click="uiStore.openSaveModal()"
      class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Save Current Page
    </button>

    <p class="mt-4 text-xs text-gray-400">
      Tip: Press <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">Cmd+Shift+S</kbd> to save quickly
    </p>
  </div>
</template>
