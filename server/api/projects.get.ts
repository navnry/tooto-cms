// GET /api/projects — list all projects
export default defineEventHandler(async () => {
  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute(
    'SELECT id, name, published, created_at, updated_at FROM projects ORDER BY updated_at DESC',
  )
  return rows
})
