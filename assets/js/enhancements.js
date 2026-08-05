/**
 * Business Card Enhancements
 * Adds interactive elements and subtle animations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initRoleInteractions();
    addCardInteractivity();
});

/**
 * Creates floating particle effects in the background
 */
function createParticles() {
    const wrapper = document.getElementById('wrapper');
    if (!wrapper) return; // guard: #wrapper may not exist in future refactors

    const particleCount = 15; // Keep number low for performance
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomize particle properties for natural look
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        const moveX = (Math.random() - 0.5) * 100;
        const moveY = (Math.random() - 0.5) * 100;
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Set styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.setProperty('--tx', `${moveX}px`);
        particle.style.setProperty('--ty', `${moveY}px`);
        particle.style.opacity = opacity;
        
        // Add to DOM
        wrapper.appendChild(particle);
    }
}

/**
 * Initialises role text interactions.
 * Hover colour is handled entirely in CSS (.role-text[data-skill]:hover).
 * This function is kept as a no-op stub so call-sites don't need updating
 * if behaviour is added back later (e.g. analytics, sound, haptics).
 */
function initRoleInteractions() {
    // CSS-only hover — no JS needed. Stub retained for extensibility.
}

/**
 * Adds interactive effects to business card
 * Note: mouse-cursor tilt (rotateZ/parallax) intentionally removed —
 * the card should feel stable and grounded, not reactive to cursor drift.
 */
function addCardInteractivity() {
    // Tilt removed. Reserved for future focus-ring or entrance animation enhancements.
}
