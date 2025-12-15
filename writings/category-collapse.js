// Category Collapse Functionality for Writing Index
(function() {
    'use strict';

    const STORAGE_KEY = 'writings-expanded-categories';
    const ANIMATION_DURATION = 400;

    const categorySections = document.querySelectorAll('.category-section');

    function loadExpandedState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    function saveExpandedState(categoryId, isExpanded) {
        try {
            const state = loadExpandedState();
            state[categoryId] = isExpanded;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save category state');
        }
    }

    function toggleCategory(header, content, shouldExpand) {
        const isExpanding = shouldExpand !== undefined ? shouldExpand : content.hasAttribute('hidden');
        const categoryId = header.closest('.category-section').getAttribute('data-category');

        if (isExpanding) {
            header.setAttribute('aria-expanded', 'true');
            content.removeAttribute('hidden');
            saveExpandedState(categoryId, true);

            if (window.lucide) {
                lucide.createIcons();
            }
        } else {
            header.setAttribute('aria-expanded', 'false');

            setTimeout(() => {
                content.setAttribute('hidden', '');
            }, ANIMATION_DURATION);

            saveExpandedState(categoryId, false);
        }
    }

    categorySections.forEach(section => {
        const header = section.querySelector('.category-header');
        const content = section.querySelector('.category-content');
        const categoryId = section.getAttribute('data-category');

        if (!header || !content) return;

        const savedState = loadExpandedState();
        const shouldBeExpanded = savedState[categoryId] === true;

        if (shouldBeExpanded) {
            toggleCategory(header, content, true);
        }

        header.addEventListener('click', () => {
            toggleCategory(header, content);
        });

        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(header, content);
            }
        });
    });

    if (window.lucide) {
        lucide.createIcons();
    }
})();
