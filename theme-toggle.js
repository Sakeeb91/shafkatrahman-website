/* Shared workspace shell, automatic theme sync, and article navigation. */
(function () {
    'use strict';

    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const localPreviewTheme = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
        ? new URLSearchParams(window.location.search).get('theme')
        : null;

    function syncTheme(event) {
        root.dataset.theme = localPreviewTheme === 'dark' || localPreviewTheme === 'light'
            ? localPreviewTheme
            : (event ? event.matches : systemTheme.matches) ? 'dark' : 'light';
    }

    syncTheme();
    systemTheme.addEventListener('change', syncTheme);

    document.querySelectorAll('.theme-toggle').forEach((button) => button.remove());

    const nav = document.querySelector('.site-nav');
    if (nav) {
        const path = window.location.pathname;
        const destinations = [
            ['Home', '/', path === '/'],
            ['Writing', '/writings/', path.startsWith('/writings/')],
            ['Reading', '/reading/', path.startsWith('/reading/')],
            ['Resources', '/resources/', path.startsWith('/resources/')],
            ['Advisory', '/advisory.html', path === '/advisory.html']
        ];

        nav.innerHTML = `
            <div class="nav-inner">
                <a class="nav-brand" href="/" aria-label="Shafkat Rahman, home">
                    <span class="nav-monogram" aria-hidden="true">SR</span>
                    <span class="nav-name">Shafkat Rahman</span>
                </a>
                <button class="nav-hamburger" type="button" aria-controls="primary-links" aria-expanded="false">
                    <span class="menu-label">Menu</span>
                    <span class="menu-close-label">Close</span>
                </button>
                <nav class="nav-links" id="primary-links" aria-label="Primary navigation">
                    ${destinations.map(([label, href, active]) => `<a class="nav-link${active ? ' nav-link-active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
                </nav>
                <div class="nav-utility" aria-label="Elsewhere">
                    <a href="https://www.linkedin.com/in/shafkat-rahman/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a href="https://github.com/Sakeeb91" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://x.com/Sakeeb91" target="_blank" rel="noopener noreferrer">X</a>
                </div>
            </div>`;

        const toggle = nav.querySelector('.nav-hamburger');
        const links = nav.querySelector('.nav-links');
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('menu-open', open);
        });
        links.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
                nav.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
                toggle.focus();
            }
        });
    }

    const articleMain = document.querySelector('.article-hero + main, .article-visual + main, .hero-figure + main');
    if (articleMain) {
        const sections = Array.from(articleMain.querySelectorAll('h2')).slice(0, 10);
        if (sections.length > 1) {
            const used = new Set();
            sections.forEach((heading, index) => {
                if (!heading.id) {
                    const base = heading.textContent.trim().toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `section-${index + 1}`;
                    let id = base;
                    let suffix = 2;
                    while (used.has(id) || document.getElementById(id)) id = `${base}-${suffix++}`;
                    heading.id = id;
                }
                used.add(heading.id);
            });

            const sectionNav = document.createElement('aside');
            sectionNav.className = 'article-section-nav';
            sectionNav.setAttribute('aria-label', 'On this page');
            sectionNav.innerHTML = `<p>On this page</p><ol>${sections.map((heading) => `<li><a href="#${heading.id}">${heading.textContent.trim()}</a></li>`).join('')}</ol>`;
            document.body.appendChild(sectionNav);
        }
    }

    if (window.lucide) window.lucide.createIcons();
}());
