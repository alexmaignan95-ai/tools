document.addEventListener('DOMContentLoaded', () => {

    let smoothEnabled = false;
    let current = 0;
    let target = 0;
    let rafId = null;

    const ease = 0.12;
    const scrollMult = 1;

    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

    // --- ACTIVER SMOOTH SCROLL ---
    function enableSmooth() {
        if (smoothEnabled) return;
        smoothEnabled = true;

        // Réinitialisation
        current = window.scrollY;
        target = window.scrollY;

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('scroll', onNativeScroll, { passive: true });
    }

    // --- DÉSACTIVER SMOOTH SCROLL ---
    function disableSmooth() {
        if (!smoothEnabled) return;
        smoothEnabled = false;

        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('scroll', onNativeScroll);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    // --- ÉVÈNEMENTS SMOOTH SCROLL ---
    function onWheel(e) {
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();

        const maxScroll = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        ) - window.innerHeight;

        target = clamp(target + e.deltaY * scrollMult, 0, maxScroll);

        if (!rafId) render();
    }

    function onNativeScroll() {
        if (!rafId) current = target = window.scrollY;
    }

    // --- ANIMATION ---
    function render() {
        if (!smoothEnabled) return;

        const diff = target - current;
        if (Math.abs(diff) < 0.1) {
            current = target;
            rafId = null;
            return;
        }

        current += diff * ease;
        window.scrollTo(0, current);

        rafId = requestAnimationFrame(render);
    }

    // --- RESPONSIVE ---
    function checkDevice() {
        if (window.innerWidth < 768) {
            disableSmooth(); // mode mobile
        } else {
            enableSmooth(); // mode desktop
        }
    }

    // Vérification initiale
    checkDevice();

    // Vérification sur redimensionnement
    window.addEventListener('resize', checkDevice);
});




