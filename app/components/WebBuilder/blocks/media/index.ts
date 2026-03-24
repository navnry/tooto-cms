import type { Editor } from 'grapesjs'

export function registerMedia(editor: Editor): void {
  const bm = editor.Blocks

  bm.add('image', {
    label: 'Image',
    category: 'Media',
    media: 'lucide:image',
    content: `<img src="" alt="Image" />`,
  })
    bm.add('video', {
        label: 'Video',
        category: 'Media',
        media: 'lucide:video',
        content: `<video src="" />`,
    })
}
