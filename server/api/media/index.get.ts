// GET /api/media — list all media files
export default defineEventHandler(async () => {
  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute(
    'SELECT id, `key`, name, size, mime_type, created_at FROM media ORDER BY created_at DESC',
  )
  return rows
})
