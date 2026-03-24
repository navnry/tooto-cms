export const FOOTER_STYLES = `
  .gjs-footer {
    background: var(--color-primary, #0057CE);
    color: var(--color-surface, #ffffff);
    font-family: var(--font-body, system-ui, -apple-system, sans-serif);
    box-sizing: border-box;
  }
  .gjs-footer *, .gjs-footer *::before, .gjs-footer *::after {
    box-sizing: border-box;
  }
  .gjs-footer__top {
    max-width: var(--container-width, 1280px);
    margin: 0 auto;
    padding: 56px var(--container-padding-x, 20px) 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--grid-gap, 24px);
  }
  .gjs-footer__logo a {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
  }
  .gjs-footer__logo img {
    height: 40px;
    width: auto;
    display: block;
    background: color-mix(in srgb, var(--color-surface, #ffffff) 15%, transparent);
    border-radius: calc(var(--radius-base, 12px) / 3);
    min-width: 120px;
  }
  .gjs-footer__body {
    max-width: var(--container-width, 1280px);
    margin: 0 auto;
    padding: 64px var(--container-padding-x, 20px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: calc(var(--grid-gap, 24px) * 1.6667);
    align-items: start;
  }
  .gjs-footer__contact {
    max-width: 400px;
  }
  .gjs-footer__contact-info {
    margin-bottom: 40px;
    font-weight: 300;
    line-height: 1.9;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--color-surface, #ffffff) 90%, transparent);
  }
  .gjs-footer__contact-info p {
    margin: 0;
  }
  .gjs-footer__social {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .gjs-footer__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--color-surface, #ffffff) 70%, transparent);
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .gjs-footer__social-link:hover {
    color: var(--color-surface, #ffffff);
    transform: translateY(-3px);
  }
  .gjs-footer__social-link svg {
    display: block;
  }
  .gjs-footer__nav {
    display: flex;
    justify-content: flex-end;
    gap: calc(var(--grid-gap, 24px) * 2.3333);
    flex-wrap: wrap;
  }
  .gjs-footer__nav-title {
    color: var(--color-surface, #ffffff);
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin: 0 0 16px;
  }
  .gjs-footer__nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .gjs-footer__nav-list a {
    color: color-mix(in srgb, var(--color-surface, #ffffff) 75%, transparent);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 300;
    line-height: 1.5;
    position: relative;
    display: inline-block;
    transition: color 0.2s ease;
  }
  .gjs-footer__nav-list a::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    background: color-mix(in srgb, var(--color-surface, #ffffff) 60%, transparent);
    transition: width 0.25s ease;
  }
  .gjs-footer__nav-list a:hover {
    color: var(--color-surface, #ffffff);
  }
  .gjs-footer__nav-list a:hover::after {
    width: 100%;
  }
  .gjs-footer__bottom {
    border-top: 1px solid color-mix(in srgb, var(--color-surface, #ffffff) 10%, transparent);
  }
  .gjs-footer__bottom-inner {
    max-width: var(--container-width, 1280px);
    margin: 0 auto;
    padding: 24px var(--container-padding-x, 20px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .gjs-footer__copyright {
    color: color-mix(in srgb, var(--color-surface, #ffffff) 65%, transparent);
    font-size: 0.75rem;
    margin: 0;
  }
  .gjs-footer__copyright a {
    color: color-mix(in srgb, var(--color-surface, #ffffff) 65%, transparent);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .gjs-footer__copyright a:hover {
    color: var(--color-surface, #ffffff);
  }
  .gjs-footer__legal {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .gjs-footer__legal a {
    color: color-mix(in srgb, var(--color-surface, #ffffff) 65%, transparent);
    text-decoration: none;
    font-size: 0.875rem;
    position: relative;
    display: inline-block;
    transition: color 0.2s ease;
  }
  .gjs-footer__legal a::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    background: color-mix(in srgb, var(--color-surface, #ffffff) 50%, transparent);
    transition: width 0.2s ease;
  }
  .gjs-footer__legal a:hover {
    color: var(--color-surface, #ffffff);
  }
  .gjs-footer__legal a:hover::after {
    width: 100%;
  }
  .gjs-footer__legal-sep {
    color: color-mix(in srgb, var(--color-surface, #ffffff) 20%, transparent);
    font-size: 0.875rem;
  }
  @media (max-width: 768px) {
    .gjs-footer__top {
      padding-top: 40px;
    }
    .gjs-footer__body {
      grid-template-columns: 1fr;
      padding: 40px var(--container-padding-x, 20px);
    }
    .gjs-footer__contact {
      max-width: 100%;
    }
    .gjs-footer__nav {
      justify-content: flex-start;
      gap: 32px;
    }
    .gjs-footer__bottom-inner {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
`
