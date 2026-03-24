export type TemplateCategory =
  | 'Landing Page'
  | 'Portfolio'
  | 'Blog'
  | 'Business'
  | 'E-commerce'

export interface TemplateItem {
  id: string
  name: string
  description: string
  category: TemplateCategory
  tags: string[]
  hue: number
  projectData: Record<string, unknown>
}

export interface RemoteTemplateItem {
  id: string
  name: string
  downloadUrl: string
  media?: string
}

export interface RemoteTemplateApiResponse {
  result?: { templates?: Array<Record<string, unknown>> }
  templates?: Array<Record<string, unknown>>
}

export function parseRemoteTemplateList(list: Array<Record<string, unknown>>): RemoteTemplateItem[] {
  return list.map((item) => ({
    id: String(item.id ?? ''),
    name: String(item.name ?? 'Untitled'),
    downloadUrl: String(item.downloadUrl ?? ''),
    media: typeof item.media === 'string' ? item.media : undefined,
  }))
}
