import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, CategoryCreateInput, CategoryWithCount, CategoryColor } from '@/models'
import { storageGet, storageSet, STORAGE_KEYS } from '@/utils/storage'
import { generateUUID } from '@/utils/helpers'
import { usePagesStore } from './pagesStore'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const categoriesWithCount = computed<CategoryWithCount[]>(() => {
    const pagesStore = usePagesStore()
    return categories.value.map(cat => ({
      ...cat,
      pageCount: pagesStore.pages.filter(p => p.categoryId === cat.id && !p.isArchived).length
    }))
  })

  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.order - b.order)
  })

  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true

    try {
      const stored = await storageGet<Category[]>(STORAGE_KEYS.CATEGORIES)
      // Validate that stored data is an array
      if (Array.isArray(stored) && stored.length > 0) {
        categories.value = stored
      } else {
        categories.value = getDefaultCategories()
        await persist()
      }
      isInitialized.value = true
    } catch (e) {
      console.error('CategoriesStore init error:', e)
      categories.value = getDefaultCategories()
    } finally {
      isLoading.value = false
    }
  }

  function getDefaultCategories(): Category[] {
    const now = Date.now()
    const defaults: { name: string; color: CategoryColor }[] = [
      { name: 'Work', color: 'blue' },
      { name: 'Personal', color: 'green' },
      { name: 'Research', color: 'purple' },
      { name: 'Shopping', color: 'orange' },
      { name: 'Read Later', color: 'amber' }
    ]

    return defaults.map((cat, index) => ({
      id: generateUUID(),
      name: cat.name,
      color: cat.color,
      icon: null,
      order: index,
      createdAt: now
    }))
  }

  async function addCategory(input: CategoryCreateInput): Promise<Category> {
    const newCategory: Category = {
      id: generateUUID(),
      name: input.name,
      color: input.color || 'slate',
      icon: input.icon || null,
      order: categories.value.length,
      createdAt: Date.now()
    }

    categories.value.push(newCategory)
    await persist()
    return newCategory
  }

  async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<boolean> {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) return false

    categories.value[index] = { ...categories.value[index], ...updates }
    await persist()
    return true
  }

  async function deleteCategory(id: string): Promise<boolean> {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) return false

    categories.value.splice(index, 1)
    // Reorder remaining categories
    categories.value.forEach((cat, i) => {
      cat.order = i
    })
    await persist()
    return true
  }

  async function reorderCategories(orderedIds: string[]): Promise<boolean> {
    orderedIds.forEach((id, index) => {
      const cat = categories.value.find(c => c.id === id)
      if (cat) cat.order = index
    })
    await persist()
    return true
  }

  async function persist() {
    await storageSet(STORAGE_KEYS.CATEGORIES, categories.value)
  }

  function findById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories,
    categoriesWithCount,
    sortedCategories,
    isLoading,
    isInitialized,
    initialize,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    findById
  }
})
