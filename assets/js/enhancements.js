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
 * Initializes role text interactions
 */
function initRoleInteractions() {
    const roleTexts = document.querySelectorAll('.role-text');
    
    roleTexts.forEach(role => {
        // Add subtle hover animation
        role.addEventListener('mouseenter', () => {
            role.style.transform = 'translateY(-3px)';
            role.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });
        
        role.addEventListener('mouseleave', () => {
            role.style.transform = '';
            role.style.boxShadow = '';
        });
    });
}

/**
 * Adds interactive effects to business card
 */
function addCardInteractivity() {
    const card = document.querySelector('.business-card');
    if (!card) return;
    
    // Subtle parallax effect on mouse movement
    document.addEventListener('mousemove', function(e) {
        // Check if we're on a desktop device (no effect on mobile)
        if (window.innerWidth <= 768) return;
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Very subtle movement - just 2-3px in any direction
        const moveX = (mouseX - 0.5) * 6;
        const moveY = (mouseY - 0.5) * 6;
        const rotate = (mouseX - 0.5) * 2;
        
        card.style.transform = `translateX(${moveX}px) translateY(${moveY}px) rotateZ(${rotate}deg)`;
    });
    
    // Reset transform when mouse leaves
    document.addEventListener('mouseleave', function() {
        card.style.transform = '';
    });
}
