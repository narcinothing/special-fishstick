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

    let navDebounceTimer = null;
    
    patchHistory();
    renderHeaderNav();

    const observer = new MutationObserver(function () {
      clearTimeout(navDebounceTimer);
      navDebounceTimer = setTimeout(renderHeaderNav, 16);
    });

    observer.observe(rootContainer, {
      childList: true,
      subtree: true
    });
  }

  // ADDITIONAL FEATURE: Centralized Form Card Infobox Engine Setup
  function scanAndRenderCards() {
      const components = document.querySelectorAll('.sf-mode-infobox:not([data-ready])');
      components.forEach(function (el) {
        el.setAttribute('data-ready', 'true');
        el.style.display = 'block';

        // Read structural configurations values
        const title = el.getAttribute('data-title') || '';
        const hp = el.getAttribute('data-hp') || '1×';
        const dmg = el.getAttribute('data-dmg') || '1×';
        const training = el.getAttribute('data-training') || '1×';
        const requirement = el.getAttribute('data-requirement') || '';
        const replacedName = el.getAttribute('data-replaced-name') || '';
        const replacedUrl = el.getAttribute('data-replaced-url') || '#';

        const triviaEl = el.querySelector('.sf-data-trivia');
        const trivia = triviaEl ? triviaEl.innerHTML : '';
        
        const descEl = el.querySelector('.sf-data-description');
        const description = descEl ? descEl.innerHTML : '';

        // Map layout toggle buttons 
        var switcherImages = [];
        el.querySelectorAll('.sf-data-images a').forEach(function (a) {
          switcherImages.push({ label: a.textContent.trim(), url: a.getAttribute('href') });
        });

        // Map bottom media components gallery grid items
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
          mediaHtml += '<div><a href="' + item.url + '" target="_blank"><img class="img-th" src="' + item.url + '" alt="' + item.caption + '" loading="lazy"></a><div class="img-cap">' + item.caption + '</div></div>';
        });

        var template = 
        '<div class="sf-card">' +
          '<div class="sf-body">' +
            '<div class="sf-left">' +
              '<div class="sf-header"><span class="sf-title">' + title + '</span></div>' +
              '<div class="sf-image-switcher">' + switcherHtml + '</div>' +
              '<a href="' + switcherImages[0].url + '" target="_blank" class="sf-main-img-wrap">' +
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

    function injectModeStyles() {
      if (document.getElementById('modes-styles')) return;
      var style = document.createElement('style');
      style.id = 'modes-styles';
      style.textContent = `
  .sf-card{background:rgba(30,30,30,.6);border:1px solid rgba(255,255,255,.10);border-radius:8px;overflow:hidden;margin:16px 0;color:#fff;font-family:"Roboto",sans-serif;font-size:15px;}
  .sf-body{display:flex;}
  .sf-left{width:272px;flex-shrink:0;padding:16px;border-right:1px solid rgba(255,255,255,.10);display:flex;flex-direction:column;align-items:center;}
  .sf-header{width:100%;max-width:240px;padding:0 0 12px 0;background:transparent;border-bottom:1px solid rgba(255,255,255,.10);text-align:center;margin-bottom:12px;}
  .sf-title{font-size:20px;font-weight:600;color:#fff;}
  .sf-image-switcher{display:flex;flex-wrap:wrap;width:100%;max-width:240px;background:rgba(0,0,0,0.25);padding:3px;border-radius:6px 6px 0 0;gap:2px;border:1px solid rgba(255,255,255,.10);border-bottom:none;margin-bottom:0;box-sizing:border-box;}
  .sf-image-btn{background:transparent !important;border:none !important;color:rgba(255,255,255,0.5) !important;padding:5px 8px;font-size:11px;font-weight:600;text-transform:uppercase;cursor:pointer;flex:1;text-align:center;border-radius:4px 4px 0 0;transition:all 0.15s ease;white-space:nowrap;outline:none !important;box-shadow:none !important;margin:0 !important;}
  .sf-image-btn:hover{color:#fff !important;background:rgba(255,255,255,0.06) !important;}
  .sf-image-btn.active{color:#fff !important;background:rgba(36, 96, 235, 1) !important;text-shadow:0 1px 2px rgba(0,0,0,0.6);}
  .sf-main-img-wrap{display:flex;justify-content:center;width:100%;max-width:240px;margin-bottom:14px;box-sizing:border-box;}
  .sf-left .sf-display-image{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border:1px solid rgba(255,255,255,.10);border-radius:0 0 8px 8px;display:block;}
  .stat-list{width:100%;max-width:240px;display:flex;flex-direction:column;}
  .stat-line{display:flex;justify-content:space-between;align-items:center;padding:6px 2px;border-bottom:1px solid rgba(255,255,255,.08);}
  .stat-line:last-child{border-bottom:none;}
  .stat-line .sl{font-size:12px;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.04em;}
  .stat-line .sv{font-size:15px;font-weight:600;color:#fff;}
  .sf-right{flex:1;min-width:0;display:flex;flex-direction:column;}
  .sf-tabs{display:flex;width:100%;border-bottom:1px solid rgba(255,255,255,.10);}
  .sf-tab{appearance:none!important;-webkit-appearance:none!important;background:transparent!important;border:none!important;border-bottom:2px solid transparent!important;border-radius:0!important;box-shadow:none!important;outline:none!important;text-shadow:none!important;margin:0!important;flex:1;text-align:center;padding:11px 18px;font-family:inherit;font-size:15px;font-weight:500;white-space:nowrap;cursor:pointer;color:rgba(255,255,255,.55)!important;transition:background .15s ease,color .15s ease,border-color .15s ease;}
  .sf-tab:hover{background:rgba(92, 92, 92, 0.356)!important;color:#fff!important;}
  .sf-tab.active{color:#fff!important;background:rgba(36, 96, 235, 1) !important;text-shadow:0 1px 3px rgb(0, 0, 0) !important}
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

  @media (max-width:980px){
    .sf-body{flex-direction:column;}
    .sf-left{width:auto;border-right:none;border-bottom:1px solid rgba(255,255,255,.10);padding:20px;}
    .sf-header,.sf-image-switcher,.sf-main-img-wrap,.stat-list{max-width:280px !important;}
    .sf-header{text-align:center !important;}
    .sf-image-btn{padding:10px 12px;font-size:12px;}
  }
  `;
      document.head.appendChild(style);
    }

    injectModeStyles();

    // Attach master unified event delegation handlers
    if (!window.__sfGlobalHandlersAttached) {
      window.__sfGlobalHandlersAttached = true;
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