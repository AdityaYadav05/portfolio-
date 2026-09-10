(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const root = document.documentElement;
  const body = document.body;

  // Theme ------------------------------------------------------------
  const themeToggle = $("#themeToggle");
  const storedTheme = localStorage.getItem("portfolio-theme");
  const preferredLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  const initialTheme = storedTheme || (preferredLight ? "light" : "dark");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === "dark"
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    }
  }

  applyTheme(initialTheme);
  themeToggle?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  // Header + mobile menu --------------------------------------------
  const header = $(".site-header");
  const menuToggle = $("#menuToggle");
  const navMenu = $("#navMenu");

  function setMenu(open) {
    menuToggle?.classList.toggle("active", open);
    navMenu?.classList.toggle("open", open);
    $(".nav-shell")?.classList.toggle("menu-open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
  }

  menuToggle?.addEventListener("click", () => setMenu(!navMenu?.classList.contains("open")));
  $$(".nav-link").forEach(link => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setMenu(false);
      closeModal();
    }
  });

  // Scroll progress + header state ---------------------------------
  const progressBar = $(".scroll-progress span");
  function onScroll() {
    const scrollY = window.scrollY;
    header?.classList.toggle("scrolled", scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Active navigation -----------------------------------------------
  const navLinks = $$(".nav-link");
  const navSections = navLinks
    .map(link => $(link.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.2, 0.5] });
  navSections.forEach(section => sectionObserver.observe(section));

  // Reveal animations -----------------------------------------------
  const revealItems = $$(".reveal");
  revealItems.forEach(item => {
    if (item.dataset.delay) item.style.setProperty("--delay", `${item.dataset.delay}ms`);
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
  revealItems.forEach(item => revealObserver.observe(item));

  // Cursor ----------------------------------------------------------
  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  const cursorDot = $(".cursor-dot");
  const cursorRing = $(".cursor-ring");
  if (finePointer && cursorDot && cursorRing) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    body.classList.add("has-cursor");
    window.addEventListener("mousemove", event => {
      mx = event.clientX; my = event.clientY;
      cursorDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    const animateRing = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    $$("a, button, .project-card, .stack-card, .mini-card").forEach(el => {
      el.addEventListener("mouseenter", () => body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => body.classList.remove("cursor-hover"));
    });
  }

  // Spotlight cards -------------------------------------------------
  $$(".spotlight-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  // Magnetic buttons ------------------------------------------------
  if (finePointer) {
    $$(".magnetic").forEach(button => {
      button.addEventListener("mousemove", event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener("mouseleave", () => { button.style.transform = ""; });
    });
  }

  // Rotating hero role ---------------------------------------------
  const roleRotator = $("#roleRotator");
  const roles = [
    "React.js applications",
    "Next.js experiences",
    "advanced admin panels",
    "REST API integrations",
    "Node.js & Express fundamentals",
    "clean responsive UI"
  ];
  let roleIndex = 0;
  let roleTimer;
  function rotateRole() {
    if (!roleRotator) return;
    roleIndex = (roleIndex + 1) % roles.length;
    roleRotator.animate([
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-6px)", offset: .45 },
      { opacity: 0, transform: "translateY(7px)", offset: .55 },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 520, easing: "ease" });
    window.setTimeout(() => { roleRotator.textContent = roles[roleIndex]; }, 270);
    roleTimer = window.setTimeout(rotateRole, 2600);
  }
  roleTimer = window.setTimeout(rotateRole, 2400);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.clearTimeout(roleTimer);
    else roleTimer = window.setTimeout(rotateRole, 1200);
  });

  // Counters --------------------------------------------------------
  const counters = $$('[data-count]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 900;
      const tick = now => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .55 });
  counters.forEach(counter => counterObserver.observe(counter));

  // Project filtering -----------------------------------------------
  const filterButtons = $$(".filter-btn");
  const projectCards = $$(".project-card");
  const projectCount = $("#projectCount");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));
      let visibleCount = 0;
      projectCards.forEach(card => {
        const categories = (card.dataset.category || "").split(" ");
        const visible = filter === "all" || categories.includes(filter);
        card.classList.toggle("hidden-project", !visible);
        if (visible) visibleCount += 1;
      });
      if (projectCount) projectCount.textContent = visibleCount;
    });
  });

  // Project case studies --------------------------------------------
  const projectData = {
    astrodhyaan: {
      title: "Astro Dhyaan",
      type: "Astrology product + operations admin",
      focus: "Frontend, APIs, admin workflows",
      description: "A live astrology and spiritual-services ecosystem spanning customer experiences and operational management interfaces.",
      bullets: [
        "Responsive user-facing flows across astrology discovery and service journeys.",
        "REST API integration for dynamic lists, profiles, transactions and operational data.",
        "Admin modules around astrologers, calls, chats, products, pujas, approvals and status actions.",
        "Reusable filters, server-side pagination, date ranges, tables, exports and modal workflows."
      ],
      tags: ["React", "Next.js", "Redux Toolkit", "Tailwind", "REST API", "Admin UI"],
      url: "https://www.astrodhyaan.com/en"
    },
    jodi4ever: {
      title: "Jodi4Ever",
      type: "Matrimony & matchmaking platform",
      focus: "Frontend UI, search flows, management",
      description: "A production matchmaking experience focused on verified profiles, discovery, privacy and serious relationship journeys.",
      bullets: [
        "Responsive website experiences across profile discovery and onboarding flows.",
        "Search, filter and form-driven interfaces designed for a large profile dataset.",
        "Modern UI refresh work focused on clarity, mobile experience and conversion.",
        "Management-oriented interfaces for user/profile operations and platform workflows."
      ],
      tags: ["React", "Responsive UI", "Search", "Forms", "UX", "Admin"],
      url: "https://www.jodi4ever.com/"
    },
    corenex: {
      title: "Corenex Infotech",
      type: "Technology company website",
      focus: "Corporate frontend & digital presentation",
      description: "A modern company presence for web, mobile, backend, cloud, AI and UI/UX engineering services and in-house digital products.",
      bullets: [
        "Modern responsive presentation for technology services and product engineering.",
        "Clear service architecture and product-led visual hierarchy.",
        "Reusable sections and responsive behaviors for desktop and mobile.",
        "Performance-aware frontend presentation with a polished technology brand feel."
      ],
      tags: ["Next.js", "UI/UX", "Responsive", "Corporate Website", "Performance"],
      url: "https://corenexinfotech.com/"
    },
    astrosetu: {
      title: "AstroSetu",
      type: "Company platform + internal admin ecosystem",
      focus: "Scalable admin frontend",
      description: "Company web presence paired with extensive internal admin/dashboard engineering across products and operations.",
      bullets: [
        "Large React admin interface with route-based modules and reusable page structure.",
        "Role/sub-admin concepts, protected workflows and permission-aware management.",
        "Users, astrologers, orders, transactions, bookings, product data and operational histories.",
        "Redux Toolkit, server-side pagination, debounced search, filters, exports and multipart forms."
      ],
      tags: ["React", "Redux Toolkit", "Admin Dashboard", "REST API", "RBAC", "Data Tables"],
      url: "https://astrosetu.com/"
    }
  };

  const modal = $("#projectModal");
  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const modalType = $("#modalType");
  const modalFocus = $("#modalFocus");
  const modalList = $("#modalList");
  const modalTags = $("#modalTags");
  const modalVisit = $("#modalVisit");
  let lastModalTrigger = null;

  function openModal(key, trigger) {
    const data = projectData[key];
    if (!data || !modal) return;
    lastModalTrigger = trigger;
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalType.textContent = data.type;
    modalFocus.textContent = data.focus;
    modalList.innerHTML = data.bullets.map(item => `<li>${item}</li>`).join("");
    modalTags.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join("");
    modalVisit.href = data.url;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    window.setTimeout(() => $(".modal-close", modal)?.focus(), 50);
  }

  function closeModal() {
    if (!modal?.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
    lastModalTrigger?.focus?.();
  }

  $$(".details-btn").forEach(button => button.addEventListener("click", () => openModal(button.dataset.project, button)));
  $$('[data-close-modal]').forEach(el => el.addEventListener("click", closeModal));

  // Basic modal focus trap
  modal?.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const focusable = $$("button, a[href]", modal).filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // Copy email ------------------------------------------------------
  const copyEmail = $("#copyEmail");
  const toast = $("#toast");
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  copyEmail?.addEventListener("click", async () => {
    const email = "adityayadavvv12@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email copied to clipboard");
    } catch {
      const temp = document.createElement("textarea");
      temp.value = email;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
      showToast("Email copied to clipboard");
    }
  });

  // Footer year title update ---------------------------------------
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "Aditya Yadav — Come back 👋" : "Aditya Yadav — Frontend Developer";
  });
})();
