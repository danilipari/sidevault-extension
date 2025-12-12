// SideVault Background Service Worker

// Toggle sidebar when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' })
    } catch (error) {
      console.log('Content script not loaded yet, injecting...')
    }
  }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SCREENSHOT') {
    handleScreenshotCapture(message.tabId, message.options)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true // Keep channel open for async response
  }

  if (message.type === 'GET_CURRENT_TAB') {
    getCurrentTab()
      .then(tab => sendResponse({ success: true, tab }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }

  return false
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id) return

  if (command === '_execute_action') {
    // Toggle sidebar
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' })
    } catch (error) {
      console.log('Content script not loaded')
    }
  }

  if (command === 'save_current_page') {
    // Trigger save in content script
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SAVE' })
    } catch (error) {
      console.log('Content script not loaded')
    }
  }
})

async function handleScreenshotCapture(
  tabId: number,
  options: { quality?: number; format?: 'jpeg' | 'png' }
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    const tab = await chrome.tabs.get(tabId)
    if (!tab.windowId) {
      throw new Error('Tab window not found')
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: options.format || 'jpeg',
      quality: options.quality || 80
    })

    return { success: true, dataUrl }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Screenshot capture failed'
    }
  }
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab || null
}

console.log('SideVault background service worker initialized')
