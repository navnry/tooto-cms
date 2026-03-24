import type { Editor } from 'grapesjs'

const base = 'box-sizing:border-box;font-family:var(--font-body,system-ui,sans-serif);'

export function registerSections(editor: Editor): void {
  const bm = editor.Blocks

  bm.add('hero', {
    label: 'Hero',
    category: 'Sections',
    media: 'lucide:panel-top',
    content: `
<section style="${base}padding:96px var(--container-padding-x,24px);background:linear-gradient(135deg,color-mix(in srgb, var(--color-primary,#2563eb) 65%, #0f172a) 0%,var(--color-primary,#1d4ed8) 100%);text-align:center;">
  <div style="max-width:720px;margin:0 auto;">
    <h1 style="font-size:var(--h1-size,3rem);font-weight:var(--h1-weight,800);color:var(--color-surface,#ffffff);margin:0 0 16px;line-height:var(--h1-line-height,1.1);font-family:var(--h1-font-family,var(--font-heading,var(--font-body,system-ui,sans-serif)));">Build Anything, Fast</h1>
    <p style="font-size:1.125rem;color:color-mix(in srgb, var(--color-surface,#ffffff) 78%, transparent);margin:0 0 40px;line-height:1.6;">Start with a template or drag and drop your own design. No code required.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="#" style="display:inline-flex;align-items:center;padding:14px 32px;background:var(--color-surface,#ffffff);color:var(--color-primary,#1d4ed8);font-size:15px;font-weight:700;border-radius:var(--radius-base,8px);text-decoration:none;">Get Started Free</a>
      <a href="#" style="display:inline-flex;align-items:center;padding:14px 32px;background:transparent;color:var(--color-surface,#ffffff);font-size:15px;font-weight:600;border-radius:var(--radius-base,8px);text-decoration:none;border:1.5px solid color-mix(in srgb, var(--color-surface,#ffffff) 40%, transparent);">Watch Demo</a>
    </div>
  </div>
</section>`,
  })

  bm.add('card', {
    label: 'Card',
    category: 'Sections',
    media: 'lucide:credit-card',
    content: `
<div style="${base}background:var(--color-surface,#ffffff);border-radius:var(--radius-base,12px);overflow:hidden;box-shadow:var(--shadow-sm,0 1px 3px rgba(0,0,0,0.1));max-width:360px;">
  <div style="width:100%;height:180px;background:var(--color-surface-muted,#e5e7eb);"></div>
  <div style="padding:20px;">
    <h3 style="margin:0 0 8px;font-size:var(--h3-size,1.125rem);font-weight:var(--h3-weight,600);line-height:var(--h3-line-height,1.15);color:var(--color-text-primary,#111827);font-family:var(--h3-font-family,var(--font-heading,var(--font-body,system-ui,sans-serif)));">Card Title</h3>
    <p style="margin:0 0 16px;font-size:0.875rem;color:var(--color-text-muted,#6b7280);line-height:1.6;">A short description of the card content goes here. Keep it concise and informative.</p>
    <a href="#" style="color:var(--color-primary,#2563eb);font-size:0.875rem;font-weight:600;text-decoration:none;">Read more →</a>
  </div>
</div>`,
  })

  bm.add('feature', {
    label: 'Feature',
    category: 'Sections',
    media: 'lucide:star',
    content: `
<div style="${base}display:flex;gap:16px;align-items:flex-start;padding:24px;">
  <div style="width:48px;height:48px;flex-shrink:0;background:color-mix(in srgb, var(--color-primary,#2563eb) 14%, transparent);border-radius:var(--radius-base,12px);display:flex;align-items:center;justify-content:center;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary,#2563eb)" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  </div>
  <div>
    <h4 style="margin:0 0 6px;font-size:var(--h4-size,1rem);font-weight:var(--h4-weight,600);line-height:var(--h4-line-height,1.2);color:var(--color-text-primary,#111827);font-family:var(--h4-font-family,var(--font-heading,var(--font-body,system-ui,sans-serif)));">Feature Title</h4>
    <p style="margin:0;font-size:0.875rem;color:var(--color-text-muted,#6b7280);line-height:1.6;">Describe the feature benefit clearly in one or two sentences.</p>
  </div>
</div>`,
  })

  bm.add('testimonial', {
    label: 'Testimonial',
    category: 'Sections',
    media: 'lucide:quote',
    content: `
<div style="${base}background:var(--color-surface,#ffffff);border-radius:var(--radius-base,12px);padding:28px;box-shadow:var(--shadow-sm,0 1px 3px rgba(0,0,0,0.1));max-width:480px;">
  <p style="margin:0 0 20px;font-size:1rem;color:var(--color-text-primary,#374151);line-height:1.7;font-style:italic;">"This product completely changed how we work. The efficiency gains have been remarkable, and the team loves using it every day."</p>
  <div style="display:flex;align-items:center;gap:12px;">
    <div style="width:40px;height:40px;border-radius:50%;background:var(--color-surface-muted,#e5e7eb);flex-shrink:0;"></div>
    <div>
      <div style="font-size:0.875rem;font-weight:600;color:var(--color-text-primary,#111827);">Jane Smith</div>
      <div style="font-size:0.75rem;color:var(--color-text-muted,#9ca3af);">CEO, Acme Corp</div>
    </div>
  </div>
</div>`,
  })

  bm.add('cta', {
    label: 'CTA',
    category: 'Sections',
    media: 'lucide:megaphone',
    content: `
<section style="${base}padding:64px var(--container-padding-x,24px);background:color-mix(in srgb, var(--color-primary,#2563eb) 10%, var(--color-surface,#ffffff));border-radius:calc(var(--radius-base,12px) * 1.3333);text-align:center;">
  <h2 style="margin:0 0 12px;font-size:var(--h2-size,2rem);font-weight:var(--h2-weight,700);line-height:var(--h2-line-height,1.1);color:var(--color-text-primary,#111827);font-family:var(--h2-font-family,var(--font-heading,var(--font-body,system-ui,sans-serif)));">Ready to Get Started?</h2>
  <p style="margin:0 0 32px;font-size:1rem;color:var(--color-text-muted,#6b7280);max-width:480px;margin-left:auto;margin-right:auto;line-height:1.6;">Join thousands of teams who use our platform to ship faster and collaborate better.</p>
  <a href="#" style="display:inline-flex;align-items:center;padding:14px 36px;background:var(--color-primary,#16a34a);color:var(--color-surface,#ffffff);font-size:15px;font-weight:700;border-radius:var(--radius-base,8px);text-decoration:none;">Start for Free</a>
</section>`,
  })
}
