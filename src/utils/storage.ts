const STORAGE_KEYS = {
  PAGES: 'sidevault_pages',
  CATEGORIES: 'sidevault_categories',
  TAGS: 'sidevault_tags',
  SETTINGS: 'sidevault_settings'
} as const

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    console.log(`[SideVault Storage] Getting key "${key}"...`)
    const result = await chrome.storage.local.get(key)
    let value = result[key] ?? null

    // Handle legacy data: convert object with numeric keys to array
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value)
      if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
        console.log(`[SideVault Storage] Converting object to array for "${key}"`)
        value = Object.values(value) as T
      }
    }

    console.log(`[SideVault Storage] Got for "${key}":`, value)
    return value
  } catch (error) {
    console.error(`[SideVault Storage] Get error for key "${key}":`, error)
    return null
  }
}

export async function storageSet<T>(key: string, value: T): Promise<boolean> {
  try {
    // Convert Vue Proxy to plain object/array for chrome.storage
    const plainValue = JSON.parse(JSON.stringify(value))
    console.log(`[SideVault Storage] Setting key "${key}":`, plainValue)
    await chrome.storage.local.set({ [key]: plainValue })
    console.log(`[SideVault Storage] Set success for "${key}"`)
    return true
  } catch (error) {
    console.error(`[SideVault Storage] Set error for key "${key}":`, error)
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
