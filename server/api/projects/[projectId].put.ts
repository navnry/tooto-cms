// PUT /api/projects/:projectId — save project data (GrapesJS remote storage store)
export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')
  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  const body = await readBody(event)

  await ensureSchema()
  const db = getDb()

  // Verify project exists
  const [rows] = await db.execute(
    'SELECT id FROM projects WHERE id = ?',
    [projectId],
  ) as [any[], any]

  if (!rows.length) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const data = body?.data ?? body
  const name = body?.name
  const html = body?.html
  const css = body?.css

  await db.execute(
    `UPDATE projects
     SET data = ?,
         html = COALESCE(?, html),
         css  = COALESCE(?, css),
         name = COALESCE(?, name)
     WHERE id = ?`,
    [JSON.stringify(data), html ?? null, css ?? null, name ?? null, projectId],
  )

  return { success: true }
})
