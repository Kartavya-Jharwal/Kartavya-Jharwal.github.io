/**
 * kartavya.tech — core page logic
 */

function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
});

/* Faster reveal — don't wait on full window load */
function revealPage() {
    document.body.classList.remove('is-preload');
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(revealPage);
    });
} else {
    requestAnimationFrame(revealPage);
}

/* Safety: still clear on load if something else re-added preload */
window.addEventListener('load', revealPage);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
});
document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    const focusable = modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    if (!document.querySelector('.modal.active')) {
        document.body.classList.remove('modal-open');
    }
    modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('DOMContentLoaded', function () {
    /* Role hover / touch / keyboard previews */
    const roleTexts = document.querySelectorAll('.role-text[data-skill]');
    roleTexts.forEach((role) => {
        const skill = role.getAttribute('data-skill');
        const preview = document.getElementById(`preview-${skill}`);
        if (!preview) return;

        const show = () => preview.classList.add('active');
        const hide = () => preview.classList.remove('active');
        const toggle = () => {
            document.querySelectorAll('.skill-preview.active').forEach((p) => {
                if (p !== preview) p.classList.remove('active');
            });
            preview.classList.toggle('active');
        };

        role.addEventListener('mouseenter', show);
        role.addEventListener('mouseleave', hide);
        role.addEventListener('focus', show);
        role.addEventListener('blur', hide);
        role.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggle();
        }, { passive: false });
        role.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.role-text') && !e.target.closest('.skill-preview')) {
            document.querySelectorAll('.skill-preview.active').forEach((p) => p.classList.remove('active'));
        }
    });

    /* Logo frog-tongue — hover desktop; tap toggle (portrait tongue drops via CSS) */
    const logoLockup = document.getElementById('logo-lockup');
    const logoBtn = document.getElementById('logo');
    const rollout = document.getElementById('logo-name-rollout');

    function setExpanded(on) {
        if (!logoLockup) return;
        logoLockup.classList.toggle('expanded', on);
        if (logoBtn) logoBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (rollout) rollout.setAttribute('aria-hidden', on ? 'false' : 'true');
    }

    if (logoLockup) {
        logoLockup.addEventListener('click', (e) => {
            // Always allow tap toggle on coarse / no-hover; also portrait click
            const needsTap = window.matchMedia('(hover: none)').matches
                || window.matchMedia('(orientation: portrait)').matches;
            if (needsTap) {
                e.preventDefault();
                setExpanded(!logoLockup.classList.contains('expanded'));
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#logo-lockup') && logoLockup.classList.contains('expanded')) {
                setExpanded(false);
            }
        });
    }

    /* Modals */
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal]');
        if (trigger) {
            e.preventDefault();
            openModal(trigger.getAttribute('data-modal'));
            return;
        }

        if (e.target.closest('#email-modal-trigger')) {
            e.preventDefault();
            openModal('email-modal');
            return;
        }

        const closeBtn = e.target.closest('.close-modal');
        if (closeBtn) {
            closeModal(closeBtn.closest('.modal'));
            return;
        }

        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            closeModal(e.target);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            if (activeModals.length) {
                closeModal(activeModals[activeModals.length - 1]);
            }
        }
    });
});
