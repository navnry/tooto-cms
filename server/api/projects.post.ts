import { randomUUID } from 'node:crypto'

// POST /api/projects — create a new project
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = randomUUID()
  const name = body?.name || 'Untitled Project'

  await ensureSchema()
  const db = getDb()
  await db.execute(
    'INSERT INTO projects (id, name) VALUES (?, ?)',
    [id, name],
  )

  setResponseStatus(event, 201)
  return { id, name }
})
