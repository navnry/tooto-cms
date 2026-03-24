import type { Editor } from 'grapesjs'
import { registerHeading } from './heading'

const base = 'box-sizing:border-box;font-family:var(--font-body,system-ui,sans-serif);'

export function registerTypography(editor: Editor): void {
    const { Blocks } = editor
    registerHeading(editor)

    Blocks.add('text', {
        label: 'Paragraph',
        category: 'Typography',
        media: 'lucide:type',
        content: `<p style="${base}font-size:1rem;color:var(--color-text-muted,#6b7280);line-height:1.75;margin:0;">Add your text here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
    })

    Blocks.add('list', {
        label: 'List',
        category: 'Typography',
        media: 'lucide:list',
        content: `
<ul style="${base}margin:0;padding-left:1.5em;color:var(--color-text-primary,#374151);line-height:2;font-size:1rem;">
  <li>First list item</li>
  <li>Second list item</li>
  <li>Third list item</li>
</ul>`,
    })

    Blocks.add('link', {
        label: 'Link',
        category: 'Typography',
        media: 'lucide:link',
        content: `<a href="#" style="${base}color:var(--color-primary,#2563eb);font-size:1rem;text-decoration:underline;">Click here to learn more →</a>`,
    })
}
