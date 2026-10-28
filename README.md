# Mohammed Nabil · Portfolio

Personal site of **Mohammed Nabil** (محمد نبيل), software developer in Sweden. Bilingual (English / Arabic with full right-to-left layout), built with React, TypeScript and Three.js.

Three.js runs through the whole page:

| Section    | Scene                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Hero       | ~16,000 GLSL particles assemble the name, morph Latin ↔ Arabic, part around the pointer, burst on click |
| Background | The same particles dissolve into a night sky; as you scroll, part of it takes the shape of the section you are reading (ring, columns, globe, helix, card ring, slabs, wave) in the empty margin beside the content, then regroups into the greeting |
| About      | Personal traits orbit the portrait on a tilted ring                                                |
| Numbers    | A skyline of hexagonal towers (years, projects, skills, credits…) that rise on entry and glow on hover; every figure is computed from the resume data |
| Skills     | A draggable skill globe; field filters light up one domain at a time                               |
| Experience | A career helix: each role and degree is a strand rising through the years, linked to the list on hover |
| Projects   | A rotating ring of project cards, synced with the detail panel, arrows and keyboard                |
| Education  | All 26 transcript courses as a stack of books; point at one to pull it out and read it             |
| Writing    | DEV articles fanned like a hand of cards; slide across to bring one forward, click to read         |
| Contact    | The particles regroup into "Hej · Hello · مرحباً", beside orbiting planets that link to GitHub, LinkedIn, DEV and X, with a core that opens an email |

**Ask my CV.** A floating box (press `/`) answers questions in English or Arabic, from the resume data only, and the page answers by moving: ask "Do you know Spring?" and the skills globe turns that word to the front, ask "Where do you work?" and the career helix lights that strand, "How many projects?" lights a tower. It is plain keyword matching (`src/lib/ask.ts`), so there is no server, no key, and an answer can never say more than the data does.

Each section scene loads lazily and only exists while it is near the viewport, so the page never holds more than a few WebGL contexts.

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

Requires Node 22.

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

Everything personal lives in **`src/data/resume.ts`**: name, intro, about text, traits, roles, degrees, the course list from the transcript, projects, certificates, skills and social links. Every text field has an `en` and an `ar` version, and the tests fail if either is missing. Interface copy (buttons, labels, messages) is in `src/i18n/dictionary.ts`.

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
  scene/                  WebGL: hero particles and shaders
    kit/                  shared scene helpers: drag-to-turn, text labels, camera fitting, palette
    sections/             one lazily loaded scene per page section
  focus/                  shared "where is the visitor looking" state that Ask my CV drives
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

`npm run build` produces a static site in `dist/` with relative asset paths, so it can be served from Vercel, Netlify, GitHub Pages or any static host. On Vercel, `vercel.json` sets the Vite build and the `dist` output folder, so no project settings need changing.

## License

MIT
