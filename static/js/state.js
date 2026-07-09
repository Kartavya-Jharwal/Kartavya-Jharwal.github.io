/**
 * State Management
 * Handles variant selection and URL parameter parsing
 */

import { VARIANTS } from './data.js';

export let currentVariant = null;

// Utility functions
export const utils = {
  esc(s) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return String(s).replace(/[&<>"]/g, c => map[c]);
  },
  
  nb(s) {
    // Non-breaking space between number and unit
    return s.replace(/(\d)\s+(?=[A-Za-z%$€£])/g, '$1\u00a0');
  },
  
  slug(s) {
    return s.replace(/\s+/g, '_').replace(/[^\w]/g, '');
  },
  
  pdfHref(variant) {
    const name = `Alex_Polymath_Resume_${utils.slug(variant.role)}_${utils.slug(variant.industry)}.pdf`;
    return `resumes/${name}`;
  }
};

// Analytics
export function track(event, data) {
  try {
    if (window.gtag) {
      window.gtag('event', event, data);
    } else {
      console.log('[telemetry]', event, data);
    }
  } catch (e) {}
}

// Get all unique roles
export function getRoles() {
  const seen = {};
  return VARIANTS
    .filter(v => !seen[v.role] && (seen[v.role] = true))
    .map(v => v.role);
}

// Get industries for a specific role
export function getIndustries(role) {
  return VARIANTS
    .filter(v => v.role === role)
    .map(v => v.industry);
}

// Find variant by ID
export function getVariantById(id) {
  return VARIANTS.find(v => v.id === id);
}

// Initial variant selection (deep link or weighted random)
export function pickInitialVariant() {
  const params = new URLSearchParams(location.search);
  const role = params.get('role');
  const industry = params.get('industry');
  
  // Deep linking
  if (role && industry) {
    const match = VARIANTS.find(v =>
      v.role.toLowerCase() === role.toLowerCase() &&
      v.industry.toLowerCase() === industry.toLowerCase()
    );
    
    if (match) {
      track('deeplink', { pair: match.id, role, industry });
      return match;
    }
  }
  
  // Weighted randomization
  const targeted = VARIANTS.filter(v => v.tgt);
  
  if (targeted.length === 0) {
    return VARIANTS[0];
  }
  
  const pick = targeted[Math.floor(Math.random() * targeted.length)];
  track('cold_visit', { pair: pick.id });
  return pick;
}

// Set current variant
export function setVariant(variant) {
  const previous = currentVariant;
  currentVariant = variant;
  
  if (previous && previous.id !== variant.id) {
    track('variant_switch', {
      from: previous.id,
      to: variant.id
    });
  }
  
  return { previous, current: variant };
}

// Initialize
export function init() {
  currentVariant = pickInitialVariant();
  return currentVariant;
}
