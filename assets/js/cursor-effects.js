/**
 * Enhanced cursor effects and animations with icons
 */

(function() {
    // Check if we should use custom cursors (not on touch devices)
    const shouldUseCustomCursors = () => {
        return window.matchMedia('(pointer: fine)').matches && 
               !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };
    
    // Check if we should use dynamic cursor elements
    const shouldUseDynamicCursor = () => {
        return shouldUseCustomCursors() && window.innerWidth >= 768;
    };
    
    // Initialize custom cursor effects
    const initCursorEffects = () => {
        if (!shouldUseCustomCursors()) {
            document.documentElement.classList.add('no-custom-cursors');
            document.body.classList.add('no-custom-cursors');
            return;
        }
        
        // Only use dynamic cursor on larger screens
        if (shouldUseDynamicCursor()) {
            document.body.classList.add('use-dynamic-cursor');
            
            // Create cursor elements
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            document.body.appendChild(cursor);
            
            const cursorRing = document.createElement('div');
            cursorRing.className = 'cursor-ring';
            document.body.appendChild(cursorRing);
            
            // Create cursor trail element for special elements
            const cursorTrail = document.createElement('div');
            cursorTrail.className = 'cursor-trail';
            document.body.appendChild(cursorTrail);
            
            // Track mouse position with smooth animation
            let mouseX = 0;
            let mouseY = 0;
            let cursorX = 0;
            let cursorY = 0;
            let ringX = 0;
            let ringY = 0;
            
            // Handle mouse movement with lerp smoothing
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                // Reset cursor classes first
                cursor.className = 'custom-cursor';
                
                // Get element under cursor
                const target = e.target;
                
                // Contextual states — restored remote behavior, current markup
                if (target.closest('.logo-lockup, .logo')) {
                    cursor.classList.add('cursor-logo', 'cursor-hover');
                } else if (target.closest('#polymath-link, .tagline-button')) {
                    cursor.classList.add('cursor-polymath', 'cursor-hover');
                } else if (target.closest('.hult-role')) {
                    cursor.classList.add('cursor-hult', 'cursor-hover');
                } else if (target.closest('#header nav li.professional .fa-github')) {
                    cursor.classList.add('cursor-professional', 'github', 'cursor-hover');
                } else if (target.closest('#header nav li.professional')) {
                    cursor.classList.add('cursor-professional', 'cursor-hover');
                } else if (target.closest('#header nav li.contact .fa-paper-plane')) {
                    cursor.classList.add('cursor-contact', 'telegram', 'cursor-hover');
                } else if (target.closest('#header nav li.contact .fa-envelope, #email-modal-trigger')) {
                    cursor.classList.add('cursor-contact', 'cursor-hover');
                } else if (target.closest('#header nav li.contact')) {
                    cursor.classList.add('cursor-contact', 'cursor-hover');
                } else if (target.closest('#header nav li.personal')) {
                    cursor.classList.add('cursor-personal', 'cursor-hover');
                } else if (target.closest('a, button, [role="button"], .classic-link, .home-link, .explore-btn, .explore-link, .role-text[data-skill]')) {
                    cursor.classList.add('cursor-hover');
                }

                // Trail on primary interactive surfaces
                const isSpecial = target.closest('.tagline-button') ||
                                 target.closest('#header nav li.professional') ||
                                 target.closest('#header nav li.contact') ||
                                 target.closest('#header nav li.personal') ||
                                 target.closest('.logo-lockup');

                if (isSpecial) {
                    cursorTrail.style.opacity = '1';
                    cursorTrail.style.left = `${mouseX}px`;
                    cursorTrail.style.top = `${mouseY}px`;
                    cursorTrail.classList.add('active');

                    if (target.closest('#header nav li.professional')) {
                        cursorTrail.dataset.type = 'professional';
                        cursor.classList.add('cursor-professional');
                        if (target.closest('.fa-github')) cursor.classList.add('github');
                    } else if (target.closest('#header nav li.contact')) {
                        cursorTrail.dataset.type = 'contact';
                        cursor.classList.add('cursor-contact');
                        if (target.closest('.fa-paper-plane')) cursor.classList.add('telegram');
                    } else if (target.closest('#header nav li.personal')) {
                        cursorTrail.dataset.type = 'personal';
                        cursor.classList.add('cursor-personal');
                    } else if (target.closest('.tagline-button, .logo-lockup')) {
                        cursorTrail.dataset.type = 'tagline';
                        if (target.closest('.tagline-button')) cursor.classList.add('cursor-polymath');
                    }
                } else {
                    cursorTrail.style.opacity = '0';
                    cursorTrail.classList.remove('active');
                    cursorTrail.dataset.type = '';
                    cursor.classList.remove('cursor-professional', 'cursor-contact', 'cursor-personal', 'github', 'telegram');
                    cursorRing.classList.remove('cursor-ring-professional', 'cursor-ring-contact', 'cursor-ring-personal');
                }

                const isHoverable = target.closest('a, button, [role="button"], .btn, .tagline-button, .classic-link, .explore-btn, .role-text[data-skill]');

                if (isHoverable) {
                    cursor.classList.add('cursor-hover');
                    cursorRing.classList.add('cursor-ring-hover');
                } else {
                    cursor.classList.remove('cursor-hover');
                    cursorRing.classList.remove('cursor-ring-hover');
                }
            });
            
            // Handle button press states
            document.addEventListener('mousedown', () => {
                cursor.classList.add('cursor-down');
                cursorRing.classList.add('cursor-ring-down');
            });
            
            document.addEventListener('mouseup', () => {
                cursor.classList.remove('cursor-down');
                cursorRing.classList.remove('cursor-ring-down');
            });
            
            // Update cursor position with smooth animation
            const updateCursorPosition = () => {
                const lerp = (start, end, factor) => start * (1 - factor) + end * factor;
                
                cursorX = lerp(cursorX, mouseX, 0.2);
                cursorY = lerp(cursorY, mouseY, 0.2);
                ringX = lerp(ringX, mouseX, 0.15);
                ringY = lerp(ringY, mouseY, 0.15);
                
                cursor.style.left = `${cursorX}px`;
                cursor.style.top = `${cursorY}px`;
                
                cursorRing.style.left = `${ringX}px`;
                cursorRing.style.top = `${ringY}px`;
                
                requestAnimationFrame(updateCursorPosition);
            };
            
            updateCursorPosition();
            
            // Ripples on social icons (anchors + email button)
            document.querySelectorAll('#header nav li a, #header nav li button').forEach((link) => {
                link.addEventListener('click', function (e) {
                    const ripple = document.createElement('div');
                    ripple.className = 'cursor-ripple';
                    if (this.closest('.professional')) ripple.classList.add('professional');
                    else if (this.closest('.contact')) ripple.classList.add('contact');
                    else if (this.closest('.personal')) ripple.classList.add('personal');
                    ripple.style.left = `${e.clientX}px`;
                    ripple.style.top = `${e.clientY}px`;
                    document.body.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 1000);
                });
            });

            // Ripples on other interactive surfaces
            document.addEventListener('click', function (e) {
                const target = e.target;
                const isInteractive = target.closest('a, button, [role="button"], .btn, .tagline-button, .classic-link, .explore-btn');
                if (isInteractive && !target.closest('#header nav li a, #header nav li button')) {
                    const ripple = document.createElement('div');
                    ripple.className = 'cursor-ripple';
                    ripple.style.left = `${e.clientX}px`;
                    ripple.style.top = `${e.clientY}px`;
                    document.body.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 1000);
                }
            });
            
            // Handle cursor leaving/entering the window
            document.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                cursorRing.style.opacity = '0';
                cursorTrail.style.opacity = '0';
            });
            
            document.addEventListener('mouseenter', () => {
                cursor.style.opacity = '1';
                cursorRing.style.opacity = '0.6';
            });
        }
    };

    // Update cursor mode on resize
    window.addEventListener('resize', () => {
        // Remove dynamic cursor if window gets too small
        if (!shouldUseDynamicCursor() && document.body.classList.contains('use-dynamic-cursor')) {
            document.body.classList.remove('use-dynamic-cursor');
            
            // Remove cursor elements
            document.querySelectorAll('.custom-cursor, .cursor-ring, .cursor-trail').forEach(el => {
                el.remove();
            });
        } 
        // Re-initialize if needed
        else if (shouldUseDynamicCursor() && !document.body.classList.contains('use-dynamic-cursor')) {
            initCursorEffects();
        }
    });

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCursorEffects);
    } else {
        initCursorEffects();
    }
})();
