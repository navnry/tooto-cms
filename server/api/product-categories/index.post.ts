import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const body = await readBody(event)
  const name = String(body?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, message: '分类名称不能为空' })
  const slug = body?.slug ? String(body.slug).trim() : toSlug(name)
  const parentId = body?.parent_id || null
  const sortOrder = Number(body?.sort_order ?? 0)
  const db = getDb()
  await db.execute(
    'INSERT INTO product_categories (id, name, slug, parent_id, sort_order) VALUES (UUID(), ?, ?, ?, ?)',
    [name, slug, parentId, sortOrder],
  )
  const [rows] = await db.execute<any[]>('SELECT * FROM product_categories WHERE slug = ?', [slug])
  return rows[0]
})
