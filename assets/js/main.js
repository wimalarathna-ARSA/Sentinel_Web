/* ═══════════════════════════════════════════════════════════════
   Sentinel AIOps — website behaviour
   Theme · nav · scrollspy · reveal · counters · demo mock ·
   LOPO tables · forms
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$(".tech-chip img").forEach((image) => {
    const showNameFallback = () => {
      image.hidden = true;
      if (image.nextElementSibling) image.nextElementSibling.hidden = false;
    };
    image.addEventListener("error", showNameFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showNameFallback();
  });

  /* ────────────────────────────── Theme ────────────────────────────── */
  const themeToggle = $("#themeToggle");
  themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("sentinel-theme", next); } catch (e) {}
  });

  /* ──────────────────────── Sticky nav + shadow ─────────────────────── */
  const nav = $("#nav");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ───────────────────────────── Mobile nav ─────────────────────────── */
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ───────────────────────── Scroll spy (active link) ───────────────── */
  const linkFor = new Map();
  $$("#navLinks a").forEach((a) => {
    const id = a.getAttribute("href").replace("#", "");
    if (id && document.getElementById(id)) linkFor.set(id, a);
  });

  // Only sections that actually have a nav entry can be "current". Sections
  // without one inherit the closest preceding mapped section rather than
  // leaving the whole nav unhighlighted.
  const sections = $$("main section[id]").filter((sec) => linkFor.has(sec.id));

  function syncSpy() {
    let currentId = sections.length ? sections[0].id : null;
    const probe = window.scrollY + 130;
    for (const sec of sections) {
      if (sec.offsetTop <= probe) currentId = sec.id;
    }
    // Bottom of page → last section wins.
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4 && sections.length) {
      currentId = sections[sections.length - 1].id;
    }
    $$("#navLinks a").forEach((a) => a.classList.remove("active"));
    const link = linkFor.get(currentId);
    if (link) link.classList.add("active");
  }
  window.addEventListener("scroll", syncSpy, { passive: true });
  window.addEventListener("resize", syncSpy);
  syncSpy();

  /* ───────────────────────── Reveal on scroll ───────────────────────── */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ────────────────────── Animated stat counters ────────────────────── */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || !isFinite(target)) {
      el.textContent = target.toFixed(dec) + suffix;
      return;
    }
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec) + suffix;
    };
    requestAnimationFrame(tick);
  }

  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ───────── Hero team avatars: hover a photo to show name + role ──────── */
  const teamRow = $(".hero-team");
  const teamName = $("#heroTeamName");
  const teamRole = $("#heroTeamRole");
  if (teamRow && teamName && teamRole) {
    const show = (img) => {
      teamName.textContent = img.alt || "";
      teamRole.textContent = img.dataset.role || "";
    };
    const reset = () => {
      teamName.textContent = "";
      teamRole.textContent = "";
    };
    teamRow.querySelectorAll("img").forEach((img) => {
      img.addEventListener("mouseenter", () => show(img));
    });
    teamRow.addEventListener("mouseleave", reset);
  }

  /* ───────── Milestone jump drop-down ──────── */
  const msJump = $("#milestoneJump");
  if (msJump) {
    msJump.addEventListener("change", () => {
      if (!msJump.value) return;
      const target = document.getElementById(msJump.value);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  /* ───────── Diagram lightbox: click a diagram to view it big ──────── */
  const lightbox = $("#lightbox");
  if (lightbox) {
    const lbImg = $("#lightboxImg");
    const lbCap = $("#lightboxCap");
    const openLb = (src, caption) => {
      lbImg.src = src;
      lbImg.alt = caption;
      lbCap.textContent = caption;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    };
    const closeLb = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      lbImg.removeAttribute("src");
    };
    document.querySelectorAll("[data-lightbox]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        openLb(img ? img.src : "", btn.dataset.caption || (img ? img.alt : ""));
      });
    });
    lightbox.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeLb);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLb();
    });
  }

  /* ───────── Demo video play overlay ──────── */
  const demoMedia = $(".demo-media");
  if (demoMedia) {
    const demoVideo = demoMedia.querySelector("video");
    const demoPlay = demoMedia.querySelector(".demo-play");
    if (demoPlay && demoVideo) {
      demoPlay.addEventListener("click", () => {
        demoVideo.play().catch(() => {});
      });
    }
    if (demoVideo) {
      demoVideo.addEventListener("play", () => {
        demoMedia.classList.add("playing");
        demoVideo.setAttribute("controls", "");
      });
      demoVideo.addEventListener("pause", () => {
        demoMedia.classList.remove("playing");
      });
    }
  }

  /* ─────────────────────── LOPO results tables ──────────────────────── */
  const CPU_LOPO = [
    { p: "Proj_01", prec: 0.9423, rec: 0.9351, f1: 0.9387, far: 2.14 },
    { p: "Proj_02", prec: 0.9654, rec: 0.9520, f1: 0.9587, far: 1.38 },
    { p: "Proj_03", prec: 0.9381, rec: 0.9245, f1: 0.9312, far: 2.46 },
    { p: "Proj_04", prec: 0.9714, rec: 0.9630, f1: 0.9672, far: 1.12 },
    { p: "Proj_05", prec: 0.9583, rec: 0.9474, f1: 0.9528, far: 1.81 },
    { p: "Proj_06", prec: 0.9620, rec: 0.9560, f1: 0.9590, far: 1.54 }
  ];

  const MEM_LOPO = [
    { p: "project_1", prec: 0.9650, rec: 0.9580, f1: 0.9614, auc: 0.9780 },
    { p: "project_2", prec: 1.0000, rec: 0.9932, f1: 0.9966, auc: 1.0000 },
    { p: "project_3", prec: 1.0000, rec: 0.9971, f1: 0.9985, auc: 1.0000 },
    { p: "project_4", prec: 0.9838, rec: 0.9984, f1: 0.9910, auc: 0.9996 },
    { p: "project_5", prec: 0.9923, rec: 0.9959, f1: 0.9941, auc: 0.9996 }
  ];

  const f3 = (v) => v.toFixed(3);
  const pct = (v) => v.toFixed(2) + "%";

  const cpuBody = $("#cpuLopo");
  if (cpuBody) {
    cpuBody.innerHTML = CPU_LOPO.map(
      (r) =>
        "<tr><td>" + r.p + "</td><td class='num'>" + f3(r.prec) + "</td><td class='num'>" +
        f3(r.rec) + "</td><td class='num'>" + f3(r.f1) + "</td><td class='num'>" +
        pct(r.far) + "</td></tr>"
    ).join("");
  }

  const memBody = $("#memLopo");
  if (memBody) {
    memBody.innerHTML = MEM_LOPO.map(
      (r) =>
        "<tr><td>" + r.p + "</td><td class='num'>" + f3(r.prec) + "</td><td class='num'>" +
        f3(r.rec) + "</td><td class='num'>" + f3(r.f1) + "</td><td class='num'>" +
        f3(r.auc) + "</td></tr>"
    ).join("");
  }

  /* ─────────────────────── Lead-time bar animation ──────────────────── */
  const bars = $$(".lc-track i");
  function growBars() {
    bars.forEach((b) => {
      b.style.animation = "none";
      void b.offsetWidth; // force reflow
      b.style.animation = "";
    });
  }
  if ("IntersectionObserver" in window && bars.length) {
    const bio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { growBars(); bio.unobserve(e.target); } });
      },
      { threshold: 0.3 }
    );
    bio.observe(bars[0].closest(".lead-chart"));
  }

  /* ────────────────────────────── Forms ─────────────────────────────── */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setStatus(el, msg, ok) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("ok", "err");
    el.classList.add(ok ? "ok" : "err");
  }

  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = $("#formStatus");
      const required = $$("#contactForm [required]");
      let firstBad = null;

      required.forEach((input) => {
        const bad =
          input.value.trim() === "" ||
          (input.type === "email" && !EMAIL_RE.test(input.value.trim()));
        input.classList.toggle("invalid", bad);
        if (bad && !firstBad) firstBad = input;
      });

      if (firstBad) {
        setStatus(status, "Please complete every field with a valid email address.", false);
        firstBad.focus();
        return;
      }

      const payload = {
        firstName: $("#firstName").value.trim(),
        lastName: $("#lastName").value.trim(),
        email: $("#email").value.trim(),
        subject: $("#subject").value.trim(),
        message: $("#message").value.trim(),
      };
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtn = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
      }
      setStatus(status, "Sending…", true);

      // POST to the serverless contact API (Vercel). On a plain static preview
      // (python http.server) /api/contact does not exist — fall back to a
      // direct-email notice instead of failing silently.
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          let data = {};
          try {
            data = await res.json();
          } catch (e) {
            throw new Error("no-api");
          }
          if (!res.ok || !data.ok) throw new Error(data.error || "send-failed");
          return data;
        })
        .then(() => {
          setStatus(
            status,
            "Thanks, " + payload.firstName + ". Your message has been sent — we will get back to you.",
            true
          );
          contactForm.reset();
        })
        .catch((err) => {
          const msg = String((err && err.message) || "");
          if (msg === "no-api" || msg.includes("Failed to fetch") || (err && err.name === "TypeError")) {
            // No backend answered: static preview, wrong deploy root, or backend down.
            setStatus(
              status,
              "Email sending is unavailable on this static preview. Start the mail server with \"npm run local\" " +
              "and open http://127.0.0.1:4321, or use the Vercel deployment with email configured. " +
              "You can email chamilasewmini2@gmail.com directly.",
              false
            );
          } else {
            setStatus(
              status,
              "Could not send right now (" + (err.message || "error") + "). Please email chamilasewmini2@gmail.com directly.",
              false
            );
          }
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtn;
            submitBtn.style.opacity = "";
          }
        });
    });

    $$("#contactForm input, #contactForm textarea").forEach((input) => {
      input.addEventListener("input", () => input.classList.remove("invalid"));
    });
  }

})();