interface AuthUser {
  id: string
  username: string
  role: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth.user', () => null)

  async function fetchMe() {
    try {
      const data = await $fetch<AuthUser>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    }
  }

  async function login(username: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = data.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/t-admin/login')
  }

  return { user: readonly(user), fetchMe, login, logout }
}
