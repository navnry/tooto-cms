import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth, hashPassword } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const body = await readBody(event)
  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '').trim()
  const role = String(body?.role ?? 'admin').trim()

  if (!username) throw createError({ statusCode: 400, message: '用户名不能为空' })
  if (!password) throw createError({ statusCode: 400, message: '密码不能为空' })
  if (password.length < 6) throw createError({ statusCode: 400, message: '密码至少6位' })

  const db = getDb()
  const [existing] = await db.execute<any[]>('SELECT id FROM users WHERE username=?', [username])
  if ((existing as any[]).length) throw createError({ statusCode: 409, message: '用户名已存在' })

  const hash = await hashPassword(password)
  await db.execute('INSERT INTO users (id, username, password, role) VALUES (UUID(), ?, ?, ?)', [username, hash, role])
  const [rows] = await db.execute<any[]>('SELECT id, username, role, created_at FROM users WHERE username=?', [username])
  return rows[0]
})
