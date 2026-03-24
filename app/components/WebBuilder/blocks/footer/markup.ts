import { SVG_INSTAGRAM, SVG_LINKEDIN, SVG_X, SVG_YOUTUBE } from './constants'

export const FOOTER_HTML = `
<footer class="gjs-footer">
  <div class="gjs-footer__top">
    <div class="gjs-footer__logo">
      <a href="/"><img src="" alt="Logo" /></a>
    </div>
  </div>

  <div class="gjs-footer__body">
    <div class="gjs-footer__contact">
      <div class="gjs-footer__contact-info">
        <p>Email：info@example.com</p>
        <p>Tel：+86-000-00000000</p>
        <p>Add: Your company address, City, Country</p>
      </div>
      <div class="gjs-footer__social">
        <a href="#" class="gjs-footer__social-link" aria-label="X / Twitter">${SVG_X}</a>
        <a href="#" class="gjs-footer__social-link" aria-label="Instagram">${SVG_INSTAGRAM}</a>
        <a href="#" class="gjs-footer__social-link" aria-label="YouTube">${SVG_YOUTUBE}</a>
        <a href="#" class="gjs-footer__social-link" aria-label="LinkedIn">${SVG_LINKEDIN}</a>
      </div>
    </div>

    <div class="gjs-footer__nav">
      <div class="gjs-footer__nav-col">
        <h4 class="gjs-footer__nav-title">Masterbatch</h4>
        <ul class="gjs-footer__nav-list">
          <li><a href="#">Carbon Black Masterbatch</a></li>
          <li><a href="#">White Masterbatch</a></li>
          <li><a href="#">Color Masterbatch</a></li>
          <li><a href="#">Masterbatch Stabilization</a></li>
          <li><a href="#">Masterbatch Concentrate</a></li>
        </ul>
      </div>
      <div class="gjs-footer__nav-col">
        <h4 class="gjs-footer__nav-title">Application</h4>
        <ul class="gjs-footer__nav-list">
          <li><a href="#">Application Film</a></li>
          <li><a href="#">Food Packaging</a></li>
          <li><a href="#">Collective Packaging</a></li>
          <li><a href="#">Industrial Packing</a></li>
          <li><a href="#">More Application</a></li>
        </ul>
      </div>
      <div class="gjs-footer__nav-col">
        <h4 class="gjs-footer__nav-title">About</h4>
        <ul class="gjs-footer__nav-list">
          <li><a href="#">About Us</a></li>
          <li><a href="#">Our Team</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="gjs-footer__bottom">
    <div class="gjs-footer__bottom-inner">
      <p class="gjs-footer__copyright">
        © 2025 Brand. All rights reserved. Designed and developed by
        <a href="#">YourAgency</a>.
      </p>
      <div class="gjs-footer__legal">
        <a href="#">Terms &amp; Conditions</a>
        <span class="gjs-footer__legal-sep">|</span>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>
`.trim()
