/* ===================================================================
   В'ячеслав & Дарина — інтерактив
   =================================================================== */
(function () {
  "use strict";

  /* ---------- КОНФІГ ---------- */
  // Дата й час весілля: 12 вересня 2026, 13:00 (місяць 0-11, тож серпень=7, вересень=8)
  const WEDDING_DATE = new Date(2026, 8, 12, 13, 0, 0);

  // Кадри анімації пари. Щоб додати кадри — просто допишіть файли у цей список.
  const FRAMES = [
    "images/first.png",
    "images/second.png",
    "images/third.png",
    "images/fourth.png",
  ];
  const FRAME_MS = 180; // тривалість одного кадру

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ===================================================================
     1. ПЕРСОНАЛІЗАЦІЯ (?id=)
     =================================================================== */
  function personalize() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const guest =
      (id && typeof GUESTS !== "undefined" && GUESTS[id]) || DEFAULT_GUEST;

    const inlineEl = document.getElementById("guest-inline");
    if (inlineEl && guest.name) inlineEl.textContent = guest.name;

    if (guest.for) {
      document.title =
        "Запрошення для " + capitalize(guest.for) + " — В'ячеслав & Дарина";
    }
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ===================================================================
     2. КОНВЕРТ → ЛИСТ ВИРОСТАЄ В ПЕРШИЙ РОЗДІЛ
     =================================================================== */
  function setupEnvelope() {
    const screen = document.getElementById("envelope-screen");
    const envelope = document.getElementById("envelope");
    const content = document.getElementById("content");
    if (!screen) return;

    let opened = false;
    function open() {
      if (opened) return;
      opened = true;
      // кришка відкривається, печатка зникає, екран згасає,
      // а лист (перший розділ) виростає й лишається на місці
      document.body.classList.add("is-open");
      document.body.classList.remove("is-sealed");
      if (content) content.setAttribute("aria-hidden", "false");
    }

    // клік будь-де на стартовому екрані відкриває запрошення
    // (щоб не доводилося влучати саме в конверт)
    screen.addEventListener("click", open);
    // клавіатура: Enter / Пробіл на сфокусованому конверті
    if (envelope) {
      envelope.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    }
  }

  /* ===================================================================
     3. SCROLL REVEAL
     =================================================================== */
  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ===================================================================
     4. ВІДЛІК ЧАСУ
     =================================================================== */
  function setupCountdown() {
    const grid = document.getElementById("countdown-grid");
    if (!grid) return;
    const f = {
      days: grid.querySelector('[data-unit="days"]'),
      hours: grid.querySelector('[data-unit="hours"]'),
      minutes: grid.querySelector('[data-unit="minutes"]'),
      seconds: grid.querySelector('[data-unit="seconds"]'),
    };
    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
      const diff = WEDDING_DATE.getTime() - Date.now();
      if (diff <= 0) {
        Object.values(f).forEach((el) => (el.textContent = "00"));
        const title = document.querySelector("#countdown .section__title");
        if (title) title.textContent = "Сьогодні наш день! ♥";
        return false;
      }
      const s = Math.floor(diff / 1000);
      f.days.textContent = pad(Math.floor(s / 86400));
      f.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      f.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      f.seconds.textContent = pad(s % 60);
      return true;
    }
    if (tick()) setInterval(tick, 1000);
  }

  /* ===================================================================
     5. ПОКАДРОВА АНІМАЦІЯ ПАРИ
     =================================================================== */
  function setupFrames() {
    const img = document.getElementById("couple-frame");
    if (!img || FRAMES.length < 2) return;

    // попереднє завантаження, щоб кадри не блимали
    FRAMES.forEach((src) => {
      const pre = new Image();
      pre.src = src;
    });

    if (reducedMotion) return; // статичний перший кадр

    let i = 0;
    setInterval(() => {
      i = (i + 1) % FRAMES.length;
      img.src = FRAMES[i];
    }, FRAME_MS);
  }

  /* ===================================================================
     INIT
     =================================================================== */
  function init() {
    personalize();
    setupEnvelope();
    setupReveal();
    setupCountdown();
    setupFrames();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
