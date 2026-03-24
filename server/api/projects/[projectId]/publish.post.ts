// POST /api/projects/:projectId/publish — publish this project (unpublishes all others)
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const projectId = getRouterParam(event, 'projectId')
  if (!projectId) throw createError({ statusCode: 400, message: 'Project ID is required' })

  await ensureSchema()
  const db = getDb()

  const [rows] = await db.execute('SELECT id FROM projects WHERE id = ?', [projectId]) as [any[], any]
  if (!rows.length) throw createError({ statusCode: 404, message: 'Project not found' })

  // Atomic: unpublish all, then publish the target
  await db.execute('UPDATE projects SET published = 0')
  await db.execute('UPDATE projects SET published = 1 WHERE id = ?', [projectId])

  return { success: true }
})
