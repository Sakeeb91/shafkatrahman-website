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
- **Writing Index** (`writings/index.html`): List of essays with dates and excerpts
- **Individual Posts** (`writings/*.html`): Full article pages with proper typography and back navigation
- **Reading Index** (`reading/index.html`): List of books and reading notes
- **Reading Notes** (`reading/*/index.html`): Individual book reading notes with chapter navigation

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

### Automatic Deployment (Recommended)
The site uses GitHub Actions for automatic deployment to Cloudflare Pages:

- **Workflow file**: `.github/workflows/deploy.yml`
- **Trigger**: Pushes to `main` branch automatically deploy
- **Action**: Uses `cloudflare/pages-action@v1` to deploy entire directory
- **Secrets required**:
  - `CLOUDFLARE_API_TOKEN` (set in repository secrets)
  - `CLOUDFLARE_ACCOUNT_ID` (set in repository secrets)

**Monitoring deployments**:
```bash
# View recent GitHub Actions runs
gh run list --limit 5

# Watch a specific deployment
gh run watch [run-id]

# View deployment logs if failed
gh run view [run-id] --log-failed
```

### Manual Deployment (Local)
For local testing or manual deployments:

```bash
# Deploy to production (requires .wranglerignore to exclude large files)
wrangler pages deploy . --project-name=shafkatrahman

# List recent deployments
wrangler pages deployment list --project-name=shafkatrahman

# List all Cloudflare Pages projects
wrangler pages project list
```

**Note**: The `.wranglerignore` file excludes development artifacts (`.playwright/`, `.npm-cache/`, `docs/`, system files) from deployments to prevent file size errors.

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

1. **Create the article HTML** in `writings/[slug].html`:
   - Copy structure from existing article (e.g., `writings/maiutics.html`)
   - Update title, meta tags, and structured data with article details
   - Include proper SEO meta tags (Open Graph, Twitter Card, Schema.org)
   - Set publication date in ISO format (`datetime="YYYY-MM-DD"`)
   - Ensure proper navigation links (`href="../style.css?v=2"` for CSS, `href="/writings/"` for back link)
   - Use semantic HTML: `<article>`, `<header>`, `<time>`, `<blockquote>`, `<figure>`
   - **Include performance optimizations** (see Performance Optimization Template below)

2. **Handle images and assets**:
   - Create a subdirectory: `writings/[article-slug]/` for article-specific images
   - Use descriptive filenames (e.g., `spiral-perturbation.png` instead of long generated names)
   - Reference images with relative paths: `<img src="[article-slug]/image.png" alt="...">`
   - Images are automatically styled to be centered, responsive, and have max-width of 800px
   - For figures with captions: wrap in `<figure class="article-image">` for proper alignment

3. **Update the writings index** in `writings/index.html`:
   - Add new `<article class="writing-item">` entry at the TOP of the list
   - Include date in ISO format (`datetime="YYYY-MM-DD"`)
   - Add compelling title and 2-3 sentence excerpt
   - Maintain reverse chronological order (newest first)

4. **Commit structure** (create atomic commits):
   - First commit: Add the article HTML file
   - Second commit: Add image assets for the article
   - Third commit: Update writings index page
   - Fourth commit (if needed): Add any supporting files like .wranglerignore updates
   - Use descriptive commit messages with the article title and date

5. **Deploy**:
   - Push commits to GitHub: `git push`
   - Monitor CI/CD: `gh run list --limit 5` and `gh run watch [run-id]`
   - Verify all checks pass before considering deployment complete
   - Changes automatically deploy to Cloudflare Pages via GitHub Actions
   - Verify live at `https://shafkatrahman.com/writings/[slug].html`

### Article Styling Reference

Articles support the following content elements with automatic styling:

- **Headings**: `<h2>`, `<h3>` (serif font, proper spacing)
- **Blockquotes**: `<blockquote>` (left border, italic, muted color)
- **Images**: `<img>` (centered, responsive, max 800px, rounded corners, shadow)
- **Figures**: `<figure class="article-image">` (for images with better alignment)
- **Emphasis**: `<em>` (italic), `<strong>` (bold)
- **Paragraphs**: Proper vertical rhythm with 1.5rem bottom margin
- **Quote callouts**: Use `<p class="article-quote">` for emphasized quotes within text

### Example Article Structure

```html
<article class="container article-container animate-fade-in">
    <header class="article-header animate-slide-up">
        <h1>Article Title</h1>
        <div class="article-meta">
            <time datetime="2025-07-04">July 4, 2025</time>
        </div>
        <p class="article-subtitle"><em>Optional subtitle or tagline</em></p>
    </header>

    <div class="article-content animate-slide-up-delay">
        <blockquote>
            <p>"Opening quote" — <strong>Author</strong></p>
        </blockquote>

        <p>Article content...</p>

        <h2>Section Heading</h2>
        <p>More content...</p>

        <figure class="article-image">
            <img src="article-slug/image.png" alt="Description" loading="lazy">
        </figure>

        <p>Concluding content...</p>
    </div>

    <footer class="article-footer animate-slide-up-delay-2">
        <a href="/writings/" class="back-link">← Back to Writing</a>
    </footer>
</article>
```

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

## Performance Optimization Template

**Important**: All new HTML pages must include these performance optimizations in the `<head>` section:

```html
<!-- Performance Optimizations -->
<link rel="dns-prefetch" href="https://unpkg.com">
<link rel="preconnect" href="https://unpkg.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" fetchpriority="high">
<link rel="stylesheet" href="[relative-path]/style.css?v=2">

<!-- Lucide Icons CDN -->
<script src="https://unpkg.com/lucide@latest" defer></script>
```

**Performance Checklist for New Pages:**
- ✅ `dns-prefetch` for `unpkg.com`
- ✅ `preconnect` for `unpkg.com` with `crossorigin`
- ✅ `preconnect` for `fonts.googleapis.com` and `fonts.gstatic.com`
- ✅ `fetchpriority="high"` on font stylesheet link
- ✅ `defer` attribute on Lucide script tag
- ✅ `loading="lazy"` on all `<img>` tags (except above-the-fold images)

**Note**: Adjust the CSS path (`[relative-path]`) based on page location:
- Root pages: `style.css?v=2`
- One level deep: `../style.css?v=2`
- Two levels deep: `../../style.css?v=2`

## Icon Usage

Social media icons use Lucide Icons CDN:
```html
<script src="https://unpkg.com/lucide@latest" defer></script>
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
