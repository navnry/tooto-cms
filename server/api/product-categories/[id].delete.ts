import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  const db = getDb()
  // Move child categories to root
  await db.execute('UPDATE product_categories SET parent_id=NULL WHERE parent_id=?', [id])
  await db.execute('DELETE FROM product_categories WHERE id=?', [id])
  return { ok: true }
})
