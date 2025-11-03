# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimalist personal portfolio website built with vanilla HTML and CSS. The site features a dark theme design system and is deployed to Cloudflare Pages with a custom domain at `shafkatrahman.com`.

## Architecture

### Design System
The entire design system is defined via CSS custom properties in `style.css`:
- **Colors**: Dark navy/slate theme with primary blue accent (`--background`, `--foreground`, `--primary`, etc.)
- **Typography**: EB Garamond serif for headings, Inter sans-serif for body text
- **Animations**: Staggered entrance animations using fade-in and slide-up keyframes

### Page Structure
- **Homepage** (`index.html`): Hero section with fixed navigation, social icons using Lucide Icons CDN
- **Writing Index** (`writing.html`): List of essays with dates and excerpts
- **Individual Posts** (`writing/*.html`): Full article pages with proper typography and back navigation

### CSS Architecture
All styles are in a single `style.css` file organized by:
1. CSS custom properties (`:root`)
2. Global styles (body, links, typography)
3. Navigation styles (`.site-nav`, `.nav-link`)
4. Hero section styles (`.hero`, `.hero-inner`)
5. Social links (`.social-section`, `.social-icon-link`)
6. Writing page styles (`.writing-page`, `.article-page`)
7. Responsive media queries

**Cache-busting**: The CSS file is referenced with a query parameter (`style.css?v=2`) to force browser cache invalidation when styles change. Increment the version number when deploying CSS updates.

## Deployment Workflow

### Cloudflare Pages Setup
- **Project name**: `shafkatrahman` (connected to custom domain)
- **Production domain**: `shafkatrahman.com`
- **Pages domain**: `shafkatrahman.pages.dev`

### Deploy Commands
```bash
# Deploy to production
wrangler pages deploy . --project-name=shafkatrahman

# List recent deployments
wrangler pages deployment list --project-name=shafkatrahman

# List all Cloudflare Pages projects
wrangler pages project list
```

### Git Workflow
**Important**: Follow the commit strategy from the global CLAUDE.md:
- Create logical, atomic commits (one commit per distinct change)
- Think through all commits before executing
- Commit messages should be descriptive with multi-line explanations using heredoc format

Example:
```bash
git commit -m "$(cat <<'EOF'
Add new feature or fix

- Detail 1
- Detail 2
- Detail 3
EOF
)"
```

After pushing, verify deployment propagation. Browser caching can cause issues; the cache-busting query parameter mitigates this.

## Adding New Writing

To add a new essay or article:

1. **Create the article HTML** in `writing/[slug].html`:
   - Copy structure from existing article (e.g., `writing/maiutics.html`)
   - Update title, date, and content
   - Ensure proper navigation links (`<a href="../">` for CSS, `<a href="/writing">` for back link)

2. **Update the writing index** in `writing.html`:
   - Add new `<article class="writing-item">` entry
   - Include date in ISO format (`datetime="YYYY-MM-DD"`)
   - Add title and excerpt
   - Maintain reverse chronological order (newest first)

3. **Commit structure**:
   - Commit article page separately from index update for clear history
   - Use descriptive commit messages with the article title and date

## CSS Styling Guidelines

### Adding New Styles
- Always use CSS custom properties for colors, fonts, and repeated values
- Follow the existing naming convention for classes (kebab-case)
- Add new component styles after existing sections, before media queries
- Ensure responsive design with mobile-first approach

### Typography
- Headings: `var(--font-display)` (EB Garamond)
- Body text: `var(--font-body)` (Inter with system fallbacks)
- Use `clamp()` for fluid typography on headings

### Animations
Existing animation classes:
- `.animate-fade-in`: 0.5s fade
- `.animate-slide-up`: 0.6s slide with bounce easing
- `.animate-slide-up-delay`: 0.7s with 0.2s delay
- `.animate-slide-up-delay-2`: 0.8s with 0.4s delay

## Browser Caching Strategy

The site uses query parameter versioning for the CSS file to handle browser caching:
- CSS is loaded as `style.css?v=2` (current version)
- When updating CSS, increment the version number in all HTML files
- This forces browsers to fetch the new stylesheet

**Important**: Cloudflare Pages has a 4-hour cache (`max-age=14400`), so changes may not be immediately visible on the production domain. Preview deployments have `max-age=0`.

## Icon Usage

Social media icons use Lucide Icons CDN:
```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="icon-name"></i>
<script>lucide.createIcons();</script>
```

Current icons: linkedin, github, twitter

## Project Dependencies

This is a static site with no build process or package manager. Dependencies:
- **Fonts**: Google Fonts (EB Garamond, Inter) - loaded via CDN
- **Icons**: Lucide Icons - loaded via CDN
- **Deployment**: Wrangler CLI for Cloudflare Pages

No npm/yarn/build commands are needed.
