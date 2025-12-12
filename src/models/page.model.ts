export interface Page {
  id: string
  url: string
  title: string
  description: string | null
  favicon: string | null
  screenshot: string | null
  categoryId: string | null
  tags: string[]
  createdAt: number
  updatedAt: number
  visitCount: number
  lastVisitedAt: number | null
  domain: string
  isFavorite: boolean
  isArchived: boolean
}

export interface PageCreateInput {
  url: string
  title: string
  description?: string
  categoryId?: string
  tags?: string[]
  screenshot?: string
  favicon?: string
}

export interface PageUpdateInput {
  title?: string
  description?: string
  categoryId?: string | null
  tags?: string[]
  isFavorite?: boolean
  isArchived?: boolean
}

export type PageSortField = 'createdAt' | 'updatedAt' | 'title' | 'visitCount' | 'lastVisitedAt'
export type SortOrder = 'asc' | 'desc'

export interface PageFilters {
  categoryId?: string | null
  tags?: string[]
  isFavorite?: boolean
  isArchived?: boolean
  domain?: string
  search?: string
}
