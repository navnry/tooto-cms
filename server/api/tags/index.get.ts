import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id, name, slug, created_at FROM tags ORDER BY name ASC',
  )
  return rows
})
