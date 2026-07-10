/* Accessible flat filters for the writing index. */
(function () {
    'use strict';

    if (window.location.pathname !== '/writings/' && window.location.pathname !== '/writings/index.html') return;

    const list = document.querySelector('.writing-list');
    const header = document.querySelector('.writing-header');
    if (!list || !header) return;

    const entries = Array.from(list.querySelectorAll('.category-section')).flatMap((section) => {
        const kind = section.dataset.category === 'research' ? 'research' : 'essay';
        return Array.from(section.querySelectorAll('.writing-item')).map((item) => {
            item.dataset.kind = kind;
            return item;
        });
    });

    entries.sort((a, b) => {
        const first = a.querySelector('time')?.getAttribute('datetime') || '';
        const second = b.querySelector('time')?.getAttribute('datetime') || '';
        return second.localeCompare(first);
    });

    list.replaceChildren(...entries);
    list.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.className = 'writing-filters';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Filter writing by type');
    controls.innerHTML = `
        <button class="writing-filter" type="button" data-filter="all" aria-pressed="true">All</button>
        <button class="writing-filter" type="button" data-filter="essay" aria-pressed="false">Essays</button>
        <button class="writing-filter" type="button" data-filter="research" aria-pressed="false">Research</button>`;
    header.insertAdjacentElement('afterend', controls);

    controls.addEventListener('click', (event) => {
        const button = event.target.closest('.writing-filter');
        if (!button) return;
        const filter = button.dataset.filter;

        controls.querySelectorAll('.writing-filter').forEach((candidate) => {
            candidate.setAttribute('aria-pressed', String(candidate === button));
        });

        entries.forEach((item) => {
            item.hidden = filter !== 'all' && item.dataset.kind !== filter;
        });

        const visible = entries.filter((item) => !item.hidden).length;
        list.setAttribute('aria-label', `${visible} ${visible === 1 ? 'article' : 'articles'} shown`);
    });
}());
