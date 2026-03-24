import { getDb, ensureSchema } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

function toSlug(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now()
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  await ensureSchema()
  const body = await readBody(event)

  const name = String(body?.name ?? 'Untitled').trim()
  const sku = body?.sku ? String(body.sku).trim() : null
  const slug = body?.slug ? String(body.slug).trim() : toSlug(name)
  const shortDesc = body?.short_desc ?? ''
  const description = body?.description ?? ''
  const categoryId = body?.category_id ?? null
  const brand = body?.brand ?? ''
  const status = ['draft', 'active', 'discontinued'].includes(body?.status) ? body.status : 'draft'
  const unit = body?.unit || '件'
  const price = body?.price != null ? Number(body.price) : null
  const minOrderQty = Number(body?.min_order_qty ?? 1)
  const cover = body?.cover ?? null
  const images = body?.images ?? []
  const specs = body?.specs ?? []
  const attachments = body?.attachments ?? []
  const weight = body?.weight != null ? Number(body.weight) : null
  const tagIds: string[] = Array.isArray(body?.tag_ids) ? body.tag_ids : []

  const db = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute(
      `INSERT INTO products
        (id, name, sku, slug, short_desc, description, category_id, brand, status,
         unit, price, min_order_qty, cover, images, specs, attachments, weight)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sku, slug, shortDesc, description, categoryId, brand, status,
       unit, price, minOrderQty, cover,
       JSON.stringify(images), JSON.stringify(specs), JSON.stringify(attachments), weight],
    )
    const [rows] = await conn.execute<any[]>('SELECT id FROM products WHERE slug = ?', [slug])
    const productId = rows[0].id
    for (const tagId of tagIds) {
      await conn.execute('INSERT IGNORE INTO product_tags (product_id, tag_id) VALUES (?, ?)', [productId, tagId])
    }
    await conn.commit()
    return { id: productId, name, slug, status }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
