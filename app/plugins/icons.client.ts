/**
 * icons.client.ts — Registers the Lucide icon collection for use with AppIcon (@iconify/vue)
 */
import { addCollection } from '@iconify/vue'
import lucide from '@iconify-json/lucide/icons.json'

export default defineNuxtPlugin(() => {
  addCollection(lucide as Parameters<typeof addCollection>[0])
})
