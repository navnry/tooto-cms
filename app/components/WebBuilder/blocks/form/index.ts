import type { Editor } from 'grapesjs'

const base = 'box-sizing:border-box;font-family:var(--font-body,system-ui,sans-serif);'

export function registerForm(editor: Editor): void {
  editor.Blocks.add('form', {
    label: 'Form',
    category: 'Form',
    media: 'lucide:clipboard-list',
    content: `
<form style="${base}max-width:480px;padding:32px;background:var(--color-surface,#ffffff);border-radius:var(--radius-base,12px);box-shadow:var(--shadow-sm,0 1px 3px rgba(0,0,0,0.1));">
  <h3 style="margin:0 0 24px;font-size:var(--h3-size,1.25rem);font-weight:var(--h3-weight,700);line-height:var(--h3-line-height,1.15);color:var(--color-text-primary,#111827);font-family:var(--h3-font-family,var(--font-heading,var(--font-body,system-ui,sans-serif)));">Contact Us</h3>
  <div style="margin-bottom:16px;">
    <label style="display:block;margin-bottom:6px;font-size:0.875rem;font-weight:500;color:var(--color-text-primary,#374151);">Name</label>
    <input type="text" placeholder="Your name" style="width:100%;padding:10px 12px;border:1px solid var(--color-border,#d1d5db);border-radius:calc(var(--radius-base,12px) / 2);font-size:0.875rem;color:var(--color-text-primary,#111827);background:var(--color-surface,#ffffff);outline:none;box-sizing:border-box;" />
  </div>
  <div style="margin-bottom:16px;">
    <label style="display:block;margin-bottom:6px;font-size:0.875rem;font-weight:500;color:var(--color-text-primary,#374151);">Email</label>
    <input type="email" placeholder="you@example.com" style="width:100%;padding:10px 12px;border:1px solid var(--color-border,#d1d5db);border-radius:calc(var(--radius-base,12px) / 2);font-size:0.875rem;color:var(--color-text-primary,#111827);background:var(--color-surface,#ffffff);outline:none;box-sizing:border-box;" />
  </div>
  <div style="margin-bottom:24px;">
    <label style="display:block;margin-bottom:6px;font-size:0.875rem;font-weight:500;color:var(--color-text-primary,#374151);">Message</label>
    <textarea placeholder="Your message…" rows="4" style="width:100%;padding:10px 12px;border:1px solid var(--color-border,#d1d5db);border-radius:calc(var(--radius-base,12px) / 2);font-size:0.875rem;color:var(--color-text-primary,#111827);background:var(--color-surface,#ffffff);outline:none;resize:vertical;box-sizing:border-box;"></textarea>
  </div>
  <button type="submit" style="width:100%;padding:12px;background:var(--color-primary,#2563eb);color:var(--color-surface,#ffffff);font-size:0.9375rem;font-weight:600;border:none;border-radius:calc(var(--radius-base,12px) / 2);cursor:pointer;">Send Message</button>
</form>`,
  })
}
