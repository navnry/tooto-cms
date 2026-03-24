import type { RowDataPacket } from 'mysql2'

// POST /api/media — upload one or more files
export default defineEventHandler(async (event) => {
  await ensureSchema()

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, message: 'No files provided' })

  const files = parts.filter(p => p.filename)
  if (!files.length) throw createError({ statusCode: 400, message: 'No files found in request' })

  const db = getDb()
  const inserted: RowDataPacket[] = []

  for (const file of files) {
    const filename = file.filename
    if (!filename) continue
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    const id = crypto.randomUUID()
    const key = `media/${id}${ext ? '.' + ext : ''}`
    const mime = file.type || 'application/octet-stream'

    await getR2().send(new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: key,
      Body: file.data,
      ContentType: mime,
    }))

    await db.execute(
      'INSERT INTO media (id, `key`, name, size, mime_type) VALUES (?, ?, ?, ?, ?)',
      [id, key, filename, file.data.length, mime],
    )

    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id, `key`, name, size, mime_type, created_at FROM media WHERE id = ?',
      [id],
    )
    if (rows[0]) inserted.push(rows[0])
  }

  return inserted
})
