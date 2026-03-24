import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少用户 ID' })
  }
  const db = getDb()

  // Prevent deleting the last user
  const [countRows] = await db.execute<any[]>('SELECT COUNT(*) AS cnt FROM users')
  if (Number(countRows[0].cnt) <= 1) {
    throw createError({ statusCode: 400, message: '不能删除唯一的管理员账号' })
  }

  await db.execute('DELETE FROM users WHERE id=?', [id])
  return { ok: true }
})
