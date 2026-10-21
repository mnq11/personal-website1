
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- From LinkedIn: master's degree in Computer Science with a machine learning focus and its activities, earlier diplomas (graphic design, computer maintenance), Edraak and HP LIFE courses, an AI and data science skill group, and gold markers on the 16 skills with a passed LinkedIn skill assessment.

## [2.1.0] - 2026-10-21

### Added
- A 3D scene in every section: trait orbit around the portrait, skill globe with field filters, career helix linked to the roles list, rotating project ring, and a stack of course books from the transcript.
- Click-to-scatter burst on the hero name, and a "Hej · Hello · مرحباً" particle greeting at the contact section.
- Education section with both degrees, thesis titles, all 26 courses (222 credits) and certificates.
- Ten featured projects from the CV, with live GitHub repositories below them.
- Swedish among languages; soft skills; updated roles from the current CV.

### Changed
- Content rewritten from the CV, official transcript and certificate of registration. Identity numbers, control codes and phone numbers are intentionally not published.

## [2.0.0] - 2026-10-21

Complete rebuild.

### Added
- WebGL hero: custom-shader particle field that assembles the name, morphs between its Latin and Arabic spellings, reacts to the pointer and dissolves into a night sky on scroll.
- Full Arabic version with right-to-left layout, language toggle and `?lang=` links.
- Projects section fed live from GitHub; articles from DEV with loading, empty and error states.
- Skills grouped by depth of experience; experience timeline with durations; education with courses.
- Copy-email action, skip link, active-section navigation, reduced-motion support, WebGL fallback.
- SEO and sharing metadata (Open Graph, JSON-LD Person, hreflang), web manifest, SVG favicon.
- TypeScript strict mode, ESLint, Vitest tests and a GitHub Actions workflow.

### Changed
- Migrated from Create React App and Bulma to Vite, React 19 and CSS Modules.
- Content moved to a typed, bilingual `src/data/resume.ts`; copy rewritten to be concise.
- Self-hosted Readex Pro replaces Font Awesome and Bulma fonts.

### Removed
- About 80 MB of animated GIF backgrounds and the background audio track.
- Deprecated Universal Analytics tag.

## [1.3.3] - 2021-04-12
### Added
- Github link to author name

### Fixed
- Bug in the experience Timeline, that would display duplicated entries for the same year

### Removed
- Codacy integration

## [1.3.2] - 2020-03-15

### Fixed

- Social network profiles columns
- Articles columns

## [1.3.1] - 2020-03-13

### Changed

- Personal photo

## [1.3.0] - 2020-01-28

### Changed

- Skills progress bar displays skill level instead of percentages. One of the following:
  - Advanced
  - Intermediate
  - Basic

## [1.2.2] - 2019-12-31

### Added

- GitHub profile page

## [1.2.1] - 2019-12-22

### Fixed

- Skills percentage floating to the right

## [1.2.0] - 2019-11-15

### Added

- Bosch work experience

## [1.1.3] - 2019-07-25

### Added

- Document title is now taken from `resume.json`

## [1.1.2] - 2019-07-21

### Fixed

- Improved some points regarding SEO

## [1.1.1] - 2019-07-21

### Fixed

- Responsiveness in the timeline items and the About me summary.

## [1.1.0] - 2019-07-20

### Added

- All resume information is now pulled from a JSON file

## [1.0.0] - 2019-06-09

### Added

- Initial commit
