import { Readable } from 'node:stream'

// GET /api/media/proxy/[...path] — public proxy for R2 objects
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path) throw createError({ statusCode: 400, message: 'Path is required' })

  const key = Array.isArray(path) ? path.join('/') : path

  const response = await getR2().send(new GetObjectCommand({ Bucket: r2Bucket(), Key: key }))

  setHeader(event, 'Content-Type', response.ContentType || 'application/octet-stream')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  if (response.ContentLength) {
    setHeader(event, 'Content-Length', response.ContentLength)
  }

  return sendStream(event, response.Body as Readable)
})
