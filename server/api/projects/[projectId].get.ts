// GET /api/projects/:projectId — load project (GrapesJS remote storage load)
export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')
  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute(
    'SELECT id, name, data, html, css FROM projects WHERE id = ?',
    [projectId],
  ) as [any[], any]

  if (!rows.length) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const project = rows[0]
  return {
    id: project.id,
    name: project.name,
    // data is stored as JSON string in MySQL, parse it back
    data: project.data ? (typeof project.data === 'string' ? JSON.parse(project.data) : project.data) : null,
    html: project.html,
    css: project.css,
  }
})
