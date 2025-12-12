export interface ScreenshotOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'jpeg' | 'png'
}

export async function captureScreenshot(
  tabId: number,
  options: ScreenshotOptions = {}
): Promise<string | null> {
  const {
    quality = 80,
    maxWidth = 400,
    maxHeight = 300,
    format = 'jpeg'
  } = options

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_SCREENSHOT',
      tabId,
      options: { quality, format }
    })

    if (!response?.success || !response.dataUrl) {
      console.error('Screenshot failed:', response?.error)
      return null
    }

    const thumbnail = await resizeImage(response.dataUrl, maxWidth, maxHeight, format, quality)
    return thumbnail
  } catch (error) {
    console.error('Screenshot capture error:', error)
    return null
  }
}

async function resizeImage(
  dataUrl: string,
  maxWidth: number,
  maxHeight: number,
  format: 'jpeg' | 'png',
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      resolve(canvas.toDataURL(mimeType, quality / 100))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' })
    if (response?.success && response.tab) {
      return response.tab
    }
    return null
  } catch (error) {
    console.error('Get current tab error:', error)
    return null
  }
}
