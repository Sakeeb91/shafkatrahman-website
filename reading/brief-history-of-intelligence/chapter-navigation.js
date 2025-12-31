// Chapter Navigation Handler
(function() {
    'use strict';

    // Chapter metadata - all 22 chapters + conclusion
    const CHAPTERS = [
        { id: '1', title: 'The World Before Brains', breakthrough: 1 },
        { id: '2', title: 'The Birth of Good and Bad', breakthrough: 1 },
        { id: '3', title: 'The Origin of Emotion', breakthrough: 1 },
        { id: '4', title: 'Associating, Predicting, and the Dawn of Learning', breakthrough: 1 },
        { id: '5', title: 'The Cambrian Explosion', breakthrough: 2 },
        { id: '6', title: 'The Evolution of Temporal Difference Learning', breakthrough: 2 },
        { id: '7', title: 'The Problems of Pattern Recognition', breakthrough: 2 },
        { id: '8', title: 'Why Life Got Curious', breakthrough: 2 },
        { id: '9', title: 'The First Model of the World', breakthrough: 2 },
        { id: '10', title: 'The Neural Dark Ages', breakthrough: 2 },
        { id: '11', title: 'Generative Models and the Neocortical Revolution', breakthrough: 3 },
        { id: '12', title: 'Mice in the Imaginarium', breakthrough: 3 },
        { id: '13', title: 'Model-Based Reinforcement Learning', breakthrough: 3 },
        { id: '14', title: 'The Secret to Dishwashing Robots', breakthrough: 3 },
        { id: '15', title: 'The Arms Race for Political Savvy', breakthrough: 4 },
        { id: '16', title: 'How to Model Other Minds', breakthrough: 4 },
        { id: '17', title: 'Monkey Hammers and Self-Driving Cars', breakthrough: 4 },
        { id: '18', title: "Why Rats Can't Go Grocery Shopping", breakthrough: 4 },
        { id: '19', title: 'The Search for Human Uniqueness', breakthrough: 5 },
        { id: '20', title: 'Language in the Brain', breakthrough: 5 },
        { id: '21', title: 'The Perfect Storm', breakthrough: 5 },
        { id: '22', title: 'ChatGPT and the Window into the Mind', breakthrough: 5 },
        { id: 'conclusion', title: 'The Sixth Breakthrough', breakthrough: 6 }
    ];

    const BREAKTHROUGHS = {
        1: { name: 'Steering', color: '#6366f1' },
        2: { name: 'Reinforcing', color: '#8b5cf6' },
        3: { name: 'Simulating', color: '#a855f7' },
        4: { name: 'Mentalizing', color: '#d946ef' },
        5: { name: 'Speaking', color: '#ec4899' },
        6: { name: 'The Sixth', color: '#f43f5e' }
    };

    // DOM elements
    const chapterLinks = document.querySelectorAll('.chapter-link');
    const chapterContents = document.querySelectorAll('.chapter-content');
    const currentChapterTitle = document.getElementById('current-chapter-title');
    const currentChapterNumber = document.getElementById('current-chapter-number');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Function to get chapter data
    function getChapter(chapterId) {
        return CHAPTERS.find(ch => ch.id === String(chapterId));
    }

    // Function to get chapter index
    function getChapterIndex(chapterId) {
        return CHAPTERS.findIndex(ch => ch.id === String(chapterId));
    }

    // Function to update progress bar
    function updateProgress(chapterId) {
        const index = getChapterIndex(chapterId);
        if (index >= 0 && progressFill && progressText) {
            const progress = ((index + 1) / CHAPTERS.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${index + 1} of ${CHAPTERS.length}`;
        }
    }

    // Function to update the current chapter indicator
    function updateChapterIndicator(chapterId) {
        const chapter = getChapter(chapterId);
        if (chapter) {
            if (currentChapterTitle) {
                currentChapterTitle.textContent = chapter.title;
            }
            if (currentChapterNumber) {
                currentChapterNumber.textContent = chapter.id === 'conclusion' ? '∞' : chapter.id;
                // Update color based on breakthrough
                const breakthrough = BREAKTHROUGHS[chapter.breakthrough];
                if (breakthrough) {
                    currentChapterNumber.style.background = `linear-gradient(135deg, ${breakthrough.color}, ${breakthrough.color}dd)`;
                }
            }
            updateProgress(chapterId);
        }
    }

    // Function to show a specific chapter
    function showChapter(chapterId) {
        // Remove active class from all contents and links
        chapterContents.forEach(content => {
            content.classList.remove('active');
        });
        chapterLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to the selected chapter
        const targetContent = document.querySelector(`.chapter-content[data-chapter="${chapterId}"]`);
        const targetLink = document.querySelector(`.chapter-link[data-chapter="${chapterId}"]`);

        if (targetContent) {
            targetContent.classList.add('active');
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (targetLink) {
            targetLink.classList.add('active');
            // Scroll the link into view within the container
            targetLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // Update the chapter indicator
        updateChapterIndicator(chapterId);
    }

    // Handle hash changes (browser back/forward, direct links)
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#chapter-')) {
            const chapterId = hash.replace('#chapter-', '');
            showChapter(chapterId);
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
            const chapterId = this.getAttribute('data-chapter');
            window.location.hash = `#chapter-${chapterId}`;
        });
    });

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

    // Keyboard navigation (arrow keys)
    document.addEventListener('keydown', function(e) {
        // Only handle arrow keys if not in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const currentHash = window.location.hash;
        if (!currentHash.startsWith('#chapter-')) return;

        const currentChapterId = currentHash.replace('#chapter-', '');
        const currentIndex = getChapterIndex(currentChapterId);

        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            // Go to previous chapter
            window.location.hash = `#chapter-${CHAPTERS[currentIndex - 1].id}`;
        } else if (e.key === 'ArrowRight' && currentIndex < CHAPTERS.length - 1) {
            // Go to next chapter
            window.location.hash = `#chapter-${CHAPTERS[currentIndex + 1].id}`;
        }
    });

    // Listen for hash changes (browser back/forward buttons)
    window.addEventListener('hashchange', handleHashChange);

    // Initialize on page load
    handleHashChange();
})();
