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

    /* -----------------------------------------------------------------------
       Base city highlight — flip data-base-city="london"|"jaipur" when you move
       Sep becomes > when London is base, < when Jaipur is base
       Hover tooltips show live local time (HH:MM:SS) with BST/GMT or IST
    ----------------------------------------------------------------------- */
    const locations = document.getElementById('locations');
    const locationSep = document.getElementById('location-sep');
    const locationTags = document.querySelectorAll('.location-tag[data-tz]');

    function syncBaseCity() {
        if (!locations) return;
        const base = (locations.getAttribute('data-base-city') || 'jaipur').toLowerCase();
        locationTags.forEach((tag) => {
            const loc = tag.getAttribute('data-location');
            tag.classList.toggle('is-base', loc === base);
        });
        if (locationSep) {
            locationSep.textContent = base === 'jaipur' ? '<' : '>';
        }
    }

    function formatCityTime(timeZone) {
        const now = new Date();
        const time = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(now);

        if (timeZone === 'Europe/London') {
            const tzName = (
                new Intl.DateTimeFormat('en-GB', {
                    timeZone,
                    timeZoneName: 'short',
                }).formatToParts(now).find((p) => p.type === 'timeZoneName') || {}
            ).value || 'GMT';
            // en-GB usually yields "GMT" / "BST"; some engines use "GMT+1"
            const label = /BST|\+01/i.test(tzName) ? 'BST' : 'GMT';
            return `${time} ${label}`;
        }
        if (timeZone === 'Asia/Kolkata') {
            return `${time} IST`;
        }
        return time;
    }

    function refreshLocationTooltips() {
        locationTags.forEach((tag) => {
            const tz = tag.getAttribute('data-tz');
            const city = tag.getAttribute('data-location');
            if (!tz) return;
            const label = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
            tag.setAttribute('data-tooltip', `${label} · ${formatCityTime(tz)}`);
        });
    }

    if (locations && locationTags.length) {
        syncBaseCity();
        refreshLocationTooltips();

        // Keep live seconds while a location tooltip might be shown
        setInterval(refreshLocationTooltips, 1000);

        // Observe class/attr edits so flipping data-base-city updates instantly
        const mo = new MutationObserver(syncBaseCity);
        mo.observe(locations, { attributes: true, attributeFilter: ['data-base-city'] });

        // Expose tiny helper for console / future UI
        window.setBaseCity = function setBaseCity(city) {
            if (!city) return;
            locations.setAttribute('data-base-city', String(city).toLowerCase());
            syncBaseCity();
        };
    }

    /* Logo tone follows wallpaper (sakura → dark offset plate for contrast) */
    const logo = document.getElementById('logo');
    function syncLogoTone() {
        const tone = (
            document.body.getAttribute('data-logo-tone')
            || (document.body.getAttribute('data-wallpaper') === 'sakura' ? 'dark' : 'light')
        ).toLowerCase();
        if (logo) logo.setAttribute('data-logo-tone', tone);
        document.body.setAttribute('data-logo-tone', tone);
    }
    syncLogoTone();
    window.setLogoTone = function setLogoTone(tone) {
        if (!tone) return;
        document.body.setAttribute('data-logo-tone', String(tone).toLowerCase());
        syncLogoTone();
    };
});
