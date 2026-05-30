(function () {
  // 🎯 SAFETY WRAPPER: Prevents script stalls by waiting for the Wiki.js core to mount
  function bootstrapFandomNav() {
    const targetNode = document.getElementById("root") || document.body;
    if (!targetNode) {
      setTimeout(bootstrapFandomNav, 100);
      return;
    }
    
    // Core logic fires safely once the browser DOM is verified
    runFandomScript(targetNode);
  }

  function runFandomScript(rootContainer) {
    function slugify(text) {
      return String(text)
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const NAV_GROUPS = [
      {
        label: "How To Play",
        items: [
          {
            label: "Progress",
            items: [
              { label: "Stats" },
              { label: "Multiplier" },
              { label: "Mastery" },
              { label: "Zenkai Boosts" }
            ]
          },
          {
            label: "Worlds",
            items: [
              { label: "Quest Givers" },
              { label: "Merchants" },
              { label: "Enemies" }
            ]
          },
          { label: "Guides" }
        ]
      },
      {
        label: "Mechanics",
        items: [
          { label: "Titles" },
          { label: "Z Souls" },
          { label: "Dragon Balls" },
          {
            label: "Items",
            items: [
              { label: "Consumables" },
              { label: "Accessories" }
            ]
          }
        ]
      },
      {
        label: "Skills",
        items: [
          {
            label: "Modes",
            items: [
              { label: "Gamepass Forms" },
              { label: "Event Forms" },
              { label: "Skin Forms" }
            ]
          },
          { label: "Specials" },
          {
            label: "Techniques",
            items: [
              {
                label: "Energy Skills",
                items: [
                  { label: "Energy Volley" },
                  { label: "Kamehameha" },
                  { label: "Blast Zone Attack" },
                  { label: "Galick Gun" },
                  { label: "Masenko" },
                  { label: "Super Kamehameha" },
                  { label: "Big Bang Attack" },
                  { label: "Death Beam" },
                  { label: "Spirit Bomb" },
                  { label: "Omega Cannon" },
                  { label: "Kamehameha X10" },
                  { label: "Final Flash" },
                  { label: "Supernova" },
                  { label: "Destructo Disk" },
                  { label: "Perfect Slash" },
                  { label: "Lightning Shower Rain" }
                ]
              },
              {
                label: "Combat Skills",
                items: [
                  { label: "Bone Crush" },
                  { label: "High Speed Rush" },
                  { label: "Counter Slam" },
                  { label: "Dirty Fireworks" },
                  { label: "Transmission" },
                  { label: "God Breaker" },
                  { label: "Perfect Transmission" },
                  { label: "Grand Slam" },
                  { label: "Gigantic Slam" },
                  { label: "Rapid Punches" }
                ]
              }
            ]
          }
        ]
      },
      {
        label: "Store",
        items: [
          {
            label: "Cosmetics",
            items: [
              { label: "Emotes" },
              { label: "Ki Skins" }
            ]
          },
          { label: "Gamepasses" },
          { label: "Products" }
        ]
      },
      {
        label: "Events",
        items: [
          { label: "Codes" },
          { label: "Beyond Time" },
          { label: "New Years Event" },
          { label: "Valentine's Day" },
          { label: "Festival of the Celestial Dragon" },
          { label: "Festival of Forgotten Eggs" },
          { label: "Dracius's Birthday" },
          { label: "The Hollow Harvest" },
          { label: "Christmas Festival" },
          { label: "Winter's Reckoning" }
        ]
      }
    ];

    function withComputedHrefs(items, parentParts) {
      return items.map(function (item) {
        const currentParts = parentParts.concat(slugify(item.label));
        const nextItem = {
          label: item.label,
          href: item.href || "/" + currentParts.join("/")
        };

        if (Array.isArray(item.items) && item.items.length > 0) {
          nextItem.items = withComputedHrefs(item.items, currentParts);
        }

        return nextItem;
      });
    }

    const NAV_TREE = withComputedHrefs(NAV_GROUPS, []);

    function convertToTitle(str) {
      return String(str)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, function (char) {
          return char.toUpperCase();
        });
    }

    function buildLink(text, href, className) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text; 
      if (className) {
        link.className = className;
      }
      return link;
    }

    function buildToggleButton(className, label) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.setAttribute("aria-label", "Toggle " + label + " menu");
      button.setAttribute("aria-expanded", "false");
      return button;
    }

    function getFolderToggle(folder) {
      if (!folder || !folder.firstElementChild) return null;
      return folder.firstElementChild.querySelector(
        ".fandom-header-summary-toggle, .fandom-nested-toggle"
      );
    }

    function setExpandedState(folder, expanded) {
      if (expanded) {
        folder.classList.add("is-open");
      } else {
        folder.classList.remove("is-open");
      }

      const toggle = getFolderToggle(folder);
      if (toggle) {
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      }
    }

    function closeSiblingFolders(folder) {
      const parent = folder.parentElement;
      if (!parent) return;

      Array.prototype.forEach.call(parent.children, function (sibling) {
        if (sibling !== folder && sibling.classList) {
          sibling.classList.remove("is-open");

          const siblingToggle = getFolderToggle(sibling);
          if (siblingToggle) {
            siblingToggle.setAttribute("aria-expanded", "false");
          }
        }
      });
    }

    function buildNode(item, depth) {
      const hasChildren = Array.isArray(item.items) && item.items.length > 0;

      if (!hasChildren) {
        return buildLink(item.label, item.href, "fandom-menu-link");
      }

      const wrapper = document.createElement("div");
      const row = document.createElement("div");
      const menu = document.createElement("div");
      const isTopLevel = depth === 0;

      wrapper.className = isTopLevel ? "fandom-header-dropdown" : "fandom-nested-folder";
      row.className = isTopLevel ? "fandom-header-summary-row" : "fandom-nested-row";
      menu.className = isTopLevel ? "fandom-header-menu" : "fandom-nested-menu";
      menu.style.setProperty("--fandom-menu-width", Math.max(152, 176 - depth * 10) + "px");
      
      const rowLink = buildLink(
        item.label,
        item.href,
        isTopLevel ? "fandom-header-summary-link" : "fandom-nested-link"
      );

      function toggleFolder(event) {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = wrapper.classList.contains("is-open");
        closeSiblingFolders(wrapper);
        setExpandedState(wrapper, !isOpen);
      }

      row.appendChild(rowLink);

      const toggle = buildToggleButton(
        isTopLevel ? "fandom-header-summary-toggle" : "fandom-nested-toggle",
        item.label
      );

      rowLink.addEventListener("click", function (event) {
        if (window.innerWidth <= 980) {
          event.stopPropagation(); 
        }
      });

      toggle.addEventListener("click", toggleFolder);

      row.addEventListener("click", function (event) {
        if (window.innerWidth > 980) return;
        toggleFolder(event);
      });

      row.appendChild(toggle);

      item.items.forEach(function (childItem) {
        menu.appendChild(buildNode(childItem, depth + 1));
      });

      wrapper.appendChild(row);
      wrapper.appendChild(menu);
      return wrapper;
    }

    function buildNav() {
      const nav = document.createElement("div");
      nav.className = "fandom-header-nav";

      NAV_TREE.forEach(function (group) {
        nav.appendChild(buildNode(group, 0));
      });

      return nav;
    }

    function placeNav(header, nav) {
      if (!header || !nav) return;

      let shell = document.querySelector(".fandom-header-nav-shell");

      if (window.innerWidth <= 980) {
        if (!shell) {
          shell = document.createElement("div");
          shell.className = "fandom-header-nav-shell";
          header.insertAdjacentElement("afterend", shell);
        }

        if (nav.parentElement !== shell) {
          shell.appendChild(nav);
        }
      } else {
        if (nav.parentElement !== header) {
          header.appendChild(nav);
        }
      }
    }

    function renderCaption(header) {
      const captionEl = header.querySelector(".caption, [class*='caption']");
      if (!captionEl) return;

      const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
      if (captionEl.getAttribute("data-path") === currentPath) return;

      captionEl.setAttribute("data-path", currentPath);

      if (currentPath === "/") {
        captionEl.innerHTML =
          'In <a href="/" class="fandom-caption-link">Home</a>, <a href="/" class="fandom-caption-link">Main Page</a>';
        return;
      }

      const parts = currentPath.split("/").filter(Boolean);
      const pageLabel = convertToTitle(parts[parts.length - 1]);
      const parentParts = parts.slice(0, -1);

      if (parentParts.length === 0) {
        captionEl.innerHTML =
          'In <a href="/" class="fandom-caption-link">Home</a>, <a href="' +
          currentPath +
          '" class="fandom-caption-link">' +
          pageLabel +
          "</a>";
        return;
      }

      const trail = parentParts
        .map(function (part, index) {
          const href = "/" + parentParts.slice(0, index + 1).join("/");
          return (
            '<a href="' +
            href +
            '" class="fandom-caption-link">' +
            convertToTitle(part) +
            "</a>"
          );
        })
        .join(" / ");

      captionEl.innerHTML =
        "In " +
        trail +
        ', <a href="' +
        currentPath +
        '" class="fandom-caption-link">' +
        pageLabel +
        "</a>";
    }

    function renderHeaderNav() {
      const header = document.querySelector(".page-header-section");
      if (!header) return;

      let nav = document.querySelector(".fandom-header-nav");
      if (!nav) {
        nav = buildNav();
      }

      placeNav(header, nav);
      renderCaption(header);
    }

    function patchHistory() {
      if (window.__fandomHistoryPatched) return;
      window.__fandomHistoryPatched = true;

      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function () {
        originalPushState.apply(this, arguments);
        setTimeout(renderHeaderNav, 50);
      };

      history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        setTimeout(renderHeaderNav, 50);
      };

      window.addEventListener("popstate", function () {
        setTimeout(renderHeaderNav, 50);
      });

      window.addEventListener("resize", function () {
        setTimeout(renderHeaderNav, 50);
      });

      document.addEventListener("click", function (event) {
        if (event.target.closest(".fandom-header-nav")) return;

        document.querySelectorAll(".fandom-header-dropdown.is-open, .fandom-nested-folder.is-open").forEach(function (node) {
          setExpandedState(node, false);
        });
      });
    }

    // Helper to translate basic text layout syntax constraints on the fly
    function parseInlineMarkdown(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Handles **bold**
        .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Handles *italics*
        .replace(/__(.*?)__/g, '<strong>$1</strong>')     // Handles __bold__ alternative
        .replace(/_(.*?)_/g, '<em>$1</em>');              // Handles _italics_ alternative
    }

    // ==========================================================================
    // 💎 PARSER LOGIC: Reads HTML elements and compiles Infoboxes dynamically
    // ==========================================================================
    function scanAndRenderCards() {
      const components = document.querySelectorAll('.sf-mode-infobox:not([data-ready])');
      components.forEach(function (el) {
        el.setAttribute('data-ready', 'true');
        el.style.display = 'block';

        const title = el.getAttribute('data-title') || '';
        const hp = el.getAttribute('data-hp') || '1x';
        const dmg = el.getAttribute('data-dmg') || '1x';
        const training = el.getAttribute('data-training') || '1x';
        const requirement = el.getAttribute('data-requirement') || '';
        const replacedName = el.getAttribute('data-replaced-name') || '';
        const replacedUrl = el.getAttribute('data-replaced-url') || '#';

        const triviaEl = el.querySelector('.sf-data-trivia');
        const trivia = triviaEl ? parseInlineMarkdown(triviaEl.innerHTML) : '';
        
        const descEl = el.querySelector('.sf-data-description');
        const description = descEl ? parseInlineMarkdown(descEl.innerHTML) : '';

        var switcherImages = [];
        el.querySelectorAll('.sf-data-images a').forEach(function (a) {
          switcherImages.push({ label: a.textContent.trim(), url: a.getAttribute('href') });
        });

        var mediaItems = [];
        el.querySelectorAll('.sf-data-media a').forEach(function (a) {
          mediaItems.push({ caption: a.textContent.trim(), url: a.getAttribute('href') });
        });

        if (switcherImages.length === 0) return;

        var switcherHtml = '';
        switcherImages.forEach(function (img, idx) {
          var activeClass = idx === 0 ? 'active' : '';
          switcherHtml += '<button type="button" class="sf-image-btn ' + activeClass + '" data-img-target="' + img.url + '">' + img.label + '</button>';
        });

        var mediaHtml = '';
        mediaItems.forEach(function (item) {
          mediaHtml += '<div><a href="' + item.url + '"><img class="img-th" src="' + item.url + '" alt="' + item.caption + '" loading="lazy"></a><div class="img-cap">' + item.caption + '</div></div>';
        });

        var template = 
        '<div class="sf-card">' +
          '<div class="sf-body">' +
            '<div class="sf-left">' +
              '<div class="sf-header"><span class="sf-title">' + title + '</span></div>' +
              '<div class="sf-image-switcher">' + switcherHtml + '</div>' +
              '<a href="' + switcherImages[0].url + '" class="sf-main-img-wrap">' +
                '<img src="' + switcherImages[0].url + '" alt="' + title + '" class="sf-display-image">' +
              '</a>' +
              '<div class="stat-list">' +
                '<div class="stat-line"><span class="sl">HP</span><span class="sv">' + hp + '</span></div>' +
                '<div class="stat-line"><span class="sl">DMG</span><span class="sv">' + dmg + '</span></div>' +
                '<div class="stat-line"><span class="sl">Training</span><span class="sv">' + training + '</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="sf-right">' +
              '<div class="sf-tabs">' +
                '<button type="button" class="sf-tab active" data-sf-tab="0">Overview</button>' +
                '<button type="button" class="sf-tab" data-sf-tab="1">Media</button>' +
              '</div>' +
              '<div class="sf-panel active" data-sf-panel="0">' +
                '<div class="sf-sub-section overview-sec">' +
                  '<div class="sf-sub-section trivia-sec">' +
                    '<div class="sf-row"><span class="sf-lbl">Trivia</span><span class="sf-val">' + trivia + '</span></div>' +
                  '</div>' +
                  '<div class="sf-row"><span class="sf-lbl">Description</span><span class="sf-val">' + description + '</span></div>' +
                  '<div class="sf-row"><span class="sf-lbl">Requirement</span><span class="sf-val">' + requirement + '</span></div>' +
                  '<div class="sf-row"><span class="sf-lbl">Replaced by</span><span class="sf-val"><a href="' + replacedUrl + '" class="sf-link" style="font-weight:bold;">' + replacedName + '</a></span></div>' +
                '</div>' +
              '</div>' +
              '<div class="sf-panel" data-sf-panel="1">' +
                '<div style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:10px;">Click any image to open full size.</div>' +
                '<div class="imgs-row">' + mediaHtml + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

        el.innerHTML = template;
      });
    }

    // ==========================================================================
    // 💎 MODAL PREVIEW ENGINE: Generates and handles screen preview canvas overlays
    // ==========================================================================
    function createPreviewModal() {
      var modal = document.getElementById('sf-preview-overlay');
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = 'sf-preview-overlay';
      modal.className = 'sf-preview-overlay';
      modal.style.display = 'none'; 
      modal.innerHTML = 
        '<div class="sf-preview-box">' +
          '<button type="button" class="sf-preview-x" aria-label="Close preview">&times;</button>' +
          '<div id="sf-preview-body"></div>' +
          '<div class="sf-preview-actions">' +
            '<a id="sf-preview-tab-link" href="#" target="_blank" class="sf-preview-btn sf-btn-primary">Open in New Tab</a>' +
            '<button type="button" id="sf-preview-close-btn" class="sf-preview-btn sf-btn-secondary">Cancel</button>' +
          '</div>' +
        '</div>';
      
      document.body.appendChild(modal);

      var dismiss = function() { 
        modal.classList.remove('active'); 
        setTimeout(function() { modal.style.display = 'none'; }, 200);
      };
      modal.querySelector('.sf-preview-x').addEventListener('click', dismiss);
      document.getElementById('sf-preview-close-btn').addEventListener('click', dismiss);
      modal.addEventListener('click', function(e) { if(e.target === modal) dismiss(); });

      return modal;
    }

    function triggerLinkPreview(url) {
      var modal = createPreviewModal();
      var body = document.getElementById('sf-preview-body');
      var tabLink = document.getElementById('sf-preview-tab-link');
      
      tabLink.setAttribute('href', url);

      var isImage = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url) || url.indexOf('/download/') !== -1;

      if (isImage) {
        body.innerHTML = '<img src="' + url + '" class="sf-preview-img" alt="Preview Showcase Element">';
      } else {
        body.innerHTML = 
          '<div class="sf-preview-link-card">' +
            '<div class="sf-preview-link-icon">🔗</div>' +
            '<div class="sf-preview-link-title">Navigation Directory Redirect</div>' +
            '<div class="sf-preview-link-url">' + url + '</div>' +
          '</div>';
      }

      modal.style.display = 'flex';
      modal.offsetHeight; // Force layout updates smoothly
      modal.classList.add('active');
    }

    function injectModeStyles() {
      if (document.getElementById('modes-styles')) return;
      var style = document.createElement('style');
      style.id = 'modes-styles';
      style.textContent = `
  .sf-card{background:rgba(30,30,30,.6);border:0px solid rgba(255,255,255,0);border-radius:8px;overflow:hidden;margin:0px 0;color:#fff;font-family:inherit !important;font-size:15px;}
  .sf-body{display:flex;}
  .sf-left{width:272px;flex-shrink:0;padding:16px;border-right:1px solid rgba(255,255,255,.10);display:flex;flex-direction:column;align-items:center;}
  .sf-header{width:100%;max-width:240px;padding:0 0 12px 0;background:transparent;border-bottom:1px solid rgba(255,255,255,.10);text-align:center;margin-bottom:12px;}
  .sf-title{font-size:20px;font-weight:600;color:#fff;font-family:inherit !important;}
  .sf-image-switcher{display:flex;flex-wrap:wrap;width:100%;max-width:240px;background:rgba(0,0,0,0.25);padding:3px;border-radius:6px 6px 0 0;gap:2px;border:1px solid rgba(255,255,255,.10);border-bottom:none;margin-bottom:0;box-sizing:border-box;}
  .sf-image-btn{background:transparent !important;border:none !important;color:rgba(255,255,255,0.5) !important;padding:5px 8px;font-size:11px;font-weight:600;text-transform:uppercase;cursor:pointer;flex:1;text-align:center;border-radius:4px 4px 0 0;transition:all 0.15s ease;white-space:nowrap;outline:none !important;box-shadow:none !important;margin:0 !important;font-family:inherit !important;}
  .sf-image-btn:hover{color:#fff !important;background:rgba(255,255,255,0.06) !important;}
  .sf-image-btn.active{color:#fff !important;background:rgba(36, 96, 235, 1) !important;text-shadow:0 1px 2px rgba(0,0,0,0.6);}
  .sf-main-img-wrap{display:flex;justify-content:center;width:100%;max-width:240px;margin-bottom:14px;box-sizing:border-box;}
  .sf-left .sf-display-image{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border:1px solid rgba(255,255,255,.10);border-radius:0 0 8px 8px;display:block;}
  .stat-list{width:100%;max-width:240px;display:flex;flex-direction:column;}
  .stat-line{display:flex;justify-content:space-between;align-items:center;padding:6px 2px;border-bottom:1px solid rgba(255,255,255,.08);}
  .stat-line:last-child{border-bottom:none;}
  .stat-line .sl{font-size:12px;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.04em;font-family:inherit !important;}
  .stat-line .sv{font-size:15px;font-weight:600;color:#fff;font-family:inherit !important;}
  .sf-right{flex:1;min-width:0;display:flex;flex-direction:column;}
  .sf-tabs{display:flex;width:100%;border-bottom:1px solid rgba(255,255,255,.10);}
  .sf-tab{appearance:none!important;-webkit-appearance:none!important;background:transparent!important;border:none!important;border-bottom:2px solid transparent!important;border-radius:0!important;box-shadow:none!important;outline:none!important;text-shadow:none!important;margin:0!important;flex:1;text-align:center;padding:11px 18px;font-family:inherit !important;font-size:15px;font-weight:500;white-space:nowrap;cursor:pointer;color:rgba(255,255,255,.55)!important;transition:background .15s ease,color .15s ease,border-color .15s ease;}
  .sf-tab:hover{background:rgba(92, 92, 92, 0.356)!important;color:#fff!important;}
  .sf-tab.active{color:#fff!important;background:rgba(36, 96, 235, 1) !important;text-shadow:0 1px 3px rgb(0, 0, 0) !important}
  .sf-panel{display:none;flex:1;padding:16px 18px;max-height:360px;overflow-y:auto;scrollbar-width:thin;}
  .sf-panel.active{display:block;}
  .sf-row{display:flex;gap:10px;margin-bottom:11px;align-items:baseline;line-height:1.5;}
  .sf-lbl{min-width:100px;flex-shrink:0;color:rgba(255,255,255,.5);font-family:inherit !important;}
  .sf-val{color:#fff;font-family:inherit !important;}
  .sf-danger{color:#ff6b6b;}
  .imgs-row{display:flex;flex-wrap:wrap;gap:12px;}
  .imgs-row a{display:block;line-height:0;}
  .imgs-row>div{flex:1 1 0;min-width:110px;}
  .img-th{width:100%;height:auto;aspect-ratio:1;object-fit:cover;border:1px solid rgba(255,255,255,.10);border-radius:8px;display:block;}
  .img-cap{margin-top:4px;font-size:13px;color:rgba(255,255,255,.6);text-align:center;font-family:inherit !important;}
  .sf-card .sf-link{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px;}
  .sf-card a[target="_blank"]::before,.sf-card a[target="_blank"]::after,.sf-card .is-external-link::before,.sf-card .is-external-link::after,.sf-tab::before,.sf-tab::after{content:none!important;}

  .sf-preview-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:999999 !important;display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s ease;box-sizing:border-box;font-family:inherit !important;}
  .sf-preview-overlay.active{opacity:1;}
  .sf-preview-box{background:#1e1f22;border:1px solid #2b2d31;border-radius:12px;padding:24px;max-width:85vw;max-height:85vh;display:flex;flex-direction:column;align-items:center;position:relative;box-shadow:0 20px 40px rgba(0,0,0,0.6);box-sizing:border-box;}
  .sf-preview-x{position:absolute;top:12px;right:16px;background:transparent!important;border:none!important;color:rgba(255,255,255,0.5)!important;font-size:24px;cursor:pointer;outline:none!important;padding:0!important;margin:0!important;line-height:1;}
  .sf-preview-x:hover{color:#fff!important;}
  #sf-preview-body{width:100%;display:flex;justify-content:center;align-items:center;margin-bottom:20px;min-width:280px;}
  .sf-preview-img{max-width:100%;max-height:55vh;object-fit:contain;border-radius:6px;border:1px solid rgba(255,255,255,0.1);display:block;}
  .sf-preview-link-card{text-align:center;padding:20px;background:rgba(0,0,0,0.2);border-radius:8px;border:1px solid rgba(255,255,255,0.05);width:100%;box-sizing:border-box;}
  .sf-preview-link-icon{font-size:32px;margin-bottom:8px;}
  .sf-preview-link-title{font-size:16px;font-weight:600;color:#fff;margin-bottom:6px;font-family:inherit !important;}
  .sf-preview-link-url{font-size:13px;color:#00a2ff;word-break:break-all;text-decoration:underline;font-family:inherit !important;}
  .sf-preview-actions{display:flex;gap:12px;width:100%;justify-content:center;}
  .sf-preview-btn{appearance:none!important;-webkit-appearance:none!important;padding:10px 20px;font-size:14px;font-weight:600;border-radius:6px;cursor:pointer;text-decoration:none!important;text-align:center;transition:all 0.15s ease;outline:none!important;box-shadow:none!important;margin:0 !important;font-family:inherit !important;}
  .sf-btn-primary{background:#2460eb!important;color:#fff!important;border:none!important;}
  .sf-btn-primary:hover{background:#3b71f7!important;}
  .sf-btn-secondary{background:transparent!important;color:rgba(255,255,255,0.6)!important;border:1px solid rgba(255,255,255,0.2)!important;}
  .sf-btn-secondary:hover{color:#fff!important;background:rgba(255,255,255,0.05)!important;border-color:rgba(255,255,255,0.4)!important;}

  @media (max-width:980px){
    .sf-body{flex-direction:column;}
    .sf-left{width:auto;border-right:none;border-bottom:1px solid rgba(255,255,255,.10);padding:20px;}
    .sf-header,.sf-image-switcher,.sf-main-img-wrap,.stat-list{max-width:280px !important;}
    .sf-header{text-align:center !important;}
    .sf-image-btn{padding:10px 12px;font-size:12px;}
    .sf-preview-box{width:90vw;padding:16px;}
  }
  `;
      document.head.appendChild(style);
    }

    injectModeStyles();

    // Attach master unified event delegation handlers
    if (!window.__sfMasterPreviewAttached_v4) {
      window.__sfMasterPreviewAttached_v4 = true;
      document.addEventListener('click', function (e) {
        var target = e.target;
        
        // 1. Intercept ANY link anchor that sits inside a .sf-card component layout
        var anchor = target.closest('a');
        if (anchor && anchor.closest('.sf-card')) {
          var targetUrl = anchor.getAttribute('href');
          if (targetUrl && targetUrl !== '#') {
            e.preventDefault();
            e.stopPropagation();
            triggerLinkPreview(targetUrl);
          }
          return;
        }

        // 2. Handle card tab toggling
        var tab = target.closest('.sf-tab');
        if (tab) {
          var card = tab.closest('.sf-card');
          if (!card) return;
          var idx = tab.getAttribute('data-sf-tab');
          
          var tabs = card.querySelectorAll('.sf-tab');
          for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle('active', tabs[i] === tab);
          }
          
          var panels = card.querySelectorAll('.sf-panel');
          for (var j = 0; j < panels.length; j++) {
            panels[j].classList.toggle('active', panels[j].getAttribute('data-sf-panel') === idx);
          }
          return;
        }

        // 3. Handle image variant switching buttons
        var imgBtn = target.closest('.sf-image-btn');
        if (imgBtn) {
          var switcher = imgBtn.closest('.sf-left');
          if (!switcher) return;
          
          var buttons = switcher.querySelectorAll('.sf-image-btn');
          for (var k = 0; k < buttons.length; k++) {
            buttons[k].classList.remove('active');
          }
          imgBtn.classList.add('active');
          
          var newImgUrl = imgBtn.getAttribute('data-img-target');
          var displayImg = switcher.querySelector('.sf-display-image');
          var parentLink = switcher.querySelector('.sf-main-img-wrap');
          if (displayImg) displayImg.setAttribute('src', newImgUrl);
          if (parentLink) parentLink.setAttribute('href', newImgUrl);
        }
      });
    }

    let navDebounceTimer = null;
    
    patchHistory();
    renderHeaderNav();
    scanAndRenderCards(); // Run on initial content load

    // This observer intercepts internal SPA route renders cleanly
    const observer = new MutationObserver(function () {
      clearTimeout(navDebounceTimer);
      navDebounceTimer = setTimeout(function() {
        renderHeaderNav();
        scanAndRenderCards(); // Automatically transforms custom data blocks live
      }, 16);
    });

    observer.observe(rootContainer, {
      childList: true,
      subtree: true
    });
  }

  // Kickstart the safety loop execution sequence
  bootstrapFandomNav();
})();