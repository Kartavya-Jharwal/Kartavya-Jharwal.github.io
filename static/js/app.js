/**
 * Main Application Controller
 * Pure vanilla JS, no frameworks
 */

import { init, setVariant, getRoles, getIndustries, getVariantById, track } from './state.js';
import { renderVariant, updateVariant } from './render.js';
import { initAnimations } from './animations.js';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Pick initial variant
  const initialVariant = init();
  
  // Render initial state
  renderVariant(initialVariant);
  
  // Setup UI controls
  setupMatrixControls();
  setupDownloadTracking();
  setupMobileDrawer();
  
  // Initialize animations
  initAnimations();
  
  // Hide loading skeleton if present
  document.body.classList.add('loaded');
});

// Setup matrix dropdowns (desktop + mobile)
function setupMatrixControls() {
  const desktopMatrix = document.getElementById('mxD');
  const mobileMatrix = document.getElementById('mxM');
  
  [desktopMatrix, mobileMatrix].forEach(container => {
    if (!container) return;
    
    // Render dropdown structure
    renderMatrix(container);
    
    // Role dropdown handler
    const roleSelect = container.querySelector('[data-k="role"]');
    const indSelect = container.querySelector('[data-k="ind"]');
    
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const newRole = e.target.value;
        updateIndustryDropdown(indSelect, newRole);
      });
    }
    
    if (indSelect) {
      indSelect.addEventListener('change', () => {
        switchVariant(roleSelect.value, indSelect.value);
      });
    }
    
    // Fallback link (full polymath)
    const fallbackLink = container.querySelector('[data-k="fb"]');
    if (fallbackLink) {
      fallbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        const fallback = getVariantById('all');
        if (fallback) {
          const { previous } = setVariant(fallback);
          updateVariant(fallback);
          updateMatrixSelections(fallback);
        }
      });
    }
  });
}

// Render matrix HTML
function renderMatrix(container) {
  const roles = getRoles();
  const currentRole = window.currentVariant?.role || roles[0];
  const industries = getIndustries(currentRole);
  const currentIndustry = window.currentVariant?.industry || industries[0];
  
  container.innerHTML = `
    <div class="sd-lbl mtx-hd">Specialization Matrix</div>
    <div class="mtx-row">
      <span class="mtx-pfx">I am a</span>
      <select class="neu" data-k="role">
        ${roles.map(r => `<option value="${r}" ${r === currentRole ? 'selected' : ''}>${r}</option>`).join('')}
      </select>
    </div>
    <div class="mtx-row">
      <span class="mtx-pfx">for</span>
      <select class="neu" data-k="ind">
        ${industries.map(i => `<option value="${i}" ${i === currentIndustry ? 'selected' : ''}>${i}</option>`).join('')}
      </select>
    </div>
    <button class="mtx-link" data-k="fb">View Full Polymath Profile</button>
  `;
}

// Update industry dropdown when role changes
function updateIndustryDropdown(indSelect, role) {
  if (!indSelect) return;
  
  const industries = getIndustries(role);
  indSelect.innerHTML = industries
    .map(i => `<option value="${i}">${i}</option>`)
    .join('');
  
  // Auto-switch to first industry
  switchVariant(role, industries[0]);
}

// Switch to a new variant
function switchVariant(role, industry) {
  const newVariant = window.VARIANTS?.find(v => 
    v.role === role && v.industry === industry
  );
  
  if (newVariant && newVariant.id !== window.currentVariant?.id) {
    setVariant(newVariant);
    updateVariant(newVariant);
    updateMatrixSelections(newVariant);
  }
}

// Update matrix selections after variant change
function updateMatrixSelections(variant) {
  document.querySelectorAll('[data-k="role"]').forEach(el => {
    el.value = variant.role;
  });
  
  document.querySelectorAll('[data-k="ind"]').forEach(el => {
    el.value = variant.industry;
  });
}

// Track PDF downloads
function setupDownloadTracking() {
  document.querySelectorAll('.dl').forEach(btn => {
    btn.addEventListener('click', () => {
      track('pdf_download', {
        variant: window.currentVariant?.id
      });
    });
  });
}

// Mobile drawer controls
function setupMobileDrawer() {
  const drawer = document.getElementById('drawer');
  const grip = document.getElementById('grip');
  
  if (!drawer || !grip) return;
  
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  
  grip.addEventListener('touchstart', (e) => {
    isDragging = true;
    startY = e.touches[0].clientY;
    drawer.classList.add('drag');
  });
  
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward drag
    if (deltaY > 0) {
      const maxDrag = window.innerHeight * 0.7;
      const translate = Math.min(deltaY, maxDrag);
      drawer.style.transform = `translateY(${translate}px)`;
    }
  });
  
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    drawer.classList.remove('drag');
    
    const deltaY = currentY - startY;
    
    if (deltaY > 100) {
      // Close drawer
      drawer.classList.remove('open');
      drawer.style.transform = '';
    } else {
      // Snap back
      drawer.classList.add('open');
      drawer.style.transform = '';
    }
  });
  
  // Tap grip to toggle
  grip.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });
}

// Mobile splash screen
const splash = document.getElementById('splash');
const enterBtn = document.getElementById('enterBtn');

if (splash && enterBtn) {
  enterBtn.addEventListener('click', () => {
    splash.classList.remove('on');
    track('splash_dismissed', { device: 'mobile' });
  });
  
  // Show splash on mobile
  if (window.innerWidth < 1024) {
    splash.classList.add('on');
  }
}
