import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now()
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const body = await readBody(event)
  const title = String(body?.title ?? 'Untitled').trim()
  const slug = body?.slug ? String(body.slug).trim() : toSlug(title)
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
      'INSERT INTO posts (id, title, slug, content, excerpt, category_id, status, cover) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, content, excerpt, categoryId, status, cover],
    )
    const [rows] = await conn.execute<any[]>('SELECT id FROM posts WHERE slug = ?', [slug])
    const postId = rows[0].id
    if (tagIds.length) {
      for (const tagId of tagIds) {
        await conn.execute('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId])
      }
    }
    await conn.commit()
    return { id: postId, title, slug, status }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
