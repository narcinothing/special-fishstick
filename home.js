/* ==========================================================================
    HOME / MAIN PAGE — page-specific script
    --------------------------------------------------------------------------
    Loaded via <script src defer> by the page loader, so this file is RAW JS
    only — no <script> wrapper. Site-wide logic lives in theme.js.
    Responsibilities:
      1. updateGameAge()   — fills #game-years with the game's age in years
      2. initCarousel()    — drives the .master-carousel image slideshow
      3. injectMediaHub()  — builds the Discord/X + YouTube hub into
                             #homepage-media-hub
   ========================================================================== */
(function () {
  // --------------------------------------------------------------------------
  // Inject the carousel CSS as an inline <style>. External <link> stylesheets
  // from GitHub are blocked by the site's content-security policy, but inline
  // styles are allowed (this is the same technique injectMediaHub() uses).
  // This is the single source of truth for the carousel styling — home.css is
  // just a mirror kept for reference / non-CSP environments.
  // --------------------------------------------------------------------------
  function injectHomeStyles() {
    if (document.getElementById('home-page-styles')) return;
    const style = document.createElement('style');
    style.id = 'home-page-styles';
    style.textContent = `
      .master-carousel ul {
        display: grid !important;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        align-items: center;
        justify-content: center;
      }
      .m-slide {
        grid-area: 1/1/2/2 !important;
        position: relative !important;
        opacity: 0;
        visibility: hidden;
        transition: opacity .4s ease-in-out, visibility .4s ease-in-out;
        z-index: 1;
        width: 100%;
        text-align: center;
      }
      .active-slide {
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 2 !important;
      }
      .m-slide img {
        margin: 0 auto !important;
        display: block !important;
      }
      a.slide-arrow {
        position: absolute;
        top: 50% !important;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, .6) !important;
        color: #fff !important;
        font-size: 24px;
        font-weight: 700;
        padding: 12px 18px;
        text-decoration: none !important;
        border-radius: 4px;
        z-index: 10;
        transition: background .2s ease, top .2s ease;
        user-select: none;
      }
      a.slide-arrow:hover {
        background: rgba(0, 0, 0, .9) !important;
        color: #fff !important;
      }
      .left-arrow { left: 10px; }
      .right-arrow { right: 10px; }
      @media (max-width: 768px) {
        a.slide-arrow { top: 50% !important; font-size: 20px; padding: 8px 12px; }
      }
      @media (max-width: 480px) {
        a.slide-arrow { top: 50% !important; }
      }
      .m-slide:first-child { margin-top: 7px !important; }
    `;
    document.head.appendChild(style);
  }

  injectHomeStyles();

  let ageUpdated = false;

  function updateGameAge() {
    if (ageUpdated) return true;
    const target = document.getElementById('game-years');
    if (!target) return false;

    const releaseDate = new Date('2015-05-23');
    const today = new Date();

    let age = today.getFullYear() - releaseDate.getFullYear();
    const monthDiff = today.getMonth() - releaseDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < releaseDate.getDate())) {
      age--;
    }

    target.innerText = age;
    ageUpdated = true;
    return true;
  }

  function initCarousel() {
    const slides = document.querySelectorAll('.master-carousel ul li');
    if (slides.length === 0) return false;

    const firstImg = slides[0].querySelector('img');
    if (firstImg && !firstImg.complete) return false;
    if (firstImg && firstImg.naturalHeight === 0) return false;

    let slideIndex = 0;
    let timer = null;

    slides.forEach(slide => slide.classList.remove('active-slide'));
    slides[0].classList.add('active-slide');

    function showSlide(index) {
      if (index >= slides.length) slideIndex = 0;
      if (index < 0) slideIndex = slides.length - 1;
      slides.forEach(slide => slide.classList.remove('active-slide'));
      slides[slideIndex].classList.add('active-slide');
    }

    function startAutoFlip() {
      clearInterval(timer);
      timer = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
      }, 4000);
    }

    const leftBtn = document.querySelector('.left-arrow');
    const rightBtn = document.querySelector('.right-arrow');

    if (rightBtn) {
      rightBtn.addEventListener('click', function (e) {
        e.preventDefault();
        slideIndex++;
        showSlide(slideIndex);
        startAutoFlip();
      });
    }

    if (leftBtn) {
      leftBtn.addEventListener('click', function (e) {
        e.preventDefault();
        slideIndex--;
        showSlide(slideIndex);
        startAutoFlip();
      });
    }

    startAutoFlip();
    return true;
  }

  function injectMediaHub() {
    const hubTarget = document.getElementById('homepage-media-hub');
    if (!hubTarget) return false;
    if (hubTarget.children.length > 0) return true;

    // Handles inner flexible alignment sizes cleanly
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .hub-content-box { height: 430px !important; }
      .hub-yt-iframe { height: 430px !important; }
      @media (max-width: 980px) {
        .hub-left-panel, .hub-right-panel { max-width: 100% !important; width: 100% !important; }
        .hub-content-box { height: 450px !important; }
        .hub-yt-iframe { height: 250px !important; }
      }
    `;
    document.head.appendChild(styleSheet);

    const innerFlex = document.createElement('div');
    innerFlex.style.cssText = "display: flex; flex-wrap: wrap; gap: 25px; justify-content: center; align-items: stretch; width: 100%;";

    const leftPanel = document.createElement('div');
    leftPanel.className = "hub-left-panel";
    leftPanel.style.cssText = "flex: 1; min-width: 320px; max-width: 520px; display: flex; flex-direction: column; gap: 14px;";

    const tabHeader = document.createElement('div');
    tabHeader.style.cssText = "display: flex; background: #1a1a1e; border-radius: 8px; padding: 4px; border: 1px solid #2d2d35;";

    const dscTab = document.createElement('button');
    dscTab.innerText = "Discord Community";
    const xTab = document.createElement('button');
    xTab.innerText = "Dracius on X";

    const baseTabStyle = `
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    dscTab.style.cssText = baseTabStyle + "background: #5865F2; color: #fff;";
    xTab.style.cssText = baseTabStyle + "background: transparent; color: #8e8e93;";

    tabHeader.appendChild(dscTab);
    tabHeader.appendChild(xTab);

    const contentBox = document.createElement('div');
    contentBox.className = "hub-content-box";
    contentBox.style.cssText = "display: flex; align-items: stretch; width: 100%;";

    const dscIframe = document.createElement('iframe');
    dscIframe.src = "https://discord.com/widget?id=342432628437286912&theme=dark";
    dscIframe.style.cssText = "width:100%; height:100%; border:none; border-radius:8px;";
    dscIframe.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts');

    const xCard = document.createElement('div');
    xCard.style.cssText = `
      width: 100%;
      background: #15181c;
      border: 1px solid #2f3336;
      border-radius: 8px;
      padding: 24px;
      display: none;
      flex-direction: column;
      justify-content: space-between;
      color: #fff;
      font-family: sans-serif;
    `;

    xCard.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <div>
            <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700;">Dracius</h4>
            <p style="margin: 0; color: #ffffff; font-size: 0.85rem;">@DraciusRBX</p>
          </div>
        </div>
        <p style="font-size: 0.9rem; line-height: 1.5; color: #e7e9ea;">
          Follow Dracius on X to catch live status updates, patch-notes, balance logs, codes, sneak peeks, directly from the creator!
        </p>
      </div>
      <a href="https://x.com/DraciusRBX" target="_blank" style="display: block; text-align: center; background: #eff3f4; color: #0f1419; font-weight: 700; font-size: 0.9rem; padding: 10px; border-radius: 9999px; text-decoration: none;">
        View Latest Tweets
      </a>
    `;

    contentBox.appendChild(dscIframe);
    contentBox.appendChild(xCard);
    leftPanel.appendChild(tabHeader);
    leftPanel.appendChild(contentBox);

    const rightPanel = document.createElement('div');
    rightPanel.className = "hub-right-panel";
    rightPanel.style.cssText = "flex: 1; min-width: 320px; max-width: 520px; display: flex; flex-direction: column;";

    const ytHeadline = document.createElement('h3');
    ytHeadline.innerText = "The latest development stream on YouTube:";
    ytHeadline.style.cssText = "margin: 0 0 14px 0 !important; padding: 0 !important; border: none !important; font-size: 1.1rem; font-weight: 500; color: #fff !important; font-family: sans-serif; letter-spacing: 0.3px; box-shadow: none !important;";

    const ytIframe = document.createElement('iframe');
    ytIframe.className = "hub-yt-iframe";
    ytIframe.src = "https://www.youtube.com/embed/videoseries?list=PL0u6iJeAOKa9YTgIsL7lj956uCJQIpoZ8&theme=dark";
    ytIframe.style.cssText = "width:100%; border:none; border-radius:8px; background:#000;";
    ytIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    ytIframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    ytIframe.setAttribute('allowfullscreen', 'true');

    rightPanel.appendChild(ytHeadline);
    rightPanel.appendChild(ytIframe);

    dscTab.addEventListener('click', () => {
      dscTab.style.background = "#5865F2"; dscTab.style.color = "#fff";
      xTab.style.background = "transparent"; xTab.style.color = "#8e8e93";
      dscIframe.style.display = "block";
      xCard.style.display = "none";
    });

    xTab.addEventListener('click', () => {
      xTab.style.background = "#eff3f4"; xTab.style.color = "#0f1419";
      dscTab.style.background = "transparent"; dscTab.style.color = "#8e8e93";
      xCard.style.display = "flex";
      dscIframe.style.display = "none";
    });

    innerFlex.appendChild(leftPanel);
    innerFlex.appendChild(rightPanel);
    hubTarget.appendChild(innerFlex);
    return true;
  }

  let attempts = 0;
  const checkInterval = setInterval(function () {
    attempts++;
    const carouselSuccess = initCarousel();
    const ageSuccess = updateGameAge();
    const hubSuccess = injectMediaHub();

    if ((carouselSuccess && ageSuccess && hubSuccess) || attempts > 50) {
      clearInterval(checkInterval);
    }
  }, 100);
})();
