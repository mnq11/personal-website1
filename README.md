# Mohammed Nabil · Portfolio

Personal site of **Mohammed Nabil** (محمد نبيل), software developer in Sweden. Bilingual (English / Arabic with full right-to-left layout), built with React, TypeScript and Three.js.

The hero is a WebGL particle field drawn with custom GLSL shaders: about 16,000 particles assemble into the name, morph between its Latin and Arabic spellings, part around the pointer, and dissolve into a night sky that stays behind the page as you scroll.

## Stack

| Concern    | Choice                                                              |
| ---------- | ------------------------------------------------------------------- |
| Build      | Vite, TypeScript (strict)                                           |
| UI         | React 19, CSS Modules, design tokens in `src/styles/global.css`     |
| 3D         | Three.js via React Three Fiber, hand-written vertex/fragment shader |
| Type       | Readex Pro (variable, self-hosted), one family for both scripts     |
| Quality    | ESLint (typescript-eslint strict), Vitest + Testing Library         |
| Live data  | GitHub REST API (projects) and DEV API (articles), fetched client-side |

## Getting started

Requires Node 20.19 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload           |
| `npm run build`     | Type-check and build to `dist/`                |
| `npm run preview`   | Serve the production build locally             |
| `npm run lint`      | Lint all TypeScript                            |
| `npm test`          | Run unit and component tests                   |
| `npm run check`     | Lint, test and build: what CI runs             |

Add `?lang=ar` or `?lang=en` to any URL to open the site in that language.

## Editing the content

Everything personal lives in **`src/data/resume.ts`**: name, intro, about text, roles, education, skills and social links. Every text field has an `en` and an `ar` version, and the tests fail if either is missing. Interface copy (buttons, labels, messages) is in `src/i18n/dictionary.ts`.

Projects are the six most recently updated public, non-fork repositories on GitHub; articles are the latest four on DEV. Both update automatically.

## Project structure

```
src/
  App.tsx                 page composition
  data/resume.ts          all personal content, typed and bilingual
  i18n/                   language context, dictionary, RTL handling
  components/
    layout/               header, footer, skip link
    sections/             hero, about, skills, experience, projects, writing, contact
    ui/                   section shell, icons, buttons, shared list styles
  scene/                  WebGL layer: point sampling, shaders, particle system
  hooks/                  media queries, active section, remote data
  lib/                    dates, skills matrix, API clients, storage, WebGL detection
  styles/global.css       design tokens and base styles
```

## Accessibility and performance

- The name is always a real `<h1>`; the canvas is decorative. Without WebGL the page shows the name as large type instead.
- `prefers-reduced-motion` freezes the particles in place and turns off smooth scrolling.
- Three.js is code-split and loads after the page content, so text is readable immediately.
- Keyboard focus is always visible, there is a skip link, and the mobile menu closes with Escape.
- Images are served as WebP with a JPEG fallback; the old 80 MB of GIF and audio assets are gone.

## Deployment

`npm run build` produces a static site in `dist/` with relative asset paths, so it can be served from Vercel, Netlify, GitHub Pages or any static host. On Vercel, import the repository and keep the detected Vite defaults.

## License

MIT
