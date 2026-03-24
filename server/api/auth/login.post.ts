import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{ username: string; password: string }>(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, message: '用户名和密码不能为空' })
  }

  const db = getDb()
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id, username, password, role FROM users WHERE username = ?',
    [username],
  )

  const user = rows[0]
  if (!user || !(await verifyPassword(password, user.password as string))) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  const token = await signToken(user.id as string, user.role as string)

  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  return {
    user: { id: user.id, username: user.username, role: user.role },
  }
})
