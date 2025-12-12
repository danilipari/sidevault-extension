export interface Tag {
  id: string
  name: string
  color: string | null
  createdAt: number
}

export interface TagCreateInput {
  name: string
  color?: string
}

export interface TagWithCount extends Tag {
  pageCount: number
}
