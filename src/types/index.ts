// Chrome message types
export interface ChromeMessage {
  type: string
  [key: string]: unknown
}

export interface ScreenshotRequest {
  type: 'CAPTURE_SCREENSHOT'
  tabId: number
  options?: {
    quality?: number
    format?: 'jpeg' | 'png'
  }
}

export interface ScreenshotResponse {
  success: boolean
  dataUrl?: string
  error?: string
}

export interface GetCurrentTabRequest {
  type: 'GET_CURRENT_TAB'
}

export interface GetCurrentTabResponse {
  success: boolean
  tab?: chrome.tabs.Tab
  error?: string
}

export interface TriggerSaveMessage {
  type: 'TRIGGER_SAVE'
  tab: chrome.tabs.Tab
}
