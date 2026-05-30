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

  window.createModeCard = function (targetId, config) {
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Generate Image switcher buttons loop
    var switcherHtml = '';
    config.switcherImages.forEach(function (img, idx) {
    var activeClass = idx === 0 ? 'active' : '';
    switcherHtml += '<button type="button" class="sf-image-btn ' + activeClass + '" data-img-target="' + img.url + '">' + img.label + '</button>';
    });

    // Generate Stat tracking rows loop
    var statsHtml = '';
    config.stats.forEach(function (stat) {
    statsHtml += '<div class="stat-line"><span class="sl">' + stat.label + '</span><span class="sv">' + stat.value + '</span></div>';
    });

    // Generate Media tabs preview items loop
    var mediaHtml = '';
    config.media.forEach(function (item) {
    mediaHtml += '<div><a href="' + item.url + '" target="_blank"><img class="img-th" src="' + item.url + '" alt="' + item.caption + '" loading="lazy"></a><div class="img-cap">' + item.caption + '</div></div>';
    });

    // Construct final component template shell string
    var template = 
    '<div class="sf-card">' +
    '<div class="sf-body">' +
    '<div class="sf-left">' +
    '<div class="sf-header"><span class="sf-title">' + config.title + '</span></div>' +
    '<div class="sf-image-switcher">' + switcherHtml + '</div>' +
    '<a href="' + config.switcherImages[0].url + '" target="_blank" class="sf-main-img-wrap">' +
    '<img src="' + config.switcherImages[0].url + '" alt="' + config.title + '" class="sf-display-image">' +
    '</a>' +
    '<div class="stat-list">' + statsHtml + '</div>' +
    '</div>' +
    '<div class="sf-right">' +
    '<div class="sf-tabs">' +
    '<button type="button" class="sf-tab active" data-sf-tab="0">Overview</button>' +
    '<button type="button" class="sf-tab" data-sf-tab="1">Media</button>' +
    '</div>' +
    '<div class="sf-panel active" data-sf-panel="0">' +
    '<div class="sf-sub-section overview-sec">' +
    '<div class="sf-sub-section trivia-sec">' +
    '<div class="sf-row"><span class="sf-lbl">Trivia</span><span class="sf-val">' + config.trivia + '</span></div>' +
    '</div>' +
    '<div class="sf-row"><span class="sf-lbl">Description</span><span class="sf-val">' + config.description + '</span></div>' +
    '<div class="sf-row"><span class="sf-lbl">Requirement</span><span class="sf-val">' + config.requirement + '</span></div>' +
    '<div class="sf-row"><span class="sf-lbl">Replaced by</span><span class="sf-val"><a href="' + config.replacedBy.url + '" class="sf-link" style="font-weight:bold;">' + config.replacedBy.name + '</a></span></div>' +
    '</div>' +
    '</div>' +
    '<div class="sf-panel" data-sf-panel="1">' +
    '<div style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:10px;">Click any image to open full size.</div>' +
    '<div class="imgs-row">' + mediaHtml + '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

    targetEl.innerHTML = template;
  };

  // Kickstart the safety loop execution sequence
  bootstrapFandomNav();
})();