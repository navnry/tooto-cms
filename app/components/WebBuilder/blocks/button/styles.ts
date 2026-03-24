export const TYPE_BUTTON = 'button-cta'
export const ATTR_EFFECT = 'data-effect'
export const BUTTON_BLOCK_ICON = 'lucide:rectangle-horizontal'

export const BUTTON_STYLES = `
  /* ── Base ─────────────────────────────────────────── */
  .gjs-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 28px;
    background: var(--color-primary, #2563eb);
    color: var(--color-surface, #ffffff);
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-base, 8px);
    text-decoration: none;
    cursor: pointer;
    border: none;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    font-family: var(--font-body, system-ui, sans-serif);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  /* ── lift ─────────────────────────────────────────── */
  .gjs-btn[data-effect="lift"]:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md, 0 10px 28px rgba(37, 99, 235, 0.45));
  }
  .gjs-btn[data-effect="lift"]:active {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm, 0 4px 12px rgba(37, 99, 235, 0.35));
  }

  /* ── scale ────────────────────────────────────────── */
  .gjs-btn[data-effect="scale"]:hover {
    transform: scale(1.06);
  }
  .gjs-btn[data-effect="scale"]:active {
    transform: scale(0.98);
  }

  /* ── glow ─────────────────────────────────────────── */
  .gjs-btn[data-effect="glow"]:hover {
    box-shadow:
      0 0 0 4px color-mix(in srgb, var(--color-primary, #2563eb) 35%, transparent),
      0 0 20px color-mix(in srgb, var(--color-primary, #2563eb) 25%, transparent);
  }

  /* ── pulse ────────────────────────────────────────── */
  .gjs-btn[data-effect="pulse"]:hover {
    animation: gjs-btn-pulse 0.45s ease;
  }
  @keyframes gjs-btn-pulse {
    0%   { transform: scale(1);    }
    35%  { transform: scale(1.09); }
    65%  { transform: scale(0.96); }
    85%  { transform: scale(1.03); }
    100% { transform: scale(1);    }
  }

  /* ── shine ────────────────────────────────────────── */
  .gjs-btn[data-effect="shine"]::after {
    content: '';
    position: absolute;
    top: 0; left: -75%;
    width: 50%; height: 100%;
    background: linear-gradient(
      120deg,
      rgba(255,255,255,0)   0%,
      rgba(255,255,255,0.4) 50%,
      rgba(255,255,255,0)   100%
    );
    transform: skewX(-20deg);
    transition: left 0.5s ease;
    pointer-events: none;
  }
  .gjs-btn[data-effect="shine"]:hover::after {
    left: 125%;
  }
`
