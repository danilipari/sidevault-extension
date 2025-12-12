import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Page, PageCreateInput, PageUpdateInput, PageFilters, PageSortField, SortOrder } from '@/models'
import { storageGet, storageSet, STORAGE_KEYS } from '@/utils/storage'
import { generateUUID, extractDomain } from '@/utils/helpers'

export const usePagesStore = defineStore('pages', () => {
  const pages = ref<Page[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<PageFilters>({})
  const sortField = ref<PageSortField>('createdAt')
  const sortOrder = ref<SortOrder>('desc')

  const filteredPages = computed(() => {
    let result = [...pages.value]

    if (filters.value.categoryId !== undefined) {
      result = result.filter(p => p.categoryId === filters.value.categoryId)
    }
    if (filters.value.tags?.length) {
      result = result.filter(p =>
        filters.value.tags!.some(t => p.tags.includes(t))
      )
    }
    if (filters.value.isFavorite !== undefined) {
      result = result.filter(p => p.isFavorite === filters.value.isFavorite)
    }
    if (filters.value.isArchived !== undefined) {
      result = result.filter(p => p.isArchived === filters.value.isArchived)
    } else {
      result = result.filter(p => !p.isArchived)
    }
    if (filters.value.domain) {
      result = result.filter(p => p.domain === filters.value.domain)
    }
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.url.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.tags.some(t => t.toLowerCase().includes(searchLower))
      )
    }

    result.sort((a, b) => {
      const aVal = a[sortField.value] ?? 0
      const bVal = b[sortField.value] ?? 0
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      }
      return sortOrder.value === 'asc' ? comparison : -comparison
    })

    return result
  })

  const totalPages = computed(() => pages.value.filter(p => !p.isArchived).length)
  const favoritePages = computed(() => pages.value.filter(p => p.isFavorite && !p.isArchived))
  const archivedPages = computed(() => pages.value.filter(p => p.isArchived))

  const domains = computed(() => {
    const domainMap = new Map<string, number>()
    pages.value.filter(p => !p.isArchived).forEach(p => {
      domainMap.set(p.domain, (domainMap.get(p.domain) || 0) + 1)
    })
    return Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
  })

  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      const stored = await storageGet<Page[]>(STORAGE_KEYS.PAGES)
      // Validate that stored data is an array
      pages.value = Array.isArray(stored) ? stored : []
      isInitialized.value = true
    } catch (e) {
      error.value = 'Failed to load pages'
      pages.value = []
      console.error('PagesStore init error:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function addPage(input: PageCreateInput): Promise<Page> {
    const now = Date.now()
    const newPage: Page = {
      id: generateUUID(),
      url: input.url,
      title: input.title,
      description: input.description || null,
      favicon: input.favicon || null,
      screenshot: input.screenshot || null,
      categoryId: input.categoryId || null,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
      visitCount: 0,
      lastVisitedAt: null,
      domain: extractDomain(input.url),
      isFavorite: false,
      isArchived: false
    }

    pages.value.unshift(newPage)
    await persist()
    return newPage
  }

  async function updatePage(id: string, input: PageUpdateInput): Promise<Page | null> {
    const index = pages.value.findIndex(p => p.id === id)
    if (index === -1) return null

    const updated = {
      ...pages.value[index],
      ...input,
      updatedAt: Date.now()
    }

    pages.value[index] = updated
    await persist()
    return updated
  }

  async function deletePage(id: string): Promise<boolean> {
    const index = pages.value.findIndex(p => p.id === id)
    if (index === -1) return false

    pages.value.splice(index, 1)
    await persist()
    return true
  }

  async function toggleFavorite(id: string): Promise<boolean> {
    const page = pages.value.find(p => p.id === id)
    if (!page) return false

    page.isFavorite = !page.isFavorite
    page.updatedAt = Date.now()
    await persist()
    return true
  }

  async function toggleArchive(id: string): Promise<boolean> {
    const page = pages.value.find(p => p.id === id)
    if (!page) return false

    page.isArchived = !page.isArchived
    page.updatedAt = Date.now()
    await persist()
    return true
  }

  async function incrementVisit(id: string) {
    const page = pages.value.find(p => p.id === id)
    if (page) {
      page.visitCount++
      page.lastVisitedAt = Date.now()
      await persist()
    }
  }

  async function persist() {
    await storageSet(STORAGE_KEYS.PAGES, pages.value)
  }

  function setFilters(newFilters: PageFilters) {
    filters.value = newFilters
  }

  function clearFilters() {
    filters.value = {}
  }

  function setSort(field: PageSortField, order: SortOrder) {
    sortField.value = field
    sortOrder.value = order
  }

  function findByUrl(url: string): Page | undefined {
    return pages.value.find(p => p.url === url)
  }

  return {
    pages,
    isLoading,
    isInitialized,
    error,
    filters,
    sortField,
    sortOrder,
    filteredPages,
    totalPages,
    favoritePages,
    archivedPages,
    domains,
    initialize,
    addPage,
    updatePage,
    deletePage,
    toggleFavorite,
    toggleArchive,
    incrementVisit,
    setFilters,
    clearFilters,
    setSort,
    findByUrl
  }
})
