# Resources Page Design

## Summary

Add a new "Resources" section to the website for curated AI/Claude learning resources. Card grid layout with category section headers. Content sourced from Google Doc with 25 initial resources across 5 categories.

## Page Structure

- URL: `/resources/index.html`
- Navigation: Add "Resources" link to all pages (Home, Writing, Reading, Resources)
- Layout: Page title + subtitle, then category sections each containing a responsive card grid
- No JavaScript needed — purely static HTML + CSS

## Categories

1. Videos (6 items)
2. Repos (8 items)
3. Guides (5 items)
4. Books (5 items)
5. Papers (6 items)

## Card Design

Each card is a clickable `<a>` opening in a new tab. Contains:
- Type icon (Lucide) + source domain hostname
- Resource title (1-2 lines)
- Optional one-line description
- Subtle external-link indicator

Lucide icon mapping:
- Videos: `play-circle`
- Repos: `github`
- Guides: `book-open`
- Books: `book`
- Papers: `file-text`

## CSS

New classes added to `style.css`:
- `.resources-page` — page wrapper (mirrors `.writing-page`)
- `.resources-grid` — CSS Grid (`repeat(auto-fill, minmax(280px, 1fr))`)
- `.resource-card` — border, padding, border-radius, hover lift/shadow
- `.resource-category` — section header with count badge
- `.resource-icon` — type icon styling
- `.resource-domain` — muted hostname text

All colors via existing CSS variables for automatic dark/light mode support.

Grid: 2 columns desktop, 1 column mobile (via `auto-fill` + `minmax`).

## Files Changed

| File | Action |
|------|--------|
| `/resources/index.html` | New — Resources page |
| `/style.css` | Edit — Add resource card grid styles |
| `/index.html` | Edit — Add "Resources" nav link |
| `/writings/index.html` | Edit — Add "Resources" nav link |
| `/reading/index.html` | Edit — Add "Resources" nav link |
| All article pages | Edit — Add "Resources" nav link |

## Content

25 resources from Google Doc organized into 5 categories with concise descriptions.
