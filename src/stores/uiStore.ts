import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ViewMode = 'list' | 'grid' | 'compact'
export type SidebarSection = 'all' | 'favorites' | 'archived' | 'category' | 'tag'

export const useUiStore = defineStore('ui', () => {
  const viewMode = ref<ViewMode>('list')
  const activeSection = ref<SidebarSection>('all')
  const activeCategoryId = ref<string | null>(null)
  const activeTagId = ref<string | null>(null)

  const isSaveModalOpen = ref(false)
  const isSettingsOpen = ref(false)
  const isCategoryManagerOpen = ref(false)

  const selectedPageId = ref<string | null>(null)
  const editingPageId = ref<string | null>(null)

  const searchQuery = ref('')
  const isSearchFocused = ref(false)

  // Collapsed state - sidebar shows only icons when collapsed
  const isCollapsed = ref(true)
  const hasInitialized = ref(false)

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function setActiveSection(section: SidebarSection) {
    activeSection.value = section
    if (section !== 'category') activeCategoryId.value = null
    if (section !== 'tag') activeTagId.value = null
  }

  function setActiveCategory(categoryId: string | null) {
    activeSection.value = categoryId ? 'category' : 'all'
    activeCategoryId.value = categoryId
    activeTagId.value = null
  }

  function setActiveTag(tagId: string | null) {
    activeSection.value = tagId ? 'tag' : 'all'
    activeTagId.value = tagId
    activeCategoryId.value = null
  }

  function openSaveModal() {
    isSaveModalOpen.value = true
  }

  function closeSaveModal() {
    isSaveModalOpen.value = false
  }

  function openSettings() {
    isSettingsOpen.value = true
  }

  function closeSettings() {
    isSettingsOpen.value = false
  }

  function openCategoryManager() {
    isCategoryManagerOpen.value = true
  }

  function closeCategoryManager() {
    isCategoryManagerOpen.value = false
  }

  function selectPage(id: string | null) {
    selectedPageId.value = id
  }

  function startEditing(id: string) {
    editingPageId.value = id
    isSaveModalOpen.value = true
  }

  function stopEditing() {
    editingPageId.value = null
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function clearSearch() {
    searchQuery.value = ''
  }

  // Collapsed state management
  function expand() {
    isCollapsed.value = false
  }

  function collapse() {
    isCollapsed.value = true
  }

  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  // Initialize with proper state based on saved pages count
  function initializeCollapsedState(hasPages: boolean) {
    if (!hasInitialized.value) {
      isCollapsed.value = hasPages // Collapsed if has pages, expanded if empty
      hasInitialized.value = true
    }
  }

  return {
    viewMode,
    activeSection,
    activeCategoryId,
    activeTagId,
    isSaveModalOpen,
    isSettingsOpen,
    isCategoryManagerOpen,
    selectedPageId,
    editingPageId,
    searchQuery,
    isSearchFocused,
    isCollapsed,
    hasInitialized,
    setViewMode,
    setActiveSection,
    setActiveCategory,
    setActiveTag,
    openSaveModal,
    closeSaveModal,
    openSettings,
    closeSettings,
    openCategoryManager,
    closeCategoryManager,
    selectPage,
    startEditing,
    stopEditing,
    setSearchQuery,
    clearSearch,
    expand,
    collapse,
    toggleCollapsed,
    initializeCollapsedState
  }
})
