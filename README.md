# Danyal Khorami - Research Portfolio (Vite + TS + Three.js)

Minimal, light, research-first portfolio with a subtle WebGL atmosphere. Built with Vite, TypeScript, Three.js, and GSAP (ScrollTrigger). All content is driven by JSON files in `src/content/`.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
1. This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys `dist/` to GitHub Pages.
2. In GitHub → Settings → Pages, set **Source** to **GitHub Actions**.
3. If your repo is not at the root domain, adjust `base` in `vite.config.ts`:
   - For `https://username.github.io/repo-name/` set `base: '/repo-name/'`.
   - For custom domain or root, keep `base: './'`.
4. The custom domain file is in `public/CNAME` and is copied on build.

## Edit content (JSON-driven)
All UI text is rendered from JSON files. Update these and reload:
- `src/content/profile.json`
- `src/content/projects.json`
- `src/content/timeline.json`

## WebGL, quality, and fallbacks
- Full-screen WebGL canvas sits behind the DOM (`#webgl-canvas`).
- If WebGL is unavailable, the site shows a static gradient/noise background.
- `prefers-reduced-motion` disables heavy animation and postprocessing.
- Quality toggle in the header:
  - **Auto** adapts pixel ratio based on frame time.
  - **High** enables subtle bloom/film.
  - **Low** disables expensive passes and reduces density.

## Images and CV
- Placeholder images live in `public/images/`.
- CV placeholder is `public/cv.pdf` (replace with your PDF).

## Plug in a real LLM (optional)
- The assistant is local-only and uses keyword scoring in `src/ai/assistant.ts`.
- To connect a real model later, update `src/ai/client.ts` to call your API and read keys from environment variables via Vite (`import.meta.env`).
- Never commit API keys to the repo.

## Notes
- No CDN runtime imports. All dependencies are installed via npm.
- The site is single-page, accessible, and designed for high readability.
