/**
 * Business Card Enhancements
 * Adds interactive elements and subtle animations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Create subtle floating particles
    createParticles();
    
    // Initialize learn more button functionality
    initLearnMoreButton();
    
    // Initialize role text interactions
    initRoleInteractions();
    
    // Add subtle interactive effects
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
 * Initializes Learn More button functionality
 */
function initLearnMoreButton() {
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create more extensive content
            const modal = document.getElementById('polymath-modal');
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            
            // Show temporary notification
            const notification = document.createElement('div');
            notification.className = 'context-popup active';
            notification.style.bottom = '50%';
            notification.style.transform = 'translateX(-50%) translateY(50%)';
            notification.innerHTML = `
                <div class="popup-content">
                    <p>Full polymath portfolio coming soon!</p>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Remove after delay
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 2000);
        });
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

/**
 * Creates accessible tab navigation for modal
 */
function setupModalAccessibility() {
    const modal = document.getElementById('polymath-modal');
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Handle tab key navigation
    modal.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}
