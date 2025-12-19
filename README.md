# Interactive WebGL Portfolio — Danyal Khorami

Three.js + GSAP-powered interactive portfolio (hero robot, particle field, project modals, and motion-capture visualization). No build step; all files are plain HTML/CSS/JS modules.

## Structure
- `index.html` — main page with hero robot, projects grid, timeline, contact form.
- `css/styles.css` — design tokens, layout, responsive rules.
- `js/scene.js` — Three.js setup per canvas (renderer, camera, lights, orbit controls).
- `js/robot.js` — robot/avatar (GLTF if present, fallback low-poly rig) with pointer/scroll reactions.
- `js/particles.js` — particle field + abstract network lattice for the experience section.
- `js/projects.js` — project cards, modal system, filters, accessibility hooks.
- `js/animations.js` — GSAP entrance + scroll-triggered animations.
- `js/main.js` — wiring, skill chips, contact form validation, 3D init.
- `assets/data/projects.json` — project data (titles, stacks, links, galleries).
- `assets/models/` — place GLB/GLTF models here (robot, extra assets).
- `assets/img/placeholder.svg` — placeholder for modals + cards.

## Add your portrait
- Replace the hero placeholder (`.portrait__placeholder`) with your image. Easiest: add an `<img>` inside `.portrait__frame` in `index.html` or use CSS background.

## Add or swap 3D models
- Hero robot: drop a GLB at `assets/models/robot.glb`. The loader in `js/robot.js` will auto-use it; animations play the first clip if present.
- Motion-capture viz: hook real data by piping your stream into `createNetworkLattice` (see `js/particles.js`) or replace with your own geometry.
- Performance: textures/models are lazy-loaded; renderer caps devicePixelRatio to protect mobile fps.

## Update project data
- Edit `assets/data/projects.json` (or the fallback data inside `js/projects.js`).
  - `type` supports filters: `Research`, `Artistic`, `Hardware`.
  - `gallery` accepts image URLs; missing images show a placeholder.
  - `links` array renders as modal buttons.
- Cards support keyboard (Enter/Space) and click; modal can be dismissed with Esc or the backdrop.

## Deploy to GitHub Pages
1. Push these files to your repo root.
2. In GitHub → Settings → Pages, set Source to `main` (root).
3. (Optional) Add a custom domain by creating `CNAME` and updating DNS.

## Notes
- No phone number is stored anywhere; contact channels are email/LinkedIn/GitHub.
- If WebGL is unavailable, the site gracefully shows static content (hero fallback message).
