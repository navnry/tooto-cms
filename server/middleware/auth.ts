// Protect project and media management APIs; leave /api/media/proxy/* public
export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  const needsAuth =
    pathname.startsWith('/api/projects') ||
    pathname.startsWith('/api/posts') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/tags') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/product-categories') ||
    pathname.startsWith('/api/users') ||
    (pathname.startsWith('/api/media') && !pathname.startsWith('/api/media/proxy'))
  if (!needsAuth) return
  await requireAuth(event)
})
