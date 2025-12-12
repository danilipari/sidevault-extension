const STORAGE_KEYS = {
  PAGES: 'sidevault_pages',
  CATEGORIES: 'sidevault_categories',
  TAGS: 'sidevault_tags',
  SETTINGS: 'sidevault_settings'
} as const

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? null
  } catch (error) {
    console.error(`Storage get error for key "${key}":`, error)
    return null
  }
}

export async function storageSet<T>(key: string, value: T): Promise<boolean> {
  try {
    await chrome.storage.local.set({ [key]: value })
    return true
  } catch (error) {
    console.error(`Storage set error for key "${key}":`, error)
    return false
  }
}

export async function storageRemove(key: string): Promise<boolean> {
  try {
    await chrome.storage.local.remove(key)
    return true
  } catch (error) {
    console.error(`Storage remove error for key "${key}":`, error)
    return false
  }
}

export async function storageClear(): Promise<boolean> {
  try {
    await chrome.storage.local.clear()
    return true
  } catch (error) {
    console.error('Storage clear error:', error)
    return false
  }
}

export async function getStorageUsage(): Promise<{ bytesUsed: number; quota: number }> {
  try {
    const bytesUsed = await chrome.storage.local.getBytesInUse()
    return {
      bytesUsed,
      quota: chrome.storage.local.QUOTA_BYTES
    }
  } catch {
    return { bytesUsed: 0, quota: 0 }
  }
}

export { STORAGE_KEYS }
