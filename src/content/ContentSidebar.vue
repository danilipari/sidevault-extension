<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePagesStore, useCategoriesStore, useTagsStore } from '@/stores'
import { getFaviconUrl } from '@/utils/helpers'
import type { Page } from '@/models'

const pagesStore = usePagesStore()
const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()

// Sidebar state
const isVisible = ref(true)
const isExpanded = ref(false)
const activeTab = ref<'all' | 'favorites' | 'archived'>('all')
const searchQuery = ref('')

const isLoading = computed(() =>
  pagesStore.isLoading || categoriesStore.isLoading || tagsStore.isLoading
)

const filteredPages = computed(() => {
  let pages = pagesStore.pages

  // Filter by tab
  if (activeTab.value === 'favorites') {
    pages = pages.filter(p => p.isFavorite && !p.isArchived)
  } else if (activeTab.value === 'archived') {
    pages = pages.filter(p => p.isArchived)
  } else {
    pages = pages.filter(p => !p.isArchived)
  }

  // Filter by search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    pages = pages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.url.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    )
  }

  return pages.slice(0, 50) // Limit for performance
})

const hasPages = computed(() => filteredPages.value.length > 0)

// Update body margin when sidebar changes
watch([isVisible, isExpanded], () => {
  updateBodyMargin()
})

function updateBodyMargin() {
  if (!isVisible.value) {
    document.body.style.marginRight = '0'
  } else if (isExpanded.value) {
    document.body.style.marginRight = '320px'
  } else {
    document.body.style.marginRight = '40px'
  }
}

function toggleSidebar() {
  isVisible.value = !isVisible.value
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function openPage(page: Page) {
  pagesStore.incrementVisit(page.id)
  window.open(page.url, '_blank')
}

async function saveCurrentPage() {
  const pageData = {
    url: window.location.href,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
    favicon: getFaviconUrl(window.location.href),
  }

  console.log('[SideVault] Saving page:', pageData)

  // Expand sidebar to show the saved page
  isExpanded.value = true

  try {
    const saved = await pagesStore.addPage(pageData)
    console.log('[SideVault] Page saved:', saved)
    console.log('[SideVault] Total pages now:', pagesStore.pages.length)
  } catch (error) {
    console.error('[SideVault] Failed to save page:', error)
  }
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SIDEBAR') {
    toggleSidebar()
  } else if (message.type === 'TRIGGER_SAVE') {
    isVisible.value = true
    saveCurrentPage()
  }
})

// Listen for storage changes (from other tabs)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return

  if (changes.sidevault_pages) {
    console.log('[SideVault] Pages changed in storage, reloading...')
    const newPages = changes.sidevault_pages.newValue
    if (Array.isArray(newPages)) {
      pagesStore.pages = newPages
    }
  }

  if (changes.sidevault_categories) {
    console.log('[SideVault] Categories changed in storage, reloading...')
    const newCategories = changes.sidevault_categories.newValue
    if (Array.isArray(newCategories)) {
      categoriesStore.categories = newCategories
    }
  }

  if (changes.sidevault_tags) {
    console.log('[SideVault] Tags changed in storage, reloading...')
    const newTags = changes.sidevault_tags.newValue
    if (Array.isArray(newTags)) {
      tagsStore.tags = newTags
    }
  }
})

onMounted(async () => {
  console.log('[SideVault] Component mounting, initializing stores...')

  await Promise.all([
    pagesStore.initialize(),
    categoriesStore.initialize(),
    tagsStore.initialize()
  ])

  console.log('[SideVault] Stores initialized, pages loaded:', pagesStore.pages.length)
  console.log('[SideVault] Pages:', pagesStore.pages)

  // Set initial state based on saved pages
  isExpanded.value = pagesStore.pages.length === 0
  updateBodyMargin()
})
</script>

<template>
  <div
    class="sidevault-sidebar"
    :class="{
      collapsed: isVisible && !isExpanded,
      expanded: isVisible && isExpanded,
      hidden: !isVisible
    }"
  >
    <!-- Collapsed View -->
    <template v-if="isVisible && !isExpanded">
      <header class="sv-header">
        <button class="sv-btn sv-btn-icon" @click="toggleExpand" title="Expand">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </button>
        <button class="sv-btn sv-btn-primary" @click="saveCurrentPage" title="Save page">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>

      <div class="sv-content">
        <div v-if="isLoading" class="sv-loading">
          <div class="sv-spinner"></div>
        </div>
        <div v-else-if="hasPages" class="sv-icon-grid">
          <button
            v-for="page in filteredPages"
            :key="page.id"
            class="sv-icon-btn"
            @click="openPage(page)"
            :title="page.title"
          >
            <img
              v-if="page.screenshot"
              :src="page.screenshot"
              class="screenshot"
            />
            <img
              v-else
              :src="getFaviconUrl(page.url)"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span v-if="page.isFavorite" class="sv-favorite-dot"></span>
          </button>
        </div>
        <div v-else class="sv-empty">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
      </div>
    </template>

    <!-- Expanded View -->
    <template v-if="isVisible && isExpanded">
      <header class="sv-header expanded">
        <div class="sv-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <span class="sv-logo-text">SideVault</span>
        </div>
        <div class="sv-actions">
          <button class="sv-btn sv-btn-primary" @click="saveCurrentPage" title="Save page">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button class="sv-btn sv-btn-icon" @click="toggleExpand" title="Collapse">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <div class="sv-search">
        <input
          v-model="searchQuery"
          type="text"
          class="sv-search-input"
          placeholder="Search pages..."
        />
      </div>

      <div class="sv-tabs">
        <button
          class="sv-tab"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          All
        </button>
        <button
          class="sv-tab"
          :class="{ active: activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          Favorites
        </button>
        <button
          class="sv-tab"
          :class="{ active: activeTab === 'archived' }"
          @click="activeTab = 'archived'"
        >
          Archive
        </button>
      </div>

      <div class="sv-content">
        <div v-if="isLoading" class="sv-loading">
          <div class="sv-spinner"></div>
        </div>
        <div v-else-if="hasPages" class="sv-page-list">
          <div
            v-for="page in filteredPages"
            :key="page.id"
            class="sv-page-card"
            @click="openPage(page)"
          >
            <div class="sv-page-thumb">
              <img
                v-if="page.screenshot"
                :src="page.screenshot"
              />
              <img
                v-else
                :src="getFaviconUrl(page.url)"
                class="favicon"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
            </div>
            <div class="sv-page-info">
              <div class="sv-page-title">{{ page.title }}</div>
              <div class="sv-page-domain">{{ page.domain }}</div>
            </div>
          </div>
        </div>
        <div v-else class="sv-empty">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p>No pages saved yet</p>
          <p style="font-size: 12px; margin-top: 4px;">Click + to save this page</p>
        </div>
      </div>
    </template>
  </div>
</template>
