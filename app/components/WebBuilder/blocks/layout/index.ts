import type { Editor } from 'grapesjs'

const base = 'box-sizing:border-box;font-family:var(--font-body,system-ui,sans-serif);'

export function registerLayout(editor: Editor): void {
  const bm = editor.Blocks

  bm.add('section', {
    label: 'Section',
    category: 'Layout',
    media: 'lucide:layout-template',
    content: `
<section style="padding:var(--section-gap,100px));background:var(--color-surface-muted,#f9fafb);">
  <div data-component-type="container"></div>
</section>`,
  })

  bm.add('container', {
    label: 'Container',
    category: 'Layout',
    media: 'lucide:box',
    content: `
<div data-component-type="container"></div>`,
  })

  bm.add('cols-2', {
    label: '2 Columns',
    category: 'Layout',
    media: 'lucide:columns-2',
    content: `
<div style="${base}display:flex;gap:var(--grid-gap,16px);">
  <div style="flex:1;padding:24px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
  <div style="flex:1;padding:24px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
</div>`,
  })

  bm.add('cols-3', {
    label: '3 Columns',
    category: 'Layout',
    media: 'lucide:table-2',
    content: `
<div style="${base}display:flex;gap:var(--grid-gap,16px);">
  <div style="flex:1;padding:24px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
  <div style="flex:1;padding:24px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
  <div style="flex:1;padding:24px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
</div>`,
  })

  bm.add('cols-4', {
    label: '4 Columns',
    category: 'Layout',
    media: 'lucide:grid-2x2',
    content: `
<div style="${base}display:flex;gap:calc(var(--grid-gap,12px) * 0.75);">
  <div style="flex:1;padding:16px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
  <div style="flex:1;padding:16px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
  <div style="flex:1;padding:16px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
  <div style="flex:1;padding:16px;background:var(--color-surface-muted,#f3f4f6);border-radius:var(--radius-base,8px);min-height:80px;"></div>
</div>`,
  })
}
