const PUBLIC_PATHS = new Set(['/', '/t-admin/login'])

export default defineNuxtRouteMiddleware(async (to) => {
  // Allow public paths
  if (PUBLIC_PATHS.has(to.path)) {
    // If already authenticated, skip login page
    if (to.path === '/t-admin/login') {
      const { user, fetchMe } = useAuth()
      if (!user.value) await fetchMe()
      if (user.value) return navigateTo('/t-admin')
    }
    return
  }

  // All other paths require auth
  const { user, fetchMe } = useAuth()
  if (!user.value) await fetchMe()
  if (!user.value) return navigateTo('/t-admin/login')
})
