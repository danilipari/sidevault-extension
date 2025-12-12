<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePagesStore, useCategoriesStore, useTagsStore, useUiStore } from '@/stores'
import { captureScreenshot, getCurrentTab } from '@/utils/screenshot'
import { getFaviconUrl } from '@/utils/helpers'
import type { PageCreateInput, PageUpdateInput } from '@/models'

const emit = defineEmits<{
  close: []
}>()

const pagesStore = usePagesStore()
const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()
const uiStore = useUiStore()

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)

const url = ref('')
const title = ref('')
const description = ref('')
const screenshot = ref<string | null>(null)
const favicon = ref<string | null>(null)
const selectedCategoryId = ref<string | null>(null)
const selectedTagIds = ref<string[]>([])
const newTagInput = ref('')

const isEditing = computed(() => !!uiStore.editingPageId)

const existingPage = computed(() => {
  if (uiStore.editingPageId) {
    return pagesStore.pages.find(p => p.id === uiStore.editingPageId)
  }
  return null
})

const alreadySaved = computed(() => {
  if (isEditing.value) return false
  return url.value ? !!pagesStore.findByUrl(url.value) : false
})

async function loadCurrentPage() {
  isLoading.value = true
  error.value = null

  try {
    const tab = await getCurrentTab()
    if (!tab) {
      error.value = 'Could not get current tab'
      return
    }

    url.value = tab.url || ''
    title.value = tab.title || ''
    favicon.value = getFaviconUrl(url.value)

    if (tab.id) {
      screenshot.value = await captureScreenshot(tab.id)
    }
  } catch (e) {
    error.value = 'Failed to load page info'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function loadExistingPage() {
  if (!existingPage.value) return

  url.value = existingPage.value.url
  title.value = existingPage.value.title
  description.value = existingPage.value.description || ''
  screenshot.value = existingPage.value.screenshot
  favicon.value = existingPage.value.favicon
  selectedCategoryId.value = existingPage.value.categoryId
  selectedTagIds.value = [...existingPage.value.tags]
}

async function handleSave() {
  if (!url.value || !title.value) return

  isSaving.value = true
  error.value = null

  try {
    if (isEditing.value && existingPage.value) {
      const updates: PageUpdateInput = {
        title: title.value,
        description: description.value || undefined,
        categoryId: selectedCategoryId.value,
        tags: selectedTagIds.value
      }
      await pagesStore.updatePage(existingPage.value.id, updates)
    } else {
      const input: PageCreateInput = {
        url: url.value,
        title: title.value,
        description: description.value || undefined,
        screenshot: screenshot.value || undefined,
        favicon: favicon.value || undefined,
        categoryId: selectedCategoryId.value || undefined,
        tags: selectedTagIds.value
      }
      await pagesStore.addPage(input)
    }

    uiStore.stopEditing()
    emit('close')
  } catch (e) {
    error.value = 'Failed to save page'
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

async function addNewTag() {
  if (!newTagInput.value.trim()) return

  const tag = await tagsStore.addTag({ name: newTagInput.value })
  if (!selectedTagIds.value.includes(tag.id)) {
    selectedTagIds.value.push(tag.id)
  }
  newTagInput.value = ''
}

function removeTag(tagId: string) {
  selectedTagIds.value = selectedTagIds.value.filter(id => id !== tagId)
}

function handleClose() {
  uiStore.stopEditing()
  emit('close')
}

onMounted(() => {
  if (isEditing.value) {
    loadExistingPage()
  } else {
    loadCurrentPage()
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="handleClose">
    <div class="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Edit Page' : 'Save Page' }}
        </h2>
        <button
          @click="handleClose"
          class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 max-h-[70vh] overflow-y-auto">
        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <template v-else>
          <!-- Error -->
          <div
            v-if="error"
            class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm"
          >
            {{ error }}
          </div>

          <!-- Already saved warning -->
          <div
            v-if="alreadySaved"
            class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm"
          >
            This page is already saved
          </div>

          <!-- Screenshot Preview -->
          <div
            v-if="screenshot"
            class="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <img :src="screenshot" :alt="title" class="w-full h-32 object-cover" />
          </div>

          <!-- URL (readonly) -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              URL
            </label>
            <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 truncate">
              <img v-if="favicon" :src="favicon" class="w-4 h-4" />
              <span class="truncate">{{ url }}</span>
            </div>
          </div>

          <!-- Title -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Title
            </label>
            <input
              v-model="title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Notes (optional)
            </label>
            <textarea
              v-model="description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add your notes..."
            ></textarea>
          </div>

          <!-- Category -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Category
            </label>
            <select
              v-model="selectedCategoryId"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">No category</option>
              <option
                v-for="cat in categoriesStore.sortedCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Tags -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tags
            </label>

            <!-- Selected tags -->
            <div v-if="selectedTagIds.length" class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="tagId in selectedTagIds"
                :key="tagId"
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs"
              >
                {{ tagsStore.findById(tagId)?.name }}
                <button @click="removeTag(tagId)" class="hover:text-blue-900">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>

            <!-- Add tag input -->
            <div class="flex gap-2">
              <input
                v-model="newTagInput"
                type="text"
                placeholder="Add tag..."
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                @keydown.enter.prevent="addNewTag"
              />
              <button
                @click="addNewTag"
                :disabled="!newTagInput.trim()"
                class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <!-- Existing tags suggestions -->
            <div v-if="tagsStore.popularTags.length" class="flex flex-wrap gap-1 mt-2">
              <button
                v-for="tag in tagsStore.popularTags.filter(t => !selectedTagIds.includes(t.id))"
                :key="tag.id"
                @click="selectedTagIds.push(tag.id)"
                class="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          @click="handleClose"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="isLoading || isSaving || !url || !title"
          class="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Save') }}
        </button>
      </div>
    </div>
  </div>
</template>
