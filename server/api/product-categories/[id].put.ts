import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const name = String(body?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, message: '分类名称不能为空' })
  const slug = body?.slug ? String(body.slug).trim() : toSlug(name)
  const parentId = body?.parent_id || null
  const sortOrder = Number(body?.sort_order ?? 0)
  const db = getDb()
  // Prevent self-referencing parent
  if (parentId === id) throw createError({ statusCode: 400, message: '不能将自身设为父分类' })
  await db.execute(
    'UPDATE product_categories SET name=?, slug=?, parent_id=?, sort_order=? WHERE id=?',
    [name, slug, parentId, sortOrder, id],
  )
  return { id, name, slug, parent_id: parentId, sort_order: sortOrder }
})
