import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }
  const db = getDb()
  const [posts] = await db.execute<RowDataPacket[]>(`
    SELECT p.id, p.title, p.slug, p.content, p.excerpt, p.status, p.cover, p.created_at, p.updated_at,
           c.id AS category_id, c.name AS category_name
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
  `, [id])
  const post = posts[0]
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  const [tags] = await db.execute<RowDataPacket[]>(`
    SELECT t.id, t.name, t.slug FROM tags t
    INNER JOIN post_tags pt ON pt.tag_id = t.id
    WHERE pt.post_id = ?
  `, [id])
  return { ...post, tags }
})
