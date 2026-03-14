// =========================
// Wedding Card Interactions
// =========================

// -------- CONFIG: Wedding Date (ISO 8601) --------
// Timezone: Vietnam +07:00
const WEDDING_ISO_STRING = "2026-04-05T10:30:00+07:00";

// -------- Preload images for smooth transitions --------
const PRELOAD_IMAGES = [
  // Hero images
  "./assets/z7612961695278_b883b3ec80c89bccdc587096e13fd682.jpg",
  "./assets/z7612961695281_daf2fa37cc67eaa3a9fa9f826559b5e9.jpg",
  "./assets/z7612961695282_4ae4a2a76796c60458bc18740539b317.jpg",
  "./assets/z7612961695289_867a73cc889bda85d5657017f7a348e5.jpg",
  "./assets/z7612961713109_8689970d2f21bc87230eb63b9501e47d.jpg",
  "./assets/z7613064308128_e073f0589b54697b662863687626c4d2.jpg",
  // Gallery/Closing images
  "./assets/z7612961713109_8689970d2f21bc87230eb63b9501e47d.jpg",
  "./assets/z7612961695289_867a73cc889bda85d5657017f7a348e5.jpg",
  "./assets/z7612961695282_4ae4a2a76796c60458bc18740539b317.jpg",
];
function preloadImages(list) {
  list.forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = src;
  });
}

// -------- Reveal on Scroll (Intersection Observer) --------
function setupRevealOnScroll() {
  const prefersReduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const nodes = document.querySelectorAll(".reveal");
  if (prefersReduce) {
    nodes.forEach((el) => el.classList.add("is-visible"));
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
    { threshold: 0.15 },
  );
  nodes.forEach((el) => io.observe(el));
}

// -------- Hero slideshow --------
function setupHeroSlideshow() {
  let slides = Array.from(document.querySelectorAll(".hero .slide")).filter(
    (img) => !!img.getAttribute("src"),
  );
  if (slides.length === 0) return;
  const waitDecode = (img) =>
    new Promise((resolve) => {
      if (img.complete) return resolve();
      if (img.decode) img.decode().then(resolve).catch(resolve);
      else {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 500);
      }
    });
  slides.forEach((img) => {
    img.loading = "eager";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener(
      "error",
      () => {
        img.dataset.skip = "1";
      },
      { once: true },
    );
  });
  let idx = 0;
  const displayMs = 3200; // Thời gian hiển thị mỗi ảnh (ms) - cho mobile dễ xem hơn
  slides[0].classList.add("active");
  const ensureActive = () => {
    if (!slides.some((s) => s.classList.contains("active"))) {
      slides[idx].classList.add("active");
    }
  };
  const nextIndex = (from) => {
    const n = slides.length;
    for (let k = 1; k <= n; k++) {
      const i = (from + k) % n;
      if (slides[i] && !slides[i].dataset.skip) return i;
    }
    return from;
  };
  const tick = async () => {
    const current = slides[idx];
    const ni = nextIndex(idx);
    const next = slides[ni];
    await waitDecode(next);
    next.classList.add("active");
    requestAnimationFrame(() => current.classList.remove("active"));
    idx = ni;
    setTimeout(() => {
      ensureActive();
      setTimeout(tick, displayMs);
    }, 60);
  };
  setTimeout(tick, displayMs);
}

// -------- Countdown --------
function setupCountdown() {
  const target = new Date(WEDDING_ISO_STRING).getTime();
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");
  if (!elDays || isNaN(target)) return;

  function update() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 60 * 1000;
    const seconds = Math.floor(diff / 1000);

    elDays.textContent = String(days).padStart(2, "0");
    elHours.textContent = String(hours).padStart(2, "0");
    elMinutes.textContent = String(minutes).padStart(2, "0");
    elSeconds.textContent = String(seconds).padStart(2, "0");
  }
  update();
  setInterval(update, 1000);
}

// -------- Falling Hearts Effect (Lightweight) --------
function setupFallingHearts() {
  const layer = document.getElementById("hearts-layer");
  if (!layer) return;
  const prefersReduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  // Nếu người dùng bật "giảm chuyển động" thì tôn trọng, không chạy hiệu ứng
  if (prefersReduce) return;

  const colors = ["#ffe3ee", "#ffe9f3", "#fff6ec"];
  const maxHearts = 24;
  let lastTime = 0;

  function makeHeart() {
    if (layer.childElementCount >= maxHearts) return;
    const h = document.createElement("div");
    h.className = "heart";
    const size = Math.random() * 10 + 8; // 8 - 18px, mảnh & tinh tế hơn
    h.style.setProperty("--size", `${size}px`);
    h.style.left = Math.random() * 100 + "vw";
    h.style.top = -20 + "px";
    h.style.color = colors[(Math.random() * colors.length) | 0];
    h.style.setProperty("--dur", `${2200 + Math.random() * 2400}ms`);
    // Độ lệch ngang nhẹ để đường rơi cong hiện đại hơn
    const drift = (Math.random() * 40 - 20).toFixed(1); // -20px đến 20px
    h.style.setProperty("--dx", `${drift}px`);
    layer.appendChild(h);
    const remove = () => h.remove();
    h.addEventListener("animationend", remove, { once: true });
    // Safety remove
    setTimeout(remove, 6000);
  }

  // Tạo một ít trái tim ngay khi vào trang (nhưng không quá nhiều)
  for (let i = 0; i < 5; i++) makeHeart();

  // Nhẹ nhàng rơi liên tục như mưa cánh hoa
  const idleInterval = setInterval(() => {
    if (document.hidden) return;
    const count = 1; // rơi ít, đều
    for (let i = 0; i < count; i++) makeHeart();
  }, 2200);

  window.addEventListener(
    "scroll",
    () => {
      const now = performance.now();
      if (now - lastTime < 60) return; // Throttle
      lastTime = now;
      // Spawn 1–2 hearts khi cuộn (vẫn giữ cảm giác sinh động)
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) makeHeart();
    },
    { passive: true },
  );
}

// -------- Smooth Scroll Indicator --------
function setupScrollIndicator() {
  const link = document.querySelector(".scroll-indicator");
  if (!link) return;
  link.addEventListener("click", (e) => {
    if (link.hash) {
      const target = document.querySelector(link.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
}

// -------- Lightbox Viewer --------
function setupLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const imgEl = lb.querySelector(".lightbox-img");
  const closeBtn = lb.querySelector(".lightbox-close");
  const open = (src) => {
    imgEl.src = src;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    imgEl.src = "";
  };
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("is-open")) close();
  });

  // Attach to gallery and marquee images
  const clickable = [
    ...document.querySelectorAll(".gallery-item img"),
    ...document.querySelectorAll(".marquee img"),
  ];
  clickable.forEach((el) => {
    el.style.cursor = "zoom-in";
    el.addEventListener("click", () => open(el.src));
  });

  // Attach to marquee zoom button
  document.querySelectorAll(".marq-zoom").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const fig = btn.closest(".thumb");
      const img = fig && fig.querySelector("img");
      if (img) open(img.src);
    });
  });
}

// -------- Showcase: Seamless Ping-Pong Scroll (CSS Animation fallback / enhancer) --------
function setupShowcasePingPong() {
  const strips = Array.from(document.querySelectorAll(".marquee"));
  if (strips.length === 0) return;
  strips.forEach((el) => {
    const track = el.querySelector(".marquee-track");
    if (!track) return;

    if (!track.dataset.looped) {
      const items = Array.from(track.children);
      items.forEach((node) => track.appendChild(node.cloneNode(true)));
      track.dataset.looped = "1";
    }

    track.style.animation = "none";
    track.style.willChange = "transform";

    let lastTs = 0;
    let offset = 0;
    let segment = 1;
    const speedPxPerSec = 55;

    const measure = () => {
      const w = track.scrollWidth / 2;
      segment = Number.isFinite(w) && w > 0 ? w : 1;
      offset = offset % segment;
    };

    const step = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(64, ts - lastTs);
      lastTs = ts;

      offset = (offset + (speedPxPerSec * dt) / 1000) % segment;
      track.style.transform = `translate3d(${-offset}px,0,0)`;
      requestAnimationFrame(step);
    };

    measure();
    window.addEventListener("resize", measure);
    requestAnimationFrame(step);
  });
}

// -------- Audio Control (Browser Autoplay Policy) --------
function setupAudioControl() {
  const btn = document.querySelector(".audio-btn");
  const audio = document.getElementById("bgm");
  if (!btn || !audio) return;
  let playing = false;
  const updateIcon = () =>
    (btn.querySelector(".audio-icon").textContent = playing ? "⏸" : "▶︎");
  btn.addEventListener("click", async () => {
    try {
      if (!playing) {
        await audio.play();
        playing = true;
        btn.classList.add("active");
      } else {
        audio.pause();
        playing = false;
        btn.classList.remove("active");
      }
      updateIcon();
    } catch (e) {
      // ignore autoplay errors
    }
  });
  updateIcon();
}

// -------- Init --------
document.addEventListener("DOMContentLoaded", () => {
  preloadImages(PRELOAD_IMAGES);
  setupRevealOnScroll();
  setupHeroSlideshow();
  setupCountdown();
  setupFallingHearts();
  setupScrollIndicator();
  setupAudioControl();
  setupLightbox();
  setupShowcasePingPong();
});
