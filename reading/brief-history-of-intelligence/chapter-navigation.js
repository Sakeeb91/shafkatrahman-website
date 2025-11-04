// Chapter Navigation Handler
(function() {
    'use strict';

    // Chapter metadata - update this when adding new chapters
    const CHAPTERS = [
        { number: 1, title: 'Chapter 1: The World Before Brains' },
        { number: 2, title: 'Chapter 2: The Birth of Good and Bad' }
        // Add more chapters here as they're added to the page
    ];

    // Get all chapter links and content
    const chapterLinks = document.querySelectorAll('.chapter-link[href^="#chapter-"]');
    const chapterContents = document.querySelectorAll('.chapter-content');
    const currentChapterTitle = document.getElementById('current-chapter-title');
    const showAllButton = document.getElementById('show-all-chapters');

    // Function to update the current chapter indicator
    function updateChapterIndicator(chapterNumber) {
        const chapter = CHAPTERS.find(ch => ch.number === parseInt(chapterNumber));
        if (chapter && currentChapterTitle) {
            currentChapterTitle.textContent = chapter.title;
        }
    }

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

        // Update the chapter indicator
        updateChapterIndicator(chapterNumber);
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

    // Handle show/hide all chapters button
    if (showAllButton) {
        let isExpanded = false;
        showAllButton.addEventListener('click', function() {
            isExpanded = !isExpanded;
            const showText = this.querySelector('.show-text');
            const hideText = this.querySelector('.hide-text');

            if (isExpanded) {
                showText.style.display = 'none';
                hideText.style.display = 'inline';
                // In the future, this will show all chapter links
                // For now, it's just a toggle that does nothing visually
            } else {
                showText.style.display = 'inline';
                hideText.style.display = 'none';
            }
        });
    }

    // Handle prev/next navigation buttons
    const prevButtons = document.querySelectorAll('.prev-chapter');
    const nextButtons = document.querySelectorAll('.next-chapter');

    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevChapter = this.getAttribute('data-prev');
            if (prevChapter) {
                window.location.hash = `#chapter-${prevChapter}`;
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextChapter = this.getAttribute('data-next');
            if (nextChapter) {
                window.location.hash = `#chapter-${nextChapter}`;
            }
        });
    });

    // Optional: Keyboard navigation (arrow keys)
    document.addEventListener('keydown', function(e) {
        // Only handle arrow keys if not in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const currentHash = window.location.hash;
        if (!currentHash.startsWith('#chapter-')) return;

        const currentChapter = parseInt(currentHash.replace('#chapter-', ''));

        if (e.key === 'ArrowLeft' && currentChapter > 1) {
            // Go to previous chapter
            window.location.hash = `#chapter-${currentChapter - 1}`;
        } else if (e.key === 'ArrowRight' && currentChapter < CHAPTERS.length) {
            // Go to next chapter
            window.location.hash = `#chapter-${currentChapter + 1}`;
        }
    });

    // Listen for hash changes (browser back/forward buttons)
    window.addEventListener('hashchange', handleHashChange);

    // Initialize on page load
    handleHashChange();
})();
