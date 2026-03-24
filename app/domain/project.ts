export type ProjectStatus = 'draft' | 'active'

export interface ProjectMeta {
  id: string
  name: string
  status: ProjectStatus
  thumbnail?: string
  createdAt: number
  updatedAt: number
}

export interface ProjectRecord extends ProjectMeta {
  data: Record<string, unknown> | null
}

export function normalizeProjectStatus(status: unknown): ProjectStatus {
  return status === 'active' || status === 'published' ? 'active' : 'draft'
}

export function toProjectMeta(record: Partial<ProjectRecord> & Pick<ProjectRecord, 'id'>): ProjectMeta {
  return {
    id: record.id,
    name: record.name ?? 'Untitled',
    status: normalizeProjectStatus(record.status),
    thumbnail: record.thumbnail,
    createdAt: record.createdAt ?? 0,
    updatedAt: record.updatedAt ?? 0,
  }
}

export function setProjectStatusInList(
  projects: ProjectMeta[],
  id: string,
  status: ProjectStatus,
): ProjectMeta[] {
  return projects.map((project) => {
    if (project.id === id) {
      return { ...project, status }
    }

    if (status === 'active' && project.status === 'active') {
      return { ...project, status: 'draft' }
    }

    return project
  })
}
