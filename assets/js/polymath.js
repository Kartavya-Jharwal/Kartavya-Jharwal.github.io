/**
 * Polymath modal — open, close, focus trap
 */
(function () {
    function initPolymathModal() {
        const modal = document.getElementById('polymath-modal');
        const trigger = document.getElementById('polymath-link');
        if (!modal || !trigger) return;

        const closeBtns = modal.querySelectorAll('.close-modal, .modal-close');
        const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocus = focusable[0];
        const lastFocus = focusable[focusable.length - 1];

        function closeModal() {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            trigger.focus();
        }

        function openModal(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            const closeBtn = modal.querySelector('.close-modal, .modal-close');
            if (closeBtn) closeBtn.focus();
        }

        trigger.addEventListener('click', openModal);
        closeBtns.forEach((btn) => btn.addEventListener('click', closeModal));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        if (firstFocus && lastFocus) {
            modal.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                if (e.shiftKey && document.activeElement === firstFocus) {
                    e.preventDefault();
                    lastFocus.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocus) {
                    e.preventDefault();
                    firstFocus.focus();
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPolymathModal);
    } else {
        initPolymathModal();
    }
})();
