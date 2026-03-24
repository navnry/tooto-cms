import type { RowDataPacket } from 'mysql2'

// DELETE /api/media/:id — delete a media file
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID is required' })

  await ensureSchema()
  const db = getDb()

  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT `key` FROM media WHERE id = ?',
    [id],
  )
  if (!rows[0]) throw createError({ statusCode: 404, message: 'File not found' })

  const key = rows[0].key as string

  await getR2().send(new DeleteObjectCommand({ Bucket: r2Bucket(), Key: key }))
  await db.execute('DELETE FROM media WHERE id = ?', [id])

  return { success: true }
})
