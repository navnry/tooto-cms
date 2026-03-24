/**
 * useProjects — Nuxt-adapted project management
 *
 * Fetches project metadata from the Nuxt API (/api/projects/:id).
 * Singleton so the project name is shared between Toolbar and other components.
 */
import { ref, computed } from 'vue'

export interface ProjectMeta {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// Singleton state
const _project = ref<ProjectMeta | null>(null)
const _loading = ref(false)

export function useProjects() {
  const route = useRoute()

  const currentProjectId = computed(() => route.params.projectId as string)

  async function refresh() {
    const id = currentProjectId.value
    if (!id) return
    _loading.value = true
    try {
      const res = await $fetch<ProjectMeta>(`/api/projects/${id}`)
      _project.value = res
    } catch {
      // ignore
    } finally {
      _loading.value = false
    }
  }

  async function rename(id: string, name: string) {
    await $fetch(`/api/projects/${id}`, { method: 'PUT', body: { name } })
    if (_project.value?.id === id) {
      _project.value = { ..._project.value, name }
    }
  }

  const currentProject = computed(() => _project.value)

  return {
    currentProject,
    currentProjectId,
    loading: _loading,
    refresh,
    rename,
  }
}
