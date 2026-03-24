import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const query = getQuery(event)
  const db = getDb()

  let sql = `
    SELECT p.id, p.name, p.sku, p.slug, p.short_desc, p.status, p.brand,
           p.unit, p.price, p.min_order_qty, p.cover, p.created_at, p.updated_at,
           c.id AS category_id, c.name AS category_name
    FROM products p
    LEFT JOIN product_categories c ON c.id = p.category_id
    WHERE 1=1
  `
  const params: any[] = []

  if (query.status) {
    sql += ' AND p.status = ?'
    params.push(query.status)
  }
  if (query.category_id) {
    sql += ' AND p.category_id = ?'
    params.push(query.category_id)
  }
  if (query.q) {
    sql += ' AND (p.name LIKE ? OR p.sku LIKE ?)'
    params.push(`%${query.q}%`, `%${query.q}%`)
  }

  sql += ' ORDER BY p.updated_at DESC'

  const [rows] = await db.execute<RowDataPacket[]>(sql, params)
  return rows
})
