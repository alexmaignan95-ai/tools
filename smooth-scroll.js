// smooth-scroll.js
// Version ES Module (ESM) pour import / init facile
export const SmoothScroll = (() => {
  let config = {
    DEBUG: false,
    MOBILE_BREAKPOINT: 768,
    ease: 0.1,
    scrollMult: 1,
    stopThreshold: 0.1,
    minPageHeightRatio: 1.05,
  };

  let enabled = false;
  let current = 0;
  let target = 0;
  let rafId = null;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  const log = (...args) => config.DEBUG && console.log('[smooth]', ...args);

  function updateScrollBehavior() {
    const behavior = window.innerWidth < config.MOBILE_BREAKPOINT ? "" : "auto";
    document.documentElement.style.scrollBehavior = behavior;
    document.body.style.scrollBehavior = behavior;
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    current = target = window.scrollY;
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", syncScroll, { passive: true });
    log("enabled", config);
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", syncScroll);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    log("disabled");
  }

  function onWheel(e) {
    if (e.ctrlKey) return;
    e.preventDefault();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    target = clamp(target + e.deltaY * config.scrollMult, 0, maxScroll);
    if (!rafId) render();
  }

  function syncScroll() {
    if (!rafId) current = target = window.scrollY;
  }

  function render() {
    if (!enabled) return;
    const diff = target - current;
    if (Math.abs(diff) < config.stopThreshold) {
      current = target;
      rafId = null;
      return;
    }
    current += diff * config.ease;
    window.scrollTo(0, Math.round(current));
    rafId = requestAnimationFrame(render);
  }

  function checkState() {
    const isMobile = window.innerWidth < config.MOBILE_BREAKPOINT;
    const pageTooShort = document.documentElement.scrollHeight <= window.innerHeight * config.minPageHeightRatio;
    if (isMobile || pageTooShort) {
      disable();
    } else {
      enable();
    }
  }

  function setupAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const el = document.querySelector(a.getAttribute("href"));
        if (!el || window.innerWidth < config.MOBILE_BREAKPOINT) return;
        e.preventDefault();
        if (rafId) cancelAnimationFrame(rafId);
        current = target = window.scrollY;
        target = el.getBoundingClientRect().top + window.scrollY;
        render();
      });
    });
  }

  function setOptions(opts = {}) {
    config = { ...config, ...opts };
    log("options updated", config);
  }

  function init(opts = {}) {
    setOptions(opts);
    updateScrollBehavior();
    checkState();
    setupAnchors();
    window.addEventListener("resize", () => {
      clearTimeout(window.__smoothResizeTimer);
      window.__smoothResizeTimer = setTimeout(() => {
        updateScrollBehavior();
        checkState();
      }, 120);
    });
  }

  return { init, enable, disable, setOptions, _getConfig: () => ({ ...config }) };
})();

})(window);



