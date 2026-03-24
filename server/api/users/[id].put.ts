import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth, hashPassword } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少用户 ID' })
  }
  const body = await readBody(event)
  const username = String(body?.username ?? '').trim()
  const role = String(body?.role ?? 'admin').trim()
  const password = body?.password ? String(body.password).trim() : ''

  if (!username) throw createError({ statusCode: 400, message: '用户名不能为空' })

  const db = getDb()
  // Check username conflict (exclude self)
  const [conflict] = await db.execute<any[]>('SELECT id FROM users WHERE username=? AND id!=?', [username, id])
  if ((conflict as any[]).length) throw createError({ statusCode: 409, message: '用户名已存在' })

  if (password) {
    if (password.length < 6) throw createError({ statusCode: 400, message: '密码至少6位' })
    const hash = await hashPassword(password)
    await db.execute('UPDATE users SET username=?, role=?, password=? WHERE id=?', [username, role, hash, id])
  } else {
    await db.execute('UPDATE users SET username=?, role=? WHERE id=?', [username, role, id])
  }

  return { id, username, role }
})
