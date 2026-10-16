
/* =========================================
   QUANTIVA — INTERACTIVE LANDING PAGE
   SkillCraft Technology | Task 01
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const currentYear = document.getElementById("currentYear");

  // 1. Set the current copyright year
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // 2. Update navbar styling when the page scrolls
  function updateNavbar() {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 30);
  }

  window.addEventListener("scroll", updateNavbar, {
    passive: true
  });

  // Apply the correct initial navbar state
  updateNavbar();

  // 3. Mobile navigation helpers
  function closeMobileMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.classList.remove("open");
    navLinks.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  function openMobileMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.classList.add("open");
    navLinks.classList.add("open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
  }

  // 4. Toggle the mobile menu
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // 5. Close the mobile menu after selecting a link
  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  // 6. Close the menu when clicking outside it
  document.addEventListener("click", (event) => {
    if (!menuToggle || !navLinks) return;

    const clickedInsideMenu = navLinks.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMobileMenu();
    }
  });

  // 7. Close the menu with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  // 8. Keep desktop and mobile navigation in sync
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  mobileQuery.addEventListener("change", () => {
    closeMobileMenu();
  });

  // 9. Highlight the navigation item for the visible section
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleSections.length === 0) return;

        const activeId = visibleSections[0].target.id;

        navItems.forEach((item) => {
          const isActive =
            item.getAttribute("href") === `#${activeId}`;

          item.classList.toggle("active", isActive);

          if (isActive) {
            item.setAttribute("aria-current", "location");
          } else {
            item.removeAttribute("aria-current");
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // 10. Ensure the Home link is active at the top
  function updateHomeLink() {
    if (window.scrollY > 100) return;

    navItems.forEach((item) => {
      const isHome = item.getAttribute("href") === "#home";

      item.classList.toggle("active", isHome);

      if (isHome) {
        item.setAttribute("aria-current", "location");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateHomeLink, {
    passive: true
  });

  updateHomeLink();
});
