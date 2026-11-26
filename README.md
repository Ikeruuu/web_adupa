# Web de ADUPA

Web de la **Asociación de Debate Universitario del Principado de Asturias** — [adupa.es](https://adupa.es).

Una sola página con escena 3D ligada al scroll (Three.js), animaciones (GSAP + Lenis), versión en español e inglés y versión móvil.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Para generar la versión de producción: `npm run build` (sale en `dist/`).

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| Enlaces de WhatsApp, formulario, email y redes | `src/content.js` → `links` y `socials` |
| Actividades del calendario | `src/content.js` → `events` |
| Fotos de la galería | copia las fotos a `public/galeria/` y pon la ruta en `src/content.js` → `gallery` |
| Publicaciones de redes | `src/content.js` → `posts` |
| Estatutos y reglamento | sustituye los PDF de `public/docs/` (mismo nombre de archivo) |
| Colaboradores | `src/content.js` → `collaborators` (logos en `public/logos/`) |
| Logos del final (Uniovi, G9, asociaciones…) | `src/content.js` → `partners` (logos en `public/logos/`) |
| Textos fijos en español e inglés | `src/i18n.js` |
| Logo / sello | `src/assets/seal-ring.svg` y `seal-owl.svg` (anillo y búho, se tiñen por CSS con `--seal`); iconos y `og.jpg` en `public/`; logo completo en `public/brand/adupa-sello.svg` |
| Colores y tipografías | variables al inicio de `src/styles.css` |
| Escena 3D y planos de cámara | `src/scene.js` |

> Lo que hay ahora en calendario, publicaciones, colaboradores y enlaces es **contenido de ejemplo**.
> El búho del sello es **provisional** hasta tener el logo definitivo en vectorial (SVG).

## Publicar en adupa.es

La web es estática: no necesita servidor ni base de datos. Recomendado: **Cloudflare Pages** (gratis).

1. En Cloudflare → *Workers & Pages* → *Create* → *Pages* → conectar este repositorio de GitHub.
2. Build command: `npm run build` · Output directory: `dist`.
3. En *Custom domains* añade `adupa.es` y `www.adupa.es`.
4. En DonDominio, cambia los servidores DNS del dominio por los dos que te indique Cloudflare.

A partir de ahí, cada `git push` a `main` publica la web sola.
