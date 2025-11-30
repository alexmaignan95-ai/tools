export function initSmoothScroll(options = {}) {
    const SmoothConfig = {
        DEBUG: false,
        MOBILE_BREAKPOINT: 768,
        ease: 0.03,
        scrollMult: 1,
        stopThreshold: 0.1,
        minPageHeightRatio: 1.05,
        ...options
    };

    let smoothEnabled = false;
    let current = 0;
    let target = 0;
    let rafId = null;
    let draggingScrollbar = false;

    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
    const log = (...args) => SmoothConfig.DEBUG && console.log('[smooth]', ...args);

    const getMaxScroll = () =>
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;

    function updateScrollBehavior() {
        const behavior = window.innerWidth < SmoothConfig.MOBILE_BREAKPOINT ? "" : "auto";
        document.documentElement.style.scrollBehavior = behavior;
        document.body.style.scrollBehavior = behavior;
    }

    function enableSmooth() {
        if (smoothEnabled) return;
        smoothEnabled = true;

        current = target = window.scrollY;

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('scroll', onNativeScroll, { passive: true });

        log('Smooth enabled');
    }

    function disableSmooth() {
        if (!smoothEnabled) return;
        smoothEnabled = false;

        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('scroll', onNativeScroll);

        cancelAnimationFrame(rafId);
        rafId = null;

        log('Smooth disabled');
    }

    document.addEventListener("mousedown", () => {
        draggingScrollbar = true;
        cancelAnimationFrame(rafId);
        rafId = null;
    });

    document.addEventListener("mouseup", () => {
        draggingScrollbar = false;
        current = target = window.scrollY;
    });

    function onWheel(e) {
        if (!smoothEnabled || draggingScrollbar || e.ctrlKey) return;

        e.preventDefault();

        const maxScroll = getMaxScroll();
        target = clamp(target + e.deltaY * SmoothConfig.scrollMult, 0, maxScroll);

        if (!rafId) render();
    }

    function onNativeScroll() {
        if (!rafId || draggingScrollbar) {
            current = target = window.scrollY;
        }
    }

    const keyboardScrollKeys = new Set([
        "ArrowUp", "ArrowDown", "PageUp",
        "PageDown", "Home", "End", "Space"
    ]);

    window.addEventListener("keydown", (e) => {
        if (!keyboardScrollKeys.has(e.code)) return;

        cancelAnimationFrame(rafId);
        rafId = null;

        current = target = window.scrollY;
    });

    function render() {
        if (!smoothEnabled || draggingScrollbar) return;

        const diff = target - current;

        if (Math.abs(diff) < SmoothConfig.stopThreshold) {
            current = target;
            rafId = null;
            return;
        }

        current += diff * SmoothConfig.ease;
        window.scrollTo({ top: Math.round(current), behavior: "auto" });

        rafId = requestAnimationFrame(render);
    }

    function checkDevice() {
        const pageHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );

        const shouldDisable =
            pageHeight <= window.innerHeight * SmoothConfig.minPageHeightRatio ||
            window.innerWidth < SmoothConfig.MOBILE_BREAKPOINT;

        shouldDisable ? disableSmooth() : enableSmooth();
    }

    function initAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (window.innerWidth < SmoothConfig.MOBILE_BREAKPOINT) return;

                const targetEl = document.querySelector(this.getAttribute('href'));
                if (!targetEl) return;

                e.preventDefault();

                cancelAnimationFrame(rafId);
                rafId = null;

                current = target = window.scrollY;
                target = targetEl.offsetTop;

                render();
            });
        });
    }

    updateScrollBehavior();
    checkDevice();
    initAnchors();

    window.addEventListener("resize", () => {
        clearTimeout(window.__smooth_resize_timer);
        window.__smooth_resize_timer = setTimeout(() => {
            updateScrollBehavior();
            checkDevice();
        }, 120);
    });
}
