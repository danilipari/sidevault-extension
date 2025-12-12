// SideVault Background Service Worker

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id })
  }
})

// Handle messages from side panel
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

// Handle keyboard shortcut for saving current page
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save_current_page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      // Open side panel and send save command
      await chrome.sidePanel.open({ tabId: tab.id })
      // Small delay to ensure panel is ready
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'TRIGGER_SAVE', tab })
      }, 300)
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

// Set side panel behavior - open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Failed to set panel behavior:', error))

console.log('SideVault background service worker initialized')
