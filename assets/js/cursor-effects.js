/**
 * Enhanced cursor effects and animations with icons
 */

(function() {
    const MOBILE_MAX = 767;

    const shouldUseCustomCursors = () => {
        return window.matchMedia('(pointer: fine)').matches &&
               !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
               window.innerWidth > MOBILE_MAX;
    };

    const shouldUseDynamicCursor = () => shouldUseCustomCursors();

    const markNoCustomCursors = (on) => {
        document.documentElement.classList.toggle('no-custom-cursors', on);
        document.body.classList.toggle('no-custom-cursors', on);
    };

    const teardownDynamicCursor = () => {
        document.body.classList.remove('use-dynamic-cursor');
        document.querySelectorAll('.custom-cursor, .cursor-ring, .cursor-trail').forEach((el) => {
            el.remove();
        });
    };

    const initCursorEffects = () => {
        if (!shouldUseCustomCursors()) {
            markNoCustomCursors(true);
            teardownDynamicCursor();
            return;
        }

        markNoCustomCursors(false);

        if (document.body.classList.contains('use-dynamic-cursor')) return;

        document.body.classList.add('use-dynamic-cursor');

        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        const cursorRing = document.createElement('div');
        cursorRing.className = 'cursor-ring';
        document.body.appendChild(cursorRing);

        const cursorTrail = document.createElement('div');
        cursorTrail.className = 'cursor-trail';
        document.body.appendChild(cursorTrail);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let ringX = 0;
        let ringY = 0;

        const hideTrail = () => {
            cursorTrail.style.opacity = '0';
            cursorTrail.classList.remove('active');
            cursorTrail.dataset.type = '';
        };

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursor.className = 'custom-cursor';
            const target = e.target;

            if (target.closest('.logo-lockup, .logo')) {
                cursor.classList.add('cursor-hidden');
                hideTrail();
                return;
            }

            if (target.closest('#polymath-link, .tagline-button')) {
                cursor.classList.add('cursor-polymath', 'cursor-hover');
            } else if (target.closest('.hult-role')) {
                cursor.classList.add('cursor-hult', 'cursor-hover');
            } else if (target.closest('#header nav li')) {
                const item = target.closest('#header nav li');
                cursor.classList.add('cursor-hover');
                if (item.classList.contains('professional')) cursor.classList.add('cursor-professional');
                if (item.classList.contains('contact')) cursor.classList.add('cursor-contact');
                if (item.classList.contains('personal')) cursor.classList.add('cursor-personal');

                if (target.closest('.fa-linkedin')) cursor.classList.add('cursor-icon-linkedin', 'cursor-brand');
                else if (target.closest('.fa-github')) cursor.classList.add('cursor-icon-github', 'cursor-brand');
                else if (target.closest('.fa-instagram')) cursor.classList.add('cursor-icon-instagram', 'cursor-brand');
                else if (target.closest('.fa-envelope, #email-modal-trigger')) cursor.classList.add('cursor-icon-envelope');
                else if (target.closest('.fa-paper-plane')) cursor.classList.add('cursor-icon-telegram');
                else if (target.closest('.fa-calendar')) cursor.classList.add('cursor-icon-calendar');
            } else if (target.closest('a, button, [role="button"], .explore-btn, .role-text[data-skill]')) {
                cursor.classList.add('cursor-hover');
            }

            const isSpecial = target.closest('.tagline-button, #header nav li');
            if (isSpecial) {
                cursorTrail.style.opacity = '1';
                cursorTrail.style.left = `${mouseX}px`;
                cursorTrail.style.top = `${mouseY}px`;
                cursorTrail.classList.add('active');

                if (target.closest('#header nav li.professional')) {
                    cursorTrail.dataset.type = 'professional';
                } else if (target.closest('#header nav li.contact')) {
                    cursorTrail.dataset.type = 'contact';
                } else if (target.closest('#header nav li.personal')) {
                    cursorTrail.dataset.type = 'personal';
                } else if (target.closest('.tagline-button')) {
                    cursorTrail.dataset.type = 'tagline';
                }
            } else {
                hideTrail();
            }
        });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('cursor-down');
            cursorRing.classList.add('cursor-ring-down');
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('cursor-down');
            cursorRing.classList.remove('cursor-ring-down');
        });

        const updateCursorPosition = () => {
            if (!document.body.classList.contains('use-dynamic-cursor')) return;
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

        document.addEventListener('click', function (e) {
            const target = e.target;
            const isInteractive = target.closest('a, button, [role="button"], .btn, .tagline-button, .explore-btn');
            if (isInteractive && !target.closest('#header nav li a, #header nav li button, .logo-lockup')) {
                const ripple = document.createElement('div');
                ripple.className = 'cursor-ripple';
                ripple.style.left = `${e.clientX}px`;
                ripple.style.top = `${e.clientY}px`;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 1000);
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorRing.style.opacity = '0';
            hideTrail();
        });

        document.addEventListener('mouseenter', () => {
            if (!cursor.classList.contains('cursor-hidden')) cursor.style.opacity = '1';
            cursorRing.style.opacity = '0.6';
        });
    };

    window.addEventListener('resize', () => {
        if (!shouldUseDynamicCursor()) {
            markNoCustomCursors(true);
            teardownDynamicCursor();
        } else if (!document.body.classList.contains('use-dynamic-cursor')) {
            initCursorEffects();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCursorEffects);
    } else {
        initCursorEffects();
    }
})();
