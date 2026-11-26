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
## Publicar en adupa.es

La web es estática: no necesita servidor ni base de datos. Se publica gratis en **GitHub Pages**:
`.github/workflows/deploy.yml` la compila y la sube en cada `git push` a `main`.

Puesta en marcha (una sola vez):

1. En GitHub → *Settings* → *Pages* → *Build and deployment* → *Source*: **GitHub Actions**.
2. En la pestaña *Actions*, abre «Publicar en GitHub Pages» y pulsa *Run workflow* (o haz cualquier push).
3. En *Settings* → *Pages* → *Custom domain* escribe `adupa.es` y guarda.
4. En DonDominio → zona DNS de `adupa.es`, borra los registros A/CNAME de aparcamiento que haya y crea:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | A | `adupa.es` (o `@`) | `185.199.108.153` |
   | A | `adupa.es` (o `@`) | `185.199.109.153` |
   | A | `adupa.es` (o `@`) | `185.199.110.153` |
   | A | `adupa.es` (o `@`) | `185.199.111.153` |
   | CNAME | `www` | `ikeruuu.github.io` |

5. Cuando GitHub dé el dominio por verificado (de minutos a unas horas), marca **Enforce HTTPS** en *Settings* → *Pages*.

### Que salga en Google

- `public/robots.txt` y `public/sitemap.xml` ya están en la web.
- Da de alta `adupa.es` en [Google Search Console](https://search.google.com/search-console) (propiedad de tipo *Dominio*; pide añadir un registro TXT en DonDominio) y envía `https://adupa.es/sitemap.xml`.
