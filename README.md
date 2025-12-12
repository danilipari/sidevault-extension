# SideVault

A Chrome extension with a sidebar to save, organize, and search your favorite web pages. Capture screenshots, add tags and categories, and never lose a page again.

## Features

- **Side Panel**: Always-accessible sidebar using Chrome's Side Panel API
- **Save Pages**: One-click save with automatic screenshot capture
- **Screenshots**: Visual thumbnails for easy page recognition
- **Categories**: Organize pages into customizable folders
- **Tags**: Flexible tagging system for cross-category organization
- **Search**: Full-text search across titles, URLs, descriptions, and tags
- **Favorites**: Quick access to starred pages
- **Archive**: Hide pages without deleting them
- **100% Local**: All data stored locally, no account required

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Vue 3 | UI Framework (Composition API) |
| TypeScript | Type safety |
| Pinia | State management |
| Vite | Build tool |
| @crxjs/vite-plugin | Chrome extension development |
| Tailwind CSS v4 | Styling |
| Chrome Manifest V3 | Extension platform |

## Project Structure

```
sidevault-extension/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   ├── sidepanel.html         # Side panel HTML entry
│   └── icons/                 # Extension icons (16, 48, 128, 256)
├── src/
│   ├── app/                   # Main app components
│   │   ├── SidePanel.vue      # Main sidebar container
│   │   ├── AppHeader.vue      # Header with logo and actions
│   │   ├── AppSearch.vue      # Search bar with filters
│   │   └── AppEmptyState.vue  # Empty state placeholder
│   ├── components/            # Reusable UI components
│   │   ├── PageCard.vue       # Single saved page card
│   │   ├── PageList.vue       # Scrollable page list
│   │   ├── SavePageModal.vue  # Save/edit page modal
│   │   ├── CategorySelector.vue
│   │   ├── TagInput.vue       # Tag input with autocomplete
│   │   ├── TagChip.vue        # Tag chip component
│   │   ├── ScreenshotPreview.vue
│   │   ├── CategoryManager.vue
│   │   ├── ConfirmDialog.vue
│   │   └── LoadingSkeleton.vue
│   ├── stores/                # Pinia state stores
│   │   ├── pagesStore.ts      # Pages CRUD, filters, sort
│   │   ├── categoriesStore.ts # Categories management
│   │   ├── tagsStore.ts       # Tags management
│   │   └── uiStore.ts         # UI state (modals, view mode)
│   ├── models/                # TypeScript interfaces
│   │   ├── page.model.ts
│   │   ├── category.model.ts
│   │   └── tag.model.ts
│   ├── utils/                 # Utility functions
│   │   ├── storage.ts         # chrome.storage wrapper
│   │   ├── screenshot.ts      # Screenshot capture & resize
│   │   ├── search.ts          # Search algorithm
│   │   └── helpers.ts         # UUID, extractDomain, etc.
│   ├── assets/
│   │   └── tailwind.css       # Tailwind entry point
│   ├── background.ts          # Service worker
│   └── sidepanel.ts           # Vue app entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.cjs
└── postcss.config.cjs
```

## Data Models

### Page

```typescript
interface Page {
  id: string;                    // UUID
  url: string;                   // Full URL
  title: string;                 // Page title
  description: string | null;    // User notes
  favicon: string | null;        // Favicon URL
  screenshot: string | null;     // Base64 thumbnail (400x300)
  categoryId: string | null;     // Category reference
  tags: string[];                // Tag IDs array
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
  visitCount: number;            // Click counter
  lastVisitedAt: number | null;  // Last opened
  domain: string;                // Extracted domain
  isFavorite: boolean;           // Starred
  isArchived: boolean;           // Hidden from main view
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  color: CategoryColor;  // 'blue' | 'green' | 'purple' | 'orange' | etc.
  icon: string | null;   // Optional emoji
  order: number;         // Display order
  createdAt: number;
}
```

### Tag

```typescript
interface Tag {
  id: string;
  name: string;          // Lowercase, normalized
  color: string | null;
  createdAt: number;
}
```

## Permissions

This extension uses minimal permissions for maximum privacy:

| Permission | Purpose |
|------------|---------|
| `storage` | Save pages, categories, and tags locally |
| `activeTab` | Capture screenshot on user action only |
| `sidePanel` | Enable Side Panel API |

**No host_permissions required** - We don't need access to any websites.

## Development

### Prerequisites

- Node.js >= 18
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Load in Chrome

1. Run `npm run dev` or `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Win) | Open SideVault sidebar |
| `Cmd+Shift+S` (Mac) / `Ctrl+Shift+S` (Win) | Save current page |

## Usage

### Saving a Page

1. Navigate to any webpage
2. Click the SideVault icon in the toolbar (opens sidebar)
3. Click the "+" button or press `Cmd+Shift+S`
4. A modal appears with:
   - Auto-captured screenshot preview
   - Pre-filled title from page
   - Optional description field
   - Category selector
   - Tag input
5. Click "Save"

### Organizing Pages

- **Categories**: Create custom categories (Work, Personal, Research, etc.)
- **Tags**: Add multiple tags to any page for flexible organization
- **Favorites**: Star important pages for quick access
- **Archive**: Hide pages without deleting them

### Searching

- Type in the search bar to find pages
- Search matches: title, URL, description, tags
- Filter by category, tag, or domain
- Sort by date, title, or visit count

## Privacy

- All data is stored locally in `chrome.storage.local`
- No data is ever sent to any server
- No analytics or tracking
- No account required

## Export/Import

Export your data as JSON for backup:

```javascript
// In browser console on any page with extension active
chrome.storage.local.get(null, (data) => {
  console.log(JSON.stringify(data, null, 2));
});
```

## Chrome Web Store

This extension is designed to meet Chrome Web Store requirements:

- Manifest V3 compliant
- Minimal permissions
- Clear privacy policy
- No remote code execution

## License

MIT
