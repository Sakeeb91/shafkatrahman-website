/* Shared workspace shell, automatic theme sync, and article navigation. */
(function () {
    'use strict';

    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let userTheme = localStorage.getItem('theme');
    let localPreviewTheme = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
        ? new URLSearchParams(window.location.search).get('theme')
        : null;

    function syncTheme(event) {
        root.dataset.theme = localPreviewTheme === 'dark' || localPreviewTheme === 'light'
            ? localPreviewTheme
            : userTheme === 'dark' || userTheme === 'light'
                ? userTheme
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
                    <span class="nav-name">Shafkat Rahman</span>
                </a>
                <nav class="nav-links" id="primary-links" aria-label="Primary navigation">
                    ${destinations.map(([label, href, active]) => `<a class="nav-link${active ? ' nav-link-active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
                </nav>
                <button class="theme-switch" type="button" role="switch" aria-checked="${root.dataset.theme === 'dark'}">
                    <span class="theme-switch-label" aria-hidden="true">Theme</span>
                    <span class="theme-switch-control" aria-hidden="true"><span class="theme-switch-thumb"></span></span>
                </button>
                <button class="nav-hamburger" type="button" aria-controls="primary-links" aria-expanded="false">
                    <span class="menu-label">Menu</span>
                    <span class="menu-close-label">Close</span>
                </button>
                <div class="nav-utility" aria-label="Elsewhere">
                    <a href="https://www.linkedin.com/in/shafkat-rahman/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a href="https://github.com/Sakeeb91" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://x.com/Sakeeb91" target="_blank" rel="noopener noreferrer">X</a>
                </div>
            </div>`;

        const toggle = nav.querySelector('.nav-hamburger');
        const links = nav.querySelector('.nav-links');
        const themeSwitch = nav.querySelector('.theme-switch');

        function updateThemeSwitch() {
            const dark = root.dataset.theme === 'dark';
            themeSwitch.setAttribute('aria-checked', String(dark));
            themeSwitch.setAttribute('aria-label', `Use ${dark ? 'light' : 'dark'} theme`);
            themeSwitch.setAttribute('title', `Use ${dark ? 'light' : 'dark'} theme`);
        }

        updateThemeSwitch();
        systemTheme.addEventListener('change', updateThemeSwitch);
        function toggleTheme() {
            localPreviewTheme = null;
            userTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', userTheme);
            syncTheme();
            updateThemeSwitch();
        }
        themeSwitch.addEventListener('click', toggleTheme);
        themeSwitch.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                toggleTheme();
            }
        });

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
    const manifest = Array.isArray(window.WRITING_MANIFEST) ? window.WRITING_MANIFEST : [];
    const currentArticle = manifest.find((entry) => entry.path === window.location.pathname);

    function renderTags(tags, className) {
        const list = document.createElement('ul');
        list.className = className;
        list.setAttribute('aria-label', 'Article tags');
        tags.forEach((tag) => {
            const item = document.createElement('li');
            item.textContent = tag;
            list.appendChild(item);
        });
        return list;
    }

    if (currentArticle) {
        document.querySelectorAll('meta[property="article:tag"]').forEach((meta) => meta.remove());
        currentArticle.tags.forEach((tag) => {
            const meta = document.createElement('meta');
            meta.setAttribute('property', 'article:tag');
            meta.setAttribute('content', tag);
            document.head.appendChild(meta);
        });

        document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
            try {
                const data = JSON.parse(script.textContent);
                if (data['@type'] === 'Article') {
                    data.keywords = currentArticle.tags;
                    script.textContent = JSON.stringify(data);
                }
            } catch (error) {
                console.warn('Could not synchronize article tags with structured data.');
            }
        });

        const hero = document.querySelector('.article-hero');
        if (hero) {
            if (!hero.querySelector('.article-date')) {
                const date = document.createElement('time');
                date.className = 'article-date';
                date.dateTime = currentArticle.date;
                date.textContent = new Intl.DateTimeFormat('en-CA', {
                    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                }).format(new Date(`${currentArticle.date}T00:00:00Z`));
                hero.appendChild(date);
            }
            hero.appendChild(renderTags(currentArticle.tags, 'article-tags'));
        }
    }

    document.querySelectorAll('.writing-item').forEach((item) => {
        const link = item.querySelector('.writing-link');
        if (!link) return;
        const article = manifest.find((entry) => entry.path === new URL(link.href, window.location.origin).pathname);
        if (!article) return;
        item.dataset.tags = article.tags.map((tag) => tag.toLowerCase()).join('|');
        link.appendChild(renderTags(article.tags, 'writing-tags'));
    });

    document.querySelectorAll('.workspace-row a[href^="/writings/"]').forEach((link) => {
        const article = manifest.find((entry) => entry.path === new URL(link.href, window.location.origin).pathname);
        const row = link.closest('.workspace-row');
        if (article && row) row.appendChild(renderTags(article.tags.slice(0, 3), 'workspace-tags'));
    });

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
