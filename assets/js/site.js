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
    const updateRoleVeilOrigin = () => {
        const card = document.querySelector('.business-card');
        const veil = document.getElementById('role-veil');
        if (!card || !veil) return;
        const r = card.getBoundingClientRect();
        veil.style.setProperty('--role-cx', `${r.left + r.width / 2}px`);
        veil.style.setProperty('--role-cy', `${r.top + r.height / 2}px`);
        veil.style.setProperty('--role-inner', `${Math.max(r.width, r.height) * 0.52}px`);
    };

    const syncRoleFocus = () => {
        const on = !!document.querySelector('.skill-preview.active');
        document.body.classList.toggle('role-focus', on);
        const veil = document.getElementById('role-veil');
        if (veil) veil.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) updateRoleVeilOrigin();
    };

    window.addEventListener('resize', updateRoleVeilOrigin);

    const roleTexts = document.querySelectorAll('.role-text[data-skill]');
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let roleHideTimer = null;

    const clearRoleHide = () => {
        if (roleHideTimer) {
            clearTimeout(roleHideTimer);
            roleHideTimer = null;
        }
    };

    const deactivateRoles = (keep) => {
        roleTexts.forEach((r) => {
            if (r !== keep) r.classList.remove('is-active');
        });
        document.querySelectorAll('.skill-preview.active').forEach((p) => {
            if (!keep || p.id !== `preview-${keep.getAttribute('data-skill')}`) {
                p.classList.remove('active');
            }
        });
    };

    roleTexts.forEach((role) => {
        const skill = role.getAttribute('data-skill');
        const preview = document.getElementById(`preview-${skill}`);
        if (!preview) return;

        const show = () => {
            clearRoleHide();
            deactivateRoles(role);
            role.classList.add('is-active');
            preview.classList.add('active');
            syncRoleFocus();
        };
        const hide = () => {
            role.classList.remove('is-active');
            preview.classList.remove('active');
            syncRoleFocus();
        };
        const scheduleHide = () => {
            clearRoleHide();
            roleHideTimer = setTimeout(hide, 180);
        };
        const toggle = () => {
            clearRoleHide();
            const on = !preview.classList.contains('active');
            deactivateRoles(on ? role : null);
            role.classList.toggle('is-active', on);
            preview.classList.toggle('active', on);
            syncRoleFocus();
        };

        if (fineHover.matches) {
            role.addEventListener('mouseenter', show);
            role.addEventListener('mouseleave', (e) => {
                if (e.relatedTarget && (preview.contains(e.relatedTarget) || e.relatedTarget === preview)) return;
                scheduleHide();
            });
            preview.addEventListener('mouseenter', show);
            preview.addEventListener('mouseleave', (e) => {
                if (e.relatedTarget && (role.contains(e.relatedTarget) || e.relatedTarget === role)) return;
                scheduleHide();
            });
        }

        role.addEventListener('focus', show);
        role.addEventListener('blur', (e) => {
            if (e.relatedTarget && preview.contains(e.relatedTarget)) return;
            scheduleHide();
        });
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
            document.querySelectorAll('.role-text[data-skill].is-active').forEach((r) => r.classList.remove('is-active'));
            syncRoleFocus();
        }
    });

    /* Touch tooltips — tap to pin; locations stay until the next tap elsewhere */
    document.querySelectorAll('[data-tooltip]').forEach((el) => {
        el.addEventListener('pointerdown', () => {
            if (!window.matchMedia('(hover: none)').matches) return;
            document.querySelectorAll('[data-tooltip].is-tip').forEach((tip) => {
                if (tip !== el) tip.classList.remove('is-tip');
            });
            el.classList.add('is-tip');
        });
    });
    document.addEventListener('pointerdown', (e) => {
        if (e.target.closest('[data-tooltip]')) return;
        document.querySelectorAll('[data-tooltip].is-tip').forEach((tip) => tip.classList.remove('is-tip'));
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

        const copyBtn = e.target.closest('.email-copy');
        if (copyBtn) {
            e.preventDefault();
            const value = copyBtn.getAttribute('data-copy') || '';
            const label = copyBtn.getAttribute('aria-label') || 'Copy email';
            const copied = () => {
                document.querySelectorAll('.email-copy.is-copied').forEach((b) => {
                    b.classList.remove('is-copied');
                    const original = b.getAttribute('data-label') || b.getAttribute('aria-label');
                    if (original) b.setAttribute('aria-label', original.replace(/^Copied:\s*/, 'Copy '));
                });
                copyBtn.classList.add('is-copied');
                copyBtn.setAttribute('data-label', label);
                copyBtn.setAttribute('aria-label', `Copied: ${value}`);
                window.setTimeout(() => {
                    copyBtn.classList.remove('is-copied');
                    copyBtn.setAttribute('aria-label', label);
                }, 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(value).then(copied).catch(() => {});
            }
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
                return;
            }
            if (document.body.classList.contains('role-focus')) {
                document.querySelectorAll('.skill-preview.active').forEach((p) => p.classList.remove('active'));
                document.querySelectorAll('.role-text[data-skill].is-active').forEach((r) => r.classList.remove('is-active'));
                syncRoleFocus();
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

    const logo = document.getElementById('logo');
    function syncLogoTone() {
        const tone = (document.body.getAttribute('data-logo-tone') || 'dark').toLowerCase();
        if (logo) logo.setAttribute('data-logo-tone', tone);
    }
    syncLogoTone();
});
