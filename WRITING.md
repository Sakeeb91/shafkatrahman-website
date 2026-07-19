# Writing system

The canonical article inventory lives in `writing-manifest.js`. It is the source of truth for article paths, dates, types, visible tags, and reviewed semantic relationships.

## Published inventory

| Path | Type | Tags |
| --- | --- | --- |
| `/writings/software-agents-can-actually-use.html` | Essay | AI agents, Agent-native software, MCP, AI security, Software architecture |
| `/writings/the-compute-curve-ai-progress.html` | Essay | AI infrastructure, Compute markets, Economics, Forecasting |
| `/writings/when-intelligence-enters-control-loop.html` | Essay | AI agents, Inference, AI infrastructure, Control systems |
| `/writings/ai-adhd-advantage-real-playbook.html` | Essay | AI, Neurodiversity, Productivity, Creativity |
| `/writings/why-agents-need-cli.html` | Essay | AI agents, CLI, MCP, AI engineering |
| `/writings/window-frost-thermodynamics/frost-crystals-physics.html` | Essay | Physics, Thermodynamics, Pattern formation |
| `/writings/research/data-center-investment-analysis.html` | Research | Data centers, AI infrastructure, Investment research, Private equity |
| `/writings/art-intelligence-patterns.html` | Essay | Philosophy, Consciousness, Art, Intelligence |
| `/writings/maiutics.html` | Essay | Philosophy, Human-AI collaboration, Creativity |
| `/writings/research/ai_infrastructure_analysis.html` | Research | AI infrastructure, Semiconductors, Investment research, Economics |

## Adding or updating an article

1. Preserve the public article path and existing prose.
2. Add or update the entry in `writing-manifest.js`.
   - Keep `tags` specific and consistent with the existing registry.
   - Propose `related` article paths based on substantive conceptual overlap.
   - Treat `related` as editorial metadata: review every proposed relationship before publishing it.
3. Add the article to `/writings/index.html` with its date, title, and excerpt.
4. Use the shared article structure: `.article-hero`, optional lead image, `main`, `.article-email-capture`, and `.article-footer`.
5. Include `/writing-manifest.js` before `/theme-toggle.js`.
6. Keep native MathML or KaTeX fallback behavior intact when equations are present.
7. Run `node scripts/generate-writing-graph.mjs` to regenerate `writing-graph-data.js`.
8. Run `node scripts/generate-writing-graph.mjs --check` to validate paths, relationships, duplicate nodes, and generated-data freshness.
9. Verify the article page, writing index tags and filters, homepage references, structured metadata, graph connections, mobile layout, and both themes.

The shared shell injects visible article tags and `article:tag` metadata from the manifest. The writing index and writing graph read the same registry, so tag changes propagate without editing multiple tag lists. The graph generator also scans published article HTML for explicit links to other registered articles; those edges are automatic and do not belong in `related`.

## Writing graph interaction

The graph uses the locally served `vendor-d3.v7.min.js` bundle for force simulation and drag handling. Do not replace it with a CDN reference. The generated graph data remains framework-independent and the rendered interface remains an accessible SVG with a semantic list fallback.

Its local/global model follows the interaction conventions of the MIT-licensed [Quartz community graph](https://github.com/quartz-community/graph): a one-hop local view beside the current article, a global view for the complete network, hover-neighbour focus, visited-article state, radial global layout, and a Ctrl/Cmd + G shortcut. The renderer remains SVG rather than adopting Quartz's PixiJS canvas so every node keeps its keyboard focus, accessible name, and button semantics.

- The default view contains articles and article-to-article relationships only.
- Hovering or focusing an article previews its tags. Selecting an article with click or Space keeps those tags visible.
- Selecting a tag, including through the Find field or list fallback, reveals its connected articles.
- Enter opens a focused article. Arrow keys move and pin a focused node; Shift plus an arrow moves it farther.
- Pointer drag reheats the simulation and pins the node on release. Double-click releases a pinned node.
- Reset clears selections, pinned positions, pan, and zoom before restoring the deterministic generated layout.
- Reduced-motion mode computes the settled force layout synchronously and does not run live animation.
- The corner graph is limited to the current article, directly related articles, and their interaction-only tags.
- Ctrl/Cmd + G opens or closes the global graph unless focus is inside a text-entry control.

## Writing graph relationship rules

- Every manifest entry becomes an article node.
- Every unique tag becomes a tag node connected to its articles.
- Links between registered article pages become internal-link edges automatically.
- `related` creates a reviewed semantic edge for connections that are meaningful even without a direct link or shared tag.
- Do not add a relationship only to make the graph look denser. Empty `related` arrays are valid.
- Never edit `writing-graph-data.js` directly; regenerate it from the manifest and article HTML.
