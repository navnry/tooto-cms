export const SEARCH_STYLES = `
  /* ── Search trigger button ───────────────────────────────────── */
  .gjs-search {
    display: inline-flex;
    align-items: center;
  }
  .gjs-search__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    border-radius: 6px;
    padding: 0;
    transition: color 0.15s, background 0.15s;
  }
  .gjs-search__btn:hover {
    background: rgba(128, 128, 128, 0.1);
  }

  /* ── Fullscreen modal ────────────────────────────────────────── */
  .gjs-search__modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    padding-top: 96px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
  }
  .gjs-search__modal.is-open {
    opacity: 1;
    visibility: visible;
  }
  .gjs-search__inner {
    position: relative;
    width: 100%;
    max-width: 620px;
    margin: 0 24px;
  }
  .gjs-search__input {
    width: 100%;
    height: 56px;
    padding: 0 52px 0 20px;
    font-size: 1.0625rem;
    background: var(--color-surface, #ffffff);
    border: none;
    border-radius: var(--radius-base, 12px);
    outline: none;
    color: var(--color-text-primary, #111827);
    box-sizing: border-box;
    box-shadow: var(--shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.3));
    font-family: var(--font-body, system-ui, sans-serif);
  }
  .gjs-search__input::placeholder {
    color: var(--color-text-muted, #9ca3af);
  }
  .gjs-search__close {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted, #9ca3af);
    border-radius: 6px;
    transition: color 0.15s;
  }
  .gjs-search__close:hover {
    color: var(--color-text-primary, #111827);
  }
`
