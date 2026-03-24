import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT p.id, p.title, p.slug, p.excerpt, p.status, p.cover, p.created_at, p.updated_at,
           c.id AS category_id, c.name AS category_name
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.updated_at DESC
  `)
  return rows
})
