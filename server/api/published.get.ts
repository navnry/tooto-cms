// GET /api/published — public endpoint, returns the currently published project's HTML/CSS
export default defineEventHandler(async () => {
  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute(
    'SELECT id, name, html, css FROM projects WHERE published = 1 LIMIT 1',
  ) as [any[], any]

  if (!rows.length) throw createError({ statusCode: 404, message: 'No published project' })

  return rows[0]
})
