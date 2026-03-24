// DELETE /api/projects/:projectId — delete a project
export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')
  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  await ensureSchema()
  const db = getDb()
  const [result] = await db.execute(
    'DELETE FROM projects WHERE id = ?',
    [projectId],
  ) as [any, any]

  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  return sendNoContent(event)
})
