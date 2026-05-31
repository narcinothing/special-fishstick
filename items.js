/* ==========================================================================
    ITEMS — reusable "profile + detail rows" infobox card component
    --------------------------------------------------------------------------
    Sister file to modes.js. Loaded via <script src defer> by items-loader.html
    (raw JS, no <script> wrapper). It:
      1. injectItemStyles() — injects the card CSS as an inline <style>. The site
         CSP blocks external <link> stylesheets, so the CSS lives here (this file
         is the single source of truth for the item-card look).
      2. scanAndRenderItemCards() — compiles each hidden .sf-item-infobox data
         block into a styled card. Runs on load, on a few timed retries (slow
         mobile SPA mounts) and on a debounced MutationObserver.

    The card renders inside a .sf-card shell, so the site-wide preview-modal
    engine in theme.js intercepts its image + links automatically — exactly like
    the mode cards. Only the item-specific rules are injected here; the .sf-card
    base (background / border / radius / colour) comes from the global theme, so
    this file never fights the mode-card styling.

    Author it like the mode card — a hidden data block; each .sf-data-row becomes
    a label/value row:
      <div class="sf-item-infobox" data-title="Angel" data-image="IMAGE_URL">
        <div class="sf-data-row" data-label="Original Price">650 Robux <em>(...)</em></div>
        <div class="sf-data-row" data-label="Active Period">2016 – February 2017</div>
        <div class="sf-data-row" data-label="Compensation Pass"><a href="URL">Pass name</a></div>
        <div class="sf-data-row" data-label="Legacy Details">Longer paragraph of text…</div>
      </div>

    data-title  — name shown above the image (optional)
    data-image  — profile image URL (optional; omit for a text-only card)
    .sf-data-row[data-label] — one detail row; inner HTML is the value and may
                  contain <a>, <em>, <span class="sf-danger">…</span> or
                  **bold** / *italic* markdown shorthand.

    Bump ?v=1 -> ?v=2 … in items-loader.html after each push to dodge the CDN
    cache.
   ========================================================================== */
(function () {
  // ---- 1. Inject the card styles (CSP-safe inline <style>) -----------------
  function injectItemStyles() {
    if (document.getElementById('items-styles')) return;
    var style = document.createElement('style');
    style.id = 'items-styles';
    style.textContent = `
.sf-item-card .sf-item-body{display:flex;flex-direction:row;}
.sf-item-card .sf-item-profile{flex:0 0 180px;padding:20px;text-align:center;border-right:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;}
.sf-item-card .sf-item-title{font-size:20px;font-weight:600;color:#fff;margin-bottom:12px;font-family:inherit !important;}
.sf-item-card .sf-item-img-wrap{display:block;width:100%;max-width:140px;line-height:0;}
.sf-item-card .sf-item-image{width:100%;height:auto;border:1px solid rgba(255,255,255,.10);border-radius:6px;display:block;box-shadow:0 1px 3px rgba(0,0,0,.4);}
.sf-item-card .sf-item-details{flex:1;min-width:0;display:flex;flex-direction:column;}
.sf-item-card .sf-item-row{display:flex;border-bottom:1px solid rgba(255,255,255,.10);min-height:45px;}
.sf-item-card .sf-item-row:last-child{border-bottom:none;}
.sf-item-card .sf-item-label{flex:0 0 160px;padding:12px 15px;font-weight:600;font-size:14px;color:rgba(255,255,255,.55);background:rgba(0,0,0,.12);border-right:1px solid rgba(255,255,255,.10);display:flex;align-items:center;font-family:inherit !important;}
.sf-item-card .sf-item-value{flex:1;padding:12px 15px;font-size:14px;line-height:1.5;color:#fff;display:flex;align-items:center;font-family:inherit !important;}
.sf-item-card .sf-item-value em{color:rgba(255,255,255,.6);font-style:italic;margin-left:5px;}
.sf-item-card .sf-item-value a{color:#fff !important;font-weight:600;text-decoration:underline !important;text-underline-offset:3px;}
.sf-item-card .sf-danger{color:#ff6b6b;}

@media (max-width:980px){
  .sf-item-card .sf-item-body{flex-direction:column;}
  .sf-item-card .sf-item-profile{flex:1;border-right:none;border-bottom:1px solid rgba(255,255,255,.10);padding:24px 20px;}
  .sf-item-card .sf-item-img-wrap{max-width:180px;}
  .sf-item-card .sf-item-row{flex-direction:column;}
  .sf-item-card .sf-item-label{flex:1;background:rgba(0,0,0,.22);border-right:none;padding:8px 15px;font-size:13px;}
  .sf-item-card .sf-item-value{padding:10px 15px 15px 15px;}
}
`;
    document.head.appendChild(style);
  }

  // Inline markdown shorthand, mirrored from theme.js so this file is standalone.
  function parseInlineMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  }

  // ---- 2. Compile each .sf-item-infobox data block into a card -------------
  function scanAndRenderItemCards() {
    var components = document.querySelectorAll('.sf-item-infobox:not([data-ready])');
    components.forEach(function (el) {
      el.setAttribute('data-ready', 'true');
      el.style.display = 'block';

      var title = el.getAttribute('data-title') || '';
      var image = el.getAttribute('data-image') || '';

      var rowsHtml = '';
      el.querySelectorAll('.sf-data-row').forEach(function (row) {
        var label = row.getAttribute('data-label') || '';
        var value = parseInlineMarkdown(row.innerHTML);
        rowsHtml +=
          '<div class="sf-item-row">' +
            '<div class="sf-item-label">' + label + '</div>' +
            '<div class="sf-item-value">' + value + '</div>' +
          '</div>';
      });

      if (!rowsHtml) return;

      var imageHtml = image
        ? '<a href="' + image + '" class="sf-item-img-wrap">' +
            '<img src="' + image + '" alt="' + title + '" class="sf-item-image">' +
          '</a>'
        : '';

      el.innerHTML =
        '<div class="sf-card sf-item-card">' +
          '<div class="sf-item-body">' +
            '<div class="sf-item-profile">' +
              (title ? '<div class="sf-item-title">' + title + '</div>' : '') +
              imageHtml +
            '</div>' +
            '<div class="sf-item-details">' + rowsHtml + '</div>' +
          '</div>' +
        '</div>';
    });
  }

  injectItemStyles();

  // ---- 3. Render now, on late mounts, and on SPA route changes -------------
  // Guarded so a page that loads BOTH this file and the global theme.js copy of
  // the engine only wires the scheduler once (whichever runs first wins; the
  // other's scan is a cheap no-op thanks to the [data-ready] guard).
  if (!window.__sfItemCardsInit) {
    window.__sfItemCardsInit = true;

    var debounceTimer = null;
    var firstScheduled = 0;

    scanAndRenderItemCards();

    // Slow mobile SPA mounts can render the page AFTER our first pass, and the
    // observer's debounce can be starved by a burst of hydration mutations — so
    // nothing would appear until the user taps. These retries + lifecycle hooks
    // catch the late mount without an interaction. The scan is idempotent.
    [50, 150, 400, 800, 1500].forEach(function (ms) { setTimeout(scanAndRenderItemCards, ms); });
    document.addEventListener('DOMContentLoaded', scanAndRenderItemCards);
    window.addEventListener('load', scanAndRenderItemCards);

    new MutationObserver(function () {
      var now = Date.now();
      if (!firstScheduled) firstScheduled = now;
      clearTimeout(debounceTimer);

      // Max-wait guard: force a scan after 250ms of continuous mutations so the
      // cards can't be starved until the user taps the screen on mobile.
      if (now - firstScheduled >= 250) {
        firstScheduled = 0;
        scanAndRenderItemCards();
        return;
      }
      debounceTimer = setTimeout(function () {
        firstScheduled = 0;
        scanAndRenderItemCards();
      }, 16);
    }).observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true
    });
  }
})();
