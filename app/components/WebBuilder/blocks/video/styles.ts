export const VIDEO_STYLES = `
  .gjs-video {
    box-sizing: border-box;
    font-family: var(--font-body, system-ui, sans-serif);
  }
  .gjs-video__cover {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    overflow: hidden;
    border-radius: var(--radius-base, 8px);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    cursor: pointer;
  }
  .gjs-video__cover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.25);
    transition: background 0.2s;
  }
  .gjs-video__cover:hover::after {
    background: rgba(0, 0, 0, 0.15);
  }
  .gjs-video__thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .gjs-video__play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    transition: transform 0.2s ease;
    line-height: 0;
  }
  .gjs-video__play svg {
    width: 100%;
    height: 100%;
  }
  .gjs-video__cover:hover .gjs-video__play {
    transform: translate(-50%, -50%) scale(1.1);
  }
  .gjs-video__modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(6px);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s, visibility 0.25s;
  }
  .gjs-video__modal.is-open {
    opacity: 1;
    visibility: visible;
  }
  .gjs-video__modal-inner {
    position: relative;
    width: 90%;
    max-width: 960px;
  }
  .gjs-video__close {
    position: absolute;
    top: -44px;
    right: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    color: color-mix(in srgb, var(--color-surface, #ffffff) 70%, transparent);
    border-radius: 6px;
    padding: 0;
    transition: color 0.15s;
  }
  .gjs-video__close:hover {
    color: var(--color-surface, #ffffff);
  }
  .gjs-video__iframe-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    border-radius: var(--radius-base, 8px);
    overflow: hidden;
    background: #000;
  }
  .gjs-video__iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`
