import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }
  const body = await readBody(event)
  const title = String(body?.title ?? 'Untitled').trim()
  const slug = String(body?.slug ?? '').trim()
  const content = body?.content ?? ''
  const excerpt = body?.excerpt ?? ''
  const categoryId = body?.category_id ?? null
  const status = body?.status === 'published' ? 'published' : 'draft'
  const cover = body?.cover ?? null
  const tagIds: string[] = Array.isArray(body?.tag_ids) ? body.tag_ids : []

  const db = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute(
      'UPDATE posts SET title=?, slug=?, content=?, excerpt=?, category_id=?, status=?, cover=? WHERE id=?',
      [title, slug, content, excerpt, categoryId, status, cover, id],
    )
    await conn.execute('DELETE FROM post_tags WHERE post_id=?', [id])
    for (const tagId of tagIds) {
      await conn.execute('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagId])
    }
    await conn.commit()
    return { id, title, slug, status }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
