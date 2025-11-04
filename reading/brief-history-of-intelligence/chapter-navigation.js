// Chapter Navigation Handler
(function() {
    'use strict';

    // Get all chapter links and content
    const chapterLinks = document.querySelectorAll('.chapter-link[href^="#chapter-"]');
    const chapterContents = document.querySelectorAll('.chapter-content');

    // Function to show a specific chapter
    function showChapter(chapterNumber) {
        // Remove active class from all contents and links
        chapterContents.forEach(content => {
            content.classList.remove('active');
        });
        chapterLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to the selected chapter
        const targetContent = document.querySelector(`.chapter-content[data-chapter="${chapterNumber}"]`);
        const targetLink = document.querySelector(`.chapter-link[href="#chapter-${chapterNumber}"]`);

        if (targetContent) {
            targetContent.classList.add('active');
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // Handle hash changes (browser back/forward, direct links)
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#chapter-')) {
            const chapterNumber = hash.replace('#chapter-', '');
            showChapter(chapterNumber);
        } else {
            // Default to chapter 1 if no hash
            showChapter('1');
            window.location.hash = '#chapter-1';
        }
    }

    // Add click event listeners to chapter links
    chapterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const hash = this.getAttribute('href');
            window.location.hash = hash;
        });
    });

    // Listen for hash changes (browser back/forward buttons)
    window.addEventListener('hashchange', handleHashChange);

    // Initialize on page load
    handleHashChange();
})();
