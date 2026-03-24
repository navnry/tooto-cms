import { ensureSchema } from '~~/server/utils/db'

export default defineNitroPlugin(async () => {
  await ensureSchema()
})
