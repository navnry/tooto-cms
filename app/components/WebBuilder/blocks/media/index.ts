import type { Editor } from 'grapesjs'
import { createBlockSuite, defineBlock } from '../registry'

const mediaSuite = createBlockSuite({
  blocks: [
    defineBlock('image', {
      label: 'Image',
      category: 'Media',
      media: 'lucide:image',
      content: `<img src="" alt="Image" />`,
    }),
    defineBlock('video', {
      label: 'Video',
      category: 'Media',
      media: 'lucide:video',
      content: `<video src="" />`,
    }),
  ],
})

export function registerMedia(editor: Editor): void {
  mediaSuite(editor)
}
