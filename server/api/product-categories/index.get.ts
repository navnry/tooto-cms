import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const db = getDb()
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT c.id, c.name, c.slug, c.parent_id, c.sort_order, c.created_at,
           p.name AS parent_name
    FROM product_categories c
    LEFT JOIN product_categories p ON p.id = c.parent_id
    ORDER BY c.sort_order ASC, c.name ASC
  `)
  return rows
})
