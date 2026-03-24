export const TABS_STYLES = `
  .gjs-tabs { width: 100%; box-sizing: border-box; }
  .gjs-tabs-nav {
    display: flex; gap: 2px; flex-wrap: wrap;
    border-bottom: 2px solid var(--color-border, #e5e7eb); padding: 0;
  }
  .gjs-tab {
    padding: 10px 20px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--color-text-muted, #6b7280);
    border-radius: var(--radius-base, 12px) var(--radius-base, 12px) 0 0;
    border: 1px solid transparent; border-bottom: none;
    margin-bottom: -2px; background: transparent;
    transition: color .15s, background .15s;
    user-select: none;
    font-family: var(--font-body, system-ui, sans-serif);
  }
  .gjs-tab:hover {
    color: var(--color-text-primary, #111827);
    background: var(--color-surface-muted, #f3f4f6);
  }
  .gjs-tab--active {
    color: var(--color-primary, #2563eb); background: var(--color-surface, #ffffff);
    border-color: var(--color-border, #e5e7eb); border-bottom-color: var(--color-surface, #ffffff);
  }
  .gjs-tabs-panels {
    padding: 20px 0 0;
    min-height: 80px;
    color: var(--color-text-primary, #111827);
    font-family: var(--font-body, system-ui, sans-serif);
  }
  .gjs-tab-panel { animation: gjs-fade .2s ease; }
  @keyframes gjs-fade { from { opacity: 0; } to { opacity: 1; } }
`
