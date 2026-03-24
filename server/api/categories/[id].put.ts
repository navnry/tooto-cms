import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少分类 ID' })
  }
  const body = await readBody(event)
  const name = String(body?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, message: '分类名称不能为空' })
  const slug = body?.slug ? String(body.slug).trim() : toSlug(name)
  const db = getDb()
  await db.execute('UPDATE categories SET name=?, slug=? WHERE id=?', [name, slug, id])
  return { id, name, slug }
})
