export const NAVBAR_STYLES = `
  /* ── Navbar base ───────────────────────────────────────────── */
  .gjs-navbar {
    background: #ffffff;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 100;
    box-sizing: border-box;
    transition: background 0.3s, box-shadow 0.3s;
  }
  .gjs-navbar.is-scrolled {
    background: #ffffff;
    box-shadow: 0 1px 16px rgba(0, 0, 0, 0.08);
  }

  .gjs-navbar__inner {
    display: flex;
    height: 100%;
    align-items: center;
    margin: 0 auto;
    gap: 16px;
  }

  .gjs-navbar__left {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
  }

  .gjs-navbar__center {
    display: flex;
    height: 100%;
    align-items: center;
    flex: 1;
    justify-content: center;
    min-width: 0;
  }

  .gjs-navbar--menu-left  .gjs-navbar__center { justify-content: flex-start; }
  .gjs-navbar--menu-right .gjs-navbar__center { justify-content: flex-end; }

  .gjs-navbar__right {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 8px;
  }

  .gjs-navbar .gjs-logo {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }
  .gjs-navbar .gjs-logo__img {
    height: 40px;
    width: auto;
    display: block;
  }

  .gjs-navbar__menu {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
  }
  .gjs-navbar__link {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 8px 14px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #041038;
    text-decoration: none;
    border-radius: 7px;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .gjs-navbar__link:hover {
    color: #041038;
  }
  .gjs-navbar.is-scrolled .gjs-navbar__link {
    color: #041038;
  }
  .gjs-navbar.is-scrolled .gjs-navbar__link:hover {
    color: #041038;
  }
  .gjs-navbar__link--cta {
    background: #0057CE;
    color: #fff !important;
    padding: 8px 18px;
    border-radius: 100px;
  }
  .gjs-navbar__link--cta:hover {
    background: #1d4ed8 !important;
  }

  .gjs-navbar__burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 6px;
  }
  .gjs-navbar__burger span {
    display: block;
    width: 22px;
    height: 2px;
    background: #041038;
    border-radius: 2px;
    transition: transform 0.2s, opacity 0.2s;
  }
  .gjs-navbar__burger:hover span {
    background: #041038;
  }
  .gjs-navbar.is-scrolled .gjs-navbar__burger span {
    background: #041038;
  }

  .gjs-navbar__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.28s, visibility 0.28s;
  }
  .gjs-navbar__overlay.is-open {
    opacity: 1;
    visibility: visible;
  }

  .gjs-navbar__close {
    display: none;
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border: none;
    background: rgba(0, 0, 0, 0.08);
    color: #000;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    transition: background 0.15s, color 0.15s;
  }
  .gjs-navbar__close:hover {
    /* background: rgba(255, 255, 255, 0.16); */
  }

  @media (max-width: 767px) {
    .gjs-navbar__inner {
      justify-content: space-between;
    }
    .gjs-navbar__center {
      flex: 0 0 0;
      width: 0;
      min-width: 0;
      overflow: visible;
    }
    .gjs-navbar__right > .gjs-search,
    .gjs-navbar__right > .gjs-navbar__link--cta {
      display: none;
    }
    .gjs-navbar__burger {
      display: flex;
    }
    .gjs-navbar__menu {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(300px, 82vw);
      flex-direction: column;
      align-items: stretch;
      gap: 2px;
      background: #ffffff;
      padding: 72px 12px 24px;
      z-index: 999;
      transform: translateX(105%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      box-shadow: -8px 0 40px rgba(0, 0, 0, 0.4);
    }
    .gjs-navbar__menu.is-open {
      transform: translateX(0);
    }
    .gjs-navbar--drawer-left .gjs-navbar__menu {
      right: auto;
      left: 0;
      transform: translateX(-105%);
      box-shadow: 8px 0 40px rgba(0, 0, 0, 0.4);
    }
    .gjs-navbar--drawer-left .gjs-navbar__menu.is-open {
      transform: translateX(0);
    }
    .gjs-navbar__close {
      display: flex;
    }
    .gjs-navbar__link {
      padding: 12px 16px;
      font-size: 1rem;
      width: 100%;
      height: auto;
      justify-content: flex-start;
    }
    .gjs-navbar__link--cta {
      margin-top: 8px;
      text-align: center;
      padding: 12px 16px;
    }
  }

  .gjs-nav-group {
    position: relative;
  }
  .gjs-nav-group--mega {
    position: static;
    height: 100%;
  }
  .gjs-nav-group__btn {
    height: 100%;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #041038;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 7px;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .gjs-nav-group__btn:hover {
    color: #041038;
  }
  .gjs-navbar.is-scrolled .gjs-nav-group__btn {
    color: #041038;
  }
  .gjs-navbar.is-scrolled .gjs-nav-group__btn:hover {
    color: #041038;
    background: rgba(4, 16, 56, 0.06);
  }
  .gjs-nav-group__btn-chevron {
    display: flex;
    align-items: center;
    transition: transform 0.2s;
  }
  .gjs-nav-group:hover .gjs-nav-group__btn-chevron {
    transform: rotate(180deg);
  }

  .gjs-nav-group__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(-6px);
    min-width: 180px;
    background: #1e293b;
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.08);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.18s, visibility 0.18s, transform 0.18s;
    z-index: 200;
  }
  .gjs-nav-group:hover .gjs-nav-group__dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  .gjs-nav-group__dropdown-item {
    display: block;
    padding: 8px 12px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    border-radius: 6px;
    white-space: nowrap;
    transition: color 0.15s, background 0.15s;
  }
  .gjs-nav-group__dropdown-item:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }

  .gjs-nav-group__mega {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    padding-top: 8px;
    background: transparent;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.18s, visibility 0.18s;
    z-index: 200;
  }
  .gjs-nav-group--mega:hover .gjs-nav-group__mega {
    opacity: 1;
    visibility: visible;
  }
  .gjs-nav-group__mega-inner {
    background: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    border-radius: 36px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.10);
    border: 1px solid rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transform: translateY(-6px);
    transition: transform 0.18s;
  }
  .gjs-nav-group--mega:hover .gjs-nav-group__mega-inner {
    transform: translateY(0);
  }
  .gjs-nav-group__mega-left {
    flex: 0 0 50%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 32px 0 32px 40px;
    min-width: 0;
    box-sizing: border-box;
  }
  .gjs-nav-group__mega-right {
    flex: 0 0 50%;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    box-sizing: border-box;
    padding: 48px;
  }
  .gjs-nav-group__mega-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gjs-nav-group__mega-col {
    flex: 1;
    min-width: 160px;
    max-width: 440px;
    padding: 0 32px 0 0;
    margin-right: 32px;
    border-right: 1px solid #f1f5f9;
  }
  .gjs-nav-group__mega-col:last-child {
    padding-right: 0;
    margin-right: 0;
    border-right: none;
  }
  .gjs-nav-group__mega-col-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: #0f172a;
    padding-bottom: 16px;
    margin-bottom: 0;
    border-bottom: 1.5px solid #e2e8f0;
  }
  .gjs-nav-group__mega-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 0;
    font-size: 0.9375rem;
    color: #374151;
    text-decoration: none;
    border-bottom: 1px solid #f1f5f9;
    transition: color 0.15s;
    gap: 8px;
  }
  .gjs-nav-group__mega-item:last-child {
    border-bottom: none;
  }
  .gjs-nav-group__mega-item:hover {
    color: var(--color-primary, #2563eb);
  }
  .gjs-nav-group__mega-item-label {
    flex: 1;
  }
  .gjs-nav-group__mega-item-icon {
    flex-shrink: 0;
    font-size: 1.125rem;
    font-weight: 300;
    line-height: 1;
    color: #9ca3af;
    transition: color 0.15s, transform 0.15s;
  }
  .gjs-nav-group__mega-item:hover .gjs-nav-group__mega-item-icon {
    color: var(--color-primary, #2563eb);
    transform: rotate(45deg);
  }

  @media (max-width: 767px) {
    .gjs-nav-group {
      position: static;
      width: 100%;
      height: auto;
    }
    .gjs-nav-group__btn {
      width: 100%;
      height: auto;
      padding: 12px 16px;
      font-size: 1rem;
      border-radius: 8px;
      justify-content: space-between;
    }
    .gjs-nav-group:hover .gjs-nav-group__btn-chevron {
      transform: none;
    }
    .gjs-nav-group.is-open .gjs-nav-group__btn-chevron {
      transform: rotate(180deg);
    }
    .gjs-nav-group:hover .gjs-nav-group__dropdown {
      opacity: 1;
      visibility: visible;
      transform: none;
    }
    .gjs-nav-group__dropdown {
      position: static;
      opacity: 1;
      visibility: visible;
      transform: none;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.28s ease, padding 0.28s ease;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 0;
      box-shadow: none;
      border: none;
      z-index: auto;
      margin: 2px 0;
    }
    .gjs-nav-group.is-open .gjs-nav-group__dropdown {
      max-height: 500px;
      padding: 6px;
    }
    .gjs-nav-group__mega {
      position: static;
      padding-top: 0 !important;
      background: transparent;
      opacity: 1;
      visibility: visible;
      transition: none;
      max-height: 0;
      overflow: hidden;
      z-index: auto;
      margin: 2px 0;
    }
    .gjs-nav-group.is-open .gjs-nav-group__mega {
      max-height: 800px;
    }
    .gjs-nav-group__mega-inner {
      background: #f8fafc;
      border-radius: 8px;
      padding: 0;
      box-shadow: none;
      border: 1px solid #e2e8f0;
      flex-direction: column;
      gap: 0;
      overflow: visible;
      transform: none !important;
      transition: none;
    }
    .gjs-nav-group__mega-left {
      flex: none;
      width: 100%;
      flex-direction: column;
      padding: 10px 12px;
      gap: 0;
    }
    .gjs-nav-group__mega-right {
      display: none;
    }
    .gjs-nav-group__mega-col {
      flex: none;
      width: 100%;
      padding: 8px 0;
      margin-right: 0;
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
    }
    .gjs-nav-group__mega-col:last-child {
      border-bottom: none;
    }
    .gjs-nav-group__mega-item {
      padding: 10px 0;
      font-size: 0.9rem;
    }
  }
`
