## 📌 Utilisation du Smooth Scroll

Le Smooth Scroll peut être utilisé de deux manières : **avec les valeurs par défaut** ou **avec des paramètres personnalisés**.

---

### 1️⃣ Version par défaut

Pour activer le scroll fluide avec toutes les valeurs par défaut, il suffit de faire :

```html
<script type="module">
  import initSmoothScroll from 'https://alexandre-maignan.github.io/tools/smooth-scroll.js';

  // Initialisation simple avec les valeurs par défaut
  initSmoothScroll();
</script>

```

### 2️⃣ Version avec paramètres


```html
<script type="module">
    import initSmoothScroll from "https://cdn.jsdelivr.net/gh/TON-USER/github-smooth-scroll/smooth-scroll.js";

    initSmoothScroll({
        DEBUG: false,
        ease: 0.12,
        scrollMult: 1.2,
        offset: 0
    });
</script>

```



