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

/* Left Column - Removed default flex gaps to handle tight custom alignment spacing */
.sf-left{width:265px;flex-shrink:0;padding:16px;border-right:1px solid rgba(255,255,255,.10);display:flex;flex-direction:column;align-items:stretch;}

/* Header Title - Fully Centered by Default on PC and Mobile layouts */
.sf-header{display:block; width:100%; padding:0 0 12px 0; background:transparent; border-bottom:1px solid rgba(255,255,255,.10); text-align:center; margin-bottom:12px;}
.sf-title{font-size:20px;font-weight:600;color:#fff;}

/* Fandom-Style Multi-Image Tab Selector Menu Frame (Fuses directly down to the image) */
.sf-image-switcher {display:flex; flex-wrap:wrap; width:100%; background:rgba(0,0,0,0.25); padding:3px; border-radius:6px 6px 0 0; gap:2px; border:1px solid rgba(255,255,255,.10); border-bottom:none; margin-bottom:0;}
.sf-image-btn {background:transparent !important; border:none !important; color:rgba(255,255,255,0.5) !important; padding:5px 8px; font-size:11px; font-weight:600; text-transform:uppercase; cursor:pointer; flex:1; text-align:center; border-radius:4px 4px 0 0; transition:all 0.15s ease; white-space:nowrap; outline:none !important; box-shadow:none !important; margin:0 !important;}
.sf-image-btn:hover {color:#fff !important; background:rgba(255,255,255,0.06) !important;}
.sf-image-btn.active {color:#fff !important; background:rgba(36, 96, 235, 1) !important; text-shadow:0 1px 2px rgba(0,0,0,0.6);}

/* Showcase Image Wrapper (Fuses cleanly up to the button switcher panel) */
.sf-main-img-wrap {width:100%; display:block; line-height:0; margin-bottom:14px;}
.sf-left .sf-display-image{width:100%; height:auto; aspect-ratio:1/1; object-fit:cover; border:1px solid rgba(255,255,255,.10); border-radius:0 0 8px 8px; display:block;}

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

.sf-row{display:flex;gap:10px;margin-bottom:11px;align-items:baseline;line-height:1.5;}
.sf-lbl{min-width:100px;flex-shrink:0;color:rgba(255,255,255,.5);}
.sf-val{color:#fff;}
.sf-danger{color:#ff6b6b;}
.imgs-row{display:flex;flex-wrap:wrap;gap:12px;}
.imgs-row a{display:block;line-height:0;}
.imgs-row>div{flex:1 1 0;min-width:110px;}
.img-th{width:100%;height:auto;aspect-ratio:1;object-fit:cover;border:1px solid rgba(255,255,255,.10);border-radius:8px;display:block;}
.img-cap{margin-top:4px;font-size:13px;color:rgba(255,255,255,.6);text-align:center;}
.sf-card .sf-link{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px;}

.sf-card a[target="_blank"]::before,.sf-card a[target="_blank"]::after,.sf-card .is-external-link::before,.sf-card .is-external-link::after,.sf-tab::before,.sf-tab::after{content:none!important;}

/* Modified Responsive Breakpoint: Triggers at < 980px wide viewports */
@media (max-width:980px){
  .sf-body{flex-direction:column;}
  .sf-left{width:auto;border-right:none;border-bottom:1px solid rgba(255,255,255,.10);align-items:center;padding:20px;}
  .sf-header{text-align:center !important; width:100%;}
  
  /* Lock sizing boundaries cleanly on tablet layout parameters */
  .sf-left img.sf-display-image{max-width:280px;}
  .sf-image-switcher {max-width:280px;}
  .stat-list {max-width:280px;}
  
  /* Makes buttons thicker on tablets/mobile screen interactions */
  .sf-image-btn { padding:10px 12px; font-size:12px; }
}
`;
    document.head.appendChild(style);
  }

  injectModeStyles();

  // ---- 2. Tab switching & Image Flipping Engine ---------------------------
  if (!window.__sfTabsInit) {
    window.__sfTabsInit = true;
    
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('.sf-tab');
      if (tab) {
        var card = tab.closest('.sf-card');
        if (!card) return;
        var idx = tab.getAttribute('data-sf-tab');
        card.querySelectorAll('.sf-tab').forEach(t => t.classList.toggle('active', t === tab));
        card.querySelectorAll('.sf-panel').forEach(p => p.classList.toggle('active', p.getAttribute('data-sf-panel') === idx));
        return;
      }

      var imgBtn = e.target.closest('.sf-image-btn');
      if (imgBtn) {
        var switcher = imgBtn.closest('.sf-left');
        if (!switcher) return;
        
        switcher.querySelectorAll('.sf-image-btn').forEach(btn => btn.classList.remove('active'));
        imgBtn.classList.add('active');
        
        var newImgUrl = imgBtn.getAttribute('data-img-target');
        var displayImg = switcher.querySelector('.sf-display-image');
        var parentLink = switcher.querySelector('.sf-main-img-wrap');
        
        if (displayImg) displayImg.setAttribute('src', newImgUrl);
        if (parentLink) parentLink.setAttribute('href', newImgUrl);
      }
    });
  }
})();