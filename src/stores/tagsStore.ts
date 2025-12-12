import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tag, TagCreateInput, TagWithCount } from '@/models'
import { storageGet, storageSet, STORAGE_KEYS } from '@/utils/storage'
import { generateUUID, normalizeTagName } from '@/utils/helpers'
import { usePagesStore } from './pagesStore'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const tagsWithCount = computed<TagWithCount[]>(() => {
    const pagesStore = usePagesStore()
    return tags.value.map(tag => ({
      ...tag,
      pageCount: pagesStore.pages.filter(p => p.tags.includes(tag.id) && !p.isArchived).length
    }))
  })

  const popularTags = computed(() =>
    tagsWithCount.value
      .filter(t => t.pageCount > 0)
      .sort((a, b) => b.pageCount - a.pageCount)
      .slice(0, 10)
  )

  const sortedTags = computed(() =>
    [...tags.value].sort((a, b) => a.name.localeCompare(b.name))
  )

  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true

    try {
      const stored = await storageGet<Tag[]>(STORAGE_KEYS.TAGS)
      // Validate that stored data is an array
      tags.value = Array.isArray(stored) ? stored : []
      isInitialized.value = true
    } catch (e) {
      console.error('TagsStore init error:', e)
      tags.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function addTag(input: TagCreateInput): Promise<Tag> {
    const normalizedName = normalizeTagName(input.name)

    const existing = tags.value.find(t => t.name === normalizedName)
    if (existing) return existing

    const newTag: Tag = {
      id: generateUUID(),
      name: normalizedName,
      color: input.color || null,
      createdAt: Date.now()
    }

    tags.value.push(newTag)
    await persist()
    return newTag
  }

  async function updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<boolean> {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1) return false

    if (updates.name) {
      updates.name = normalizeTagName(updates.name)
    }

    tags.value[index] = { ...tags.value[index], ...updates }
    await persist()
    return true
  }

  async function deleteTag(id: string): Promise<boolean> {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1) return false

    tags.value.splice(index, 1)
    await persist()
    return true
  }

  async function persist() {
    await storageSet(STORAGE_KEYS.TAGS, tags.value)
  }

  function findByName(name: string): Tag | undefined {
    return tags.value.find(t => t.name === normalizeTagName(name))
  }

  function findById(id: string): Tag | undefined {
    return tags.value.find(t => t.id === id)
  }

  function searchTags(query: string): Tag[] {
    const q = query.toLowerCase()
    return tags.value.filter(t => t.name.includes(q))
  }

  return {
    tags,
    tagsWithCount,
    popularTags,
    sortedTags,
    isLoading,
    isInitialized,
    initialize,
    addTag,
    updateTag,
    deleteTag,
    findByName,
    findById,
    searchTags
  }
})
