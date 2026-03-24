// DELETE /api/projects/:projectId/publish — unpublish this project
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const projectId = getRouterParam(event, 'projectId')
  if (!projectId) throw createError({ statusCode: 400, message: 'Project ID is required' })

  await ensureSchema()
  const db = getDb()
  await db.execute('UPDATE projects SET published = 0 WHERE id = ?', [projectId])

  return { success: true }
})
