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
  if (!name) throw createError({ statusCode: 400, message: '标签名称不能为空' })
  const slug = body?.slug ? String(body.slug).trim() : toSlug(name)
  const db = getDb()
  await db.execute('INSERT INTO tags (id, name, slug) VALUES (UUID(), ?, ?)', [name, slug])
  const [rows] = await db.execute<any[]>('SELECT id, name, slug, created_at FROM tags WHERE slug = ?', [slug])
  return rows[0]
})
