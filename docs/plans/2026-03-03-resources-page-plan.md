# Resources Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a card-grid Resources page to shafkatrahman.com for curated AI/Claude learning resources, with navigation updates across the site.

**Architecture:** New `/resources/index.html` page using responsive CSS Grid cards, organized by category (Videos, Repos, Guides, Books, Papers). New CSS classes added to the existing `style.css`. Navigation updated on all 6 pages that use the global nav bar.

**Tech Stack:** Vanilla HTML, CSS (Grid + custom properties), Lucide Icons (CDN)

---

### Task 1: Add Resource Card Grid CSS to style.css

**Files:**
- Modify: `style.css` (append before final closing — currently ends at line 2286)

**Step 1: Add the resource page styles**

Append the following CSS to the end of `style.css`:

```css
/* ==================== */
/* Resources Page */
/* Card Grid Layout */
/* ==================== */

.resources-page {
    width: 100%;
}

.resources-container {
    max-width: min(56rem, 100%);
}

.resources-header {
    margin-bottom: 3rem;
}

.resources-header h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 500;
    margin: 0;
}

.resources-intro {
    color: var(--muted-foreground);
    font-size: 1.0625rem;
    margin-top: 0.75rem;
}

/* Category sections */
.resource-category {
    margin-bottom: 3rem;
}

.resource-category-header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
}

.resource-category-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0;
    color: var(--foreground);
}

.resource-category-count {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    font-weight: 500;
}

/* Card grid */
.resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

/* Individual card */
.resource-card {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--background);
    color: var(--foreground);
    text-decoration: none;
    transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
}

.resource-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    color: var(--foreground);
    text-decoration: none;
}

.resource-card:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

/* Card header: icon + domain */
.resource-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
}

.resource-card-header .resource-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

/* Card title */
.resource-card-title {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.4;
    margin: 0;
    color: var(--foreground);
}

/* Card description */
.resource-card-description {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    line-height: 1.5;
    margin: 0;
}

/* External link indicator */
.resource-card-external {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 14px;
    height: 14px;
    color: var(--muted-foreground);
    opacity: 0;
    transition: opacity 200ms ease;
}

.resource-card:hover .resource-card-external {
    opacity: 0.6;
}

/* Mobile responsive */
@media (max-width: 640px) {
    .resources-grid {
        grid-template-columns: 1fr;
    }

    .resource-card {
        padding: 1rem 1.25rem;
    }

    .resource-category {
        margin-bottom: 2.5rem;
    }

    .resource-category-title {
        font-size: 1.25rem;
    }
}
```

**Step 2: Commit**

```bash
git add style.css
git commit -m "$(cat <<'EOF'
Add resource card grid CSS styles

- Card grid layout with responsive columns (auto-fill, minmax 280px)
- Hover lift effect with border highlight and shadow
- Category section headers with count badges
- External link indicator on hover
- Mobile responsive (single column at 640px)
EOF
)"
```

---

### Task 2: Create the Resources Page HTML

**Files:**
- Create: `resources/index.html`

**Step 1: Create the resources directory**

```bash
mkdir -p resources
```

**Step 2: Create the resources index page**

Create `resources/index.html` with the full HTML content below. This contains all 25 resources from the Google Doc organized into 5 categories.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Curated AI and Claude learning resources — videos, repos, guides, books, and papers.">
    <title>Resources — Shafkat Rahman</title>

    <!-- SEO Meta Tags -->
    <meta name="author" content="Shafkat Rahman">
    <meta name="keywords" content="Shafkat Rahman, AI resources, Claude, Anthropic, machine learning, tutorials, guides">
    <link rel="canonical" href="https://shafkatrahman.com/resources/">

    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://shafkatrahman.com/resources/">
    <meta property="og:title" content="Resources — Shafkat Rahman">
    <meta property="og:description" content="Curated tools, guides, and references for building with AI.">
    <meta property="og:site_name" content="Shafkat Rahman">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@Sakeeb91">
    <meta name="twitter:creator" content="@Sakeeb91">
    <meta name="twitter:title" content="Resources — Shafkat Rahman">
    <meta name="twitter:description" content="Curated tools, guides, and references for building with AI.">

    <link rel="dns-prefetch" href="https://unpkg.com">
    <link rel="preconnect" href="https://unpkg.com" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" fetchpriority="high">
    <link rel="stylesheet" href="../style.css?v=7">
    <script>document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');</script>

    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest" defer></script>
</head>
<body>
    <!-- Theme Toggle Button -->
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
        <i data-lucide="moon" class="moon-icon"></i>
        <i data-lucide="sun" class="sun-icon"></i>
    </button>

    <header class="site-nav" aria-label="Primary">
        <div class="container nav-inner">
            <a class="nav-link" href="/">Home</a>
            <a class="nav-link" href="/writings/">Writing</a>
            <a class="nav-link" href="/reading/">Reading</a>
            <a class="nav-link nav-link-active" href="/resources/">Resources</a>
        </div>
    </header>

    <main class="resources-page">
        <div class="container resources-container animate-fade-in">
            <div class="resources-header animate-slide-up">
                <h1>Resources</h1>
                <p class="resources-intro">Curated tools, guides, and references for building with AI.</p>
            </div>

            <div class="animate-slide-up-delay">

                <!-- Videos -->
                <section class="resource-category">
                    <div class="resource-category-header">
                        <h2 class="resource-category-title">Videos</h2>
                        <span class="resource-category-count">6</span>
                    </div>
                    <div class="resources-grid">
                        <a href="https://www.youtube.com/watch?v=6eBSHbLKuN0" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="play-circle" class="resource-icon" aria-hidden="true"></i>
                                <span>youtube.com</span>
                            </div>
                            <h3 class="resource-card-title">Mastering Claude Code in 30 Minutes</h3>
                            <p class="resource-card-description">Comprehensive walkthrough of Claude Code's core features and workflows.</p>
                        </a>

                        <a href="https://www.youtube.com/watch?v=KrKhfm2Xuho" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="play-circle" class="resource-icon" aria-hidden="true"></i>
                                <span>youtube.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude Full Course — Build & Automate Anything</h3>
                            <p class="resource-card-description">One-hour course covering Claude from basics to full automation workflows.</p>
                        </a>

                        <a href="https://www.youtube.com/watch?v=9vM4p9NN0Ts" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="play-circle" class="resource-icon" aria-hidden="true"></i>
                                <span>youtube.com</span>
                            </div>
                            <h3 class="resource-card-title">36 Claude Tips for Beginners</h3>
                            <p class="resource-card-description">Practical tips to go from beginner to power user fast.</p>
                        </a>

                        <a href="https://www.youtube.com/playlist?list=PLtPgUfajvh_YNdUozVRM15RLYAMG5x_h6" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="play-circle" class="resource-icon" aria-hidden="true"></i>
                                <span>youtube.com</span>
                            </div>
                            <h3 class="resource-card-title">Automate Any Task Using Claude</h3>
                            <p class="resource-card-description">Playlist of full workflow automation tutorials with Claude.</p>
                        </a>

                        <a href="https://www.youtube.com/watch?v=WGbjP8q79i4" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="play-circle" class="resource-icon" aria-hidden="true"></i>
                                <span>youtube.com</span>
                            </div>
                            <h3 class="resource-card-title">Ultimate Claude 4.1 Guide 2026</h3>
                            <p class="resource-card-description">Deep dive into Claude 4.1 capabilities and advanced usage patterns.</p>
                        </a>

                        <a href="https://www.youtube.com/watch?v=6eBSHbLKuN0" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="play-circle" class="resource-icon" aria-hidden="true"></i>
                                <span>youtube.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude Code Best Practices</h3>
                            <p class="resource-card-description">Official best practices for writing effective code with Claude.</p>
                        </a>
                    </div>
                </section>

                <!-- Repos -->
                <section class="resource-category">
                    <div class="resource-category-header">
                        <h2 class="resource-category-title">Repos</h2>
                        <span class="resource-category-count">8</span>
                    </div>
                    <div class="resources-grid">
                        <a href="https://github.com/anthropics/claude-code" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/anthropics</span>
                            </div>
                            <h3 class="resource-card-title">Claude Code</h3>
                            <p class="resource-card-description">Official CLI tool for agentic coding with Claude.</p>
                        </a>

                        <a href="https://github.com/anthropics/claude-cookbooks" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/anthropics</span>
                            </div>
                            <h3 class="resource-card-title">Claude Cookbooks</h3>
                            <p class="resource-card-description">Official recipe collection for common Claude integration patterns.</p>
                        </a>

                        <a href="https://github.com/travisvn/awesome-claude-skills" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/travisvn</span>
                            </div>
                            <h3 class="resource-card-title">Awesome Claude Skills</h3>
                            <p class="resource-card-description">Community-curated list of skills and extensions for Claude Code.</p>
                        </a>

                        <a href="https://github.com/anthropics/claude-agent-sdk" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/anthropics</span>
                            </div>
                            <h3 class="resource-card-title">Claude Agent SDK</h3>
                            <p class="resource-card-description">SDK for building custom autonomous agents powered by Claude.</p>
                        </a>

                        <a href="https://github.com/obra/superpowers" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/obra</span>
                            </div>
                            <h3 class="resource-card-title">Superpowers for Claude</h3>
                            <p class="resource-card-description">Advanced skills and workflows that extend Claude Code's capabilities.</p>
                        </a>

                        <a href="https://github.com/travisvn/claude-d3js-skill" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/travisvn</span>
                            </div>
                            <h3 class="resource-card-title">Claude D3.js Skill</h3>
                            <p class="resource-card-description">Skill for generating interactive D3.js data visualizations with Claude.</p>
                        </a>

                        <a href="https://github.com/travisvn/loki-mode" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/travisvn</span>
                            </div>
                            <h3 class="resource-card-title">Loki Mode</h3>
                            <p class="resource-card-description">Unrestricted creative mode skill for Claude Code.</p>
                        </a>

                        <a href="https://github.com/yusufkaraaslan/Skill_Seekers" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="github" class="resource-icon" aria-hidden="true"></i>
                                <span>github.com/yusufkaraaslan</span>
                            </div>
                            <h3 class="resource-card-title">Skill Seekers</h3>
                            <p class="resource-card-description">Discovery tool for finding and evaluating Claude Code skills.</p>
                        </a>
                    </div>
                </section>

                <!-- Guides -->
                <section class="resource-category">
                    <div class="resource-category-header">
                        <h2 class="resource-category-title">Guides</h2>
                        <span class="resource-category-count">5</span>
                    </div>
                    <div class="resources-grid">
                        <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book-open" class="resource-icon" aria-hidden="true"></i>
                                <span>platform.claude.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude Prompting Best Practices</h3>
                            <p class="resource-card-description">Official guide to writing effective prompts for Claude.</p>
                        </a>

                        <a href="https://code.claude.com/docs/en/best-practices" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book-open" class="resource-icon" aria-hidden="true"></i>
                                <span>code.claude.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude Code Best Practices</h3>
                            <p class="resource-card-description">Official documentation for getting the most out of Claude Code.</p>
                        </a>

                        <a href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book-open" class="resource-icon" aria-hidden="true"></i>
                                <span>resources.anthropic.com</span>
                            </div>
                            <h3 class="resource-card-title">The Complete Guide to Building Skills</h3>
                            <p class="resource-card-description">Anthropic's official guide to creating custom Claude Code skills.</p>
                        </a>

                        <a href="https://www.anthropic.com/constitution" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book-open" class="resource-icon" aria-hidden="true"></i>
                                <span>anthropic.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude's Constitution</h3>
                            <p class="resource-card-description">The values and principles that guide Claude's behavior.</p>
                        </a>

                        <a href="https://www.claudeinsider.com/docs/getting-started" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book-open" class="resource-icon" aria-hidden="true"></i>
                                <span>claudeinsider.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude Insider Documentation</h3>
                            <p class="resource-card-description">Community-maintained getting started guide and tips.</p>
                        </a>
                    </div>
                </section>

                <!-- Books -->
                <section class="resource-category">
                    <div class="resource-category-header">
                        <h2 class="resource-category-title">Books</h2>
                        <span class="resource-category-count">5</span>
                    </div>
                    <div class="resources-grid">
                        <a href="https://www.amazon.com/Mastering-Claude-AI-Practical-Journey/dp/B0FLJFY8BD" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book" class="resource-icon" aria-hidden="true"></i>
                                <span>amazon.com</span>
                            </div>
                            <h3 class="resource-card-title">Mastering Claude AI</h3>
                            <p class="resource-card-description">Practical journey from first prompts to professional-grade usage.</p>
                        </a>

                        <a href="https://www.chirpbooks.com/audiobooks/claude-llm-by-anthropic-by-et-tu-code" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book" class="resource-icon" aria-hidden="true"></i>
                                <span>chirpbooks.com</span>
                            </div>
                            <h3 class="resource-card-title">Claude LLM by Anthropic</h3>
                            <p class="resource-card-description">Audiobook overview of Claude's architecture and capabilities.</p>
                        </a>

                        <a href="https://www.oreilly.com/library/view/ai-engineering/9781098166298/" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book" class="resource-icon" aria-hidden="true"></i>
                                <span>oreilly.com</span>
                            </div>
                            <h3 class="resource-card-title">AI Engineering</h3>
                            <p class="resource-card-description">Chip Huyen's guide to building production AI systems.</p>
                        </a>

                        <a href="https://www.amazon.com/Designing-Machine-Learning-Systems-Production-Ready/dp/1098107969" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book" class="resource-icon" aria-hidden="true"></i>
                                <span>amazon.com</span>
                            </div>
                            <h3 class="resource-card-title">Designing Machine Learning Systems</h3>
                            <p class="resource-card-description">Production-ready ML system design by Chip Huyen.</p>
                        </a>

                        <a href="https://www.amazon.com/Self-Aware-Being-Claude-AI/dp/B0FLJFY8BD" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="book" class="resource-icon" aria-hidden="true"></i>
                                <span>amazon.com</span>
                            </div>
                            <h3 class="resource-card-title">A Self-Aware Being by Claude AI</h3>
                            <p class="resource-card-description">Philosophical exploration of AI consciousness written by Claude.</p>
                        </a>
                    </div>
                </section>

                <!-- Papers -->
                <section class="resource-category">
                    <div class="resource-category-header">
                        <h2 class="resource-category-title">Papers</h2>
                        <span class="resource-category-count">6</span>
                    </div>
                    <div class="resources-grid">
                        <a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="file-text" class="resource-icon" aria-hidden="true"></i>
                                <span>arxiv.org</span>
                            </div>
                            <h3 class="resource-card-title">ReAct: Reasoning and Acting in Language Models</h3>
                            <p class="resource-card-description">Synergizing reasoning and acting for general task solving in LLMs.</p>
                        </a>

                        <a href="https://arxiv.org/abs/2304.03442" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="file-text" class="resource-icon" aria-hidden="true"></i>
                                <span>arxiv.org</span>
                            </div>
                            <h3 class="resource-card-title">Generative Agents</h3>
                            <p class="resource-card-description">Interactive simulacra of human behavior using LLM-powered agents.</p>
                        </a>

                        <a href="https://arxiv.org/abs/2302.04761" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="file-text" class="resource-icon" aria-hidden="true"></i>
                                <span>arxiv.org</span>
                            </div>
                            <h3 class="resource-card-title">Toolformer</h3>
                            <p class="resource-card-description">Teaching language models to use tools autonomously.</p>
                        </a>

                        <a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="file-text" class="resource-icon" aria-hidden="true"></i>
                                <span>arxiv.org</span>
                            </div>
                            <h3 class="resource-card-title">Chain-of-Thought Prompting</h3>
                            <p class="resource-card-description">Eliciting reasoning in large language models via chain-of-thought.</p>
                        </a>

                        <a href="https://arxiv.org/abs/2305.10601" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="file-text" class="resource-icon" aria-hidden="true"></i>
                                <span>arxiv.org</span>
                            </div>
                            <h3 class="resource-card-title">Tree of Thoughts</h3>
                            <p class="resource-card-description">Deliberate problem solving with large language models using tree search.</p>
                        </a>

                        <a href="https://arxiv.org/abs/2303.11366" target="_blank" rel="noopener noreferrer" class="resource-card">
                            <i data-lucide="external-link" class="resource-card-external" aria-hidden="true"></i>
                            <div class="resource-card-header">
                                <i data-lucide="file-text" class="resource-icon" aria-hidden="true"></i>
                                <span>arxiv.org</span>
                            </div>
                            <h3 class="resource-card-title">Reflexion</h3>
                            <p class="resource-card-description">Language agents with verbal reinforcement learning.</p>
                        </a>
                    </div>
                </section>

            </div>
        </div>
    </main>

    <script src="../theme-toggle.js" defer></script>
</body>
</html>
```

**Step 3: Commit**

```bash
git add resources/index.html
git commit -m "$(cat <<'EOF'
Add Resources page with 25 curated AI/Claude resources

Card grid layout with 5 categories:
- Videos (6): tutorials and courses
- Repos (8): GitHub repositories and tools
- Guides (5): documentation and best practices
- Books (5): books and audiobooks
- Papers (6): foundational AI research papers
EOF
)"
```

---

### Task 3: Update Navigation on All Pages

**Files:**
- Modify: `index.html` (line 85)
- Modify: `writings/index.html` (line 50)
- Modify: `reading/index.html` (line 50)
- Modify: `reading/brief-history-of-intelligence/index.html` (line 365)
- Modify: `404.html` (line 49)

**Step 1: Add the Resources nav link to each page**

In each file, find the closing `</a>` for the Reading nav link and add the Resources link after it. The nav block should become:

```html
<a class="nav-link" href="/">Home</a>
<a class="nav-link" href="/writings/">Writing</a>
<a class="nav-link" href="/reading/">Reading</a>
<a class="nav-link" href="/resources/">Resources</a>
```

The `nav-link-active` class stays on whichever page is currently active (Home, Writing, Reading — none of them get it for Resources since the Resources page already has its own active state).

**Step 2: Bump the CSS version query parameter**

In each modified file, update the `style.css` query parameter to `?v=7` to bust the cache for the new CSS.

Pages to update:
- `index.html`: `style.css?v=3` → `style.css?v=7`
- `writings/index.html`: `../style.css?v=6` → `../style.css?v=7`
- `reading/index.html`: `../style.css?v=3` → `../style.css?v=7`
- `reading/brief-history-of-intelligence/index.html`: find current version → `?v=7`
- `404.html`: find current version → `?v=7`

**Step 3: Commit**

```bash
git add index.html writings/index.html reading/index.html reading/brief-history-of-intelligence/index.html 404.html
git commit -m "$(cat <<'EOF'
Add Resources nav link to all pages

- Add fourth nav item pointing to /resources/
- Bump CSS version to v=7 for cache busting
EOF
)"
```

---

### Task 4: Verify and Push

**Step 1: Open the page locally to verify**

```bash
open "/Users/sakeeb/Code repositories/shafkatrahman/shafkatrahman-website/resources/index.html"
```

Verify:
- Cards render in a 2-column grid on desktop
- Hover effect works (lift + border highlight + external icon appears)
- Dark/light mode toggle works
- Navigation shows all 4 links with "Resources" active
- All 25 resource links open in new tabs
- Mobile responsive (resize browser window)

**Step 2: Push to GitHub**

```bash
git push
```

**Step 3: Monitor CI/CD**

```bash
gh run list --limit 5
```

Wait for the deployment to complete, then verify at https://shafkatrahman.com/resources/
