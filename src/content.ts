console.log('[SideVault] Content script loading...', window.location.href)

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ContentSidebar from './content/ContentSidebar.vue'

// Don't inject on chrome:// or extension pages
const isValidPage = !window.location.href.startsWith('chrome://') &&
    !window.location.href.startsWith('chrome-extension://') &&
    !window.location.href.startsWith('about:')

console.log('[SideVault] Is valid page:', isValidPage)

if (isValidPage) {
  console.log('[SideVault] Injecting sidebar...')

  try {
    // Create container for sidebar
    const container = document.createElement('div')
    container.id = 'sidevault-root'
    document.body.appendChild(container)
    console.log('[SideVault] Container added to body')

    // Create shadow root for style isolation
    const shadowRoot = container.attachShadow({ mode: 'open' })
    console.log('[SideVault] Shadow root created')

    // Create app container inside shadow root
    const appContainer = document.createElement('div')
    appContainer.id = 'sidevault-app'
    shadowRoot.appendChild(appContainer)

    // Inject styles into shadow root
    const style = document.createElement('style')
    style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #sidevault-app {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    .sidevault-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      transition: width 0.2s ease;
    }

    .sidevault-sidebar.collapsed {
      width: 48px;
    }

    .sidevault-sidebar.expanded {
      width: 320px;
    }

    .sidevault-sidebar.hidden {
      width: 0;
      overflow: hidden;
      box-shadow: none;
    }

    /* Header */
    .sv-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .sv-header.expanded {
      flex-direction: row;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .sv-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #3b82f6;
    }

    .sv-logo svg {
      width: 24px;
      height: 24px;
    }

    .sv-logo-text {
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
    }

    .sv-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sv-btn-icon {
      width: 36px;
      height: 36px;
      background: transparent;
      color: #6b7280;
    }

    .sv-btn-icon:hover {
      background: #f3f4f6;
      color: #3b82f6;
    }

    .sv-btn-primary {
      width: 36px;
      height: 36px;
      background: #3b82f6;
      color: white;
    }

    .sv-btn-primary:hover {
      background: #2563eb;
    }

    .sv-btn svg {
      width: 20px;
      height: 20px;
    }

    /* Content area */
    .sv-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .sv-content::-webkit-scrollbar {
      width: 6px;
    }

    .sv-content::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    /* Icon grid (collapsed) */
    .sv-icon-grid {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .sv-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #f3f4f6;
      border: none;
      cursor: pointer;
      overflow: hidden;
      position: relative;
    }

    .sv-icon-btn:hover {
      background: #e5e7eb;
    }

    .sv-icon-btn img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    .sv-icon-btn .screenshot {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .sv-favorite-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 6px;
      height: 6px;
      background: #fbbf24;
      border-radius: 50%;
    }

    /* Page list (expanded) */
    .sv-page-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sv-page-card {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .sv-page-card:hover {
      background: #f3f4f6;
    }

    .sv-page-thumb {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      background: #e5e7eb;
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sv-page-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .sv-page-thumb .favicon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .sv-page-info {
      flex: 1;
      min-width: 0;
    }

    .sv-page-title {
      font-weight: 500;
      font-size: 14px;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sv-page-domain {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Search */
    .sv-search {
      padding: 8px 16px 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .sv-search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .sv-search-input:focus {
      border-color: #3b82f6;
    }

    /* Empty state */
    .sv-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #9ca3af;
      text-align: center;
    }

    .sv-empty svg {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }

    /* Tabs */
    .sv-tabs {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .sv-tab {
      padding: 6px 12px;
      font-size: 12px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sv-tab:hover {
      background: #e5e7eb;
    }

    .sv-tab.active {
      background: #dbeafe;
      color: #1d4ed8;
    }

    /* Actions row */
    .sv-actions {
      display: flex;
      gap: 4px;
    }

    /* Loading */
    .sv-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
    }

    .sv-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: sv-spin 0.8s linear infinite;
    }

    @keyframes sv-spin {
      to { transform: rotate(360deg); }
    }
  `
  shadowRoot.appendChild(style)

    // Create Vue app
    console.log('[SideVault] Creating Vue app...')
    const app = createApp(ContentSidebar)
    app.use(createPinia())
    app.mount(appContainer)
    console.log('[SideVault] Vue app mounted successfully!')
  } catch (error) {
    console.error('[SideVault] Error:', error)
  }
}
