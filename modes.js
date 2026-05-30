/* ==========================================================================
    MODES — reusable "mode / form" card component (styles + tab behaviour)
    --------------------------------------------------------------------------
    Loaded via <script src defer> by a page loader (raw JS, no <script> wrapper).
    Does two things:
      1. injectModeStyles() — injects the card CSS as an inline <style>. External
         <link> stylesheets are blocked by the site CSP, so the CSS lives here
         (this file is the single source of truth for it).
      2. Tab switching — one delegated listener handles every .sf-card on the
         page, scoped per card via data-sf-tab / data-sf-panel (no IDs, no
         collisions, works for any number of cards).

    Markup per card:
      <div class="sf-card">
        <div class="sf-header"><span class="sf-title">Name</span></div>
        <div class="sf-body">
          <div class="sf-left"> img + <div class="stat-list">…</div> </div>
          <div class="sf-right">
            <div class="sf-tabs">
              <button class="sf-tab active" data-sf-tab="0">Overview</button>
              <button class="sf-tab"        data-sf-tab="1">Media</button>
            </div>
            <div class="sf-panel active" data-sf-panel="0"> … </div>
            <div class="sf-panel"        data-sf-panel="1"> … </div>
          </div>
        </div>
      </div>
   ========================================================================== */
(function () {
  // ---- 1. Inject the card styles (CSP-safe inline <style>) -----------------
  function injectModeStyles() {
    if (document.getElementById('modes-styles')) return;
    var style = document.createElement('style');
    style.id = 'modes-styles';
    style.textContent = `
.sf-card{background:rgba(30,30,30,.6);border:1px solid rgba(255,255,255,.10);border-radius:8px;overflow:hidden;margin:16px 0;color:#fff;font-family:"Roboto",sans-serif;font-size:15px;}
.sf-body{display:flex;}

/* Left Column Sizing and Formatting */
.sf-left{width:280px;flex-shrink:0;padding:18px;border-right:1px solid rgba(255,255,255,.10);display:flex;flex-direction:column;align-items:stretch;gap:14px;}

/* Fandom Style Header Styling rules */
.sf-card-title {font-size:22px !important;font-weight:600 !important;color:#fff !important;margin:0 0 4px 0 !important;padding:0 !important;border:none !important;text-align:left;line-height:1.2;}

/* Fandom-Style Multi-Image Tab Selector Menu */
.sf-img-tabs {display:flex;flex-wrap:wrap;gap:4px;width:100%;background:rgba(0,0,0,0.2);padding:4px;border-radius:4px;border:1px solid rgba(255,255,255,0.05);}
.sf-img-btn {background:transparent !important;border:none !important;color:rgba(255,255,255,0.6) !important;padding:6px 10px;font-size:12px;font-weight:600;text-transform:uppercase;cursor:pointer;flex:1;text-align:center;border-radius:3px;transition:all 0.15s ease;white-space:nowrap;}
.sf-img-btn:hover {color:#fff !important;background:rgba(255,255,255,0.05) !important;}
.sf-img-btn.active {color:#fff !important;background:rgba(36, 96, 235, 1) !important;box-shadow:0 1px 3px rgba(0,0,0,0.3);}

/* Explicit Icon Card Constraints (Fixes Stretching bugs) */
.sf-main-link-wrap {display:block;width:100%;line-height:0;}
.sf-main-display-img{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border:1px solid rgba(255,255,255,.10);border-radius:8px;display:block;}

.stat-list{width:100%;display:flex;flex-direction:column;}
.stat-line{display:flex;justify-content:space-between;align-items:center;padding:6px 2px;border-bottom:1px solid rgba(255,255,255,.08);}
.stat-line:last-child{border-bottom:none;}
.stat-line .sl{font-size:12px;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.04em;}
.stat-line .sv{font-size:15px;font-weight:600;color:#fff;}

/* Right column: tabs + panels */
.sf-right{flex:1;min-width:0;display:flex;flex-direction:column;}
.sf-tabs{display:flex;width:100%;border-bottom:1px solid rgba(255,255,255,.10);}
.sf-tab{appearance:none!important;-webkit-appearance:none!important;background:transparent!important;border:none!important;border-bottom:2px solid transparent!important;border-radius:0!important;box-shadow:none!important;outline:none!important;text-shadow:none!important;margin:0!important;flex:1;text-align:center;padding:11px 18px;font-family:inherit;font-size:15px;font-weight:500;white-space:nowrap;cursor:pointer;color:rgba(255,255,255,.55)!important;transition:background .15s ease,color .15s ease,border-color .15s ease;}
.sf-tab:hover{background:rgba(92, 92, 92, 0.356)!important;color:#fff!important;}
.sf-tab.active{color:#fff!important; background: rgba(36, 96, 235, 1) !important; text-shadow: 0 1px 3px rgb(0, 0, 0) !important}
.sf-panel{display:none;flex:1;padding:16px 18px;max-height:360px;overflow-y:auto;scrollbar-width:thin;}
.sf-panel.active{display:block;}

/* Layout elements */
.sf-row{display:flex;gap:10px;margin-bottom:11px;align-items:baseline;line-height:1.5;}
.sf-lbl{min-width:100px;flex-shrink:0;color:rgba(255,255,255,.5);font-weight:500;}
.sf-val{color:#fff;}
.sf-danger{color:#ff6b6b;}
.imgs-row{display:flex;flex-wrap:wrap;gap:12px;}
.imgs-row a{display:block;line-height:0;}
.imgs-row>div{flex:1 1 0;min-width:110px;}
.img-th{width:100%;height:auto;aspect-ratio:1;object-fit:cover;border:1px solid rgba(255,255,255,.10);border-radius:8px;display:block;}
.img-cap{margin-top:4px;font-size:13px;color:rgba(255,255,255,.6);text-align:center;}
.sf-card .sf-link{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px;}

/* CSS Global Resets targeting Wiki external hooks */
.sf-card a[target="_blank"]::before,.sf-card a[target="_blank"]::after,.sf-card .is-external-link::before,.sf-card .is-external-link::after,.sf-tab::before,.sf-tab::after{content:none!important;}

/* Mobile Optimization: Centers header, collapses layout columns stack vertically */
@media (max-width:640px){
  .sf-body{flex-direction:column;}
  .sf-left{width:auto;border-right:none;border-bottom:1px solid rgba(255,255,255,.10);align-items:center;}
  .sf-card-title {text-align:center !important; width:100%; margin-bottom:10px !important;}
  .sf-main-link-wrap {max-width:240px; margin:0 auto;}
  .sf-img-tabs {max-width:280px; margin:0 auto;}
  .stat-list {max-width:280px; margin-top:6px;}
  .stat-line .sl{font-size:14px;}
  .stat-line .sv{font-size:16px;}
}
`;
    document.head.appendChild(style);
  }

  injectModeStyles();

  // ---- 2. Unified Click Handlers (Delegated Execution Scopes) -------------------
  if (!window.__sfTabsInit) {
    window.__sfTabsInit = true;
    
    document.addEventListener('click', function (e) {
      // Handle Right Side Panel Tab Changes
      var tab = e.target.closest('.sf-tab');
      if (tab) {
        var card = tab.closest('.sf-card');
        if (!card) return;
        var idx = tab.getAttribute('data-sf-tab');
        card.querySelectorAll('.sf-tab').forEach(t => t.classList.toggle('active', t === tab));
        card.querySelectorAll('.sf-panel').forEach(p => p.classList.toggle('active', p.getAttribute('data-sf-panel') === idx));
        return;
      }

      // Handle Left Side Fandom Image Switches
      var imgBtn = e.target.closest('.sf-img-btn');
      if (imgBtn) {
        var leftPanel = imgBtn.closest('.sf-left');
        if (!leftPanel) return;
        
        // Toggle Active State styles across siblings
        leftPanel.querySelectorAll('.sf-img-btn').forEach(btn => btn.classList.toggle('active', btn === imgBtn));
        
        // Pull target URL value and update display tags inside frame
        var targetSrc = imgBtn.getAttribute('data-img-src');
        var displayImg = leftPanel.querySelector('.sf-main-display-img');
        var linkWrap = leftPanel.querySelector('.sf-main-link-wrap');
        
        if (displayImg) displayImg.setAttribute('src', targetSrc);
        if (linkWrap) linkWrap.setAttribute('href', targetSrc);
      }
    });
  }
})();