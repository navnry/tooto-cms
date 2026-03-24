import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)

  const db = getDb()
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id, username, role FROM users WHERE id = ?',
    [payload.sub],
  )

  if (!rows[0]) throw createError({ statusCode: 401, message: 'Unauthorized' })

  return { id: rows[0].id, username: rows[0].username, role: rows[0].role }
})
