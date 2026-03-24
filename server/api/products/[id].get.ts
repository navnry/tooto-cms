import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少产品 ID' })
  }
  const db = getDb()

  const [products] = await db.execute<RowDataPacket[]>(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN product_categories c ON c.id = p.category_id
    WHERE p.id = ?
  `, [id])

  const product = products[0]
  if (!product) throw createError({ statusCode: 404, message: '产品不存在' })

  const [tags] = await db.execute<RowDataPacket[]>(`
    SELECT t.id, t.name, t.slug FROM tags t
    INNER JOIN product_tags pt ON pt.tag_id = t.id
    WHERE pt.product_id = ?
  `, [id])

  // Parse JSON fields
  const parse = (v: any) => {
    if (typeof v === 'string') { try { return JSON.parse(v) } catch { return [] } }
    return v ?? []
  }

  return {
    ...product,
    images: parse(product.images),
    specs: parse(product.specs),
    attachments: parse(product.attachments),
    tags,
  }
})
