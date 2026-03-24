import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少分类 ID' })
  }
  const db = getDb()
  await db.execute('DELETE FROM categories WHERE id=?', [id])
  return { ok: true }
})
