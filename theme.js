(function () {
  const FOLDERS_WITH_PAGES = [
    "characters",
    "sagas",
    "forms",
    "techniques",
    "planets"
  ];

  const NAV_GROUPS = [
    {
      label: "Community",
      items: [
        { text: "Update Logs", href: "/update-logs" },
        { text: "Codes", href: "/codes" },
        { text: "Trivia", href: "/trivia" },
        { text: "Credits", href: "/credits" }
      ]
    },
    {
      label: "How to Play",
      items: [
        { text: "Tutorial", href: "/tutorial" },
        { text: "Main Menu", href: "/main-menu" },
        { text: "Stats", href: "/stats" },
        { text: "Multipliers", href: "/multipliers" },
        { text: "Zenkai Boosts", href: "/zenkai-boosts" },
        { text: "Mastery", href: "/mastery" },
        { text: "Zeni", href: "/zeni" }
      ]
    },
    {
      label: "Mechanics",
      items: [
        { text: "Dragon Balls", href: "/dragon-balls" },
        { text: "Z Souls", href: "/z-souls" },
        { text: "Titles", href: "/titles" },
        { text: "Consumables", href: "/consumables" },
        { text: "Accessories", href: "/accessories" },
        { text: "Items", href: "/items" },
        { text: "Skills", href: "/skills" },
        {
          label: "Modes",
          isFolder: true,
          items: [
            { text: "Forms", href: "/forms" },
            { text: "Gamepass Forms", href: "/gamepass-forms" },
            { text: "Event Forms", href: "/event-forms" },
            { text: "Skin Forms", href: "/skin-forms" },
            { text: "Special Techniques", href: "/special-techniques" }
          ]
        },
        {
          label: "Cosmetics",
          isFolder: true,
          items: [
            { text: "Emotes", href: "/emotes" },
            { text: "Ki Skins", href: "/ki-skins" },
            { text: "Skin Forms", href: "/skin-forms" }
          ]
        },
        {
          label: "Events",
          isFolder: true,
          items: [
            { text: "Winter", href: "/winter-event" },
            { text: "Easter", href: "/easter-event" },
            { text: "Christmas", href: "/christmas-event" },
            { text: "Halloween", href: "/halloween-event" }
          ]
        }
      ]
    },
    {
      label: "NPCs",
      items: [
        { text: "Miscellaneous NPCs", href: "/miscellaneous-npcs" },
        { text: "Merchants", href: "/merchants" },
        { text: "Quest Givers", href: "/quest-givers" },
        { text: "Enemies", href: "/enemies" }
      ]
    },
    {
      label: "Store",
      items: [
        { text: "Gamepasses", href: "/gamepasses" },
        { text: "Products", href: "/products" }
      ]
    }
  ];

  function convertToTitle(str) {
    return str.replace(/[-_]/g, " ").replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function buildLink(text, href) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    return link;
  }

  function buildDropdown(group) {
    const dropdown = document.createElement("div");
    dropdown.className = "fandom-header-dropdown";

    const summary = document.createElement("div");
    summary.className = "fandom-header-summary";
    summary.textContent = group.label;

    const menu = document.createElement("div");
    menu.className = "fandom-header-menu";

    group.items.forEach(function (item) {
      if (item.isFolder) {
        const subFolder = document.createElement("div");
        subFolder.className = "fandom-nested-folder";

        const subSummary = document.createElement("div");
        subSummary.className = "fandom-nested-summary";
        subSummary.textContent = item.label;

        const subMenu = document.createElement("div");
        subMenu.className = "fandom-nested-menu";

        item.items.forEach(function (subItem) {
          subMenu.appendChild(buildLink(subItem.text, subItem.href));
        });

        subFolder.appendChild(subSummary);
        subFolder.appendChild(subMenu);
        menu.appendChild(subFolder);
      } else {
        menu.appendChild(buildLink(item.text, item.href));
      }
    });

    dropdown.appendChild(summary);
    dropdown.appendChild(menu);
    return dropdown;
  }

  function renderCaption(header) {
    const captionEl = header.querySelector(".caption, [class*='caption']");
    if (!captionEl) return;

    const currentPath = window.location.pathname;
    if (captionEl.getAttribute("data-path") === currentPath) return;

    captionEl.setAttribute("data-path", currentPath);

    const parts = currentPath.split("/").filter(Boolean);

    let folderText = "Home";
    let folderHref = "/";
    let pageText = "Main Page";
    let pageHref = "/";

    if (parts.length === 1) {
      pageText = convertToTitle(parts[0]);
      pageHref = "/" + parts[0];
    } else if (parts.length >= 2) {
      const folderSlug = parts[parts.length - 2];
      folderText = convertToTitle(folderSlug);
      pageText = convertToTitle(parts[parts.length - 1]);
      pageHref = "/" + parts.join("/");

      if (FOLDERS_WITH_PAGES.includes(folderSlug.toLowerCase())) {
        folderHref = "/" + parts.slice(0, parts.length - 1).join("/");
      }
    }

    captionEl.innerHTML =
      'In <a href="' +
      folderHref +
      '" class="fandom-caption-link">' +
      folderText +
      '</a>, <a href="' +
      pageHref +
      '" class="fandom-caption-link">' +
      pageText +
      "</a>";
  }

  function renderHeaderNav() {
    const header = document.querySelector(".page-header-section");
    if (!header) return;

    let nav = header.querySelector(".fandom-header-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.className = "fandom-header-nav";
      header.appendChild(nav);
    }

    if (!nav.hasChildNodes()) {
      NAV_GROUPS.forEach(function (group) {
        nav.appendChild(buildDropdown(group));
      });
    }

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
  }

  function initHeaderNav() {
    patchHistory();
    renderHeaderNav();

    const observer = new MutationObserver(function () {
      renderHeaderNav();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderNav);
  } else {
    initHeaderNav();
  }
})();