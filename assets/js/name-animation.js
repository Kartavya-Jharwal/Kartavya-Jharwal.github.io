/**
 * Name Character Animation
 * Animates the name with character-by-character reveal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setup name animation with characters
    const nameElement = document.getElementById('name');
    if (nameElement) {
        const name = nameElement.textContent;
        nameElement.textContent = '';
        nameElement.setAttribute('aria-label', name);
        
        // Split name into individual characters with spans
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
            span.style.setProperty('--delay', `${1.5 + (i * 0.05)}s`);
            nameElement.appendChild(span);
        }
        
        // Remove JS animation class if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.char').forEach(char => {
                char.style.opacity = '1';
                char.style.transform = 'none';
                char.style.animationDelay = '0s';
            });
        }
    }
});
