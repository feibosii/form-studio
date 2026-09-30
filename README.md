# FORM Studio

A standalone, local-first photo editor designed by 菲波斯. Photos, geometry rendering, subject detection, and exports are processed in the browser. No ChatGPT hosting, server, API key, or account is required to use the editor.

## Project layout

- `src/`: editable React/TypeScript source and styles
- `public/`: original sample photo, favicon, and local subject-segmentation model/runtime
- `docs/index.html`: built website entry point for GitHub Pages
- `outputs/`: preserved secondary layout concept
- `tests/`: existing rendering and adjustment checks

## Develop and build

Install Node.js 22 or newer and pnpm, then run:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

The build regenerates `docs/`, including `.nojekyll` and the secondary design. Commit both source changes and the updated `docs/` directory.

## GitHub Pages

In repository Settings → Pages, select **Deploy from a branch**, branch **main**, folder **/docs**. All production assets use relative URLs so the site also works under a repository subpath. No alternative hosting provider is configured.

To preview the production files locally:

```sh
python3 -m http.server 8080 --directory docs
```

Open http://localhost:8080/. Opening HTML directly with `file://` is not supported because the editor uses module workers and fetch.

## Assets and privacy

The sample photograph is credited in the editor to Ospan Ali on Unsplash. The fonts are DM Mono and Libre Caslon Display, currently loaded from Google Fonts. The MediaPipe segmentation runtime and model are included locally. Uploaded photos never leave the browser. The experimental design is available at `outputs/layout-concept.html`.
