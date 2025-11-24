/**
 * Smooth Scroll Module — Vanilla JS
 * Version réutilisable
 *
 * @version 1.0
 * @author 
 *
 * Utilisation :
 * import initSmoothScroll from './smoothScroll.js';
 * initSmoothScroll({ offset: 120, ease: 0.08 });
 */

export default function initSmoothScroll(options = {}) {
    // --------------------------------------------------
    // Configuration par défaut
    // --------------------------------------------------
    const SmoothConfig = {
        DEBUG: false,               // Activer les logs
        MOBILE_BREAKPOINT: 768,     // Désactivation JS sur mobile
        ease: 0.06,                 // Facteur de lissage du scroll
        scrollMult: 1,              // Multiplicateur de delta
        stopThreshold: 0.1,         // Seuil d'arrêt du scroll
        minPageHeightRatio: 1.05,   // Page trop courte => désactive smooth
        offset: 100,                // Décalage pour navbar
        ...options                  // Merge options personnalisées
    };

    let smoothEnabled = false;
    let current = 0;
    let target = 0;
    let rafId = null;

    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
    const log = (...args) => { if (SmoothConfig.DEBUG) console.log('[smooth]', ...args); };

    // --------------------------------------------------
    // Activation / désactivation smooth
    // --------------------------------------------------
    function enableSmooth() {
        if (smoothEnabled) return;
        smoothEnabled = true;
        current = window.scrollY;
        target = window.scrollY;

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('scroll', onNativeScroll, { passive: true });
        log('Smooth enabled');
    }

    function disableSmooth() {
        if (!smoothEnabled) return;
        smoothEnabled = false;
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('scroll', onNativeScroll);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        log('Smooth disabled (mobile ou page courte)');
    }

    // --------------------------------------------------
    // Gestion du scroll
    // --------------------------------------------------
    function onWheel(e) {
        e.preventDefault();
        let delta = e.deltaY;
        const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
        target = clamp(target + delta * SmoothConfig.scrollMult, 0, maxScroll);
        if (!rafId) render();
    }

    function onNativeScroll() {
        if (!rafId) target = current = window.scrollY;
    }

    function render() {
        if (!smoothEnabled) return;
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

    // --------------------------------------------------
    // Vérification de la taille de page et device
    // --------------------------------------------------
    function checkDevice() {
        const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        if (pageHeight <= window.innerHeight * SmoothConfig.minPageHeightRatio) {
            disableSmooth();
            return;
        }
        if (window.innerWidth < SmoothConfig.MOBILE_BREAKPOINT) {
            disableSmooth();
            return;
        }
        enableSmooth();
    }

    checkDevice();
    window.addEventListener("resize", () => {
        clearTimeout(window.__smooth_resize_timer);
        window.__smooth_resize_timer = setTimeout(checkDevice, 120);
    });

    // --------------------------------------------------
    // Gestion des liens vers des ancres internes
    // --------------------------------------------------
    function initAnchors(offset = SmoothConfig.offset) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault(); // empêche le jump natif
                    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                    current = target = window.scrollY;
                    const topPos = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: topPos, behavior: "smooth" });
                }
            });
        });
    }

    initAnchors(SmoothConfig.offset);

    // --------------------------------------------------
    // Retourne un objet pour contrôle manuel
    // --------------------------------------------------
    return {
        enable: enableSmooth,
        disable: disableSmooth,
        config: SmoothConfig,
        status: () => ({ smoothEnabled, current, target })
    };
}

