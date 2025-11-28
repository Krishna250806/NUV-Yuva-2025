# NUV Yuva — Project Overview

This project contains the main front-end assets for the NUV Yuva 2026 event page.
This repo has been cleaned to remove demo pages and keep only assets used in production.

## Structure

- `NUV_Yuva.html` — main site page
- `NUV_Yuva.css` — primary stylesheet (all effects and components)
- `NUV_Yuva.js` — main behavior script (interactions, animations, ribbon)
- `assets/` — UI components and CSS (button splash, glass button)
  - `assets/ui` — component CSS
  - `assets/js/components` — component scripts
- `archive/` — archived files (demos and additional assets moved here)

## Cleanups done

- Demo pages moved to `archive/` and replaced with notes in their original paths.
- Duplicated file `NUV_Yuva_updated.js` marked as archived in root and a small stub created under `archive/`.
- Small JS duplication fixed (removed duplicate `getBoundingClientRect()` call) in `assets/js/components/liquid-glass-button.js`.

## How to restore

If you need to restore any archived demos or assets, copy from `archive/` back into `assets/` then update imports.

## Formatting and conventions

- The code has been lightly refactored for readability; no UI or behavioral changes were made.
- Please run your local linter of choice (prettier/eslint) if you prefer an automated reformat.

If you want I can further extract small helpers into `assets/js/utils.js` and tidy imports to a module style (ES modules), but that would change the loading strategy — ask if you'd like that.
