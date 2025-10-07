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
                
                // Check for specific elements to assign proper icons
                if (target.closest('.logo')) {
                    cursor.classList.add('cursor-logo');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('#polymath-link')) {
                    cursor.classList.add('cursor-polymath');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('.storyteller-role')) {
                    cursor.classList.add('cursor-storyteller');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('.entrepreneur-role')) {
                    cursor.classList.add('cursor-entrepreneur');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('.engineer-role')) {
                    cursor.classList.add('cursor-engineer');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('#header nav li.professional a.fa-linkedin')) {
                    cursor.classList.add('cursor-professional');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('#header nav li.professional a.fa-github')) {
                    cursor.classList.add('cursor-professional');
                    cursor.classList.add('github');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('#header nav li.contact a.fa-envelope')) {
                    cursor.classList.add('cursor-contact');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('#header nav li.contact a.fa-paper-plane')) {
                    cursor.classList.add('cursor-contact');
                    cursor.classList.add('telegram');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('#header nav li.personal a.fa-spotify')) {
                    cursor.classList.add('cursor-personal');
                    
                    // Add hover state when hovering
                    if (target.matches(':hover')) {
                        cursor.classList.add('cursor-hover');
                    }
                } else if (target.closest('a') || target.closest('button') || 
                          target.closest('[role="button"]') || target.closest('input[type="submit"]') || 
                          target.closest('input[type="button"]') || target.closest('.btn')) {
                    // Generic interactive elements
                    cursor.classList.add('cursor-hover');
                }
                
                // Only show the trail on special elements
                const isSpecial = target.closest('.tagline-button') || 
                                 target.closest('#header nav li.professional a') ||
                                 target.closest('#header nav li.contact a') ||
                                 target.closest('#header nav li.personal a');
                
                if (isSpecial) {
                    cursorTrail.style.opacity = '1';
                    cursorTrail.style.left = `${mouseX}px`;
                    cursorTrail.style.top = `${mouseY}px`;
                    cursorTrail.classList.add('active');
                    
                    // Set trail color based on element type
                    if (target.closest('#header nav li.professional a')) {
                        cursorTrail.dataset.type = 'professional';
                        cursor.classList.add('cursor-professional');
                        
                        if (target.closest('.fa-github')) {
                            cursor.classList.add('github');
                        }
                    } else if (target.closest('#header nav li.contact a')) {
                        cursorTrail.dataset.type = 'contact';
                        cursor.classList.add('cursor-contact');
                        
                        if (target.closest('.fa-paper-plane')) {
                            cursor.classList.add('telegram');
                        }
                    } else if (target.closest('#header nav li.personal a')) {
                        cursorTrail.dataset.type = 'personal';
                        cursor.classList.add('cursor-personal');
                    } else if (target.closest('.tagline-button')) {
                        cursorTrail.dataset.type = 'tagline';
                        cursor.classList.add('cursor-polymath');
                    }
                } else {
                    cursorTrail.style.opacity = '0';
                    cursorTrail.classList.remove('active');
                    cursorTrail.dataset.type = '';
                    cursor.classList.remove('cursor-professional', 'cursor-contact', 'cursor-personal');
                    cursorRing.classList.remove('cursor-ring-professional', 'cursor-ring-contact', 'cursor-ring-personal');
                }
                
                // Change cursor state when hovering over interactive elements
                const isHoverable = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], .btn, .tagline-button');
                
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
            
            // Handle icon interactions
            const iconLinks = document.querySelectorAll('#header nav li a');
            iconLinks.forEach(link => {
                // Add ripple effect on click
                link.addEventListener('click', function(e) {
                    const ripple = document.createElement('div');
                    ripple.className = 'cursor-ripple';
                    
                    if (this.closest('.professional')) {
                        ripple.classList.add('professional');
                    } else if (this.closest('.contact')) {
                        ripple.classList.add('contact');
                    } else if (this.closest('.personal')) {
                        ripple.classList.add('personal');
                    }
                    
                    ripple.style.left = `${e.clientX}px`;
                    ripple.style.top = `${e.clientY}px`;
                    document.body.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 1000);
                });
            });
            
            // Add ripple effect to all interactive elements
            document.addEventListener('click', function(e) {
                const target = e.target;
                const isInteractive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], .btn, .tagline-button');
                
                if (isInteractive && !target.closest('#header nav li a')) {
                    const ripple = document.createElement('div');
                    ripple.className = 'cursor-ripple';
                    
                    ripple.style.left = `${e.clientX}px`;
                    ripple.style.top = `${e.clientY}px`;
                    document.body.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 1000);
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
